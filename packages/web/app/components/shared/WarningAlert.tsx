import * as cn from "classnames";
import * as React from "react";

import { TDataTestId } from "../../types";
import { InlineIcon } from "./icons/InlineIcon";

import warningIcon from "../../assets/img/inline_icons/warning-circle--solid.svg";
import * as styles from "./WarningAlert.module.scss";

export enum EWarningAlertSize {
  NORMAL,
  BIG = styles.big,
}

export enum EWarningAlertLayout {
  DEFAULT,
  INLINE = styles.inline,
}

interface IWarningAlertProps {
  className?: string;
  size?: EWarningAlertSize;
  layout?: EWarningAlertLayout;
}

export const WarningAlert: React.FunctionComponent<IWarningAlertProps & TDataTestId> = ({
  children,
  className,
  size = EWarningAlertSize.NORMAL,
  layout = EWarningAlertLayout.DEFAULT,
  "data-test-id": dataTestId,
}) => (
  <div className={cn(styles.warningAlert, size, layout, className)} data-test-id={dataTestId}>
    <InlineIcon svgIcon={warningIcon} className={styles.icon} />
    <span>{children}</span>
  </div>
);
