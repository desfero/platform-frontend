import { ECurrency } from "@neufund/shared-utils";
import { expectSaga, matchers } from "@neufund/sagas/tests";

import { investmentFlowReducer, EInvestmentType } from "./reducer";
import { recalculateCurrencies, computeAndSetCurrencies } from "./sagas";

describe("Investment-flow - Integration Test", () => {
  describe.only("recalculateCurrencies", async function(): Promise<void> {
    it("calculate currencies if ethValue is present", async () => {
      await expectSaga(recalculateCurrencies)
        .withReducer({ investmentFlow: investmentFlowReducer } as any, {
          investmentFlow: {
            ethValueUlps: "99",
            etoId: "0x2754523CE7C78FeD60F742b0Bc8A8F9fa323bB4C",
            euroValueUlps: "",
            investmentType: EInvestmentType.Eth,
            isValidatedInput: false,
            wallets: [],
          },
        })
        .provide([[matchers.call.fn(computeAndSetCurrencies), undefined]])
        .call(computeAndSetCurrencies, "99", ECurrency.ETH)
        .run();
    });

    it("calculate currencies if eurValue is present", async () => {
      await expectSaga(recalculateCurrencies)
        .withReducer({ investmentFlow: investmentFlowReducer } as any, {
          investmentFlow: {
            ethValueUlps: "",
            etoId: "0x2754523CE7C78FeD60F742b0Bc8A8F9fa323bB4C",
            euroValueUlps: "99",
            investmentType: EInvestmentType.NEur,
            isValidatedInput: false,
            wallets: [],
          },
        })
        .provide([[matchers.call.fn(computeAndSetCurrencies), undefined]])
        .call(computeAndSetCurrencies, "99", ECurrency.EUR_TOKEN)
        .run();
    });

    it("do nothing is ethValue and eurValue is empty", async () => {
      await expectSaga(recalculateCurrencies)
        .withReducer({ investmentFlow: investmentFlowReducer } as any, {
          investmentFlow: {
            ethValueUlps: "",
            etoId: "0x2754523CE7C78FeD60F742b0Bc8A8F9fa323bB4C",
            euroValueUlps: "",
            investmentType: EInvestmentType.NEur,
            isValidatedInput: false,
            wallets: [],
          },
        })
        .provide([[matchers.call.fn(computeAndSetCurrencies), undefined]])
        .not.call(computeAndSetCurrencies)
        .run();
    });
  });
});
