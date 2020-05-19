import { Dictionary } from "@neufund/shared-utils";

import { FUNDING_ROUNDS } from "../../../components/eto/shared/constants";
import { EEtoFormTypes } from "../../../modules/eto-flow/types";
import { TEtoWithCompanyAndContractReadonly } from "../../../modules/eto/types";
import { EEtoState, EFundingRound } from "./EtoApi.interfaces.unsafe";

export const etoFormIsReadonly = (formName: EEtoFormTypes, etoState?: EEtoState) => {
  const readOnlyForms = [
    EEtoFormTypes.EtoEquityTokenInfo,
    EEtoFormTypes.EtoTerms,
    EEtoFormTypes.EtoVotingRights,
    EEtoFormTypes.EtoInvestmentTerms,
  ];
  return etoState !== EEtoState.PREVIEW && readOnlyForms.includes(formName);
};

export const NEXT_FUNDING_ROUNDS: Dictionary<EFundingRound | undefined, EFundingRound> = {
  [EFundingRound.PRE_SEED]: EFundingRound.SEED,
  [EFundingRound.SEED]: EFundingRound.A_ROUND,
  [EFundingRound.A_ROUND]: EFundingRound.B_ROUND,
  [EFundingRound.B_ROUND]: EFundingRound.C_ROUND,
  [EFundingRound.C_ROUND]: EFundingRound.D_ROUND,
  [EFundingRound.D_ROUND]: EFundingRound.E_ROUND,
  [EFundingRound.E_ROUND]: EFundingRound.PRE_IPO,
  [EFundingRound.PRE_IPO]: EFundingRound.PUBLIC,
  [EFundingRound.PUBLIC]: undefined,
};

export const getNextFundingRound = ({ company }: TEtoWithCompanyAndContractReadonly) => {
  if (company.companyStage) {
    const nextFundingRound = NEXT_FUNDING_ROUNDS[company.companyStage];

    return nextFundingRound ? FUNDING_ROUNDS[nextFundingRound] : undefined;
  }

  return undefined;
};
