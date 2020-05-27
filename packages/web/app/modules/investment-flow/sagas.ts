import { all, call, delay, put, select, take, takeEvery, takeLatest } from "@neufund/sagas";
import {
  addBigNumbers,
  compareBigNumbers,
  convertToUlps,
  extractNumber,
  nonNullable,
  subtractBigNumbers,
} from "@neufund/shared-utils";
import BigNumber from "bignumber.js";

import { WalletSelectionData } from "../../components/modals/tx-sender/investment-flow/InvestmentTypeSelector";
import { ECurrency } from "../../components/shared/formatters/utils";
import { TGlobalDependencies } from "../../di/setupBindings";
import { ETOCommitment } from "../../lib/contracts/ETOCommitment";
import { ITxData } from "../../lib/web3/types";
import { TAppGlobalState } from "../../store";
import { actions, TActionFromCreator } from "../actions";
import {
  selectEtoById,
  selectEtoOnChainStateById,
  selectEtoWithCompanyAndContractById,
} from "../eto/selectors";
import { EETOStateOnChain, TEtoWithCompanyAndContractReadonly } from "../eto/types";
import { selectStandardGasPriceWithOverHead } from "../gas/selectors";
import { loadComputedContributionFromContract } from "../investor-portfolio/sagas";
import {
  selectCalculatedContribution,
  selectCalculatedEtoTicketSizesUlpsById,
  selectIsWhitelisted,
} from "../investor-portfolio/selectors";
import { neuCall } from "../sagasUtils";
import { selectEtherPriceEur, selectEurPriceEther } from "../shared/tokenPrice/selectors";
import { selectTxGasCostEthUlps, selectTxSenderModalOpened } from "../tx/sender/selectors";
import { INVESTMENT_GAS_AMOUNT } from "../tx/transactions/investment/sagas";
import { ETxSenderType } from "../tx/types";
import { txValidateSaga } from "../tx/validator/sagas";
import {
  selectICBMLockedEtherBalance,
  selectICBMLockedEtherBalanceEuroAmount,
  selectICBMLockedEuroTokenBalance,
  selectLiquidEtherBalance,
  selectLiquidEtherBalanceEuroAmount,
  selectLiquidEuroTokenBalance,
  selectLockedEtherBalance,
  selectLockedEtherBalanceEuroAmount,
  selectLockedEuroTokenBalance,
  selectNEURStatus,
  selectWalletData,
} from "../wallet/selectors";
import { ENEURWalletStatus } from "../wallet/types";
import { EInvestmentErrorState, EInvestmentType } from "./reducer";
import {
  selectInvestmentEthValueUlps,
  selectInvestmentEtoId,
  selectInvestmentEurValueUlps,
  selectInvestmentType,
  selectIsICBMInvestment,
  selectWallets,
} from "./selectors";
import { getCurrencyByInvestmentType, hasBalance } from "./utils";

function* processCurrencyValue(
  action: TActionFromCreator<typeof actions.investmentFlow.submitCurrencyValue>,
): Generator<any, any, any> {
  const state: TAppGlobalState = yield select();

  const value = action.payload.value && convertToUlps(extractNumber(action.payload.value));
  const curr = action.payload.currency;
  const oldVal =
    curr === ECurrency.ETH
      ? selectInvestmentEthValueUlps(state)
      : selectInvestmentEurValueUlps(state);

  // stop if value has not changed. allows editing fractions without overriding user input.
  if (compareBigNumbers(oldVal || "0", value || "0") === 0) return;

  yield put(actions.investmentFlow.setIsInputValidated(false));
  yield computeAndSetCurrencies(value, curr);
  // dispatch in order to debounce, instead of calling directly
  yield put(actions.investmentFlow.validateInputs());
}

export function* computeAndSetCurrencies(value: string, currency: ECurrency): any {
  const state: TAppGlobalState = yield select();
  const etherPriceEur = selectEtherPriceEur(state);
  const eurPriceEther = selectEurPriceEther(state);
  if (!value) {
    yield put(actions.investmentFlow.setEthValue(""));
    yield put(actions.investmentFlow.setEurValue(""));
  } else if (etherPriceEur && etherPriceEur !== "0") {
    const valueAsBigNumber = new BigNumber(value);
    switch (currency) {
      case ECurrency.ETH:
        const eurVal = valueAsBigNumber.mul(etherPriceEur);
        yield put(
          actions.investmentFlow.setEthValue(valueAsBigNumber.toFixed(0, BigNumber.ROUND_UP)),
        );
        yield put(actions.investmentFlow.setEurValue(eurVal.toFixed(0, BigNumber.ROUND_UP)));
        return;
      case ECurrency.EUR_TOKEN:
        const ethVal = valueAsBigNumber.mul(eurPriceEther);
        yield put(actions.investmentFlow.setEthValue(ethVal.toFixed(0, BigNumber.ROUND_UP)));
        yield put(
          actions.investmentFlow.setEurValue(valueAsBigNumber.toFixed(0, BigNumber.ROUND_UP)),
        );
        return;
    }
  }
}

function* investEntireBalance(): any {
  yield setTransactionWithPresetGas();
  const state: TAppGlobalState = yield select();

  const type = selectInvestmentType(state);

  let balance = "";
  switch (type) {
    case EInvestmentType.ICBMEth:
      balance = selectLockedEtherBalance(state);
      yield computeAndSetCurrencies(balance, ECurrency.ETH);
      break;

    case EInvestmentType.ICBMnEuro:
      balance = selectLockedEuroTokenBalance(state);
      yield computeAndSetCurrencies(balance, ECurrency.EUR_TOKEN);
      break;

    case EInvestmentType.NEur:
      balance = selectLiquidEuroTokenBalance(state);
      yield computeAndSetCurrencies(balance, ECurrency.EUR_TOKEN);
      break;

    case EInvestmentType.Eth:
      const gasCostEth = selectTxGasCostEthUlps(state);
      balance = selectLiquidEtherBalance(state);
      const balanceWithoutGas = subtractBigNumbers([balance, gasCostEth]);

      if (compareBigNumbers(balanceWithoutGas, "0") >= 0) {
        yield computeAndSetCurrencies(balanceWithoutGas, ECurrency.ETH);
      } else {
        yield computeAndSetCurrencies(balance, ECurrency.ETH);
      }
      break;
  }

  if (balance) {
    yield put(actions.investmentFlow.validateInputs());
  }
}

function validateInvestment(state: TAppGlobalState): EInvestmentErrorState | undefined {
  const investmentFlow = state.investmentFlow;

  const euroValue = investmentFlow.euroValueUlps;
  const etherValue = investmentFlow.ethValueUlps;

  const wallet = selectWalletData(state);

  const contribs = selectCalculatedContribution(state, investmentFlow.etoId);
  const ticketSizes = selectCalculatedEtoTicketSizesUlpsById(state, investmentFlow.etoId);

  if (!contribs || !euroValue || !wallet || !ticketSizes) return;

  if (investmentFlow.investmentType === EInvestmentType.Eth) {
    const gasPrice = selectTxGasCostEthUlps(state);
    if (
      compareBigNumbers(addBigNumbers([etherValue, gasPrice]), selectLiquidEtherBalance(state)) > 0
    ) {
      return EInvestmentErrorState.ExceedsWalletBalance;
    }
  }

  if (investmentFlow.investmentType === EInvestmentType.ICBMnEuro) {
    if (compareBigNumbers(euroValue, selectLockedEuroTokenBalance(state)) > 0) {
      return EInvestmentErrorState.ExceedsWalletBalance;
    }
  }

  if (investmentFlow.investmentType === EInvestmentType.NEur) {
    if (compareBigNumbers(euroValue, selectLiquidEuroTokenBalance(state)) > 0) {
      return EInvestmentErrorState.ExceedsWalletBalance;
    }
  }

  if (investmentFlow.investmentType === EInvestmentType.ICBMEth) {
    if (compareBigNumbers(etherValue, selectLockedEtherBalance(state)) > 0) {
      return EInvestmentErrorState.ExceedsWalletBalance;
    }
  }

  if (compareBigNumbers(euroValue, ticketSizes.minTicketEurUlps) < 0) {
    return EInvestmentErrorState.BelowMinimumTicketSize;
  }

  if (compareBigNumbers(euroValue, ticketSizes.maxTicketEurUlps) > 0) {
    return EInvestmentErrorState.AboveMaximumTicketSize;
  }

  if (contribs.maxCapExceeded) {
    return EInvestmentErrorState.ExceedsTokenAmount;
  }

  return;
}

function* validateAndCalculateInputs({ contractsService }: TGlobalDependencies): any {
  // debounce validation
  yield delay(300);

  yield put(actions.investmentFlow.setErrorState());
  let state: TAppGlobalState = yield select();
  const eto = selectEtoById(state, state.investmentFlow.etoId);
  const value = state.investmentFlow.euroValueUlps;

  if (value && compareBigNumbers(value, "0") < 0) {
    return yield put(
      actions.investmentFlow.setErrorState(EInvestmentErrorState.ExceedsWalletBalance),
    );
  } else if (value && eto) {
    const etoContract: ETOCommitment = yield contractsService.getETOCommitmentContract(eto.etoId);
    if (etoContract) {
      const isICBM = selectIsICBMInvestment(state);

      const contribution = yield neuCall(loadComputedContributionFromContract, eto, value, isICBM);

      yield put(actions.investorEtoTicket.setCalculatedContribution(eto.etoId, contribution));

      state = yield select();
      const validation = validateInvestment(state);

      if (validation) {
        return yield put(actions.investmentFlow.setErrorState(validation));
      }

      const txData: ITxData = yield neuCall(
        txValidateSaga,
        actions.txValidator.validateDraft({ type: ETxSenderType.INVEST }),
      );
      yield put(actions.txSender.setTransactionData(txData));

      yield put(actions.investmentFlow.setIsInputValidated(true));
    }
  } else {
    yield put(actions.investmentFlow.setErrorState());
  }
}

function* start(
  action: TActionFromCreator<typeof actions.investmentFlow.startInvestment>,
): Generator<any, any, any> {
  const { etoId } = action.payload;
  const eto: TEtoWithCompanyAndContractReadonly = nonNullable(
    yield* select((state: TAppGlobalState) => selectEtoWithCompanyAndContractById(state, etoId)),
  );

  yield put(actions.investmentFlow.resetInvestment());
  yield put(actions.investmentFlow.setEtoId(etoId));
  yield put(actions.kyc.kycLoadStatusAndData());
  yield put(actions.investorEtoTicket.loadEtoInvestorTicket(eto));

  yield put(actions.investorEtoTicket.loadTokenPersonalDiscount(eto));
  yield put(actions.eto.loadTokenTerms(eto));

  // wait for discount to be in the state
  yield all([
    take(actions.eto.setTokenGeneralDiscounts),
    take(actions.investorEtoTicket.setTokenPersonalDiscount),
  ]);

  yield put(actions.txTransactions.startInvestment(etoId));

  yield take("TX_SENDER_SHOW_MODAL");
  yield createWallets();
  yield selectInitialInvestmentType();

  yield resetTxDataAndValidations();
}

export function* onInvestmentTxModalHide(): any {
  yield put(actions.investmentFlow.resetInvestment());
}

function* createWallets(): Generator<any, void, any> {
  const walletData = yield* call(getInvestmentWalletData);
  yield put(actions.investmentFlow.setWallets(walletData));
}

export function* selectInitialInvestmentType(): Generator<any, void, any> {
  const wallets = yield* select(selectWallets);
  yield put(actions.investmentFlow.selectInvestmentType(wallets[0]?.type));
}

function* getInvestmentWalletData(): Generator<any, WalletSelectionData[], any> {
  const state: TAppGlobalState = yield select();
  const etoId = yield* select(selectInvestmentEtoId);
  const etoOnChainState = yield* select(selectEtoOnChainStateById, etoId);

  const activeTypes: WalletSelectionData[] = [];

  // no regular investment if not whitelisted in pre eto
  if (
    (etoOnChainState === EETOStateOnChain.Whitelist && selectIsWhitelisted(state, etoId)) ||
    etoOnChainState !== EETOStateOnChain.Whitelist
  ) {
    //eth wallet
    const liquidEthBalance = yield* select(selectLiquidEtherBalance);

    if (hasBalance(liquidEthBalance)) {
      const liquidEthEurBalance = yield* select(selectLiquidEtherBalanceEuroAmount);
      activeTypes.push({
        balanceEth: liquidEthBalance,
        balanceEur: liquidEthEurBalance,
        type: EInvestmentType.Eth,
        name: "ETH Balance",
        enabled: true,
      });
    }

    //neur wallet
    // only if neur is not restricted because of the us state
    const neurStatus = yield* select(selectNEURStatus);
    const balanceNEur = yield* select(selectLiquidEuroTokenBalance);

    if (hasBalance(balanceNEur) && neurStatus !== ENEURWalletStatus.DISABLED_RESTRICTED_US_STATE) {
      activeTypes.push({
        balanceNEuro: balanceNEur,
        balanceEur: balanceNEur,
        type: EInvestmentType.NEur,
        name: "nEUR Balance",
        enabled: true,
      });
    }
  }

  //eth icbm
  // ICBM investment is active only if unlocked balance available
  const icbmBalanceEth = yield* select(selectLockedEtherBalance);
  const lockedIcbmBalanceEth = yield* select(selectICBMLockedEtherBalance);

  const hasIcbmEthBalance = hasBalance(icbmBalanceEth);
  const hasLockedIcbmEthBalance = hasBalance(lockedIcbmBalanceEth);

  if (hasIcbmEthBalance || hasLockedIcbmEthBalance) {
    const lockedEthEurBalance = yield* select(selectLockedEtherBalanceEuroAmount);
    const lockedIcbmEthEurBalance = yield* select(selectICBMLockedEtherBalanceEuroAmount);

    activeTypes.push({
      type: EInvestmentType.ICBMEth,
      name: "ICBM Balance",
      balanceEth: icbmBalanceEth,
      balanceEur: lockedEthEurBalance,
      icbmBalanceEth: lockedIcbmBalanceEth,
      icbmBalanceEur: lockedIcbmEthEurBalance,
      enabled: hasIcbmEthBalance,
    });
  }

  //eur icbm
  // ICBM investment is active only if unlocked balance available
  const icbmEuroBalance = yield* select(selectLockedEuroTokenBalance);
  const lockedIcbmEuroBalance = yield* select(selectICBMLockedEuroTokenBalance);

  const hasIcbmEuroBalance = hasBalance(icbmEuroBalance);
  const hasLockedIcbmEuroBalance = hasBalance(lockedIcbmEuroBalance);

  if (hasIcbmEuroBalance || hasLockedIcbmEuroBalance) {
    activeTypes.push({
      type: EInvestmentType.ICBMnEuro,
      name: "ICBM Balance",
      balanceNEuro: icbmEuroBalance,
      balanceEur: icbmEuroBalance,
      icbmBalanceNEuro: lockedIcbmEuroBalance,
      icbmBalanceEur: lockedIcbmEuroBalance,
      enabled: hasIcbmEuroBalance,
    });
  }

  //this is a workaround for users with no funds
  // until we redesign the investment flow
  if (activeTypes.length === 0) {
    activeTypes.push({
      balanceEth: "0",
      balanceEur: "0",
      type: EInvestmentType.Eth,
      name: "ETH Balance",
      enabled: true,
    });
    activeTypes.push({
      balanceNEuro: "0",
      balanceEur: "0",
      type: EInvestmentType.NEur,
      name: "nEUR Balance",
      enabled: true,
    });
  }
  return activeTypes;
}

export function* recalculateCurrencies(): any {
  yield delay(100); // wait for new token price to be available
  const s: TAppGlobalState = yield select();
  const type = selectInvestmentType(s);

  if (type === undefined) {
    throw new Error("Investment Type can't undefined at this moment");
  }

  const curr = getCurrencyByInvestmentType(type);
  const ethVal = selectInvestmentEthValueUlps(s);
  const eurVal = selectInvestmentEurValueUlps(s);

  if (curr === ECurrency.ETH && ethVal) {
    yield call(computeAndSetCurrencies, ethVal, curr);
  } else if (eurVal) {
    yield call(computeAndSetCurrencies, eurVal, curr);
  }
}

function* setTransactionWithPresetGas(): any {
  const gasPrice = yield select(selectStandardGasPriceWithOverHead);

  yield put(
    actions.txSender.setTransactionData({
      gas: INVESTMENT_GAS_AMOUNT,
      value: "",
      to: "",
      from: "",
      gasPrice,
    }),
    // This sets all other irrelevant values into false values.
    // TODO: Refactor the whole transaction flow into a simpler flow that doesn't relay on txData
  );
}

function* resetTxDataAndValidations(): any {
  yield put(actions.txValidator.clearValidationState());
  yield put(actions.txSender.txSenderClearTransactionData());
}

function* stop(): any {
  // TODO: Decouple stop from @@router/LOCATION_CHANGE as txSenderHideModal
  //       is being called on every Router change
  // THIS IS A QUICK FIX
  const isOpen = yield select(selectTxSenderModalOpened);
  if (isOpen) yield put(actions.txSender.txSenderHideModal());
}

export function* investmentFlowSagas(): any {
  yield takeEvery(actions.investmentFlow.submitCurrencyValue, processCurrencyValue);
  yield takeLatest(actions.investmentFlow.validateInputs, neuCall, validateAndCalculateInputs);
  yield takeEvery(actions.investmentFlow.startInvestment, start);
  yield takeEvery("TOKEN_PRICE_SAVE", recalculateCurrencies);
  yield takeEvery(actions.investmentFlow.selectInvestmentType, resetTxDataAndValidations);
  yield takeEvery(actions.investmentFlow.investEntireBalance, investEntireBalance);
  yield takeEvery("@@router/LOCATION_CHANGE", stop); // stop investment if some link is clicked
}
