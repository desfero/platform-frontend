import { Button, EButtonLayout } from "@neufund/design-system";
import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";

import { ILedgerAccount } from "../../../../../modules/wallet-selector/ledger-wizard/reducer";
import { TTranslatedString } from "../../../../../types";
import { LoadingIndicator } from "../../../../shared/loading-indicator/LoadingIndicator";
import { PanelRounded } from "../../../../shared/Panel";
import { AddressTable } from "./AddressTable";
import { WalletLedgerChooserError } from "./WalletLedgerChooserError";

import * as styles from "./SimpleChooser.module.scss";

type TSimpleChooserProps = {
  loading: boolean;
  accounts: ReadonlyArray<ILedgerAccount>;
  handleAddressChosen: (account: ILedgerAccount) => void;
  toggleAdvanced: () => void;
  ledgerErrorMessage?: TTranslatedString;
};

export const SimpleChooser: React.FunctionComponent<TSimpleChooserProps> = ({
  loading,
  accounts,
  handleAddressChosen,
  toggleAdvanced,
  ledgerErrorMessage,
}) => (
  <>
    {ledgerErrorMessage && <WalletLedgerChooserError message={ledgerErrorMessage} />}
    {loading ? (
      <LoadingIndicator />
    ) : (
      <>
        <PanelRounded>
          <AddressTable accounts={accounts} handleAddressChosen={handleAddressChosen} />
        </PanelRounded>

        <Button
          className={styles.advanced}
          onClick={toggleAdvanced}
          data-test-id="btn-advanced-simple"
          layout={EButtonLayout.PRIMARY}
        >
          <FormattedMessage id="wallet-selector.ledger.show-more" />
        </Button>
      </>
    )}
  </>
);
