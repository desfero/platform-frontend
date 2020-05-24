import { EUserType } from "@neufund/shared-modules";
import { withContainer } from "@neufund/shared-utils";
import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";
import { compose } from "redux";

import { EKycRequestStatus, EKycRequestType } from "../../lib/api/kyc/KycApi.interfaces";
import { actions } from "../../modules/actions";
import { selectUserType } from "../../modules/auth/selectors";
import { selectKycRequestStatus, selectKycRequestType } from "../../modules/kyc/selectors";
import {
  selectIcbmWalletConnected,
  selectLockedWalletConnected,
} from "../../modules/wallet/selectors";
import { selectIsLightWallet } from "../../modules/web3/selectors";
import { appConnect } from "../../store";
import { onEnterAction } from "../../utils/react-connected-components/OnEnterAction";
import { withMetaTags } from "../../utils/withMetaTags.unsafe";
import { Container, EColumnSpan } from "../layouts/Container";
import { Layout } from "../layouts/Layout";
import { WidgetGrid } from "../layouts/WidgetGrid";
import { DashboardHeading } from "../shared/DashboardHeading";
import { createErrorBoundary } from "../shared/errorBoundary/ErrorBoundary.unsafe";
import { ErrorBoundaryLayout } from "../shared/errorBoundary/ErrorBoundaryLayout";
import { YourEthereumAddressWidget } from "./ethereum-address-widget/YourEthereumAddressWidget";
import { CheckYourICBMWalletWidget } from "./icbm-wallet-widget/CheckYourICBMWalletWidget";
import { LinkedBankAccountWidget } from "./linked-bank-account/LinkedBankAccountWidget";
import { PersonalAccountDetails } from "./personal-account-details/PersonalAccountDetails";
import { SettingsWidgets } from "./settings-widget/SettingsWidgets";

import * as layoutStyles from "../layouts/WidgetGrid.module.scss";

interface IStateProps {
  isLightWallet: boolean;
  isIcbmWalletConnected: boolean;
  isLockedWalletConnected: boolean;
  userType?: EUserType;
  kycRequestType?: EKycRequestType;
  kycRequestStatus?: EKycRequestStatus;
}

export const SettingsComponent: React.FunctionComponent<IStateProps> = ({
  isLightWallet,
  isIcbmWalletConnected,
  isLockedWalletConnected,
  userType,
  kycRequestType,
  kycRequestStatus,
}) => {
  const isPersonalDataProcessed =
    kycRequestStatus === EKycRequestStatus.PENDING ||
    kycRequestStatus === EKycRequestStatus.ACCEPTED;
  const isUserInvestor = userType === EUserType.INVESTOR;
  const isIndividual = kycRequestType === EKycRequestType.INDIVIDUAL;

  return (
    <WidgetGrid className={layoutStyles.layoutOffset} data-test-id="eto-profile">
      <Container columnSpan={EColumnSpan.THREE_COL}>
        <DashboardHeading
          title={<FormattedMessage id="settings.security-settings.title" />}
          data-test-id="eto-dashboard-application"
        />
      </Container>
      <SettingsWidgets
        isDynamic={false}
        isLightWallet={isLightWallet}
        columnSpan={EColumnSpan.ONE_AND_HALF_COL}
      />
      <Container columnSpan={EColumnSpan.THREE_COL}>
        <DashboardHeading
          title={<FormattedMessage id="settings.account-info.title" />}
          data-test-id="eto-dashboard-application"
        />
      </Container>
      <YourEthereumAddressWidget columnSpan={EColumnSpan.ONE_AND_HALF_COL} />
      {process.env.NF_CHECK_LOCKED_WALLET_WIDGET_ENABLED === "1" &&
        !isIcbmWalletConnected &&
        !isLockedWalletConnected &&
        isUserInvestor && <CheckYourICBMWalletWidget columnSpan={EColumnSpan.ONE_AND_HALF_COL} />}

      {isUserInvestor && isIndividual && isPersonalDataProcessed && (
        <PersonalAccountDetails columnSpan={EColumnSpan.ONE_AND_HALF_COL} />
      )}

      <LinkedBankAccountWidget columnSpan={EColumnSpan.ONE_AND_HALF_COL} />
    </WidgetGrid>
  );
};

export const Settings = compose<React.FunctionComponent>(
  createErrorBoundary(ErrorBoundaryLayout),
  appConnect<IStateProps>({
    stateToProps: state => ({
      isLightWallet: selectIsLightWallet(state),
      userType: selectUserType(state),
      kycRequestStatus: selectKycRequestStatus(state),
      kycRequestType: selectKycRequestType(state),
      isIcbmWalletConnected: selectIcbmWalletConnected(state.wallet),
      isLockedWalletConnected: selectLockedWalletConnected(state),
    }),
  }),
  onEnterAction({
    actionCreator: dispatch => {
      dispatch(actions.wallet.loadWalletData());
      dispatch(actions.kyc.kycLoadStatusAndData());
    },
  }),
  withContainer(Layout),
  withMetaTags((_, intl) => ({ title: intl.formatIntlMessage("menu.settings") })),
)(SettingsComponent);
