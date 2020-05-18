import { createMount, setupFakeClock, tid } from "@neufund/shared-utils/tests";
import { expect } from "chai";
import * as React from "react";
import { createSandbox, SinonStub } from "sinon";

import { testCompany, testContract, testEto } from "../../../../../test/fixtures";
import { wrapWithBasicProviders } from "../../../../../test/integrationTestUtils.unsafe";
import * as authModuleSelectors from "../../../../modules/auth/selectors";
import * as bookBuildingFlowSelectors from "../../../../modules/bookbuilding-flow/selectors";
import * as etoSelectors from "../../../../modules/eto/selectors";
import { EETOStateOnChain } from "../../../../modules/eto/types";
import * as investmentPortfolioSelectors from "../../../../modules/investor-portfolio/selectors";
import * as kycSelectors from "../../../../modules/kyc/selectors";
import * as buttonLink from "../../../shared/buttons/ButtonLink";
import { EtoStatusManager } from "./EtoStatusManager/EtoStatusManager";

const { stub, restore } = createSandbox();

const contract = {
  ...testContract,
  timedState: EETOStateOnChain.Setup,
};

const eto = {
  etos: {
    [testEto.previewCode]: testEto,
  },
  companies: {
    [testEto.companyId]: testCompany,
  },
  contracts: {
    [testEto.previewCode]: contract,
  },
};

const props = {
  isEmbedded: false,
  eto: {
    ...testEto,
    contract: contract,
  },
};

//TODO test all eto state changes, including EtoCard
describe("EtoStatusManager state change", () => {
  let stubs: Record<string, SinonStub>;
  const clock = setupFakeClock();

  beforeEach(() => {
    // stub button link as it uses store under the hood
    stub(buttonLink, "ButtonLink").callsFake((buttonProps: any) => (
      <div data-test-id={buttonProps["data-test-id"]} />
    ));

    stubs = {
      selectIsEligibleToPreEto: stub(
        investmentPortfolioSelectors,
        "selectIsEligibleToPreEto",
      ).returns(false),
      selectEtoOnChainStateById: stub(etoSelectors, "selectEtoOnChainStateById").returns(
        EETOStateOnChain.Setup,
      ),
      selectInitialMaxCapExceeded: stub(
        investmentPortfolioSelectors,
        "selectInitialMaxCapExceeded",
      ).returns(false),
      selectIsAuthorized: stub(authModuleSelectors, "selectIsAuthorized").returns(auth.status),
      selectIsVerifiedInvestor: stub(authModuleSelectors, "selectIsVerifiedInvestor").returns(true),
      selectUserType: stub(authModuleSelectors, "selectUserType").returns(auth.user.type),
      selectIsUserEmailVerified: stub(authModuleSelectors, "selectIsUserEmailVerified").returns(
        true,
      ),
      selectKycStatus: stub(kycSelectors, "selectKycStatus").returns(true),
      selectInvestorCount: stub(bookBuildingFlowSelectors, "selectInvestorCount").returns(
        undefined,
      ),
      selectPledgedAmount: stub(bookBuildingFlowSelectors, "selectPledgedAmount").returns(
        undefined,
      ),
      selectMyPledge: stub(bookBuildingFlowSelectors, "selectMyPledge").returns(undefined),
      selectIsUserVerifiedOnBlockchain: stub(
        kycSelectors,
        "selectIsUserVerifiedOnBlockchain",
      ).returns(false),
      selectClientCountry: stub(kycSelectors, "selectClientCountry").returns(undefined),
      selectEto: stub(etoSelectors, "selectEto").returns(eto),
      selectEtoContract: stub(etoSelectors, "selectEtoContract").returns(contract),
      selectCompany: stub(etoSelectors, "selectCompany").returns(testCompany),
      selectEtoOnChainNextStateStartDate: stub(
        etoSelectors,
        "selectEtoOnChainNextStateStartDate",
      ).returns(undefined),
    };
  });

  afterEach(() => {
    restore();
  });

  it("shows a quote if state is SETUP and Whitelisting is not active", async () => {
    const component = createMount(wrapWithBasicProviders(() => <EtoStatusManager {...props} />));
    expect(component.find(tid("eto-overview-status-founders-quote")).length).to.eq(1);
  });

  // there is a bootstrap Tooltip component deep inside the component tree
  // that throws for some reason. Skipping this for now
  it.skip("shows the whitelisting component", async () => {
    stubs.selectInvestorCount.returns(0);
    props.eto.contract.timedState = EETOStateOnChain.Setup;
    (props.eto.isBookbuilding as unknown) = true;

    clock.fakeClock.setSystemTime(
      new Date(testContract.startOfStates[EETOStateOnChain.Whitelist]).valueOf() - 2000,
    );

    const component = createMount(wrapWithBasicProviders(() => <EtoStatusManager {...props} />));

    expect(component.find(tid("eto-overview-status-whitelisting-active")).length).to.eq(1);
  });

  it("shows the whitelisting component with WhitelistingLimitReached", async () => {
    stubs.selectInvestorCount.returns(500);
    stubs.selectEtoOnChainStateById.returns(EETOStateOnChain.Setup);

    clock.fakeClock.setSystemTime(
      new Date(testContract.startOfStates[EETOStateOnChain.Whitelist]).valueOf() - 2000,
    );

    const component = createMount(wrapWithBasicProviders(() => <EtoStatusManager {...props} />));

    expect(
      component.render().find(tid("eto-overview-status-whitelisting-limit-reached")).length,
    ).to.eq(1);
  });

  it("SETUP, shows the whitelisting component with WhitelistingLimitReached", async () => {
    stubs.selectInvestorCount.returns(500);

    clock.fakeClock.setSystemTime(
      new Date(testContract.startOfStates[EETOStateOnChain.Public]).valueOf() - 2000,
    );

    const component = createMount(wrapWithBasicProviders(() => <EtoStatusManager {...props} />));

    expect(component.find(tid("eto-overview-status-whitelisting-limit-reached")).length).to.eq(2);
    expect(component.find(tid("eto-whitelist-countdown")).length).to.eq(0);
    expect(component.find(tid("eto-whitelist-countdown-finished")).length).to.eq(0);
    expect(component.find(tid("eto-start-date-not-set")).length).to.eq(1);

    await clock.fakeClock.tickAsync(3000);
    component.update();

    expect(component.find(tid("eto-overview-status-whitelisting-limit-reached")).length).to.eq(2);
    expect(component.find(tid("eto-whitelist-countdown")).length).to.eq(0);
    expect(component.find(tid("eto-whitelist-countdown-finished")).length).to.eq(0);
    expect(component.find(tid("eto-start-date-not-set")).length).to.eq(1);
  });

  it("SETUP, shows the whitelisting component with WL closed", async () => {
    stubs.selectInvestorCount.returns(10);

    clock.fakeClock.setSystemTime(
      new Date(testContract.startOfStates[EETOStateOnChain.Public]).valueOf() - 2000,
    );

    const component = createMount(wrapWithBasicProviders(() => <EtoStatusManager {...props} />));

    expect(component.find(tid("eto-overview-status-whitelisting-suspended")).length).to.eq(2);
    expect(component.find(tid("eto-start-date-not-set")).length).to.eq(1);
    expect(component.find(tid("eto-whitelist-countdown-finished")).length).to.eq(0);

    await clock.fakeClock.tickAsync(3000);
    component.update();

    //imitate updating state from backend
    const componentUpdated = createMount(
      wrapWithBasicProviders(() => <EtoStatusManager {...props} />),
    );

    expect(componentUpdated.find(tid("eto-overview-status-whitelisting-suspended")).length).to.eq(
      2,
    );
    expect(componentUpdated.find(tid("eto-whitelist-countdown")).length).to.eq(0);
    expect(componentUpdated.find(tid("eto-whitelist-countdown-finished")).length).to.eq(0);
    expect(componentUpdated.find(tid("eto-start-date-not-set")).length).to.eq(1);
  });

  it("counter shows a loading state and EtoStateManager dispatches the update action on nextStateDate", async () => {
    clock.fakeClock.setSystemTime(
      new Date(testContract.startOfStates[EETOStateOnChain.Public]).valueOf() - 2000,
    );

    props.eto.contract.timedState = EETOStateOnChain.Whitelist;

    const component = createMount(wrapWithBasicProviders(() => <EtoStatusManager {...props} />));

    expect(component.find(tid("eto-whitelist-countdown")).length).to.eq(1);
    expect(component.find(tid("eto-whitelist-countdown-finished")).length).to.eq(0);

    await clock.fakeClock.tickAsync(4000);
    component.update();

    expect(component.find(tid("eto-whitelist-countdown")).length).to.eq(0);
    expect(component.find(tid("eto-whitelist-countdown-finished")).length).to.eq(1);
  });

  it("shows the countdown and then calls the final function", async () => {
    stubs.selectIsAuthorized.returns(undefined);
    stubs.selectEtoOnChainNextStateStartDate.returns(
      testContract.startOfStates[EETOStateOnChain.Signing],
    );
    props.eto.contract.timedState = EETOStateOnChain.Public;

    clock.fakeClock.setSystemTime(
      new Date(testContract.startOfStates[EETOStateOnChain.Signing]).valueOf() - 2000,
    );

    const component = createMount(wrapWithBasicProviders(() => <EtoStatusManager {...props} />));

    expect(component.find(tid("eto-whitelist-countdown-finished")).length).to.eq(0);
    expect(component.find(tid("investment-widget")).length).to.eq(1);
    expect(component.find(tid("end-time-widget-running")).hostNodes().length).to.eq(1);
    expect(component.find(tid("end-time-widget-finished")).length).to.eq(0);

    await clock.fakeClock.tickAsync(4000);
    component.update();

    expect(component.find(tid("end-time-widget-running")).length).to.eq(0);
    expect(component.find(tid("end-time-widget-finished")).hostNodes().length).to.eq(1);
  });
});
