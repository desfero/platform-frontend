import BigNumber from "bignumber.js";

export interface ITxData {
  to: string;
  value: string;
  data?: string;
  from: string;
  input?: string;
  gas: string;
  gasPrice: string;
}

export enum ETxType {
  UNLOCK_FUNDS = "UNLOCK_FUNDS",
  TRANSFER_TOKENS = "TRANSFER_TOKENS",
  WITHDRAW = "WITHDRAW",
  INVEST = "INVEST",
  UPGRADE = "UPGRADE",
  ETO_SET_DATE = "ETO_SET_DATE",
  SIGN_INVESTMENT_AGREEMENT = "SIGN_INVESTMENT_AGREEMENT",
  USER_CLAIM = "USER_CLAIM",
  INVESTOR_ACCEPT_PAYOUT = "INVESTOR_ACCEPT_PAYOUT",
  INVESTOR_REDISTRIBUTE_PAYOUT = "INVESTOR_REDISTRIBUTE_PAYOUT",
  NEUR_REDEEM = "NEUR_REDEEM",
  INVESTOR_REFUND = "INVESTOR_REFUND",
  NOMINEE_THA_SIGN = "NOMINEE_THA_SIGN",
  NOMINEE_RAAA_SIGN = "NOMINEE_RAAA_SIGN",
  NOMINEE_ISHA_SIGN = "NOMINEE_ISHA_SIGN",
}

export interface ITxMetadata {
  transactionType: ETxType;
  transactionAdditionalData: object | undefined;
}

export interface IRawTxData extends ITxData {
  nonce: string;
}

export interface IEthereumNetworkConfig {
  rpcUrl: string;
  backendRpcUrl: string;
  bridgeUrl: string;
}

export enum ESignTransactionMethod {
  ETH_SEND_TRANSACTION = "eth_sendTransaction",
  ETH_SEND_TYPED_TRANSACTION = "eth_sendTypedTransaction",
}

export type TBigNumberVariants = string | BigNumber;
