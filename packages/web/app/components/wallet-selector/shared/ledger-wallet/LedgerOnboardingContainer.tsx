import { EWalletType } from "@neufund/shared-modules";
import * as React from "react";
import { FormattedHTMLMessage, FormattedMessage } from "react-intl-phraseapp";

import { externalRoutes } from "../../../../config/externalRoutes";
import { WalletChooser } from "../WalletChooser";

import * as styles from "../../shared/RegisterWalletSelector.module.scss";

export type TLedgerContainerBaseProps = {
  isLogin: boolean;
  showWalletSelector: boolean | undefined;
};

export const LedgerOnboardingContainer: React.FunctionComponent<TLedgerContainerBaseProps> = ({
  isLogin,
  showWalletSelector,
  children,
}) => (
  <>
    <div className={styles.wrapper} data-test-id="wallet-selector">
      <h1 className={styles.title} data-test-id="wallet-selector.login.ledger">
        {isLogin ? (
          <FormattedMessage id={"wallet-selector.login.ledger"} />
        ) : (
          <FormattedMessage id={"wallet-selector.sign-up.ledger"} />
        )}
      </h1>
      <section className={styles.main}>
        <span className={styles.explanation}>
          <FormattedMessage id="wallet-selector.ledger.provide-signature" />
        </span>
        {children}
        <section className={styles.help}>
          <FormattedHTMLMessage
            tagName="span"
            id="wallet-selector.ledger.help"
            values={{ ledgerSupportLink: externalRoutes.ledgerSupportLink }}
          />
        </section>
      </section>
      {showWalletSelector && <WalletChooser isLogin={isLogin} activeWallet={EWalletType.LEDGER} />}
    </div>
  </>
);
