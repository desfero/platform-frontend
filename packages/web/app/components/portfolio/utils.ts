import { compareBigNumbers, convertToUlps, ECurrency } from "@neufund/shared";

import { IWindowWithData } from "../../../test/helperTypes";

const EURO_TOKEN_PAYOUT_THRESHOLD = "1";
const ETHER_TOKEN_PAYOUT_THRESHOLD = "0.01";

export const getRequiredAmount = (token: ECurrency) => {
  // In case of Cypress tests we have to return 0 by default to prevent tests with low amounts from crash
  // If there is data stored in window use it
  if (process.env.NF_CYPRESS_RUN === "1") {
    const { payoutRequiredAmount } = window as IWindowWithData;
    return payoutRequiredAmount || "0";
  }

  switch (token) {
    case ECurrency.ETH: {
      return convertToUlps(ETHER_TOKEN_PAYOUT_THRESHOLD);
    }
    case ECurrency.EUR_TOKEN: {
      return convertToUlps(EURO_TOKEN_PAYOUT_THRESHOLD);
    }
    default:
      return "0";
  }
};

export const shouldShowToken = (token: ECurrency, amount: string) => {
  const requiredAmount = getRequiredAmount(token);
  return compareBigNumbers(amount, requiredAmount) >= 0;
};
