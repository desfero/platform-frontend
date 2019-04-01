import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";
import { Col, Row } from "reactstrap";
import { compose } from "redux";

import { EKycRequestType, ERequestStatus } from "../../lib/api/KycApi.interfaces";
import { EUserType } from "../../lib/api/users/interfaces";
import { actions } from "../../modules/actions";
import { selectUserType } from "../../modules/auth/selectors";
import { selectKycRequestStatus, selectKycRequestType } from "../../modules/kyc/selectors";
import {
  selectIcbmWalletConnected,
  selectLockedWalletConnected,
} from "../../modules/wallet/selectors";
import { selectIsLightWallet } from "../../modules/web3/selectors";
import { appConnect } from "../../store";
import { onEnterAction } from "../../utils/OnEnterAction";
import { withMetaTags } from "../../utils/withMetaTags.unsafe";
import { DashboardSection } from "../eto/shared/DashboardSection";
import { LayoutAuthorized } from "../layouts/LayoutAuthorized";
import { createErrorBoundary } from "../shared/errorBoundary/ErrorBoundary.unsafe";
import { ErrorBoundaryLayoutAuthorized } from "../shared/errorBoundary/ErrorBoundaryLayoutAuthorized";
import { YourEthereumAddressWidget } from "./ethereum-address-widget/YourEthereumAddressWidget";
import { CheckYourICBMWalletWidget } from "./icbm-wallet-widget/CheckYourICBMWalletWidget";
import { LinkedBankAccountWidget } from "./linked-bank-account/LinkedBankAccountWidget";
import { PersonalAccountDetails } from "./personal-account-details/PersonalAccountDetails";
import { SettingsWidgets } from "./settings-widget/SettingsWidgets";

interface IStateProps {
  isLightWallet: boolean;
  isIcbmWalletConnected: boolean;
  isLockedWalletConnected: boolean;
  userType?: EUserType;
  kycRequestType?: EKycRequestType;
  kycRequestStatus?: ERequestStatus;
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
    kycRequestStatus === ERequestStatus.PENDING || kycRequestStatus === ERequestStatus.ACCEPTED;
  const isUserInvestor = userType === EUserType.INVESTOR;
  const isIndividual = kycRequestType === EKycRequestType.INDIVIDUAL;

  return (
    <LayoutAuthorized>
      <Row className="row-gutter-top" data-test-id="eto-profile">
        <DashboardSection title={<FormattedMessage id="settings.security-settings.title" />} />
        <SettingsWidgets isDynamic={false} isLightWallet={isLightWallet} />

        <DashboardSection title={<FormattedMessage id="settings.account-info.title" />} />

        <Col lg={4} xs={12}>
          <YourEthereumAddressWidget />
        </Col>
        {process.env.NF_CHECK_LOCKED_WALLET_WIDGET_ENABLED === "1" &&
          !isIcbmWalletConnected &&
          !isLockedWalletConnected &&
          isUserInvestor && (
            <Col lg={4} xs={12}>
              <CheckYourICBMWalletWidget />
            </Col>
          )}

        {isUserInvestor &&
          isIndividual &&
          isPersonalDataProcessed && (
            <Col lg={4} xs={12}>
              <PersonalAccountDetails />
            </Col>
          )}
      </Row>
      <Row className="row-gutter-top">
        <Col lg={4} xs={12}>
          <LinkedBankAccountWidget />
        </Col>
      </Row>
    </LayoutAuthorized>
  );
};

export const Settings = compose<React.FunctionComponent>(
  createErrorBoundary(ErrorBoundaryLayoutAuthorized),
  appConnect<IStateProps>({
    stateToProps: state => ({
      isLightWallet: selectIsLightWallet(state.web3),
      userType: selectUserType(state),
      kycRequestStatus: selectKycRequestStatus(state),
      kycRequestType: selectKycRequestType(state.kyc),
      isIcbmWalletConnected: selectIcbmWalletConnected(state.wallet),
      isLockedWalletConnected: selectLockedWalletConnected(state),
    }),
  }),
  onEnterAction({
    actionCreator: dispatch => {
      dispatch(actions.wallet.loadWalletData());
      dispatch(actions.kyc.kycLoadIndividualData());
    },
  }),
  withMetaTags((_, intl) => ({ title: intl.formatIntlMessage("menu.settings") })),
)(SettingsComponent);
