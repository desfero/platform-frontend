import * as React from "react";
import * as cn from "classnames";
import { Button, ButtonInline, EButtonLayout, EButtonSize, TokenIcon } from "@neufund/design-system";
import { FormattedHTMLMessage, FormattedMessage } from "react-intl-phraseapp";

import { Container, EColumnSpan } from "../layouts/Container";
import { BankNumber } from "./bank-account/BankAccount";
import { KycBankVerifiedBankAccount } from "../../lib/api/kyc/KycApi.interfaces";

import bankIcon from "../../assets/img/bank-transfer/bank-icon.svg";
import tokenIcon from "../../assets/img/eth_icon.svg";
import * as styles from "./Wallet.module.scss";

type TBankAccountProps = {
  verifyBankAccount: () => void
  bankAccountData: KycBankVerifiedBankAccount
  userIsFullyVerified: boolean
}

type TNobankAccountProps = {
  verifyBankAccount: () => void
}

export const BankAccount:React.FunctionComponent<TBankAccountProps> = ({ verifyBankAccount, bankAccountData, userIsFullyVerified }) => (
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
      <img className={styles.bankIcon} src={bankIcon} alt="" />
      <div>
        <p className={cn(styles.bankNumber, "m-0")} data-test-id="wallet.bank-account.details">
          <BankNumber last4={bankAccountData.bankAccountNumberLast4} bank={bankAccountData.bankName} />
        </p>
      </div>
    </div>
  </Container>
)

export const NoBankAccount:React.FunctionComponent<TNobankAccountProps> = ({ verifyBankAccount }) => (
  <Container className={styles.noLinkedBankAccountWrapper} columnSpan={EColumnSpan.ONE_COL}>

    <div className={styles.subtitle}>
      <FormattedMessage id="wallet.linked-bank-account-title" />
    </div>
    <div className={styles.noLinkedBankAccount}>
      <FormattedHTMLMessage tagName="span" id="wallet.no-linked-bank-account" values={{ href: "" }} />
      <Button
        onClick={verifyBankAccount}
        size={EButtonSize.SMALL}
        layout={EButtonLayout.SECONDARY}
        className={styles.linkButton}
      >
        <TokenIcon srcSet={{ "1x": tokenIcon }} alt="" className={styles.linkButtonIcon} />
        <FormattedMessage id="wallet.link-bank-account" />
      </Button>
    </div>
  </Container>
)
