import {
  delay,
  fork,
  neuCall,
  neuTakeEvery,
  neuTakeUntil,
  put,
  SagaGenerator,
  select,
} from "@neufund/sagas";
import { EthereumAddressWithChecksum } from "@neufund/shared-utils";
import BigNumber from "bignumber.js";
import promiseAll from "promise-all";

import { neuGetBindings } from "../../utils";
import { authModuleAPI, IUser, TAuthModuleState } from "../auth/module";
import { contractsModuleApi, IContractsService, ILockedAccountAdapter } from "../contracts/module";
import { coreModuleApi } from "../core/module";
import { walletActions } from "./actions";
import { ILockedWallet, IWalletStateData } from "./reducer";

type TGlobalDependencies = unknown;

const WALLET_DATA_FETCHING_INTERVAL = 12000;

function* loadWalletDataSaga(_: TGlobalDependencies): any {
  const { logger, contractsService } = yield* neuGetBindings({
    logger: coreModuleApi.symbols.logger,
    contractsService: contractsModuleApi.symbols.contractsService,
  });

  try {
    // COMMENT: it looks like the gas price api information is not really needed
    // for this saga to work properly..
    // yield put(actions.gas.gasApiEnsureLoading());
    // yield take(actions.gas.gasApiLoaded);

    const user: IUser = yield select((state: TAuthModuleState) =>
      authModuleAPI.selectors.selectUser(state),
    );
    const ethAddress = user.userId;

    const state: IWalletStateData = yield neuCall(
      loadWalletDataAsync,
      ethAddress,
      contractsService,
    );
    yield put(walletActions.saveWalletData(state));
    logger.info("Wallet Loaded");
  } catch (e) {
    yield put(walletActions.loadWalletDataError("Error while loading wallet data."));
    logger.error("Error while loading wallet data: ", e);
  }
}

async function loadICBMWallet(
  ethAddress: EthereumAddressWithChecksum,
  lockedAccount: ILockedAccountAdapter,
): Promise<ILockedWallet> {
  const balance = await lockedAccount.balanceOf(ethAddress);
  return contractsModuleApi.utils.numericValuesToString({
    LockedBalance: balance[0],
    neumarksDue: balance[1],
    unlockDate: balance[2],
  });
}

export async function loadWalletDataAsync(
  _: TGlobalDependencies,
  ethAddress: EthereumAddressWithChecksum,
  contractsService: IContractsService,
): Promise<IWalletStateData> {
  return {
    ...(await promiseAll({
      euroTokenICBMLockedWallet: loadICBMWallet(ethAddress, contractsService.icbmEuroLock),
      etherTokenICBMLockedWallet: loadICBMWallet(ethAddress, contractsService.icbmEtherLock),
      euroTokenLockedWallet: loadICBMWallet(ethAddress, contractsService.euroLock),
      etherTokenLockedWallet: loadICBMWallet(ethAddress, contractsService.etherLock),
      etherTokenUpgradeTarget: contractsService.icbmEtherLock.currentMigrationTarget,
      euroTokenUpgradeTarget: contractsService.icbmEuroLock.currentMigrationTarget,
    })),
    neumarkAddress: contractsService.neumark.address,
    ...contractsModuleApi.utils.numericValuesToString(
      await promiseAll({
        etherTokenBalance: contractsService.etherToken.balanceOf(ethAddress),
        euroTokenBalance: contractsService.euroToken.balanceOf(ethAddress),
        // TODO: get ether balance from somewhere
        etherBalance: Promise.resolve(new BigNumber(0)),
        neuBalance: contractsService.neumark.balanceOf(ethAddress),
      }),
    ),
  };
}

function* walletBalanceWatcher(): any {
  // TODO wait for contracts
  // yield waitUntilSmartContractsAreInitialized();

  while (true) {
    yield neuCall(loadWalletDataSaga);
    yield delay(WALLET_DATA_FETCHING_INTERVAL);
  }
}

export function setupWalletSagas(): () => SagaGenerator<void> {
  return function* walletSagas(): any {
    yield fork(neuTakeEvery, "WALLET_LOAD_WALLET_DATA", loadWalletDataSaga);
    yield neuTakeUntil(
      authModuleAPI.actions.setUser,
      walletActions.stopWalletBalanceWatcher,
      walletBalanceWatcher,
    );
  };
}
