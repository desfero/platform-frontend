import {
  Button,
  ButtonInline,
  EButtonLayout,
  EButtonSize,
  InlineIcon,
} from "@neufund/design-system";
import * as React from "react";
import { FormattedHTMLMessage, FormattedMessage } from "react-intl-phraseapp";

import { KycBankVerifiedBankAccount } from "../../lib/api/kyc/KycApi.interfaces";
import { Container, EColumnSpan } from "../layouts/Container";
import { BankAccountDetails } from "./bank-account/BankAccount";

import linkIcon from "../../assets/img/inline_icons/social_link.svg";
import * as styles from "./Wallet.module.scss";

type TBankAccountProps = {
  verifyBankAccount: () => void;
  bankAccountData: KycBankVerifiedBankAccount;
  userIsFullyVerified: boolean;
};

type TNobankAccountProps = {
  verifyBankAccount: () => void;
};

export const BankAccount: React.FunctionComponent<TBankAccountProps> = ({
  verifyBankAccount,
  bankAccountData,
  userIsFullyVerified,
}) => (
  <Container className={styles.linkedBankAccountWrapper} columnSpan={EColumnSpan.ONE_COL}>
    <h2 className={styles.subtitle}>
      <FormattedMessage id="wallet.linked-bank-account-title" />
    </h2>
    <ButtonInline
      className={styles.linkButtonInline}
      onClick={verifyBankAccount}
      data-test-id="locked-wallet.neur.bank-account.link-account"
      disabled={!userIsFullyVerified}
    >
      <FormattedMessage id="shared-component.wallet-verified-bank-account.link-account" />
    </ButtonInline>
    <div className={styles.linkedBankAccount}>
      <BankAccountDetails details={bankAccountData} />
    </div>
  </Container>
);

export const NoBankAccount: React.FunctionComponent<TNobankAccountProps> = ({
  verifyBankAccount,
}) => (
  <Container className={styles.noLinkedBankAccountWrapper} columnSpan={EColumnSpan.ONE_COL}>
    <div className={styles.subtitle}>
      <FormattedMessage id="wallet.linked-bank-account-title" />
    </div>
    <div className={styles.noLinkedBankAccount}>
      <FormattedHTMLMessage
        tagName="span"
        id="wallet.no-linked-bank-account"
        values={{ href: "" }}
      />
      <Button
        onClick={verifyBankAccount}
        size={EButtonSize.SMALL}
        layout={EButtonLayout.SECONDARY}
        className={styles.linkButton}
      >
        <InlineIcon svgIcon={linkIcon} alt="" className={styles.linkButtonIcon} />
        <FormattedMessage id="wallet.link-bank-account" />
      </Button>
    </div>
  </Container>
);
