import * as React from "react";
import { FormattedHTMLMessage, FormattedMessage } from "react-intl-phraseapp";

import { ILedgerAccount } from "../../../../../modules/wallet-selector/ledger-wizard/reducer";
import { getMessageTranslation } from "../../../../translatedMessages/messages";
import { TMessage } from "../../../../translatedMessages/utils";
import { AdvancedChooser } from "./AdvancedChooser/AdvancedChooser";
import { SimpleChooser } from "./SimpleChooser";

import * as styles from "./WalletLedgerChooserBase.module.scss";

export interface IWalletLedgerChooserStateProps {
  accounts: ReadonlyArray<ILedgerAccount>;
  hasPreviousPage: boolean;
  loading: boolean;
  advanced: boolean;
  ledgerError?: TMessage;
}

export interface IWalletLedgerChooserDispatchProps {
  onSearch: (derivationPathprefix: string) => void;
  handleAddressChosen: (account: ILedgerAccount) => void;
  showPrevAddresses: () => void;
  showNextAddresses: () => void;
  toggleAdvanced: () => void;
}

export const WalletLedgerChooserBase: React.FunctionComponent<IWalletLedgerChooserStateProps &
  IWalletLedgerChooserDispatchProps> = ({
  accounts,
  handleAddressChosen,
  loading,
  advanced,
  toggleAdvanced,
  ledgerError,
  ...remainingProps
}) => {
  const ledgerErrorMessage = ledgerError ? getMessageTranslation(ledgerError) : undefined;

  return (
    <div className={styles.wrapper}>
      <h1 className={styles.title}>
        <FormattedMessage id="wallet-selector.ledger.select-address.title" />
      </h1>

      <p className={styles.explanation}>
        {advanced ? (
          <FormattedHTMLMessage
            tagName="span"
            id="wallet-selector.ledger.select-address.description"
          />
        ) : (
          <FormattedHTMLMessage
            tagName="span"
            id="wallet-selector.ledger.select-address.description.single"
          />
        )}
      </p>

      {advanced ? (
        <AdvancedChooser
          accounts={accounts}
          handleAddressChosen={handleAddressChosen}
          ledgerErrorMessage={ledgerErrorMessage}
          loading={loading}
          toggleAdvanced={toggleAdvanced}
          {...remainingProps}
        />
      ) : (
        <SimpleChooser
          accounts={accounts}
          handleAddressChosen={handleAddressChosen}
          ledgerErrorMessage={ledgerErrorMessage}
          loading={loading}
          toggleAdvanced={toggleAdvanced}
        />
      )}
    </div>
  );
};
