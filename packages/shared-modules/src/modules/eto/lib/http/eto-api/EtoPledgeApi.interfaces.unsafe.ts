import { ECurrency } from "@neufund/shared-utils";

export interface IPledge {
  amountEur: number;
  currency: ECurrency.EUR_TOKEN;
  consentToRevealEmail: boolean;
  etoId?: string;
}

export interface IPledges {
  [etoId: string]: IPledge;
}

export interface IBookBuildingStats {
  investorsCount: number;
  pledgedAmount: number;
}
