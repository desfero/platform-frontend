import { Button, EButtonLayout } from "@neufund/design-system";
import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";
import { compose } from "recompose";

import { actions } from "../../../../modules/actions";
import { appConnect } from "../../../../store";
import {
  BrowserWalletErrorMessage,
  getMessageTranslation,
} from "../../../translatedMessages/messages";
import { TMessage } from "../../../translatedMessages/utils";
import {
  TWalletBrowserDispatchProps,
  TWalletBrowserProps,
} from "../../WalletSelectorLogin/LoginBrowserWallet/LoginBrowserWallet";

import notificationSign from "../../../../assets/img/notifications/warning.svg";
import * as styles from "../RegisterWalletSelector.module.scss";

type TBrowserWalletErrorProps = {
  errorMessage: TMessage;
  tryConnectingWithBrowserWallet: () => void;
};

export const BrowserWalletErrorBase: React.FunctionComponent<TBrowserWalletErrorProps> = ({
  errorMessage,
  tryConnectingWithBrowserWallet,
}) => (
  <>
    <div data-test-id="browser-wallet-error-msg" className={styles.notification}>
      <img src={notificationSign} alt="" />
      <span>{getMessageTranslation(errorMessage)}</span>
    </div>
    {errorMessage.messageType !== BrowserWalletErrorMessage.WALLET_NOT_ENABLED && (
      <Button
        layout={EButtonLayout.PRIMARY}
        onClick={tryConnectingWithBrowserWallet}
        data-test-id="browser-wallet-init.try-again"
        className={styles.button}
      >
        <FormattedMessage id="common.try-again" />
      </Button>
    )}
  </>
);

export const BrowserWalletError = compose<TBrowserWalletErrorProps, TBrowserWalletErrorProps>(
  appConnect<TWalletBrowserProps, TWalletBrowserDispatchProps>({
    dispatchToProps: dispatch => ({
      tryConnectingWithBrowserWallet: () => {
        dispatch(actions.walletSelector.browserWalletSignMessage());
      },
    }),
  }),
)(BrowserWalletErrorBase);
