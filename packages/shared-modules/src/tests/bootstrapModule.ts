import { createStore, getSagaExtension, SagaMiddleware } from "@neufund/sagas";
import { expectSaga as expectSagaNative, matchers } from "@neufund/sagas/tests";
import { Container } from "inversify";
import { SagaType } from "redux-saga-test-plan";

import { getLoadContextExtension } from "../extensions";
import { INeuModule } from "../types";

/**
 * Bootstrap modules and provides an access to utility methods
 *
 * @todo Do not return whole container but rather `bind` and `get` methods
 *       that will make sure we only use symbols defined in `modules` api's.
 *
 * @returns Returns a helper utility methods for tests
 * @returns .getState - Returns the current redux state
 * @returns .dispatch - Dispatches an action to the store
 * @returns .expectSaga - Allows to tests individual sagas without triggering store side effects
 * @returns .runSaga - Runs the given saga and all related side effects (for .e.g store modifications based on module reducers)
 */
const bootstrapModule = <T extends INeuModule<unknown>[]>(modules: T) => {
  const container = new Container();

  const sagaExtension = getSagaExtension({ container });
  const sagaMiddleware = sagaExtension.middleware![0] as SagaMiddleware;

  const store = createStore(
    {
      extensions: [getLoadContextExtension(container), sagaExtension],
    },
    ...modules,
  );

  const expectSaga = <S extends SagaType>(generator: S, ...sagaArgs: Parameters<S>) =>
    expectSagaNative(generator, ...sagaArgs)
      .withState(store.getState())
      .provide([[matchers.getContext("container"), container]]);

  return {
    getState: store.getState,
    dispatch: store.dispatch,
    runSaga: sagaMiddleware.run,
    container,
    expectSaga,
  };
};

export { bootstrapModule };
