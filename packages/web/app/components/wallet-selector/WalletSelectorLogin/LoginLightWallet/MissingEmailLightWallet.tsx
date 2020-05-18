import { ButtonInline } from "@neufund/design-system";
import { EWalletType } from "@neufund/shared-modules";
import * as React from "react";
import { FormattedHTMLMessage, FormattedMessage } from "react-intl-phraseapp";

import { WalletChooser } from "../../shared/WalletChooser";

import mailLink from "../../../../assets/img/login-link.svg";
import * as styles from "./MissingEmailLightWallet.module.scss";

type TExternalProps = {
  goToPasswordRecovery: () => void;
  shouldShowWalletSelector: boolean;
};

export const MissingEmailLightWallet: React.FunctionComponent<TExternalProps> = ({
  goToPasswordRecovery,
}) => (
  <>
    <h1 className={styles.title}>
      <FormattedMessage id="wallet-selector.log-in" />
    </h1>
    <section className="text-center" data-test-id="modals.wallet-selector.login-light-wallet">
      <img src={mailLink} className={styles.icon} />
      <p className={styles.missingEmail} data-test-id="neuwallet-missing-email">
        <FormattedHTMLMessage id="wallet-selector.neuwallet.login-instructions" tagName="span" />
      </p>
      <section className={styles.forgottenPassword}>
        <FormattedMessage
          id="wallet-selector.neuwallet.forgotten-password"
          values={{
            link: (
              <ButtonInline onClick={goToPasswordRecovery} className="mt-n1">
                <FormattedMessage id="wallet-selector.neuwallet.recover-password" />
              </ButtonInline>
            ),
          }}
        />
      </section>
      <WalletChooser isLogin={true} activeWallet={EWalletType.LIGHT} />
    </section>
  </>
);
