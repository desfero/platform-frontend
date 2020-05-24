import { EWalletType } from "@neufund/shared-modules";
import * as React from "react";
import { FormattedHTMLMessage, FormattedMessage } from "react-intl-phraseapp";

import { externalRoutes } from "../../../../config/externalRoutes";
import { ECommonWalletRegistrationFlowState } from "../../../../modules/wallet-selector/types";
import { WalletChooser } from "../../shared/WalletChooser";

import * as styles from "../../shared/RegisterWalletSelector.module.scss";

export type TWalletBrowserBaseExternalProps = {
  showWalletSelector: boolean | undefined;
  isLogin: boolean;
  uiState: ECommonWalletRegistrationFlowState;
};

export type TWalletBrowserBaseProps = TWalletBrowserBaseExternalProps;

export const RegisterBrowserWalletContainer: React.FunctionComponent<TWalletBrowserBaseExternalProps> = ({
  showWalletSelector,
  children,
  uiState,
  isLogin,
}) => (
  <>
    <div className={styles.wrapper} data-test-id="wallet-selector">
      <h1 className={styles.title}>
        {isLogin ? (
          <FormattedMessage id="wallet-selector.login.metamask" />
        ) : (
          <FormattedMessage id="wallet-selector.sign-up.metamask" />
        )}
      </h1>
      <section className={styles.main}>
        <span className={styles.explanation}>
          {isLogin || uiState === ECommonWalletRegistrationFlowState.REGISTRATION_WALLET_SIGNING ? (
            <FormattedMessage id="wallet-selector.browser-wallet-provide-signature" />
          ) : (
            <FormattedMessage id="wallet-selector.browser-wallet-sign-up" />
          )}
        </span>
        {children}
        <section className={styles.help}>
          <FormattedHTMLMessage
            tagName="span"
            id="wallet-selector.browser-wallet.help"
            values={{ metamaskSupportLink: externalRoutes.metamaskSupportLink }}
          />
        </section>
      </section>
      {showWalletSelector && <WalletChooser isLogin={isLogin} activeWallet={EWalletType.BROWSER} />}
    </div>
  </>
);
