import { Button, EButtonLayout, EButtonSize } from "@neufund/design-system";
import * as cn from "classnames";
import * as React from "react";

import { EBalanceActionLevel, TBalance, TBalanceAction } from "../../modules/wallet-view/types";
import { Money } from "../shared/formatters/Money";
import { ECurrency, ENumberInputFormat, ENumberOutputFormat } from "../shared/formatters/utils";
import { useCycleFocus } from "../shared/hooks/useCycleFocus";
import { ECustomTooltipTextPosition, Tooltip } from "../shared/tooltips";

import * as styles from "./Wallet.module.scss";

const mapBalanceActionLevelToBtnProps = {
  [EBalanceActionLevel.PRIMARY]: EButtonLayout.PRIMARY,
  [EBalanceActionLevel.SECONDARY]: EButtonLayout.SECONDARY,
};

const BalanceActions: React.FunctionComponent<TBalance> = props => {
  const { walletActions } = props;

  const [isOn, toggle] = React.useState(false);

  const toggleBalanceActionsRef = React.useRef<HTMLButtonElement>(null);
  const balanceActionRefs = walletActions.map(_ => React.useRef<HTMLButtonElement>(null));
  const allRefs = [toggleBalanceActionsRef, ...[...balanceActionRefs].reverse()]; //reverse the button order to match the visual order of the buttons

  const moveFocusOnTabKey = useCycleFocus(allRefs);

  const onTabKey = (ref: React.RefObject<HTMLButtonElement>, e: React.KeyboardEvent) => {
    if (isOn) {
      moveFocusOnTabKey(ref, e);
    }
  };

  return (
    <>
      <div className={cn(styles.balanceActions, { [styles.active]: isOn })}>
        {walletActions.map((balanceAction: TBalanceAction, i: number) => (
          <Button
            onKeyDown={e => onTabKey(balanceActionRefs[i], e)}
            ref={balanceActionRefs[i]}
            key={i}
            layout={mapBalanceActionLevelToBtnProps[balanceAction.level]}
            size={EButtonSize.SMALL}
            onClick={balanceAction.dispatchAction}
            disabled={balanceAction.disableIf(props)}
            data-test-id={balanceAction.dataTestId}
          >
            {balanceAction.text}
          </Button>
        ))}
      </div>

      <Button
        ref={toggleBalanceActionsRef}
        onKeyDown={e => onTabKey(toggleBalanceActionsRef, e)}
        layout={EButtonLayout.LINK}
        size={EButtonSize.SMALL}
        className={styles.balanceActionsButton}
        onClick={() => toggle(!isOn)}
      >
        {"•••"}
      </Button>
    </>
  );
};

export const Balance: React.FunctionComponent<TBalance> = balance => {
  const {
    balanceName,
    logo: Logo,
    amount,
    currency,
    euroEquivalentAmount,
    balanceAdditionalInfo,
    dataTestId,
  } = balance;
  return (
    <ul className={styles.balanceListItem}>
      <div className={styles.currencyLogo}>
        <Logo />
      </div>
      <div className={styles.currency} data-test-id="balance-name">
        {balanceName}
        {balanceAdditionalInfo && (
          <Tooltip
            data-test-id="balance.info"
            content={balanceAdditionalInfo}
            textPosition={ECustomTooltipTextPosition.LEFT}
            preventDefault={false}
          />
        )}
      </div>
      <div className={styles.amount}>
        <Money
          value={amount}
          inputFormat={ENumberInputFormat.ULPS}
          outputFormat={ENumberOutputFormat.ONLY_NONZERO_DECIMALS}
          valueType={currency}
          data-test-id={dataTestId}
        />
        <span className={styles.euroEquivalent}>
          {"≈"}
          <Money
            value={euroEquivalentAmount}
            inputFormat={ENumberInputFormat.ULPS}
            outputFormat={ENumberOutputFormat.ONLY_NONZERO_DECIMALS}
            valueType={ECurrency.EUR}
            data-test-id={`${dataTestId}-euro-equivalent`}
          />
        </span>
      </div>
      {!!balance.walletActions.length && <BalanceActions {...balance} />}
    </ul>
  );
};
