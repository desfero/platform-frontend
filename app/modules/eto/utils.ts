import BigNumber from "bignumber.js";

import { EEtoState, TEtoData } from "../../lib/api/eto/EtoApi.interfaces.unsafe";
import { EJurisdiction } from "../../lib/api/eto/EtoProductsApi.interfaces";
import { Overwrite } from "../../types";
import { isPastInvestment } from "../investor-portfolio/utils";
import { hiddenJurisdictions } from "./constants";
import {
  EETOStateOnChain,
  IEtoTotalInvestment,
  TEtoStartOfStates,
  TEtoWithCompanyAndContract,
} from "./types";

export const convertToEtoTotalInvestment = (
  [totalEquivEurUlps, totalTokensInt, totalInvestors]: [BigNumber, BigNumber, BigNumber],
  euroTokenBalance: BigNumber,
  etherTokenBalance: BigNumber,
): IEtoTotalInvestment => ({
  totalEquivEurUlps,
  totalTokensInt,
  totalInvestors,
  euroTokenBalance,
  etherTokenBalance,
});

const convertToDate = (startOf: BigNumber): Date | undefined => {
  if (startOf.isZero()) {
    return undefined;
  }

  return new Date(startOf.mul(1000).toNumber());
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
  eto: TEtoWithCompanyAndContract,
): eto is Overwrite<
  TEtoWithCompanyAndContract,
  { contract: Exclude<TEtoWithCompanyAndContract["contract"], undefined> }
> {
  return eto.state === EEtoState.ON_CHAIN && eto.contract !== undefined;
}

export const isRestrictedEto = (eto: TEtoWithCompanyAndContract): boolean =>
  eto.product.jurisdiction === EJurisdiction.GERMANY && !isPastInvestment(eto.contract!.timedState);

export const filterEtosByRestrictedJurisdictions = (
  etos: TEtoData[],
  jurisdiction: string | undefined,
) =>
  jurisdiction
    ? etos.filter(
        eto =>
          !hiddenJurisdictions[jurisdiction].some(
            hiddenJurisdiction => hiddenJurisdiction === eto.product.jurisdiction,
          ),
      )
    : etos;