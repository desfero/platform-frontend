import { select } from "@neufund/sagas";
import { EUserType } from "@neufund/shared-modules";
import BigNumber from "bignumber.js";
import { TestContext, TestOptions } from "yup";

import { isValidNumber } from "../../components/shared/formatters/utils";
import {
  getMessageTranslation,
  ValidationMessage,
} from "../../components/translatedMessages/messages";
import { createMessage } from "../../components/translatedMessages/utils";
import {
  EEtoState,
  TEtoInvestmentCalculatedValues,
} from "../../lib/api/eto/EtoApi.interfaces.unsafe";
import { selectIsUserFullyVerified, selectUserType } from "../auth/selectors";
import { EETOStateOnChain } from "../eto/types";

// TODO: remove state machine duplication! EEtoSubState has same role
// use one state machine to drive both thumbnail and this widget!
export enum EWhitelistingState {
  ACTIVE = "active",
  NOT_ACTIVE = "notActive",
  LIMIT_REACHED = "limitReached",
  SUSPENDED = "suspended",
  STOPPED = "stopped",
  LOADING = "loading",
}

type TcalculateWhitelistingState = {
  canEnableBookbuilding: boolean;
  whitelistingIsActive: boolean;
  bookbuildingLimitReached: boolean | undefined;
  investorsCount: number | undefined;
  investmentCalculatedValues: TEtoInvestmentCalculatedValues | undefined;
  isAuthorized: boolean;
  isInvestor: boolean;
};

export const isPledgeAboveMinimum = (minPledge: number): TestOptions => ({
  name: "minAmount",
  message: getMessageTranslation(
    createMessage(ValidationMessage.VALIDATION_MIN_PLEDGE, minPledge),
  ) as string,
  test: function(this: TestContext, value: string): boolean {
    return isValidNumber(value) && new BigNumber(value).greaterThanOrEqualTo(minPledge.toString());
  },
});

export const shouldLoadBookbuildingStats = (
  etoState: EEtoState,
  onChainState: EETOStateOnChain | undefined,
): boolean =>
  [EEtoState.LISTED, EEtoState.PROSPECTUS_APPROVED, EEtoState.ON_CHAIN].indexOf(etoState) >= 0 &&
  (onChainState === undefined || onChainState < EETOStateOnChain.Claim);

export const isPledgeNotAboveMaximum = (maxPledge?: number): TestOptions => ({
  name: "minAmount",
  message: getMessageTranslation(
    createMessage(ValidationMessage.VALIDATION_MAX_PLEDGE, maxPledge),
  ) as string,
  test: function(this: TestContext, value: string): boolean {
    return (
      isValidNumber(value) &&
      new BigNumber(value).lessThanOrEqualTo(maxPledge ? maxPledge.toString() : Infinity.toString())
    );
  },
});

export const calculateWhitelistingState = ({
  canEnableBookbuilding,
  whitelistingIsActive,
  bookbuildingLimitReached,
  investorsCount,
  investmentCalculatedValues,
  isAuthorized,
  isInvestor,
}: TcalculateWhitelistingState) => {
  //TODO this should be put in line with api after API's canEnableBookbuilding after limit is reached gets fixed by Marcin
  if (
    isAuthorized &&
    isInvestor &&
    whitelistingIsActive &&
    (investmentCalculatedValues === undefined || bookbuildingLimitReached === undefined)
  ) {
    return EWhitelistingState.LOADING;
  } else if (bookbuildingLimitReached) {
    return EWhitelistingState.LIMIT_REACHED;
  } else if (whitelistingIsActive) {
    return EWhitelistingState.ACTIVE;
  } else if (
    !whitelistingIsActive &&
    !canEnableBookbuilding &&
    investorsCount &&
    investorsCount > 0
  ) {
    return EWhitelistingState.STOPPED;
  } else if (!whitelistingIsActive && !canEnableBookbuilding && investorsCount === 0) {
    return EWhitelistingState.NOT_ACTIVE;
  } else if (
    !whitelistingIsActive &&
    canEnableBookbuilding &&
    investorsCount &&
    !bookbuildingLimitReached
  ) {
    return EWhitelistingState.SUSPENDED;
  } else {
    return EWhitelistingState.NOT_ACTIVE;
  }
};

export function* canLoadPledges(): Generator<any, boolean, void> {
  const userType = yield* select(selectUserType);
  const isVerified = yield* select(selectIsUserFullyVerified);
  return !(userType !== EUserType.INVESTOR || !isVerified);
}
