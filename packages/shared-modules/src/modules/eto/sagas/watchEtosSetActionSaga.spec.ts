import { minutesToMs } from "@neufund/shared-utils";
import { setupFakeClock } from "@neufund/shared-utils/tests";
import { expect } from "chai";

import { testCompany, testContract, testEto } from "../../../../test/fixtures";
import { TGlobalDependencies } from "../../../di/setupBindings";
import { etoInProgressPollingDelay, etoNormalPollingDelay } from "../constants";
import { EETOStateOnChain } from "../types";
import { calculateNextStateDelay, getEtoRefreshStrategies } from "./watchEtosSetActionSaga";

const globalDependencies = {
  //todo write out the full context, move to utils
  logger: {
    info: (_: string) => {},
    error: (_: string) => {},
  },
} as TGlobalDependencies;

const eto = {
  ...testEto,
  company: testCompany,
  contract: {
    ...testContract,
    timedState: EETOStateOnChain.Whitelist,
  },
};

describe("watchEtosSetActionSaga tests", () => {
  const clock = setupFakeClock();

  it("getEtoRefreshStrategies test", done => {
    const renewStrategies = () => {
      let generator = getEtoRefreshStrategies(globalDependencies, eto);
      generator.next();
      generator.next();
      let nextStateDelay = calculateNextStateDelay(globalDependencies, eto).next().value;
      return generator.next(nextStateDelay).value;
    };

    clock.fakeClock.setSystemTime(
      new Date(testContract.startOfStates[EETOStateOnChain.Public]).valueOf() - minutesToMs(15),
    );

    expect(renewStrategies()).to.be.deep.equal({
      default: etoNormalPollingDelay,
      inProgress: etoInProgressPollingDelay,
    });

    clock.fakeClock.tick(minutesToMs(6));

    expect(renewStrategies()).to.be.deep.equal({
      default: etoNormalPollingDelay,
      inProgress: etoInProgressPollingDelay,
      nextState: 542000,
    });

    clock.fakeClock.tick(minutesToMs(7));

    expect(renewStrategies()).to.be.deep.equal({
      default: etoNormalPollingDelay,
      inProgress: etoInProgressPollingDelay,
      nextState: 122000,
    });

    clock.fakeClock.tick(minutesToMs(0.5));

    expect(renewStrategies()).to.be.deep.equal({
      default: etoNormalPollingDelay,
      inProgress: etoInProgressPollingDelay,
      nextState: 92000,
    });

    done();
  });
});
