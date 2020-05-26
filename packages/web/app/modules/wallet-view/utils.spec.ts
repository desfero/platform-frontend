import { expect } from "chai";

import { EBalanceViewType } from "./types";
import { isMainBalance } from "./utils";

describe("isMainBalance()", () => {
  it("should return true main balances (eth & neuro)", () => {
    const ethBalance = {
      name: EBalanceViewType.ETH,
      hasFunds: true,
      amount: "0",
      euroEquivalentAmount: "0",
    };

    const neurBalance = {
      name: EBalanceViewType.NEUR,
      hasFunds: true,
      amount: "0",
      euroEquivalentAmount: "0",
    };

    expect(isMainBalance(ethBalance)).to.be.true;
    expect(isMainBalance(neurBalance)).to.be.true;
  });

  it("should return false for non-essential balances (not eth & neuro)", () => {
    const ethBalance = {
      name: EBalanceViewType.ICBM_ETH,
      hasFunds: true,
      amount: "0",
      euroEquivalentAmount: "0",
    };

    const neurBalance = {
      name: EBalanceViewType.ICBM_NEUR,
      hasFunds: true,
      amount: "0",
      euroEquivalentAmount: "0",
    };

    expect(isMainBalance(ethBalance)).to.be.false;
    expect(isMainBalance(neurBalance)).to.be.false;
  });
});

describe("hasFunds()", () => {
  it("should return true if balance has funds", () => {
    const ethBalance = {
      name: EBalanceViewType.ETH,
      hasFunds: true,
      amount: "10",
      euroEquivalentAmount: "3000",
    };

    expect(isMainBalance(ethBalance)).to.be.true;
  });

  it("should return false for for balance with no funds", () => {
    const ethBalance = {
      name: EBalanceViewType.ICBM_ETH,
      hasFunds: true,
      amount: "0",
      euroEquivalentAmount: "0",
    };

    expect(isMainBalance(ethBalance)).to.be.false;
  });
});
