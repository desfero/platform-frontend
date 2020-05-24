import { EWalletType } from "@neufund/shared-modules";
import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";

import { TStateProps } from "../../WalletSelectorRegister/RegisterLightWallet/RegisterLightWallet";
import { WalletChooser } from "../WalletChooser";

import * as styles from "../../shared/RegisterWalletSelector.module.scss";

export const LightWalletContainer: React.FunctionComponent<TStateProps> = ({
  isLogin,
  showWalletSelector,
  children,
}) => (
  <>
    <div className={styles.wrapper} data-test-id="wallet-selector">
      <h1 className={styles.title}>
        <FormattedMessage id="wallet-selector.sign-up" />
      </h1>
      <section className={styles.main}>
        <p className={styles.explanation}>
          <FormattedMessage id="wallet-selector.neuwallet.explanation" />
        </p>
        {children}
      </section>
      {showWalletSelector && <WalletChooser isLogin={isLogin!} activeWallet={EWalletType.LIGHT} />}
    </div>
  </>
);
