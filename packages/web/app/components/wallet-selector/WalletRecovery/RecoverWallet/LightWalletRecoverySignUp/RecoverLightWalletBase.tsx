import { EWalletType } from "@neufund/shared-modules";
import * as cn from "classnames";
import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";

import { WalletChooser } from "../../../shared/WalletChooser";
import { TStateProps } from "./RestoreLightWallet";

import * as styles from "../../../shared/RegisterWalletSelector.module.scss";

export const RecoverLightWalletBase: React.FunctionComponent<TStateProps> = ({
  isLogin,
  showWalletSelector,
  children,
}) => (
  <>
    <div className={styles.wrapper} data-test-id="wallet-selector">
      <h1 className={cn(styles.title, styles.textLeft)}>
        <FormattedMessage id="account-recovery.seed-check.title" />
      </h1>
      <section className={cn(styles.main)}>
        <p className={cn(styles.explanation, styles.textLeft)}>
          <FormattedMessage id="account-recovery.import-wallet.description" />
        </p>
        {children}
      </section>
      {showWalletSelector && <WalletChooser isLogin={isLogin!} activeWallet={EWalletType.LIGHT} />}
    </div>
  </>
);
