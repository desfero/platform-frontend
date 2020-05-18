import * as React from "react";

import { TBalance } from "../../modules/wallet-view/types";
import { PanelRounded } from "../shared/Panel";
import { Balance } from "./Balance";

import * as styles from "./Wallet.module.scss";

export type TBalanceListProps = { balances: TBalance[] };

export const BalanceList: React.FunctionComponent<TBalanceListProps> = ({ balances }) => (
  <PanelRounded>
    <li className={styles.balanceList}>
      {balances.map(b => (
        <Balance {...b} key={b.balanceName} />
      ))}
    </li>
  </PanelRounded>
);
