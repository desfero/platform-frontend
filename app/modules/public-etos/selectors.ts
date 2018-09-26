import { find } from "lodash/fp";
import { IAppState } from "../../store";
import { IPublicEtoState } from "./reducer";
import { TEtoWithCompanyAndContract } from "./types";

const selectPublicEtosState = (state: IAppState) => state.publicEtos;

const selectEtoPreviewCode = (state: IPublicEtoState, etoId: string) => {
  const eto = find(eto => eto!.etoId === etoId, state.publicEtos);

  if (eto) {
    return eto.previewCode;
  }

  return undefined;
};

export const selectEto = (state: IPublicEtoState, previewCode: string) =>
  state.publicEtos[previewCode];

export const selectEtoById = (state: IPublicEtoState, etoId: string) => state.publicEtos[etoId];

export const selectCalculatedContributionByEtoId = (state: IPublicEtoState, etoId: string) => {
  const previewCode = selectEtoPreviewCode(state, etoId);

  if (previewCode) {
    return state.calculatedContributions[previewCode];
  }

  return undefined;
};

export const selectEquityTokenCountByEtoId = (state: IPublicEtoState, etoId: string) => {
  const contrib = selectCalculatedContributionByEtoId(state, etoId);
  return contrib && contrib.equityTokenInt.toString();
};

export const selectNeuRewardUlpsByEtoId = (state: IPublicEtoState, etoId: string) => {
  const contrib = selectCalculatedContributionByEtoId(state, etoId);
  return contrib && contrib.neuRewardUlps.toString();
};

export const selectEtoWithCompanyAndContract = (
  state: IAppState,
  previewCode: string,
): TEtoWithCompanyAndContract | undefined => {
  const publicEtosState = selectPublicEtosState(state);
  const eto = publicEtosState.publicEtos[previewCode];

  if (eto) {
    return {
      ...eto,
      company: publicEtosState.companies[eto.companyId]!,
      contract: publicEtosState.contracts[previewCode],
    };
  }

  return undefined;
};

export const selectEtoWithCompanyAndContractById = (
  state: IAppState,
  etoId: string,
): TEtoWithCompanyAndContract | undefined => {
  const publicEtosState = selectPublicEtosState(state);
  const previewCode = selectEtoPreviewCode(publicEtosState, etoId);

  if (previewCode) {
    return selectEtoWithCompanyAndContract(state, previewCode);
  }

  return undefined;
};

export const selectPublicEtos = (state: IAppState): Array<TEtoWithCompanyAndContract> => {
  const publicEtosState = selectPublicEtosState(state);

  return publicEtosState.displayOrder
    .map(id => selectEtoWithCompanyAndContract(state, id)!)
    .filter(Boolean);
};
