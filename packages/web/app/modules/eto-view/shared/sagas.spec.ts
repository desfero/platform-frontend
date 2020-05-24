import { expectSaga } from "@neufund/sagas/tests";
import { EUserType } from "@neufund/shared-modules";

import { testEto } from "../../../../test/fixtures";
import { EEtoState } from "../../../lib/api/eto/EtoApi.interfaces.unsafe";
import { EProcessState } from "../../../utils/enums/processStates";
import { actions } from "../../actions";
import { performLoadEtoSideEffects } from "./sagas";

describe("performLoadEtoSideEffects", () => {
  it("should not load investor ticket for not logged user", () =>
    expectSaga(performLoadEtoSideEffects, testEto)
      .withState({
        auth: {},
        user: {},
        eto: {},
        etoView: {
          processState: EProcessState.SUCCESS,
          eto: testEto,
        },
      })
      .not.put(actions.investorEtoTicket.loadEtoInvestorTicket(testEto))
      .run());

  it("should load investor ticket for Investor user", () =>
    expectSaga(performLoadEtoSideEffects, testEto)
      .withState({
        auth: {},
        user: {
          data: {
            type: EUserType.INVESTOR,
          },
        },
        eto: {},
        etoView: {
          processState: EProcessState.SUCCESS,
          eto: testEto,
        },
      })
      .put(actions.investorEtoTicket.loadEtoInvestorTicket(testEto))
      .run());

  it("should not load investor ticket for Issuer user", () =>
    expectSaga(performLoadEtoSideEffects, testEto)
      .withState({
        auth: {},
        user: {
          data: {
            type: EUserType.ISSUER,
          },
        },
        eto: {},
        etoView: {
          processState: EProcessState.SUCCESS,
          eto: testEto,
        },
      })
      .not.put(actions.investorEtoTicket.loadEtoInvestorTicket(testEto))
      .run());

  it("should not load investor ticket for Nominee user", () =>
    expectSaga(performLoadEtoSideEffects, testEto)
      .withState({
        auth: {},
        user: {
          data: {
            type: EUserType.NOMINEE,
          },
        },
        eto: {},
        etoView: {
          processState: EProcessState.SUCCESS,
          eto: testEto,
        },
      })
      .not.put(actions.investorEtoTicket.loadEtoInvestorTicket(testEto))
      .run());

  it("should not load investor ticket for ETO not on chain", () =>
    expectSaga(performLoadEtoSideEffects, testEto)
      .withState({
        auth: {},
        user: {
          data: {
            type: EUserType.NOMINEE,
          },
        },
        eto: {},
        etoView: {
          processState: EProcessState.SUCCESS,
          eto: {
            ...testEto,
            state: EEtoState.LISTED,
          },
        },
      })
      .not.put(actions.investorEtoTicket.loadEtoInvestorTicket(testEto))
      .run());
});
