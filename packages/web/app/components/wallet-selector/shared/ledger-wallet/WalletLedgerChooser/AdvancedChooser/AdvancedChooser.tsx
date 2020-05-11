import { ButtonArrowLeft, EButtonWidth } from "@neufund/design-system";
import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";

import { DEFAULT_DERIVATION_PATH_SUB_PREFIX_2 } from "../../../../../../modules/wallet-selector/ledger-wizard/constants";
import { TTranslatedString } from "../../../../../../types";
import { LoadingIndicator } from "../../../../../shared/loading-indicator/LoadingIndicator";
import { PanelRounded } from "../../../../../shared/Panel";
import { AddressTable } from "../AddressTable";
import {
  IWalletLedgerChooserDispatchProps,
  IWalletLedgerChooserStateProps,
} from "../WalletLedgerChooserBase";
import { WalletLedgerChooserError } from "../WalletLedgerChooserError";
import { TableControls } from "./TableControls";

import * as styles from "./AdvancedChooser.module.scss";

type TAdvancedChooserProps = {
  ledgerErrorMessage?: TTranslatedString;
};

export const AdvancedChooser: React.FunctionComponent<Omit<
  IWalletLedgerChooserStateProps & IWalletLedgerChooserDispatchProps,
  "ledgerError" | "advanced"
> &
  TAdvancedChooserProps> = ({
  loading,
  toggleAdvanced,
  ledgerErrorMessage,
  onSearch,
  hasPreviousPage,
  showPrevAddresses,
  showNextAddresses,
  accounts,
  handleAddressChosen,
}) => {
  const [derivationPathPrefix, setDerivationPathPrefix] = React.useState<string>(
    DEFAULT_DERIVATION_PATH_SUB_PREFIX_2,
  );

  const [derivationPathPrefixValidity, setDerivationPathPrefixValidity] = React.useState<boolean>(
    true,
  );

  let errorMessage;
  if (!derivationPathPrefixValidity) {
    errorMessage = <FormattedMessage id="error-message.ledger.invalid-derivation-path" />;
  } else if (ledgerErrorMessage !== undefined) {
    errorMessage = ledgerErrorMessage;
  }

  const onBackToDefaults = () => {
    onSearch(DEFAULT_DERIVATION_PATH_SUB_PREFIX_2);
    toggleAdvanced();
    // reset state
    setDerivationPathPrefix(DEFAULT_DERIVATION_PATH_SUB_PREFIX_2);
    setDerivationPathPrefixValidity(true);
  };

  return (
    <>
      <ButtonArrowLeft
        width={EButtonWidth.NO_PADDING}
        className={styles.backToDefaults}
        onClick={onBackToDefaults}
      >
        Back to defaults
      </ButtonArrowLeft>

      {errorMessage && <WalletLedgerChooserError message={errorMessage} />}

      <PanelRounded>
        <TableControls
          derivationPathPrefix={derivationPathPrefix}
          setDerivationPathPrefix={setDerivationPathPrefix}
          hasError={!!errorMessage}
          setDerivationPathPrefixValidity={setDerivationPathPrefixValidity}
          onSearch={onSearch}
          hasPreviousPage={hasPreviousPage}
          hasNextPage={accounts.length > 1}
          showPrevAddresses={showPrevAddresses}
          showNextAddresses={showNextAddresses}
          showNavigation={!loading && accounts.length > 0}
        />

        {loading ? (
          <LoadingIndicator />
        ) : (
          accounts.length > 0 && (
            <AddressTable accounts={accounts} handleAddressChosen={handleAddressChosen} />
          )
        )}
      </PanelRounded>
    </>
  );
};
