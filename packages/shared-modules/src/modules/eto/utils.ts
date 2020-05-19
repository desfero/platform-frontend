import { DeepPartial, EthereumAddressWithChecksum, Overwrite } from "@neufund/shared-utils";
import BigNumber from "bignumber.js";
import { includes } from "lodash/fp";

import {
  EEtoMarketingDataVisibleInPreview,
  EEtoState,
  TEtoSpecsData,
} from "./lib/http/eto-api/EtoApi.interfaces.unsafe";
import { EJurisdiction } from "./lib/http/eto-api/EtoProductsApi.interfaces";
import {
  calculateCurrentInvestmentProgressPercentage,
  calculateTarget,
} from "./lib/http/eto-api/EtoUtils";
import {
  EETOStateOnChain,
  EEtoSubState,
  IEtoTotalInvestment,
  TEtoContractData,
  TEtoStartOfStates,
  TEtoWithCompanyAndContractReadonly,
} from "./types";

export const isPastInvestment = (etoState: EETOStateOnChain) =>
  includes(etoState, [EETOStateOnChain.Payout, EETOStateOnChain.Refund, EETOStateOnChain.Claim]);

export const amendEtoToCompatibleFormat = (
  eto: DeepPartial<TEtoSpecsData>,
): DeepPartial<TEtoSpecsData> =>
  eto && {
    ...eto,
    product: {
      ...eto.product,
      jurisdiction:
        eto.product &&
        eto.product.jurisdiction &&
        (eto.product.jurisdiction.toUpperCase() as EJurisdiction),
    },
  };

export const convertToEtoTotalInvestment = (
  [totalEquivEurUlps, totalTokensInt, totalInvestors]: [BigNumber, BigNumber, BigNumber],
  euroTokenBalance: BigNumber,
  etherTokenBalance: BigNumber,
): IEtoTotalInvestment => ({
  totalEquivEurUlps: totalEquivEurUlps.toString(),
  totalTokensInt: totalTokensInt.toString(),
  totalInvestors: totalInvestors.toString(),
  euroTokenBalance: euroTokenBalance.toString(),
  etherTokenBalance: etherTokenBalance.toString(),
});

const convertToDate = (startOf: BigNumber): Date | undefined => {
  if (startOf.isZero()) {
    return undefined;
  }

  return new Date(startOf.mul("1000").toNumber());
};

export const convertToStateStartDate = (
  startOfStates: [BigNumber, BigNumber, BigNumber, BigNumber, BigNumber, BigNumber, BigNumber],
): TEtoStartOfStates => {
  const [
    startOfSetup,
    startOfWhitelist,
    startOfPublic,
    startOfSigning,
    startOfClaim,
    startOfPayout,
    startOfRefund,
  ] = startOfStates.map(convertToDate);

  return {
    [EETOStateOnChain.Setup]: startOfSetup,
    [EETOStateOnChain.Whitelist]: startOfWhitelist,
    [EETOStateOnChain.Public]: startOfPublic,
    [EETOStateOnChain.Signing]: startOfSigning,
    [EETOStateOnChain.Claim]: startOfClaim,
    [EETOStateOnChain.Payout]: startOfPayout,
    [EETOStateOnChain.Refund]: startOfRefund,
  };
};

export function isOnChain(
  eto: TEtoWithCompanyAndContractReadonly,
): eto is Overwrite<
  TEtoWithCompanyAndContractReadonly,
  { contract: Exclude<TEtoWithCompanyAndContractReadonly["contract"], undefined> }
> {
  return eto.state === EEtoState.ON_CHAIN && eto.contract !== undefined;
}

export const isRestrictedEto = (eto: TEtoWithCompanyAndContractReadonly): boolean =>
  eto.product.jurisdiction === EJurisdiction.GERMANY &&
  !(eto.contract && isPastInvestment(eto.contract.timedState));

/**
 * Check if user is associated with given eto
 * @returns true if user is either the issuer or nominee of the eto
 */
export const isUserAssociatedWithEto = (
  eto: TEtoWithCompanyAndContractReadonly,
  userId: EthereumAddressWithChecksum,
) => eto.companyId === userId || eto.nominee === userId;

type TCalculateSubStateOptions = {
  eto: TEtoSpecsData;
  contract: TEtoContractData | undefined;
  isEligibleToPreEto: boolean;
};

/**
 * Check if eto is still in preparation
 * @returns {boolean} true when ETO is either in PREVIEW or PENDING state
 */
export const isComingSoon = (state: EEtoState): boolean =>
  EEtoState.PREVIEW === state || EEtoState.PENDING === state;

/**
 * Check if eto is active (either presale or public sale)
 */
export const isFundraisingActive = (eto: TEtoWithCompanyAndContractReadonly): boolean => {
  if (isOnChain(eto)) {
    return (
      eto.contract.timedState === EETOStateOnChain.Whitelist ||
      eto.contract.timedState === EETOStateOnChain.Public
    );
  }

  return false;
};

/**
 * Calculates sub state of the ETO
 * Should not be connected with issuer or investor states
 * @todo Remove `isEligibleToPreEto` as it's related to investor
 */
export const getEtoSubState = ({
  eto,
  contract,
  isEligibleToPreEto,
}: TCalculateSubStateOptions): EEtoSubState | undefined => {
  switch (eto.state) {
    /**
     * Sub states 'PREVIEW' can generate
     * - MARKETING_LISTING_IN_REVIEW: after submitting marketing listing to review
     */
    case EEtoState.PREVIEW: {
      if (
        eto.isMarketingDataVisibleInPreview === EEtoMarketingDataVisibleInPreview.VISIBILITY_PENDING
      ) {
        return EEtoSubState.MARKETING_LISTING_IN_REVIEW;
      }

      return undefined;
    }

    case EEtoState.SUSPENDED:
    case EEtoState.PENDING:
      return undefined;

    case EEtoState.LISTED:
    case EEtoState.PROSPECTUS_APPROVED: {
      if (eto.isBookbuilding) {
        return EEtoSubState.WHITELISTING;
      }

      return EEtoSubState.CAMPAIGNING;
    }
    case EEtoState.ON_CHAIN: {
      if (!contract) {
        throw new Error(`Eto ${eto.etoId} is on chain but without contracts deployed`);
      }

      switch (contract.timedState) {
        case EETOStateOnChain.Setup:
          if (eto.isBookbuilding) {
            return EEtoSubState.WHITELISTING;
          }

          if (!eto.startDate) {
            return EEtoSubState.CAMPAIGNING;
          }

          return isEligibleToPreEto
            ? EEtoSubState.COUNTDOWN_TO_PRESALE
            : EEtoSubState.COUNTDOWN_TO_PUBLIC_SALE;

        case EETOStateOnChain.Whitelist:
          if (!isEligibleToPreEto) {
            return EEtoSubState.COUNTDOWN_TO_PUBLIC_SALE;
          }

          return undefined;
      }

      return undefined;
    }
  }
};
export const getInvestmentCalculatedPercentage = (eto: TEtoWithCompanyAndContractReadonly) => {
  if (isOnChain(eto)) {
    const { totalTokensInt } = eto.contract.totalInvestment;
    const { minimumNewSharesToIssue, equityTokensPerShare } = eto;

    return calculateCurrentInvestmentProgressPercentage(
      totalTokensInt,
      minimumNewSharesToIssue.toString(),
      equityTokensPerShare.toString(),
    );
  }
  return undefined;
};

export const getEtoEurMinTarget = (eto: TEtoWithCompanyAndContractReadonly) => {
  if (
    [
      EEtoState.LISTED,
      EEtoState.PROSPECTUS_APPROVED,
      EEtoState.ON_CHAIN,
      EEtoState.SUSPENDED,
    ].includes(eto.state)
  ) {
    const { minimumNewSharesToIssue, equityTokensPerShare } = eto;

    const totalTokensInt = isOnChain(eto) ? eto.contract.totalInvestment.totalTokensInt : "0";
    const totalEquivEurUlps = isOnChain(eto) ? eto.contract.totalInvestment.totalEquivEurUlps : "0";

    return calculateTarget(
      minimumNewSharesToIssue.toString(),
      equityTokensPerShare.toString(),
      totalTokensInt,
      totalEquivEurUlps,
    );
  }

  return undefined;
};

export const getEtoEurMaxTarget = (eto: TEtoWithCompanyAndContractReadonly) => {
  if (isOnChain(eto)) {
    const { newSharesToIssue, equityTokensPerShare } = eto;
    const { totalTokensInt, totalEquivEurUlps } = eto.contract.totalInvestment;

    return calculateTarget(
      newSharesToIssue.toString(),
      equityTokensPerShare.toString(),
      totalTokensInt,
      totalEquivEurUlps,
    );
  }

  return undefined;
};

export const getEtoNextStateStartDate = (eto: TEtoWithCompanyAndContractReadonly | undefined) => {
  if (eto && isOnChain(eto)) {
    const nextState: EETOStateOnChain | undefined = eto.contract.timedState + 1;

    if (nextState) {
      return eto.contract.startOfStates[nextState];
    }
  }

  return undefined;
};

export const etoIsInOfferState = (onChainState: EETOStateOnChain | undefined) =>
  [
    EETOStateOnChain.Setup,
    EETOStateOnChain.Whitelist,
    EETOStateOnChain.Public,
    EETOStateOnChain.Signing,
  ].some(offerState => offerState === onChainState);
