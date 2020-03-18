import { ECurrency } from "@neufund/shared";
import { expect } from "chai";

import { ETransactionType } from "../../lib/api/analytics-api/interfaces";
import { EInvestmentType } from "../investment-flow/reducer";
import { ETxSenderType } from "./types";
import {
  generalPendingTxFixture,
  getPendingTransactionAmount,
  getPendingTransactionCurrency,
  getPendingTransactionType,
} from "./utils";

describe("Pending transaction type", () => {
  let pendingTransaction: any;

  beforeEach(() => {
    pendingTransaction = generalPendingTxFixture("0x16cd5aC5A1b77FB72032E3A09E91A98bB21D8988");
  });

  it("returns transfer type for withdraw", () => {
    expect(getPendingTransactionType(pendingTransaction)).to.eq(ETransactionType.TRANSFER);
  });

  it("returns eto_invest for investment operation", () => {
    pendingTransaction.transactionType = ETxSenderType.INVEST;
    expect(getPendingTransactionType(pendingTransaction)).to.eq(ETransactionType.ETO_INVESTMENT);
  });
});

describe("Pending transaction currency", () => {
  let pendingTransaction: any;

  beforeEach(() => {
    pendingTransaction = generalPendingTxFixture("0x16cd5aC5A1b77FB72032E3A09E91A98bB21D8988");
  });

  it("returns token symbol when it is set", () => {
    pendingTransaction.transactionType = ETxSenderType.INVEST;
    expect(getPendingTransactionCurrency(pendingTransaction)).to.eq(
      pendingTransaction.transactionAdditionalData.tokenSymbol,
    );
  });

  it("returns neur for redeem", () => {
    delete pendingTransaction.transactionAdditionalData.tokenSymbol;
    pendingTransaction.transactionType = ETxSenderType.NEUR_REDEEM;
    expect(getPendingTransactionCurrency(pendingTransaction)).to.eq(ECurrency.EUR_TOKEN);
  });
});

describe("Pending transaction amount", () => {
  let pendingTransaction: any;

  beforeEach(() => {
    pendingTransaction = generalPendingTxFixture("0x16cd5aC5A1b77FB72032E3A09E91A98bB21D8988");
  });

  it("returns amount eur", () => {
    pendingTransaction.transactionAdditionalData.investmentEur = "10000000000000000000";
    expect(getPendingTransactionAmount(pendingTransaction)).to.eq(
      pendingTransaction.transactionAdditionalData.investmentEur,
    );
  });

  it("returns amount eth", () => {
    pendingTransaction.transactionAdditionalData.investmentEth = "10000000000000000000";
    pendingTransaction.transactionAdditionalData.investmentType = EInvestmentType.Eth;
    expect(getPendingTransactionAmount(pendingTransaction)).to.eq(
      pendingTransaction.transactionAdditionalData.investmentEth,
    );
  });

  it("returns amount neur", () => {
    pendingTransaction.transactionAdditionalData.tokenQuantity = "10000000000000000000";
    expect(getPendingTransactionAmount(pendingTransaction)).to.eq(
      pendingTransaction.transactionAdditionalData.tokenQuantity,
    );
  });
});
