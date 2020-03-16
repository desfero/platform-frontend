import { ECurrency, isZero } from "@neufund/shared";
import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";

import { CommonHtmlProps } from "../../../types";
import { EColumnSpan } from "../../layouts/Container";
import { AccountAddressWithHistoryLink } from "../../shared/AccountAddress";
import { AccountBalance } from "../../shared/AccountBalance";
import { WalletBalanceContainer } from "./WalletBalance";

import ethIcon from "../../../assets/img/eth_icon.svg";
import * as styles from "./WalletBalance.module.scss";

interface IUnlockedETHWallet {
  depositEth: () => void;
  withdrawEth: () => void;
  address: string;
  ethAmount: string;
  ethEuroAmount: string;
  totalEuroAmount: string;
}

interface IExternalProps {
  columnSpan?: EColumnSpan;
}

export const UnlockedETHWallet: React.FunctionComponent<IUnlockedETHWallet &
  CommonHtmlProps &
  IExternalProps> = ({
  address,
  depositEth,
  withdrawEth,
  className,
  ethAmount,
  ethEuroAmount,
  columnSpan,
}) => (
  <WalletBalanceContainer
    className={className}
    columnSpan={columnSpan}
    headerText={<FormattedMessage id="components.wallet.start.eth-wallet" />}
  >
    <p className={styles.message}>
      <FormattedMessage id={"shared-component.eth-wallet-balance.explanation"} />
    </p>

    <section>
      <h4 className={styles.title}>
        <FormattedMessage id="shared-component.wallet-balance.title.account-address" />
      </h4>
      <AccountAddressWithHistoryLink address={address} />
    </section>

    <section>
      <h4 className={styles.title}>
        <FormattedMessage id="shared-component.wallet-balance.title.account-balance" />
      </h4>

      <AccountBalance
        icon={ethIcon}
        currency={ECurrency.ETH}
        currencyTotal={ECurrency.EUR}
        largeNumber={ethAmount}
        value={ethEuroAmount}
        data-test-id="wallet-balance.ether"
        actions={[
          {
            name: <FormattedMessage id="shared-component.account-balance.send" />,
            onClick: withdrawEth,
            disabled: process.env.NF_WITHDRAW_ENABLED !== "1" || isZero(ethAmount),
            "data-test-id": "wallet.eth.withdraw.button",
          },
          {
            name: <FormattedMessage id="shared-component.account-balance.receive" />,
            onClick: depositEth,
            disabled: process.env.NF_WITHDRAW_ENABLED !== "1",
            "data-test-id": "wallet.eth.transfer.button",
          },
        ]}
      />
    </section>
  </WalletBalanceContainer>
);
