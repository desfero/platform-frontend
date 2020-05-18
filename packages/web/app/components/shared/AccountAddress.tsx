import * as cn from "classnames";
import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";

import { CommonHtmlProps, TDataTestId } from "../../types";
import { Avatar } from "./Avatar";
import { CopyToClipboardButton } from "./CopyToClipboardButton";
import { EtherscanAddressLink } from "./links";
import { ECustomTooltipTextPosition, Tooltip } from "./tooltips";

import * as styles from "./AccountAddress.module.scss";

export interface IAccountAddressProps {
  address: string;
}

export const HistoryLink: React.FunctionComponent<IAccountAddressProps & CommonHtmlProps> = ({ address, className }) => (
  <div className={cn(styles.transactionHistory, className)}>
    <FormattedMessage
      id="shared-components.account-address.transaction-history"
      values={{
        etherscan: (
          <EtherscanAddressLink address={address}>
            <FormattedMessage id="common.text.etherscan" />
          </EtherscanAddressLink>
        ),
      }}
    />
  </div>
);

export const WalletAddress: React.FunctionComponent<IAccountAddressProps &
  CommonHtmlProps &
  TDataTestId> = ({
  address,
  "data-test-id": dataTestId = "account-address.your.ether-address.from-div"
}) =>
  <div className={styles.walletAddress}>
    <div className={styles.addressWrapper}>
      <Avatar seed={address} className={styles.avatar} />

      <Tooltip
        className={styles.address}
        data-test-id={dataTestId}
        content={address}
        textPosition={ECustomTooltipTextPosition.LEFT}
        preventDefault={false}
      >
        {address}
      </Tooltip>
      <CopyToClipboardButton value={address} />
    </div>
    <HistoryLink address={address} className={styles.historyLink} />
  </div>

const AccountAddress: React.FunctionComponent<IAccountAddressProps &
  CommonHtmlProps &
  TDataTestId> = ({
  address,
  className,
  "data-test-id": dataTestId = "account-address.your.ether-address.from-div",
}) => (
  <div className={cn(styles.accountAddress, className)}>
    <Avatar seed={address} />
    <span className={styles.address} data-test-id={dataTestId}>
      {address}
    </span>
    <CopyToClipboardButton value={address} />
  </div>
);

const AccountAddressWithHistoryLink: React.FunctionComponent<IAccountAddressProps &
  CommonHtmlProps &
  TDataTestId> = ({
  address,
  className,
  "data-test-id": dataTestId = "account-address.your.ether-address.from-div",
}) => (
  <div className={cn(styles.accountAddressWithHistoryLink, className)}>
    <Avatar seed={address} />

    <div className={styles.addressWrapper}>
      <div className={styles.address} data-test-id={dataTestId}>
        {address}
      </div>
      <HistoryLink address={address} />
    </div>

    <CopyToClipboardButton value={address} />
  </div>
);

export { AccountAddressWithHistoryLink, AccountAddress };
