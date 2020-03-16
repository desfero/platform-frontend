import { ECurrency } from "@neufund/shared";
import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";

import { CommonHtmlProps } from "../../../types";
import { AccountBalance } from "../../shared/AccountBalance";
import { HorizontalLine } from "../../shared/HorizontalLine";
import { isWalletNotEmpty } from "./utils";
import { IWalletValues, WalletBalanceContainer } from "./WalletBalance";

import ethIcon from "../../../assets/img/eth_icon.svg";
import neuroIcon from "../../../assets/img/nEUR_icon.svg";
import * as styles from "./WalletBalance.module.scss";

export interface IIcbmWalletValues extends IWalletValues {
  hasFunds: boolean;
  isEtherUpgradeTargetSet: boolean;
  isEuroUpgradeTargetSet: boolean;
}

interface IIcbmWallet {
  onUpgradeEtherClick: () => void;
  onUpgradeEuroClick: () => void;
  data: IIcbmWalletValues;
}

export const IcbmWallet: React.FunctionComponent<IIcbmWallet & CommonHtmlProps> = ({
  data,
  className,
  onUpgradeEtherClick,
  onUpgradeEuroClick,
}) => (
  <WalletBalanceContainer
    className={className}
    headerText={<FormattedMessage id="components.wallet.start.icbm-wallet" />}
  >
    <p className={styles.message}>
      <FormattedMessage id="shared-component.wallet-icbm.upgrade-message" />
    </p>

    <section>
      <h4 className={styles.title}>
        <FormattedMessage id="shared-component.wallet-balance.title.account-balance" />
      </h4>

      {isWalletNotEmpty(data.neuroAmount) && (
        <AccountBalance
          icon={neuroIcon}
          currency={ECurrency.EUR_TOKEN}
          currencyTotal={ECurrency.EUR}
          largeNumber={data.neuroAmount}
          value={data.neuroEuroAmount}
          actions={[
            {
              name: <FormattedMessage id="shared-component.account-balance.upgrade" />,
              onClick: onUpgradeEuroClick,
              disabled: !data.isEuroUpgradeTargetSet,
              "data-test-id": "wallet.icbm-euro.upgrade-button",
            },
          ]}
          data-test-id="icbm-wallet.neur"
        />
      )}
      {isWalletNotEmpty(data.neuroAmount) && isWalletNotEmpty(data.ethAmount) && (
        <HorizontalLine className="my-3" />
      )}
      {isWalletNotEmpty(data.ethAmount) && (
        <AccountBalance
          icon={ethIcon}
          currency={ECurrency.ETH}
          currencyTotal={ECurrency.EUR}
          largeNumber={data.ethAmount}
          value={data.ethEuroAmount}
          actions={[
            {
              name: <FormattedMessage id="shared-component.account-balance.upgrade" />,
              onClick: onUpgradeEtherClick,
              disabled: !data.isEtherUpgradeTargetSet,
              "data-test-id": "wallet.icbm-eth.upgrade-button",
            },
          ]}
          data-test-id="icbm-wallet.eth"
        />
      )}
    </section>
  </WalletBalanceContainer>
);
