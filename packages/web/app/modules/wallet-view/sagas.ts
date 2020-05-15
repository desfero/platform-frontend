import { neuTakeLatestUntil, neuCall } from "../sagasUtils";
import { select, all, put } from "@neufund/sagas";
import { actions } from "../actions";
import { addBigNumbers, compareBigNumbers } from "@neufund/shared-utils";
import {
  selectICBMLockedEtherBalance,
  selectICBMLockedEtherBalanceEuroAmount,
  selectICBMLockedEuroTokenBalance,
  selectIsEtherUpgradeTargetSet, selectIsEuroUpgradeTargetSet,
  selectLiquidEtherBalance,
  selectLiquidEtherBalanceEuroAmount,
  selectLiquidEuroTokenBalance,
  selectLockedEtherBalance,
  selectLockedEtherBalanceEuroAmount,
  selectLockedEuroTokenBalance,
  selectNEURStatus
} from "../wallet/selectors";
import { selectEthereumAddress } from "../web3/selectors";
import { EProcessState } from "../../utils/enums/processStates";
import { loadWalletDataSaga } from "../wallet/sagas";
import { loadBankAccountDetails } from "../kyc/sagas";
import { EBalanceType } from "./types";
import { selectBankAccount } from "../kyc/selectors";
import { selectIsUserFullyVerified } from "../auth/selectors";


export function* loadWalletView() {
  try {
    yield all([
      neuCall(loadWalletDataSaga),
      neuCall(loadBankAccountDetails)
    ])

    const userIsFullyVerified = yield* select(selectIsUserFullyVerified)
    const userAddress = yield* select(selectEthereumAddress)
    const bankAccount = yield* select(selectBankAccount)

    const ethWalletData = yield all({
      amount: select(selectLiquidEtherBalance),
      euroEquivalentAmount: yield* select(selectLiquidEtherBalanceEuroAmount),
    })
    const neuroWalletData = yield all({
      amount: select(selectLiquidEuroTokenBalance),
      euroEquivalentAmount: select(selectLiquidEuroTokenBalance),
      neurStatus: select(selectNEURStatus),
    })
    const icbmEthWalletData = yield all({
      amount: select(selectLockedEtherBalance),
      euroEquivalentAmount: select(selectLockedEtherBalanceEuroAmount),
    })
    const icbmNeuroWalletData = yield all({
      amount: select(selectLockedEuroTokenBalance),
      euroEquivalentAmount: select(selectLockedEuroTokenBalance),
    })
    const lockedIcbmEthWalletData = yield all({
      amount: select(selectICBMLockedEtherBalance),
      euroEquivalentAmount: select(selectICBMLockedEtherBalanceEuroAmount),
      isEtherUpgradeTargetSet: select(selectIsEtherUpgradeTargetSet),
    })
    const lockedIcbmNeuroWalletData = yield all({
      amount: select(selectICBMLockedEuroTokenBalance),
      euroEquivalentAmount: select(selectICBMLockedEuroTokenBalance),
      isEuroUpgradeTargetSet: select(selectIsEuroUpgradeTargetSet),
    })

    const balanceData = [
      {
        name: EBalanceType.ETH,
        hasFunds: compareBigNumbers(ethWalletData.amount, "0") > 0,
        amount: ethWalletData.amount,
        euroEquivalentAmount: ethWalletData.euroEquivalentAmount
      },
      {
        name: EBalanceType.NEUR,
        hasFunds: compareBigNumbers(neuroWalletData.amount, "0") > 0,
        amount: neuroWalletData.amount,
        euroEquivalentAmount: neuroWalletData.euroEquivalentAmount
      },
      {
        name: EBalanceType.ICBM_ETH,
        hasFunds: compareBigNumbers(icbmEthWalletData.amount, "0") > 0,
        amount: icbmEthWalletData.amount,
        euroEquivalentAmount: icbmEthWalletData.euroEquivalentAmount
      },
      {
        name: EBalanceType.ICBM_NEUR,
        hasFunds: compareBigNumbers(icbmNeuroWalletData.amount, "0") > 0,
        amount: icbmNeuroWalletData.amount,
        euroEquivalentAmount: icbmNeuroWalletData.euroEquivalentAmount
      },
      {
        name: EBalanceType.LOCKED_ICBM_ETH,
        hasFunds: compareBigNumbers(lockedIcbmEthWalletData.amount, "0") > 0,
        amount: lockedIcbmEthWalletData.amount,
        euroEquivalentAmount: lockedIcbmEthWalletData.euroEquivalentAmount
      },
      {
        name: EBalanceType.LOCKED_ICBM_NEUR,
        hasFunds: compareBigNumbers(lockedIcbmNeuroWalletData.amount, "0") > 0,
        amount: lockedIcbmNeuroWalletData.amount,
        euroEquivalentAmount: lockedIcbmNeuroWalletData.euroEquivalentAmount
      }
    ]
      .filter((data) => data.hasFunds)


    const walletBalanceEuro = addBigNumbers([
      ethWalletData.euroEquivalentAmount,
      neuroWalletData.euroEquivalentAmount,
      icbmEthWalletData.euroEquivalentAmount,
      icbmEthWalletData.euroEquivalentAmount,
      lockedIcbmEthWalletData.euroEquivalentAmount,
      lockedIcbmNeuroWalletData.euroEquivalentAmount,
    ])


    yield put(actions.walletView.walletViewSetData({
      userIsFullyVerified,
      userAddress,
      balanceData,
      walletBalanceEuro,
      bankAccount,
      processState: EProcessState.SUCCESS
    }))

  }catch(e){
    console.log(e)
  }

  console.log("loadWalletView done")
}

export function* walletViewSagas(): any {
  yield neuTakeLatestUntil(
    actions.walletView.loadWalletView,
    "@@router/LOCATION_CHANGE",
    loadWalletView,
  );
}
