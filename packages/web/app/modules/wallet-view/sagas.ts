import { all, call, put, select } from "@neufund/sagas";
import { addBigNumbers, compareBigNumbers } from "@neufund/shared-utils";

import { EProcessState } from "../../utils/enums/processStates";
import { actions } from "../actions";
import { selectIsUserFullyVerified } from "../auth/selectors";
import { loadBankAccountDetails } from "../kyc/sagas";
import { selectBankAccount } from "../kyc/selectors";
import { neuCall, neuTakeLatestUntil } from "../sagasUtils";
import { loadWalletDataSaga } from "../wallet/sagas";
import {
  selectICBMLockedEtherBalance,
  selectICBMLockedEtherBalanceEuroAmount,
  selectICBMLockedEuroTokenBalance,
  selectIsEtherUpgradeTargetSet,
  selectIsEuroUpgradeTargetSet,
  selectLiquidEtherBalance,
  selectLiquidEtherBalanceEuroAmount,
  selectLiquidEuroTokenBalance,
  selectLockedEtherBalance,
  selectLockedEtherBalanceEuroAmount,
  selectLockedEuroTokenBalance,
  selectNEURStatus,
} from "../wallet/selectors";
import { ENEURWalletStatus } from "../wallet/types";
import { selectEthereumAddress } from "../web3/selectors";
import { EBalanceType, TBalanceData, TBasicBalanceData } from "./types";
import { hasFunds, isMainBalance } from "./utils";

export function* populateWalletData(): Generator<any, TBasicBalanceData[], any> {
  const ethWalletData = yield all({
    amount: select(selectLiquidEtherBalance),
    euroEquivalentAmount: yield* select(selectLiquidEtherBalanceEuroAmount),
  });
  const neuroWalletData = yield all({
    amount: select(selectLiquidEuroTokenBalance),
    euroEquivalentAmount: select(selectLiquidEuroTokenBalance),
    neurStatus: select(selectNEURStatus),
  });
  const icbmEthWalletData = yield all({
    amount: select(selectLockedEtherBalance),
    euroEquivalentAmount: select(selectLockedEtherBalanceEuroAmount),
  });
  const icbmNeuroWalletData = yield all({
    amount: select(selectLockedEuroTokenBalance),
    euroEquivalentAmount: select(selectLockedEuroTokenBalance),
  });
  const lockedIcbmEthWalletData = yield all({
    amount: select(selectICBMLockedEtherBalance),
    euroEquivalentAmount: select(selectICBMLockedEtherBalanceEuroAmount),
    isEtherUpgradeTargetSet: select(selectIsEtherUpgradeTargetSet),
  });
  const lockedIcbmNeuroWalletData = yield all({
    amount: select(selectICBMLockedEuroTokenBalance),
    euroEquivalentAmount: select(selectICBMLockedEuroTokenBalance),
    isEuroUpgradeTargetSet: select(selectIsEuroUpgradeTargetSet),
  });

  return [
    {
      name: EBalanceType.ETH,
      hasFunds: compareBigNumbers(ethWalletData.amount, "0") > 0,
      amount: ethWalletData.amount,
      euroEquivalentAmount: ethWalletData.euroEquivalentAmount,
    },
    {
      name:
        neuroWalletData.neurStatus === ENEURWalletStatus.DISABLED_RESTRICTED_US_STATE
          ? EBalanceType.RESTRICTED_NEUR
          : EBalanceType.NEUR,
      hasFunds: compareBigNumbers(neuroWalletData.amount, "0") > 0,
      amount: neuroWalletData.amount,
      euroEquivalentAmount: neuroWalletData.euroEquivalentAmount,
    },
    {
      name: EBalanceType.ICBM_ETH,
      hasFunds: compareBigNumbers(icbmEthWalletData.amount, "0") > 0,
      amount: icbmEthWalletData.amount,
      euroEquivalentAmount: icbmEthWalletData.euroEquivalentAmount,
    },
    {
      name: EBalanceType.ICBM_NEUR,
      hasFunds: compareBigNumbers(icbmNeuroWalletData.amount, "0") > 0,
      amount: icbmNeuroWalletData.amount,
      euroEquivalentAmount: icbmNeuroWalletData.euroEquivalentAmount,
    },
    {
      name: EBalanceType.LOCKED_ICBM_ETH,
      hasFunds: compareBigNumbers(lockedIcbmEthWalletData.amount, "0") > 0,
      amount: lockedIcbmEthWalletData.amount,
      euroEquivalentAmount: lockedIcbmEthWalletData.euroEquivalentAmount,
    },
    {
      name: EBalanceType.LOCKED_ICBM_NEUR,
      hasFunds: compareBigNumbers(lockedIcbmNeuroWalletData.amount, "0") > 0,
      amount: lockedIcbmNeuroWalletData.amount,
      euroEquivalentAmount: lockedIcbmNeuroWalletData.euroEquivalentAmount,
    },
  ];
}

export function* loadWalletView(): Generator<any, void, any> {
  try {
    yield all([neuCall(loadWalletDataSaga), neuCall(loadBankAccountDetails)]);

    const userIsFullyVerified = yield* select(selectIsUserFullyVerified);
    const userAddress = yield* select(selectEthereumAddress);
    const bankAccount = yield* select(selectBankAccount);

    const balanceData = (yield call(populateWalletData)).filter(
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
    yield put(actions.walletView.walletViewSetData({ processState: EProcessState.ERROR }));
  }
}

export function* walletViewSagas(): any {
  yield neuTakeLatestUntil(
    actions.walletView.loadWalletView,
    "@@router/LOCATION_CHANGE",
    loadWalletView,
  );
}
