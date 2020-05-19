import { EBalanceType, TBasicBalanceData } from "./types";

export const isMainBalance = (balance:TBasicBalanceData) =>
  balance.name === EBalanceType.ETH || balance.name == EBalanceType.NEUR

export const hasFunds = (balance:TBasicBalanceData) =>
  balance.hasFunds
