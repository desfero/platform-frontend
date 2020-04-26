import { Button, EButtonLayout, EButtonSize, EIconPosition } from "@neufund/design-system";
import { makeTid } from "@neufund/shared-utils";
import * as React from "react";

import { TDataTestId, TTranslatedString } from "../../types";
import { IMoneySuiteWidgetProps, MoneySuiteWidget } from "./MoneySuiteWidget/MoneySuiteWidget";

import arrowRightIcon from "../../assets/img/inline_icons/arrow_right.svg";
import * as styles from "./AccountBalance.module.scss";

type TAction = {
  name: TTranslatedString;
  onClick: () => void;
  disabled?: boolean;
} & TDataTestId;

interface IProps {
  actions?: TAction[];
}

export const AccountBalance: React.FunctionComponent<IProps &
  IMoneySuiteWidgetProps &
  TDataTestId> = ({
  icon,
  currency,
  currencyTotal,
  largeNumber,
  value,
  actions,
  "data-test-id": dataTestId,
}) => (
  <div className={styles.accountBalance}>
    <MoneySuiteWidget
      icon={icon}
      currency={currency}
      currencyTotal={currencyTotal}
      largeNumber={largeNumber}
      value={value}
      data-test-id={makeTid(dataTestId, "balance-values")}
    />
    <div className={styles.buttons}>
      {actions &&
        actions.map(({ onClick, disabled, name, "data-test-id": actionDataTestId }, i) => (
          <Button
            key={i}
            layout={EButtonLayout.LINK}
            size={EButtonSize.SMALL}
            className={styles.button}
            iconPosition={EIconPosition.ICON_AFTER}
            svgIcon={arrowRightIcon}
            onClick={onClick}
            data-test-id={actionDataTestId}
            disabled={disabled}
          >
            {name}
          </Button>
        ))}
    </div>
  </div>
);
