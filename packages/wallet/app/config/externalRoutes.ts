import { withParams } from "@neufund/shared-utils";

export const externalRoutes = {
  platformWalletConnect: "https://platform.neufund.org/wc",
  etherscanTransaction: "https://etherscan.io/tx/:txHash",
};

export const etherscanTxLink = (txHash: string) =>
  withParams(externalRoutes.etherscanTransaction, { txHash });
