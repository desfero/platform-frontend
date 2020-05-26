import { EBalanceViewType, TBasicBalanceData } from "./types";

export const isMainBalance = (balance: TBasicBalanceData) =>
  balance.name === EBalanceViewType.ETH ||
  balance.name === EBalanceViewType.NEUR ||
  balance.name === EBalanceViewType.RESTRICTED_NEUR;

export const hasFunds = (balance: TBasicBalanceData) => balance.hasFunds;
