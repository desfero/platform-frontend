import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";

import { ECurrencySymbol, Money } from "../shared/formatters/Money";
import { ECurrency, ENumberInputFormat, ENumberOutputFormat } from "../shared/formatters/utils";

import * as styles from "./Wallet.module.scss";

type TCommonBalanceProps = {
  walletBalanceEuro: string
}

export const BalanceTotal: React.FunctionComponent<TCommonBalanceProps> = ({ walletBalanceEuro }) =>
  <>
    <div className={styles.totalBalanceTitle}><FormattedMessage id="wallet.total-balance"/></div>
    <span className={styles.totalBalance}>€
    <Money
      currencySymbol={ECurrencySymbol.NONE}
      inputFormat={ENumberInputFormat.ULPS}
      outputFormat={ENumberOutputFormat.ONLY_NONZERO_DECIMALS}
      value={walletBalanceEuro}
      valueType={ECurrency.EUR}
    />
  </span>
  </>
