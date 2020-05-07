import * as React from "react";

import { ECurrencySymbol, Money } from "../shared/formatters/Money";
import { ECurrency, ENumberInputFormat, ENumberOutputFormat } from "../shared/formatters/utils";

import * as styles from "./Wallet.module.scss";

type TCommonBalanceProps = {
  walletBalanceEuro: string
}

export const CommonBalance: React.FunctionComponent<TCommonBalanceProps> = ({ walletBalanceEuro }) =>
  <div>
    <div className={styles.commonBalanceTitle}>Wallet balance</div>
    €<Money
    className={styles.commonBalance}
    currencySymbol={ECurrencySymbol.NONE}
    inputFormat={ENumberInputFormat.ULPS}
    outputFormat={ENumberOutputFormat.ONLY_NONZERO_DECIMALS}
    value={walletBalanceEuro}
    valueType={ECurrency.EUR}
  />
  </div>
