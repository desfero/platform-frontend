import { EUserType } from "@neufund/shared-modules";
import { DataUnavailableError, DeepReadonly, nonNullable } from "@neufund/shared-utils";
import { find } from "lodash/fp";
import createCachedSelector from "re-reselect";
import { createSelector } from "reselect";

import { selectUserType } from "../auth/user/selectors";
import { selectIssuerEto, selectIssuerEtoWithCompanyAndContract } from "../eto-flow/selectors";
import { selectIsEligibleToPreEto } from "../investor-portfolio/selectors";
import { selectActiveNomineeEto } from "../nominee-flow/selectors";
import { hiddenJurisdictions } from "./constants";
import {
  EEtoState,
  TEtoDataWithCompany,
  TEtoInvestmentCalculatedValues,
  TEtoSpecsData,
} from "./lib/http/eto-api/EtoApi.interfaces.unsafe";
import { calcShareAndTokenPrice } from "./lib/http/eto-api/EtoUtils";
import { TEtoModuleState } from "./module";
import { IEtoState } from "./reducer";
import {
  EETOStateOnChain,
  IEtoTokenData,
  TEtoStartOfStates,
  TEtoWithCompanyAndContractReadonly,
} from "./types";
import { etoIsInOfferState, getEtoNextStateStartDate, getEtoSubState } from "./utils";

const selectEtoState = (state: TEtoModuleState) => state.eto;

const selectEtoPreviewCode = (state: TEtoModuleState, etoId: string) => {
  const eto = find(e => e!.etoId === etoId, state.eto.etos);

  if (eto) {
    return eto.previewCode;
  }

  return undefined;
};

export const selectEtoTokenName = (state: TEtoModuleState, etoId: string) => {
  const eto = find(e => e!.etoId === etoId, state.eto.etos);

  if (eto) {
    return eto.equityTokenName;
  }

  return undefined;
};

export const selectEto = createSelector(
  selectEtoState,
  (_: TEtoModuleState, previewCode: string) => previewCode,
  (etoState: DeepReadonly<IEtoState>, previewCode: string) => etoState.etos[previewCode],
);

export const selectCompany = createSelector(
  selectEtoState,
  (_: TEtoModuleState, companyId: string) => companyId,
  (etoState: DeepReadonly<IEtoState>, companyId: string) => etoState.companies[companyId],
);

export const selectEtoContract = (state: TEtoModuleState, previewCode: string) =>
  state.eto.contracts[previewCode];

// TODO: Check why the type is inferred as `any` without explicit return type information
export const selectEtoById = (state: TEtoModuleState, etoId: string): TEtoSpecsData | undefined => {
  const previewCode = selectEtoPreviewCode(state, etoId);

  if (previewCode) {
    return state.eto.etos[previewCode];
  }

  return undefined;
};

export const selectEtoSubState = createCachedSelector(
  // forward eto param to combiner
  (_: TEtoModuleState, eto: TEtoSpecsData) => eto,
  (state: TEtoModuleState, eto: TEtoSpecsData) => selectIsEligibleToPreEto(state, eto.etoId),
  (state: TEtoModuleState, eto: TEtoSpecsData) => selectEtoContract(state, eto.previewCode),
  (eto, isEligibleToPreEto, contract) => getEtoSubState({ eto, contract, isEligibleToPreEto }),
)((_: TEtoModuleState, eto: TEtoSpecsData) => eto.previewCode);

//todo this is a workaround, remove it when etos are stored consistently across apis
export const selectEtoSubStateEtoEtoWithContract = createCachedSelector(
  // forward eto param to combiner
  (_: TEtoModuleState, eto: TEtoWithCompanyAndContractReadonly) => eto,
  (state: TEtoModuleState, eto: TEtoWithCompanyAndContractReadonly) =>
    selectIsEligibleToPreEto(state, eto.etoId),
  (eto, isEligibleToPreEto) => getEtoSubState({ eto, contract: eto.contract, isEligibleToPreEto }),
)((_: TEtoModuleState, eto: TEtoWithCompanyAndContractReadonly) => eto.previewCode);

const selectEtoWithCompanyAndContractInternal = createCachedSelector(
  // forward eto param to combiner
  (_: TEtoModuleState, eto: TEtoSpecsData) => eto,
  (state: TEtoModuleState, eto: TEtoSpecsData) => selectEtoContract(state, eto.previewCode),
  (state: TEtoModuleState, eto: TEtoSpecsData) => nonNullable(selectCompany(state, eto.companyId)),
  (state: TEtoModuleState, eto: TEtoSpecsData) => selectEtoSubState(state, eto),
  (eto, contract, company, subState) => ({
    ...eto,
    contract,
    company,
    subState,
  }),
)((_: TEtoModuleState, eto: TEtoSpecsData) => eto.previewCode);

export const selectEtoWithCompanyAndContract = (state: TEtoModuleState, previewCode?: string) => {
  const userType = selectUserType(state);
  switch (userType) {
    case EUserType.NOMINEE:
      return selectActiveNomineeEto(state);
    case EUserType.ISSUER:
      if (previewCode !== undefined) {
        return selectInvestorEtoWithCompanyAndContract(state, previewCode);
      } else {
        return selectIssuerEtoWithCompanyAndContract(state);
      }
    case EUserType.INVESTOR:
    default:
      if (previewCode === undefined) {
        throw new DataUnavailableError("preview code missing");
      }
      return selectInvestorEtoWithCompanyAndContract(state, previewCode);
  }
};

export const selectInvestorEtoWithCompanyAndContract = (
  state: TEtoModuleState,
  previewCode: string,
): TEtoWithCompanyAndContractReadonly | undefined => {
  const eto = selectEto(state, previewCode);
  if (eto) {
    return selectEtoWithCompanyAndContractInternal(state, eto);
  }

  return undefined;
};

export const selectEtoWithCompanyAndContractById = (
  state: TEtoModuleState,
  etoId: string,
): TEtoWithCompanyAndContractReadonly | undefined => {
  const previewCode = selectEtoPreviewCode(state, etoId);

  if (previewCode) {
    return selectInvestorEtoWithCompanyAndContract(state, previewCode);
  }

  return undefined;
};

export const selectEtos = (
  state: TEtoModuleState,
): TEtoWithCompanyAndContractReadonly[] | undefined => {
  const etoState = selectEtoState(state);

  if (etoState.displayOrder) {
    return etoState.displayOrder
      .map(id => selectInvestorEtoWithCompanyAndContract(state, id)!)
      .filter(Boolean);
  }

  return undefined;
};

export const selectEtoOnChainState = (
  state: TEtoModuleState,
  previewCode: string,
): EETOStateOnChain | undefined => {
  const contract = state.eto.contracts[previewCode];
  return contract && contract.timedState;
};

export const selectEtoStartOfStates = (
  state: TEtoModuleState,
  previewCode: string,
): TEtoStartOfStates | undefined => {
  const contract = state.eto.contracts[previewCode];
  return contract && contract.startOfStates;
};

export const selectEtoOnChainNextStateStartDate = (
  state: TEtoModuleState,
  previewCode: string,
): Date | undefined => {
  const eto = selectInvestorEtoWithCompanyAndContract(state, previewCode);
  return getEtoNextStateStartDate(eto);
};

export const selectEtoWidgetError = (state: DeepReadonly<IEtoState>): boolean | undefined =>
  state.etoWidgetError;

export const selectEtoOnChainStateById = (
  state: TEtoModuleState,
  etoId: string,
): EETOStateOnChain | undefined => {
  const code = selectEtoPreviewCode(state, etoId);
  return code ? selectEtoOnChainState(state, code) : undefined;
};

export const selectTokenData = (
  state: DeepReadonly<IEtoState>,
  previewCode: string,
): IEtoTokenData | undefined => state.tokenData[previewCode];

export const selectIsEtoAnOffer = (
  state: TEtoModuleState,
  previewCode: string,
  etoState: EEtoState,
) => {
  if (etoState !== EEtoState.ON_CHAIN) {
    return true;
  }
  const onChainState = selectEtoOnChainState(state, previewCode);
  return etoIsInOfferState(onChainState);
};

export const selectFilteredEtosByRestrictedJurisdictions = (
  state: TEtoModuleState,
  etos: TEtoDataWithCompany[],
  jurisdiction: string | undefined,
) =>
  jurisdiction
    ? etos.filter(eto => {
        // @See https://github.com/Neufund/platform-frontend/issues/2789#issuecomment-489084892
        const isEtoAnOffer = selectIsEtoAnOffer(state, eto.previewCode, eto.state);
        return (
          !isEtoAnOffer ||
          !(
            hiddenJurisdictions[jurisdiction] &&
            hiddenJurisdictions[jurisdiction].some(
              (hiddenJurisdiction: string) => hiddenJurisdiction === eto.product.jurisdiction,
            )
          )
        );
      })
    : etos;

export const selectAgreementsStatus = createSelector(
  selectEtoState,
  (_: TEtoModuleState, previewCode: string) => previewCode,
  (etoState: DeepReadonly<IEtoState>, previewCode: string) =>
    etoState.offeringAgreementsStatus[previewCode],
);

export const selectEtoTokenGeneralDiscounts = createSelector(
  selectEtoState,
  (_: TEtoModuleState, etoId: string) => etoId,
  (etoState: DeepReadonly<IEtoState>, etoId: string) => etoState.tokenGeneralDiscounts[etoId],
);

export const selectEtoTokenStandardPrice = createSelector(
  selectInvestorEtoWithCompanyAndContract,
  eto => {
    if (eto) {
      const { tokenPrice } = calcShareAndTokenPrice(eto);

      return tokenPrice;
    }

    return undefined;
  },
);

export const selectInvestmentAgreement = (state: TEtoModuleState, previewCode: string) => {
  const eto = selectEtoState(state);

  return eto.signedInvestmentAgreements[previewCode];
};

export const selectInvestmentAgreementLoading = createSelector(
  selectInvestmentAgreement,
  agreement => {
    if (agreement) {
      return agreement.isLoading;
    }

    return false;
  },
);

export const selectSignedInvestmentAgreementHash = createSelector(
  selectInvestmentAgreement,
  agreement => {
    if (agreement) {
      return agreement.url;
    }

    return undefined;
  },
);

export const selectIssuerEtoInvestmentCalculatedValues = (
  state: TEtoModuleState,
): TEtoInvestmentCalculatedValues | undefined => {
  const eto = selectIssuerEto(state);
  return eto && eto.investmentCalculatedValues;
};

export const selectStartOfOnchainState = (
  state: TEtoModuleState,
  previewCode: string,
  onChainState: EETOStateOnChain,
) => {
  const eto = selectEtoWithCompanyAndContract(state, previewCode);

  const startOfStates = eto && eto.contract && eto.contract.startOfStates;

  return startOfStates && startOfStates[onChainState];
};

export const selectEtosError = createSelector(selectEtoState, eto => eto.etosError);

export const selectTokensLoading = createSelector(selectEtoState, eto => eto.tokensLoading);
