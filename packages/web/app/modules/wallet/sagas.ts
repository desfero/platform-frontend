import { delay, fork, put, select, take } from "@neufund/sagas";
import { authModuleAPI, contractsModuleApi } from "@neufund/shared-modules";
import { EthereumAddress } from "@neufund/shared-utils";
import * as promiseAll from "promise-all";

import { TGlobalDependencies } from "../../di/setupBindings";
import { ICBMLockedAccount } from "../../lib/contracts/ICBMLockedAccount";
import { LockedAccount } from "../../lib/contracts/LockedAccount";
import { actions } from "../actions";
import { waitUntilSmartContractsAreInitialized } from "../init/sagas";
import { neuCall, neuTakeEvery, neuTakeUntil } from "../sagasUtils";
import { selectEthereumAddress } from "../web3/selectors";
import { ILockedWallet, IWalletStateData } from "./reducer";

const WALLET_DATA_FETCHING_INTERVAL = 12000;

export function* loadWalletDataSaga({ logger }: TGlobalDependencies): any {
  try {
    const ethAddress = yield select(selectEthereumAddress);
    yield put(actions.gas.gasApiEnsureLoading());
    yield take(actions.gas.gasApiLoaded);

    const state: IWalletStateData = yield neuCall(loadWalletDataAsync, ethAddress);

    yield put(actions.wallet.saveWalletData(state));
    logger.info("Wallet Loaded");
  } catch (e) {
    yield put(actions.wallet.loadWalletDataError("Error while loading wallet data."));
    logger.error("Error while loading wallet data: ", e);
  }
}

async function loadICBMWallet(
  ethAddress: EthereumAddress,
  lockedAccount?: ICBMLockedAccount | LockedAccount,
): Promise<ILockedWallet> {
  if (lockedAccount) {
    const balance = await lockedAccount.balanceOf(ethAddress);
    return contractsModuleApi.utils.numericValuesToString({
      LockedBalance: balance[0],
      neumarksDue: balance[1],
      unlockDate: balance[2],
    });
  } else {
    // todo: may be removed when contracts deployed on production
    return {
      LockedBalance: "0",
      neumarksDue: "0",
      unlockDate: "0",
    };
  }
}

export async function loadWalletDataAsync(
  { contractsService, web3Manager }: TGlobalDependencies,
  ethAddress: EthereumAddress,
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
        etherBalance: web3Manager.getBalance(ethAddress),
        neuBalance: contractsService.neumark.balanceOf(ethAddress),
      }),
    ),
  };
}

function* walletBalanceWatcher(): any {
  yield waitUntilSmartContractsAreInitialized();

  while (true) {
    yield neuCall(loadWalletDataSaga);
    yield delay(WALLET_DATA_FETCHING_INTERVAL);
  }
}

export function* walletSagas(): any {
  yield fork(neuTakeEvery, "WALLET_LOAD_WALLET_DATA", loadWalletDataSaga);
  yield neuTakeUntil(
    authModuleAPI.actions.setUser,
    actions.wallet.stopWalletBalanceWatcher,
    walletBalanceWatcher,
  );
}
