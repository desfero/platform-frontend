import * as React from "react";
import { compose } from "recompose";

import { selectIsAuthorized } from "../../modules/auth/selectors";
import { appConnect } from "../../store";
import { TDataTestId } from "../../types";
import { AcceptTosModal } from "../modals/accept-tos-modal/AcceptTosModal";
import { BankTransferFlowModal } from "../modals/bank-transfer-flow/BankTransferFlow";
import { DepositEthModal } from "../modals/deposit-eth/DepositEthModal";
import { DownloadTokenAgreementModal } from "../modals/download-token-agreements-modal/DownloadTokenAgreementModal";
import { IcbmWalletBalanceModal } from "../modals/icbm-wallet-balance-modal/IcbmWalletBalanceModal";
import { TxSenderModal } from "../modals/tx-sender/TxSender/TxSender";
import { NotificationWidget } from "../shared/notification-widget/NotificationWidget";
import { Content } from "./Content";
import { Footer } from "./Footer";
import { HeaderAuthorized, HeaderTransitional, HeaderUnauthorized } from "./header/Header";
import { LayoutWrapper } from "./LayoutWrapper";

interface IStateProps {
  userIsAuthorized: boolean;
}

interface ILayoutUnauthProps {
  hideHeaderCtaButtons?: boolean;
}

type TTransitionalLayoutProps = {
  isLoginRoute: boolean;
} & ILayoutUnauthProps;

type TContentExternalProps = React.ComponentProps<typeof Content>;

const LayoutUnauthorized: React.FunctionComponent<ILayoutUnauthProps & TContentExternalProps> = ({
  children,
  ...contentProps
}) => (
  <>
    <HeaderUnauthorized />
    <Content {...contentProps}>{children}</Content>
    <Footer />
  </>
);

const LayoutAuthorized: React.FunctionComponent<TContentExternalProps> = ({
  children,
  ...contentProps
}) => (
  <>
    <HeaderAuthorized />
    <Content {...contentProps}>
      <NotificationWidget />
      {children}
    </Content>
    <Footer />
    <AcceptTosModal />
    <DepositEthModal />
    <TxSenderModal />
    <IcbmWalletBalanceModal />
    <BankTransferFlowModal />
    <DownloadTokenAgreementModal />
  </>
);

const LayoutComponent: React.FunctionComponent<IStateProps &
  TDataTestId &
  TContentExternalProps &
  ILayoutUnauthProps> = ({
  children,
  userIsAuthorized,
  "data-test-id": dataTestId,
  ...contentProps
}) => (
  <LayoutWrapper data-test-id={dataTestId}>
    {userIsAuthorized ? (
      <LayoutAuthorized {...contentProps}>{children}</LayoutAuthorized>
    ) : (
      <LayoutUnauthorized {...contentProps}>{children}</LayoutUnauthorized>
    )}
  </LayoutWrapper>
);

const Layout = compose<IStateProps, TDataTestId & TContentExternalProps & ILayoutUnauthProps>(
  appConnect<IStateProps, {}, {}>({
    stateToProps: state => ({
      userIsAuthorized: selectIsAuthorized(state),
    }),
  }),
)(LayoutComponent);

const TransitionalLayout: React.FunctionComponent<TDataTestId &
  TContentExternalProps &
  TTransitionalLayoutProps> = ({ children, "data-test-id": dataTestId, ...contentProps }) => (
  <LayoutWrapper data-test-id={dataTestId}>
    <HeaderTransitional isLoginRoute={contentProps.isLoginRoute} />
    <Content {...contentProps}>{children}</Content>
    <Footer />
  </LayoutWrapper>
);

export {
  Layout,
  TransitionalLayout,
  LayoutComponent,
  LayoutAuthorized,
  LayoutUnauthorized,
  ILayoutUnauthProps,
  TContentExternalProps,
};
