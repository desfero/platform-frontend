import { all, call, fork, put, select, take } from "@neufund/sagas";
import { tokenPriceModuleApi, walletApi } from "@neufund/shared-modules";
import { addBigNumbers, compareBigNumbers } from "@neufund/shared-utils";

import { EProcessState } from "../../utils/enums/processStates";
import { actions } from "../actions";
import { selectIsUserFullyVerified } from "../auth/selectors";
import { loadBankAccountDetails } from "../kyc/sagas";
import { selectBankAccount } from "../kyc/selectors";
import { neuCall, neuTakeUntil } from "../sagasUtils";
import { selectNEURStatus } from "../wallet/selectors";
import { ENEURWalletStatus } from "../wallet/types";
import { selectEthereumAddress } from "../web3/selectors";
import { EBalanceViewType, EWalletViewError, TBalanceData, TBasicBalanceData } from "./types";
import { hasFunds, isMainBalance } from "./utils";

export function* populateWalletData(): Generator<any, TBasicBalanceData[], any> {
  const ethWalletData = yield all({
    amount: select(walletApi.selectors.selectLiquidEtherBalance),
    euroEquivalentAmount: yield* select(walletApi.selectors.selectLiquidEtherBalanceEuroAmount),
  });
  const neuroWalletData = yield all({
    amount: select(walletApi.selectors.selectLiquidEuroTokenBalance),
    euroEquivalentAmount: select(walletApi.selectors.selectLiquidEuroTokenBalance),
    neurStatus: select(selectNEURStatus),
  });
  const icbmEthWalletData = yield all({
    amount: select(walletApi.selectors.selectLockedEtherBalance),
    euroEquivalentAmount: select(walletApi.selectors.selectLockedEtherBalanceEuroAmount),
  });
  const icbmNeuroWalletData = yield all({
    amount: select(walletApi.selectors.selectLockedEuroTokenBalance),
    euroEquivalentAmount: select(walletApi.selectors.selectLockedEuroTokenBalance),
  });
  const lockedIcbmEthWalletData = yield all({
    amount: select(walletApi.selectors.selectICBMLockedEtherBalance),
    euroEquivalentAmount: select(walletApi.selectors.selectICBMLockedEtherBalanceEuroAmount),
    isEtherUpgradeTargetSet: select(walletApi.selectors.selectIsEtherUpgradeTargetSet),
  });
  const lockedIcbmNeuroWalletData = yield all({
    amount: select(walletApi.selectors.selectICBMLockedEuroTokenBalance),
    euroEquivalentAmount: select(walletApi.selectors.selectICBMLockedEuroTokenBalance),
    isEuroUpgradeTargetSet: select(walletApi.selectors.selectIsEuroUpgradeTargetSet),
  });

  return [
    {
      name: EBalanceViewType.ETH,
      hasFunds: compareBigNumbers(ethWalletData.amount, "0") > 0,
      amount: ethWalletData.amount,
      euroEquivalentAmount: ethWalletData.euroEquivalentAmount,
    },
    {
      name:
        neuroWalletData.neurStatus === ENEURWalletStatus.DISABLED_RESTRICTED_US_STATE
          ? EBalanceViewType.RESTRICTED_NEUR
          : EBalanceViewType.NEUR,
      hasFunds: compareBigNumbers(neuroWalletData.amount, "0") > 0,
      amount: neuroWalletData.amount,
      euroEquivalentAmount: neuroWalletData.euroEquivalentAmount,
    },
    {
      name: EBalanceViewType.ICBM_ETH,
      hasFunds: compareBigNumbers(icbmEthWalletData.amount, "0") > 0,
      amount: icbmEthWalletData.amount,
      euroEquivalentAmount: icbmEthWalletData.euroEquivalentAmount,
    },
    {
      name: EBalanceViewType.ICBM_NEUR,
      hasFunds: compareBigNumbers(icbmNeuroWalletData.amount, "0") > 0,
      amount: icbmNeuroWalletData.amount,
      euroEquivalentAmount: icbmNeuroWalletData.euroEquivalentAmount,
    },
    {
      name: EBalanceViewType.LOCKED_ICBM_ETH,
      hasFunds: compareBigNumbers(lockedIcbmEthWalletData.amount, "0") > 0,
      amount: lockedIcbmEthWalletData.amount,
      euroEquivalentAmount: lockedIcbmEthWalletData.euroEquivalentAmount,
    },
    {
      name: EBalanceViewType.LOCKED_ICBM_NEUR,
      hasFunds: compareBigNumbers(lockedIcbmNeuroWalletData.amount, "0") > 0,
      amount: lockedIcbmNeuroWalletData.amount,
      euroEquivalentAmount: lockedIcbmNeuroWalletData.euroEquivalentAmount,
    },
  ];
}

export function* loadWalletView(): Generator<any, void, any> {
  try {
    yield all([neuCall(walletApi.sagas.loadWalletDataSaga), neuCall(loadBankAccountDetails)]);

    const userIsFullyVerified = yield* select(selectIsUserFullyVerified);
    const userAddress = yield* select(selectEthereumAddress);
    const bankAccount = yield* select(selectBankAccount);

    const balanceData = (yield* call(populateWalletData)).filter(
      (balance: TBasicBalanceData) => isMainBalance(balance) || hasFunds(balance),
    );

    const totalBalanceEuro = addBigNumbers(
      balanceData.map((balance: TBalanceData) => balance.euroEquivalentAmount),
    );

    yield put(
      actions.walletView.walletViewSetData({
        userIsFullyVerified,
        userAddress,
        balanceData,
        totalBalanceEuro,
        bankAccount,
        processState: EProcessState.SUCCESS,
      }),
    );
  } catch (e) {
    yield put(
      actions.walletView.walletViewSetData({
        processState: EProcessState.ERROR,
        errorType: EWalletViewError.GENERIC_ERROR,
      }),
    );
  }
}

export function* walletViewController(): Generator<any, void, any> {
  yield neuCall(loadWalletView);

  while (true) {
    yield take([
      actions.txTransactions.upgradeSuccessful,
      tokenPriceModuleApi.actions.saveTokenPrice,
    ]);
    yield neuCall(loadWalletView);
  }
}

export function* walletViewSagas(): Generator<any, void, any> {
  yield fork(
    neuTakeUntil,
    actions.walletView.loadWalletView,
    "@@router/LOCATION_CHANGE",
    walletViewController,
  );
}
