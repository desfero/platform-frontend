import { withContainer } from "@neufund/shared-utils";
import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";
import { compose, setDisplayName, withProps } from "recompose";

import { selectBackupCodesVerified, selectIsUserEmailVerified } from "../../modules/auth/selectors";
import { selectKycRequestStatus } from "../../modules/kyc/selectors";
import { appConnect } from "../../store";
import { TDataTestId } from "../../types";
import { Container, EColumnSpan } from "../layouts/Container";
import { Layout } from "../layouts/Layout";
import { WidgetGrid } from "../layouts/WidgetGrid";
import { Heading } from "../shared/Heading";
import { DashboardTitle } from "./DashboardTitle";
import { EtoList } from "./eto-list/EtoList";
import { MyPortfolioWidget } from "./my-portfolio/MyPortfolioWidget";
import { MyWalletWidget } from "./my-wallet/MyWalletWidget";
import { Onboarding } from "./onboarding/Onboarding";
import { shouldShowOnboardingWidget, TOnboardingStateData } from "./onboarding/utils";

type TDashboardProps = {
  shouldShowOnboarding: boolean;
};

export const DashboardLayout: React.ComponentType<TDashboardProps> = ({ shouldShowOnboarding }) => (
  <WidgetGrid>
    <Container columnSpan={EColumnSpan.THREE_COL}>
      <DashboardTitle />
    </Container>
    {shouldShowOnboarding && <Onboarding />}
    <MyPortfolioWidget />
    <MyWalletWidget />
    {process.env.NF_EQUITY_TOKEN_OFFERINGS_VISIBLE === "1" && (
      <>
        <Container columnSpan={EColumnSpan.THREE_COL}>
          <Heading level={3} decorator={false}>
            <FormattedMessage id="dashboard.eto-opportunities" />
          </Heading>

          <p>
            <FormattedMessage id="dashboard.eto-opportunities.description" />
          </p>
        </Container>

        <EtoList />
      </>
    )}
  </WidgetGrid>
);

export const Dashboard = compose<TDashboardProps, {}>(
  setDisplayName("Dashboard"),
  appConnect<TOnboardingStateData>({
    stateToProps: state => ({
      emailVerified: selectIsUserEmailVerified(state),
      backupCodesVerified: selectBackupCodesVerified(state),
      kycRequestStatus: selectKycRequestStatus(state),
    }),
  }),
  withProps<{ shouldShowOnboarding: boolean }, TOnboardingStateData>(props => ({
    shouldShowOnboarding: shouldShowOnboardingWidget(props),
  })),
  withContainer(
    withProps<TDataTestId, {}>({ "data-test-id": "dashboard-application" })(Layout),
  ),
)(DashboardLayout);
