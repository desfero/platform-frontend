import { Button, EButtonLayout } from "@neufund/design-system";
import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";

import { DocumentButton } from "../../shared/DocumentLink";
import { Money } from "../../shared/formatters/Money";
import { ECurrency, ENumberInputFormat, ENumberOutputFormat } from "../../shared/formatters/utils";
import { Heading } from "../../shared/Heading";
import { CurrencyIcon } from "../../shared/icons/CurrencyIcon";
import { InfoList } from "../tx-sender/shared/InfoList";
import { InfoRow } from "../tx-sender/shared/InfoRow";

import * as styles from "./IcbmWalletBalanceModal.module.scss";

interface IBalanceModal {
  isUserVerified: boolean;
  startMigration: () => void;
  ethAddress: string;
  neumarksDue: string;
  etherBalance: string;
  downloadICBMAgreement: () => void;
}

const BalanceFooter: React.FunctionComponent<{
  startMigration: () => void;
  disabled?: boolean;
  downloadICBMAgreement: () => void;
}> = ({ startMigration, disabled, downloadICBMAgreement }) => (
  <div className="d-flex flex-column justify-content-center">
    {disabled && (
      <p className="text-center">
        <FormattedMessage id="settings.modal.icbm-wallet-balance.warning-message" />
      </p>
    )}
    {!disabled && (
      <p className="text-center">
        <DocumentButton
          onClick={() => downloadICBMAgreement()}
          title={<FormattedMessage id="wallet.icbm.reservation-agreement" />}
        />
      </p>
    )}
    <Button
      onClick={startMigration}
      disabled={disabled}
      layout={EButtonLayout.LINK}
      data-test-id="modals.icbm-balance-modal.balance-footer.generate-transaction"
    >
      <FormattedMessage id="settings.modal.icbm-wallet-balance.button" />
    </Button>
  </div>
);

export const BalanceModal: React.FunctionComponent<IBalanceModal> = ({
  isUserVerified,
  startMigration,
  ethAddress = "",
  neumarksDue = "0",
  etherBalance = "0",
  downloadICBMAgreement,
}) => (
  <>
    <Heading level={3} className={styles.header}>
      <FormattedMessage id="settings.modal.icbm-wallet-balance.title.balance" />
    </Heading>

    <InfoList className="mb-4">
      <InfoRow
        caption={
          <FormattedMessage id="settings.modal.icbm-wallet-balance.icbm-wallet-address.label" />
        }
        value={ethAddress}
      />

      <InfoRow
        data-test-id="profile.modal.icbm-wallet-balance.neu-balance"
        caption={
          <>
            <CurrencyIcon currency={ECurrency.NEU} />
            <FormattedMessage id="settings.modal.icbm-wallet-balance.neu-balance.label" />
          </>
        }
        value={
          <Money
            value={neumarksDue}
            inputFormat={ENumberInputFormat.ULPS}
            valueType={ECurrency.NEU}
            outputFormat={ENumberOutputFormat.ONLY_NONZERO_DECIMALS}
          />
        }
      />

      <InfoRow
        data-test-id="profile.modal.icbm-wallet-balance.eth-balance"
        caption={
          <>
            <CurrencyIcon currency={ECurrency.ETH} />
            <FormattedMessage id="settings.modal.icbm-wallet-balance.eth-balance.label" />
          </>
        }
        value={
          <Money
            value={etherBalance}
            inputFormat={ENumberInputFormat.ULPS}
            outputFormat={ENumberOutputFormat.ONLY_NONZERO_DECIMALS}
            valueType={ECurrency.ETH}
          />
        }
      />
    </InfoList>

    <BalanceFooter
      disabled={!isUserVerified}
      startMigration={startMigration}
      downloadICBMAgreement={downloadICBMAgreement}
    />
  </>
);
