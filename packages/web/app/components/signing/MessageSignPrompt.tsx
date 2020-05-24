import { EWalletSubType, EWalletType } from "@neufund/shared-modules";
import { nonNullable } from "@neufund/shared-utils";
import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";

import { selectWalletSubType, selectWalletType } from "../../modules/web3/selectors";
import { appConnect } from "../../store";

import ledgerConfirm from "../../assets/img/wallet_selector/ledger_confirm.svg";
import walletConfirmIcon from "../../assets/img/wallet_selector/wallet_confirm_icon.svg";

interface IStateProps {
  walletType: EWalletType;
  walletSubType: EWalletSubType;
}

export const BrowserWalletMessageSignPrompt: React.FunctionComponent<IStateProps> = ({
  walletSubType,
}) => (
  <section className="text-center" data-test-id="signing.browser-wallet.sign-prompt">
    <h1>
      <FormattedMessage id="signing.browser-wallet.header" />
    </h1>
    <img className="mt-5 mb-4" src={walletConfirmIcon} alt="" />
    <p className="font-weight-bold">
      {walletSubType === EWalletSubType.GNOSIS ? (
        <FormattedMessage id="signing.browser-gnosis-wallet.message" />
      ) : (
        <FormattedMessage id="signing.browser-wallet.message" />
      )}
    </p>
  </section>
);

export const LedgerWalletMessageSignPrompt: React.FunctionComponent = () => (
  <section className="text-center" data-test-id="signing.ledger-wallet.sign-prompt">
    <h1>
      <FormattedMessage id="signing.ledger-wallet.header" />
    </h1>
    <img className="mt-5 mb-4" src={ledgerConfirm} alt="" />
    <p className="font-weight-bold">
      <FormattedMessage id="signing.ledger-wallet.message" />
    </p>
  </section>
);

export const MessageSignPromptComponent: React.FunctionComponent<IStateProps> = ({
  walletType,
  walletSubType,
}) =>
  walletType === EWalletType.LEDGER ? (
    <LedgerWalletMessageSignPrompt />
  ) : (
    <BrowserWalletMessageSignPrompt walletType={walletType} walletSubType={walletSubType} />
  );

export const MessageSignPrompt = appConnect<IStateProps>({
  stateToProps: s => ({
    walletType: nonNullable(selectWalletType(s)),
    walletSubType: nonNullable(selectWalletSubType(s.web3)),
  }),
})(MessageSignPromptComponent);
