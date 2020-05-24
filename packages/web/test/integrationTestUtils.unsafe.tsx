import { createSagaMiddleware, SagaMiddleware } from "@neufund/sagas";
import { authModuleAPI, coreModuleApi, IHttpResponse, noopLogger } from "@neufund/shared-modules";
import { DeepPartial, dummyIntl, simpleDelay } from "@neufund/shared-utils";
import { createMock, tid } from "@neufund/shared-utils/tests";
import { routerMiddleware } from "connected-react-router";
import { ReactWrapper } from "enzyme";
import { createMemoryHistory, History } from "history";
import { Container, ContainerModule } from "inversify";
import * as React from "react";
import { IntlProvider } from "react-intl";
import { Provider as ReduxProvider } from "react-redux";
import { applyMiddleware, combineReducers, createStore, ReducersMapObject, Store } from "redux";
import configureStore from "redux-mock-store";
import { SinonSpy } from "sinon";

import {
  createGlobalDependencies,
  setupBindings,
  TGlobalDependencies,
} from "../app/di/setupBindings";
import { symbols } from "../app/di/symbols";
import { BroadcastChannelMock } from "../app/lib/dependencies/broadcast-channel/BroadcastChannel.mock";
import { IntlWrapper } from "../app/lib/intl/IntlWrapper";
import { Storage } from "../app/lib/persistence/Storage";
import { createMockStorage } from "../app/lib/persistence/Storage.mock";
import { BrowserWalletConnector } from "../app/lib/web3/browser-wallet/BrowserWalletConnector";
import { ContractsService } from "../app/lib/web3/ContractsService";
import { LedgerWalletConnector } from "../app/lib/web3/ledger-wallet/LedgerConnector";
import { Web3ManagerMock } from "../app/lib/web3/Web3Manager/Web3Manager.mock";
import { rootSaga } from "../app/modules/sagas";
import { generateRootModuleReducerMap } from "../app/store";
import { dummyConfig } from "./fixtures";
import { createSpyMiddleware } from "./reduxSpyMiddleware";

/**
 * @deprecated
 * This is a legacy setup for integration tests.
 */

const defaultTranslations = require("../intl/locales/en-en.json");

interface ICreateIntegrationTestsSetupOptions {
  initialState?: DeepPartial<TAppGlobalState>;
  browserWalletConnectorMock?: BrowserWalletConnector;
  ledgerWalletConnectorMock?: LedgerWalletConnector;
  storageMock?: Storage;
  initialRoute?: string;
  contractsMock?: ContractsService;
}

type TReducersMapToReturnTypes<T extends ReducersMapObject<any, any>> = T extends ReducersMapObject<
  infer S,
  any
>
  ? S
  : never;

export type TAppGlobalState = TReducersMapToReturnTypes<
  ReturnType<typeof generateRootModuleReducerMap>
>;

interface ICreateIntegrationTestsSetupOutput {
  store: Store<unknown>;
  container: Container;
  dispatchSpy: SinonSpy;
  history: History;
  sagaMiddleware: SagaMiddleware<{ container: Container; deps: TGlobalDependencies }>;
}

/**
 * @deprecated Please don't write unit tests for components as integration tests.
 *             Just mock all selectors/external components and assert component behaviour
 *             without spinning whole sagas under the hood
 */
// TODO: There is a circular dependency after the function and all imports are removed. Remove the function and fix invalid circular dependency
export function createIntegrationTestsSetup(
  options: ICreateIntegrationTestsSetupOptions = {},
): ICreateIntegrationTestsSetupOutput {
  const browserWalletMock =
    options.browserWalletConnectorMock || createMock(BrowserWalletConnector, {});
  const ledgerWalletMock =
    options.ledgerWalletConnectorMock || createMock(LedgerWalletConnector, {});
  const storageMock = options.storageMock || createMockStorage();
  const contractsMock = options.contractsMock || createMock(ContractsService, {});

  const container = new Container();

  class MockHttpClient extends coreModuleApi.utils.HttpClient {
    protected makeFetchRequest<T>(): Promise<IHttpResponse<T>> {
      throw Error("Not allowed in tests");
    }
  }

  container.load(
    new ContainerModule(bind => {
      bind(coreModuleApi.symbols.jsonHttpClient).toConstantValue(createMock(MockHttpClient, {}));
      bind(coreModuleApi.symbols.binaryHttpClient).toConstantValue(createMock(MockHttpClient, {}));
      bind(authModuleAPI.symbols.authJsonHttpClient).toConstantValue(
        createMock(MockHttpClient, {}),
      );
    }),
  );

  container.load(setupBindings(dummyConfig));

  container.rebind(symbols.userActivityChannel).toConstantValue(new BroadcastChannelMock());
  container.rebind(symbols.ledgerWalletConnector).toConstantValue(ledgerWalletMock);
  container.rebind(symbols.browserWalletConnector).toConstantValue(browserWalletMock);
  container
    .rebind(symbols.web3Manager)
    .to(Web3ManagerMock)
    .inSingletonScope();
  container.bind(symbols.logger).toConstantValue(noopLogger);
  container.rebind(symbols.storage).toConstantValue(storageMock);
  container.rebind(symbols.contractsService).toConstantValue(contractsMock);

  const context: { container: Container; deps?: TGlobalDependencies } = {
    container,
  };

  const intlWrapper = new IntlWrapper();
  intlWrapper.intl = dummyIntl;
  container.rebind(symbols.intlWrapper).toConstantValue(intlWrapper);

  const sagaMiddleware = createSagaMiddleware({ context });
  const spyMiddleware = createSpyMiddleware();

  const history = createMemoryHistory({
    initialEntries: [options.initialRoute ? options.initialRoute : "/"],
  });

  const middleware = applyMiddleware(
    spyMiddleware.middleware,
    routerMiddleware(history),
    sagaMiddleware,
  );

  const reducerMap = generateRootModuleReducerMap(history);

  // TODO: we need to build a proper way to mock module state
  const reducerMapWithMockModuleReducer = Object.keys(options.initialState ?? {}).reduce<object>(
    (p, key) => {
      if (key in reducerMap) {
        return p;
      }

      return {
        ...p,
        [key]: (s = {}) => s,
      };
    },
    {},
  );

  const rootReducer = combineReducers({ ...reducerMap, ...reducerMapWithMockModuleReducer });

  const store = createStore(rootReducer, options.initialState as any, middleware);
  context.deps = createGlobalDependencies(container);
  sagaMiddleware.run(rootSaga);

  return {
    store,
    container,
    dispatchSpy: spyMiddleware.dispatchSpy,
    history,
    sagaMiddleware,
  };
}

export function clickFirstTid(component: ReactWrapper, id: string): void {
  component
    .find(tid(id))
    .first()
    .simulate("click");
}

export async function waitForTid(component: ReactWrapper, id: string): Promise<void> {
  // wait until event queue is empty :/ currently we don't have a better way to solve it
  let waitTime = 50;
  while (--waitTime > 0 && component.find(tid(id)).length === 0) {
    await Promise.resolve();
    component.update();
  }

  if (waitTime === 0) {
    throw new Error(`Timeout while waiting for '${id}'`);
  }
}

export async function waitForPredicate(predicate: () => boolean, errorMsg: string): Promise<void> {
  // wait until event queue is empty :/ currently we don't have a better way to solve it
  let waitTime = 20;

  while (--waitTime > 0 && !predicate()) {
    await simpleDelay(10);
  }

  if (waitTime === 0) {
    throw new Error(`Timeout while waiting for '${errorMsg}'`);
  }
}

export async function waitUntilDoesntThrow(
  globalFakeClock: any /* lolex.InstalledClock<lolex.Clock> */,
  fn: () => any,
  errorMsg: string,
): Promise<void> {
  // wait until event queue is empty :/ currently we don't have a better way to solve it
  let waitTime = 20;
  let lastError: any;
  while (--waitTime > 0) {
    try {
      fn();
      break;
    } catch (e) {
      await globalFakeClock.tickAsync(1);
      lastError = e;
    }
  }

  if (waitTime === 0) {
    throw new Error(
      `Timeout while waiting for '${errorMsg}'. Original error: ${lastError && lastError.message}`,
    );
  }
}

export function wrapWithIntl(component: React.ReactElement): React.ReactElement<any> {
  return (
    <IntlProvider locale="en-en" messages={defaultTranslations}>
      {component}
    </IntlProvider>
  );
}

const getCurrentSubmitCount = (element: ReactWrapper): number =>
  +element.find(tid("test-form-submit-count")).text();

const getIsSubmitting = (element: ReactWrapper): boolean =>
  element.find(tid("test-form-is-submitting")).text() === "true";

export const submit = async (element: ReactWrapper): Promise<void> => {
  const currentCount = getCurrentSubmitCount(element);

  clickFirstTid(element, "test-form-submit");

  await waitForPredicate(
    () => currentCount + 1 === getCurrentSubmitCount(element) && !getIsSubmitting(element),
    "Waiting for form to be submitted",
  );
};

const mockStore = configureStore();
const throwOnAccessHandler = {
  get: (_: unknown, name: string) => {
    throw new Error(
      `Seems that you are trying to get data from redux store (state.${name}). The best approach would be to mock selectors. Maintaining tests related on the external store shape is close to impossible.`,
    );
  },
};
const restrictedStore = new Proxy({}, throwOnAccessHandler);

/**
 * Wraps a component redux store and intl provider.
 * Enforces that store is not accesses directly to promote `selectors` mocking
 */
export const wrapWithBasicProviders = (Component: React.ComponentType) => (
  <ReduxProvider store={mockStore(restrictedStore)}>
    <IntlProvider locale="en-en" messages={defaultTranslations}>
      <Component />
    </IntlProvider>
  </ReduxProvider>
);
