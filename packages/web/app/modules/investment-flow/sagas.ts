import { all, delay, put, select, take, takeEvery, takeLatest } from "@neufund/sagas";
import {
  addBigNumbers,
  compareBigNumbers,
  convertToUlps,
  ECurrency,
  extractNumber,
  nonNullable,
  subtractBigNumbers,
} from "@neufund/shared";
import BigNumber from "bignumber.js";

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
  selectLiquidEtherBalance,
  selectLiquidEuroTokenBalance,
  selectLockedEtherBalance,
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
} from "./selectors";
import { getCurrencyByInvestmentType } from "./utils";

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

function* computeAndSetCurrencies(value: string, currency: ECurrency): any {
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
      balance = subtractBigNumbers([balance, gasCostEth]);
      yield computeAndSetCurrencies(balance, ECurrency.ETH);
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

  if (value && eto) {
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
  const etoId = action.payload.etoId;
  const eto: TEtoWithCompanyAndContractReadonly = nonNullable(
    yield select((state: TAppGlobalState) => selectEtoWithCompanyAndContractById(state, etoId)),
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
  yield getActiveInvestmentTypes();
  yield resetTxDataAndValidations();
}

export function* onInvestmentTxModalHide(): any {
  yield put(actions.investmentFlow.resetInvestment());
}

function* getActiveInvestmentTypes(): Generator<any, any, any> {
  const state: TAppGlobalState = yield select();
  const etoId = selectInvestmentEtoId(state);
  const etoOnChainState = selectEtoOnChainStateById(state, etoId);
  const neurStatus = selectNEURStatus(state);

  let activeTypes: EInvestmentType[] = [EInvestmentType.Eth];

  // if neur is not restricted because of the us state
  if (neurStatus !== ENEURWalletStatus.DISABLED_RESTRICTED_US_STATE) {
    activeTypes.unshift(EInvestmentType.NEur);
  }

  // no regular investment if not whitelisted in pre eto
  if (etoOnChainState === EETOStateOnChain.Whitelist && !selectIsWhitelisted(state, etoId)) {
    activeTypes = [];
  }

  // only ICBM investment if balance available
  if (compareBigNumbers(selectLockedEuroTokenBalance(state), "0") > 0) {
    activeTypes.unshift(EInvestmentType.ICBMnEuro);
  }
  if (compareBigNumbers(selectLockedEtherBalance(state), "0") > 0) {
    activeTypes.unshift(EInvestmentType.ICBMEth);
  }

  yield put(actions.investmentFlow.setActiveInvestmentTypes(activeTypes));

  // guarantee that current type is inside active types.
  const currentType = selectInvestmentType(state);
  if (currentType && !activeTypes.includes(currentType)) {
    yield put(actions.investmentFlow.selectInvestmentType(activeTypes[0]));
  }
}

function* recalculateCurrencies(): any {
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
    yield computeAndSetCurrencies(ethVal, curr);
  } else if (eurVal) {
    yield computeAndSetCurrencies(eurVal, curr);
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
