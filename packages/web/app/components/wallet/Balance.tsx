import * as React from "react";
import * as cn from "classnames";
import { Button, EButtonLayout, EButtonSize } from "@neufund/design-system";

import { TBalance, TBalanceAction } from "../../modules/wallet-view/types";
import { Money } from "../shared/formatters/Money";
import { ECurrency, ENumberInputFormat, ENumberOutputFormat } from "../shared/formatters/utils";
import { useRef } from "react";
import { useCycleFocus } from "../shared/hooks/useCycleFocus";

import * as styles from "./Wallet.module.scss";

const BalanceActions: React.FunctionComponent<TBalance> = (props) => {
  const { walletActions } = props

  const [isOn, toggle] = React.useState(false);

  const toggleBalanceActionsRef = useRef<HTMLButtonElement>(null)
  const balanceActionRefs = walletActions.map(_ => useRef<HTMLButtonElement>(null))
  const allRefs = [toggleBalanceActionsRef, ...[...balanceActionRefs].reverse()] //reverse the button order to reflect the visual ordering

  const moveFocusOnTabKey = useCycleFocus(allRefs)

  const onTabKey = (ref: React.RefObject<HTMLButtonElement>, e: React.KeyboardEvent) => {
    if (isOn){
      moveFocusOnTabKey(ref, e)
    }
  }

  return (
    <>
      <div className={cn(styles.balanceActions, { [styles.active]: isOn })}>
        {walletActions.map((balanceAction: TBalanceAction, i: number) =>
          <Button
            onKeyDown={(e) => onTabKey(balanceActionRefs[i], e)}
            ref={balanceActionRefs[i]}
            key={i}
            layout={EButtonLayout.PRIMARY}
            size={EButtonSize.SMALL}
            onClick={balanceAction.dispatchAction}
            disabled={balanceAction.disableIf(props)}
          >
            {balanceAction.text}
          </Button>
        )}
      </div>

      <Button
        ref={toggleBalanceActionsRef}
        onKeyDown={(e) => onTabKey(toggleBalanceActionsRef, e)}
        layout={EButtonLayout.LINK}
        size={EButtonSize.SMALL}
        className={styles.balanceActionsButton}
        onClick={() => toggle(!isOn)}
      >
        {"•••"}
      </Button>

    </>
  )
}


export const Balance: React.FunctionComponent<TBalance> = (balance) => {
  const {
    balanceName,
    logo: Logo,
    amount,
    currency,
    euroEquivalentAmount,
  } = balance
  return (
    <div className={styles.balanceListItem}>
      <div className={styles.currencyLogo}>
        <Logo />
      </div>
      <div className={styles.currency}>{balanceName}</div>
      <div className={styles.amount}>
        <Money
          value={amount}
          inputFormat={ENumberInputFormat.ULPS}
          outputFormat={ENumberOutputFormat.ONLY_NONZERO_DECIMALS}
          valueType={currency}
        />
        <span className={styles.euroEquivalent}>
                    {"≈"}
          <Money
            value={euroEquivalentAmount}
            inputFormat={ENumberInputFormat.ULPS}
            outputFormat={ENumberOutputFormat.ONLY_NONZERO_DECIMALS}
            valueType={ECurrency.EUR}
          />
                </span>
      </div>
      {!!balance.walletActions.length &&
      <BalanceActions
        {...balance}
      />
      }

    </div>
  );
}
