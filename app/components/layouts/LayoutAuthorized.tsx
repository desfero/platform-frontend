import * as React from "react";
import { Col, Row } from "reactstrap";

import { NotificationWidget } from "../dashboard/notification-widget/NotificationWidget";
import { DepositEthModal } from "../modals/DepositEthModal";
import { IcbmWalletBalanceModal } from "../modals/IcbmWalletBalanceModal";
import { TxSenderModal } from "../modals/txSender/TxSender";
import { LayoutAuthorizedMenu } from "./LayoutAuthorizedMenu";

import { InvestmentModal } from "../modals/txSender/TemporalInvestFlow";
import * as styles from "./LayoutAuthorized.module.scss";

export const LayoutAuthorized: React.SFC = ({ children }) => (
  <>
    <div>
      <LayoutAuthorizedMenu />
    </div>
    <div className="layout-container">
      <NotificationWidget />
      <Row>
        <Col className={styles.content}>{children}</Col>
      </Row>
    </div>
    <DepositEthModal />
    <TxSenderModal />
    <InvestmentModal />
    <IcbmWalletBalanceModal />
  </>
);
