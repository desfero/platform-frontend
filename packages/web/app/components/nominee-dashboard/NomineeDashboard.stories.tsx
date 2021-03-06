import { action } from "@storybook/addon-actions";
import { storiesOf } from "@storybook/react";
import * as React from "react";

import { OnboardingMain } from "../dashboard/onboarding/Onboarding";
import { EOnboardingStepState } from "../dashboard/onboarding/types";
import { NomineeLinkBankAccountLayout } from "./linkBankAccount/LinkBankAccount";
import { NomineeRequestContainer } from "./linkToIssuer/LinkToIssuer";
import { AccountSetupContainer } from "./nomineeDashboardContainer/AccountSetupContainer";
import { LinkedNomineeDashboardContainer } from "./nomineeDashboardContainer/LinkedNomineeDashboardContainer";
import { NotLinkedNomineeDashboardContainer } from "./nomineeDashboardContainer/NotLinkedNomineeDashboardContainer";
import { NoTasks } from "./NoTasks";

storiesOf("Nominee tasks", module)
  .add("no tasks", () => (
    <LinkedNomineeDashboardContainer>
      <NoTasks />
    </LinkedNomineeDashboardContainer>
  ))
  .add("account setup tasks", () => {
    const steps = [
      {
        key: "step1",
        stepState: EOnboardingStepState.DONE,
        title: "Step 1 Title",
        component: "bla",
        number: 1,
        isLast: false,
      },
      {
        key: "step2",
        stepState: EOnboardingStepState.ACTIVE,
        title: "Step 2 Title",
        component: "bla",
        number: 2,
        isLast: false,
      },
      {
        key: "step3",
        stepState: EOnboardingStepState.NOT_DONE,
        title: "Step 3 Title",
        component: "bla",
        number: 2,
        isLast: true,
      },
    ];

    return (
      <AccountSetupContainer>
        <OnboardingMain accountSetupStepsData={steps} />
      </AccountSetupContainer>
    );
  })
  .add("link to issuer ", () => (
    <NotLinkedNomineeDashboardContainer>
      <NomineeRequestContainer />
    </NotLinkedNomineeDashboardContainer>
  ))
  .add("link bank account", () => (
    <LinkedNomineeDashboardContainer>
      <NomineeLinkBankAccountLayout verifyBankAccount={action("verifyBankAccount")} />
    </LinkedNomineeDashboardContainer>
  ));
