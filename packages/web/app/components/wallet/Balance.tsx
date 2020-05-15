import * as React from "react";
import * as cn from "classnames";
import { Button, EButtonLayout, EButtonSize } from "@neufund/design-system";

import { TBalance, TBalanceAction } from "../../modules/wallet-view/types";
import { Money } from "../shared/formatters/Money";
import { ECurrency, ENumberInputFormat, ENumberOutputFormat } from "../shared/formatters/utils";
import { useEffect, useRef, useState } from "react";

import * as styles from "./Wallet.module.scss";

type TBalanceActionsProps = { isOn: boolean, toggle: (x: boolean) => void }

const BalanceActions: React.FunctionComponent<TBalance & TBalanceActionsProps> = (props) => {
  const { walletActions, isOn, toggle } = props

  const toggleBalanceActionsRef = useRef<HTMLButtonElement>(null)
  const balanceActionRefs = walletActions.map(_ => useRef<HTMLButtonElement>(null))

  const allRefs = [...balanceActionRefs, toggleBalanceActionsRef]
  const [f, setF] = useState(allRefs.length - 1)

  useEffect(() => {
    allRefs[f].current !== null && allRefs[f].current!.focus()
  }, [f])


  const onTabKey = (ref: React.RefObject<unknown>, e: React.KeyboardEvent) => {


    if (isOn && e.which === 9 && !e.shiftKey) {
      const next = f + 1 >= allRefs.length ? 0 : f + 1
      setNext(e, next)

    } else if (isOn && e.which === 9 && e.shiftKey) {
      const next = f - 1 >= 0 ? f - 1 : allRefs.length - 1
      setNext(e, next)
    }
  }

  const setNext = (e: React.KeyboardEvent, next: number) => {
    e.preventDefault()
    if (allRefs[next].current !== null) {
      setF(next)
    }
  }

  const setButtonFocus = (i) => {

  }

  const setToggleButtonFocus = () => {
  }

  return (
    <>
      <div className={cn(styles.balanceActions, { [styles.active]: isOn })}>
        {walletActions.map((balanceAction: TBalanceAction, i: number) =>
          <Button
            onKeyDown={(e) => onTabKey(balanceActionRefs[i], e)}
            ref={balanceActionRefs[i]}
            // onFocus={() => setFocus(i)}
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
  const [isOn, toggle] = React.useState(false);


  const {
    balanceName,
    logo: Logo,
    amount,
    currency,
    euroEquivalentAmount,
  } = balance
  return (
    <div className={styles.balanceListItem} key={balanceName} onClick={() => isOn ? undefined : toggle(true)}>
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
        isOn={isOn}
        toggle={toggle}
      />
      }

    </div>
  );
}
