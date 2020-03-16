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

interface ILockedWallet {
  data: IWalletValues;
}

export const LockedWallet: React.FunctionComponent<ILockedWallet & CommonHtmlProps> = ({
  data,
  className,
}) => (
  <WalletBalanceContainer
    className={className}
    headerText={<FormattedMessage id="components.wallet.start.locked-wallet" />}
  >
    <p className={styles.message}>
      <FormattedMessage id="shared-component.wallet-icbm.already-upgraded-message" />
    </p>

    <section>
      <h4 className={styles.title}>
        <FormattedMessage id="shared-component.wallet-balance.title.account-balance" />
      </h4>
      {isWalletNotEmpty(data.neuroEuroAmount) && (
        <AccountBalance
          icon={neuroIcon}
          currency={ECurrency.EUR_TOKEN}
          currencyTotal={ECurrency.EUR}
          largeNumber={data.neuroAmount}
          value={data.neuroEuroAmount}
          data-test-id="locked-wallet.eur"
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
          data-test-id="locked-wallet.eth"
        />
      )}
    </section>
  </WalletBalanceContainer>
);
