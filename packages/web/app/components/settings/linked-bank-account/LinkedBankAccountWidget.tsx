import {
  Button,
  ButtonInline,
  EButtonLayout,
  EButtonSize,
  EIconPosition,
} from "@neufund/design-system";
import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";
import { branch, compose, renderNothing } from "recompose";

import { ENEURWalletStatus } from "../../../modules/wallet/types";
import { THocProps } from "../../../types";
import { EColumnSpan } from "../../layouts/Container";
import { Panel } from "../../shared/Panel";
import { BankAccount } from "../../wallet/bank-account/BankAccount";
import { connectLinkBankAccountComponent } from "./ConnectLinkBankAccount";

import bankIcon from "../../../assets/img/bank-transfer/bank-icon.svg";
import arrowRight from "../../../assets/img/inline_icons/arrow_right.svg";
import * as styles from "./LinkedBankAccountWidget.module.scss";

interface IExternalProps {
  columnSpan?: EColumnSpan;
}

type IComponentProps = THocProps<typeof connectLinkBankAccountComponent>;

const LinkAccount: React.FunctionComponent<IComponentProps> = ({
  verifyBankAccount,
  neurStatus,
}) => (
  <>
    <img className={styles.icon} src={bankIcon} alt="" />
    <Button
      onClick={verifyBankAccount}
      disabled={neurStatus !== ENEURWalletStatus.ENABLED}
      data-test-id="linked-bank-account-widget.link-account"
      layout={EButtonLayout.LINK}
      size={EButtonSize.SMALL}
      iconPosition={EIconPosition.ICON_AFTER}
      svgIcon={arrowRight}
    >
      <FormattedMessage id="linked-bank-account-widget.verify" />
    </Button>
  </>
);

const LinkedBankAccountLayout: React.FunctionComponent<IComponentProps &
  IExternalProps> = props => (
  <Panel
    data-test-id="linked-bank-account-widget"
    headerText={<FormattedMessage id="linked-bank-account-widget.header" />}
    columnSpan={props.columnSpan}
  >
    <div className={styles.bankAccountButtonWrapper}>
      <section className={styles.bankAccountButton}>
        {props.isBankAccountVerified && props.bankAccount && props.bankAccount.hasBankAccount ? (
          <BankAccount details={props.bankAccount.details} />
        ) : (
          <LinkAccount {...props} />
        )}
      </section>
    </div>
    {props.isBankAccountVerified && (
      <small>
        <ButtonInline
          className={styles.linkButton}
          onClick={props.verifyBankAccount}
          disabled={props.neurStatus !== ENEURWalletStatus.ENABLED}
          data-test-id="linked-bank-account-widget.link-different-account"
        >
          <FormattedMessage id="linked-bank-account-widget.link-different" />
        </ButtonInline>
      </small>
    )}
  </Panel>
);

const LinkedBankAccountWidget = compose<IComponentProps & IExternalProps, IExternalProps>(
  connectLinkBankAccountComponent(),
  // in case it's an restricted US state we hide fully widget from portfolio
  branch<IComponentProps>(
    props => props.neurStatus === ENEURWalletStatus.DISABLED_RESTRICTED_US_STATE,
    renderNothing,
  ),
)(LinkedBankAccountLayout);

export { LinkedBankAccountWidget, LinkedBankAccountLayout };
