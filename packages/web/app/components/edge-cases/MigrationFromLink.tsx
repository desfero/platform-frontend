import { EUserType } from "@neufund/shared-modules";
import { withContainer } from "@neufund/shared-utils";
import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";
import { Col, Row } from "reactstrap";
import { compose } from "redux";

import { actions } from "../../modules/actions";
import { selectUserType } from "../../modules/auth/selectors";
import { appConnect } from "../../store";
import { onEnterAction } from "../../utils/react-connected-components/OnEnterAction";
import { Layout } from "../layouts/Layout";
import { CheckYourICBMWalletWidget } from "../settings/icbm-wallet-widget/CheckYourICBMWalletWidget";
import { DashboardHeading } from "../shared/DashboardHeading";

interface IStateProps {
  userType?: EUserType;
}

export const MigrationFromLinkComponent: React.FunctionComponent<IStateProps> = ({ userType }) => {
  const isUserInvestor = userType === EUserType.INVESTOR;

  return (
    <Row className="row-gutter-top">
      <DashboardHeading title={<FormattedMessage id="settings.account-info.title" />} />

      {process.env.NF_CHECK_LOCKED_WALLET_WIDGET_ENABLED === "1" && isUserInvestor && (
        <Col lg={4} xs={12}>
          <CheckYourICBMWalletWidget />
        </Col>
      )}
    </Row>
  );
};

export const MigrationFromLink = compose<React.FunctionComponent>(
  onEnterAction({ actionCreator: d => d(actions.wallet.loadWalletData()) }),
  appConnect<IStateProps>({
    stateToProps: state => ({
      userType: selectUserType(state),
    }),
  }),
  withContainer(Layout),
)(MigrationFromLinkComponent);
