import { InlineIcon } from "@neufund/design-system";
import { makeTid } from "@neufund/shared-utils";
import * as cn from "classnames";
import * as React from "react";

import { CommonHtmlProps, TDataTestId, TTranslatedString } from "../../../types";
import { EInlineIconFill } from "../icons";
import { TooltipBase } from "./TooltipBase";

import icon from "../../../assets/img/inline_icons/info-outline.svg";
import * as styles from "./Tooltip.module.scss";

interface IProps {
  content: TTranslatedString;
  isOpen?: boolean;
  preventDefault?: boolean;
}

type TForwardedProps = Omit<React.ComponentProps<typeof TooltipBase>, "target">;

let tooltipCount = 0;

class Tooltip extends React.Component<
  IProps & CommonHtmlProps & TForwardedProps & TDataTestId,
  { targetId: string }
> {
  static defaultProps = {
    preventDefault: true,
  };

  state = {
    targetId: `tooltip-${tooltipCount++}`,
  };

  render(): React.ReactNode {
    const {
      content,
      className,
      children,
      preventDefault,
      ["data-test-id"]: dataTestId,
      ...tooltipProps
    } = this.props;

    return (
      <span
        className={cn(
          className,
          styles.tooltipWrapper,
          typeof children === "string" ? styles.tooltipWrapperText : styles.tooltipWrapperIcon,
        )}
        onClick={preventDefault ? e => e.preventDefault() : undefined}
      >
        <span
          className={styles.tooltip}
          id={this.state.targetId}
          data-test-id={makeTid(dataTestId, "trigger")}
        >
          {children ? children : <InlineIcon fill={EInlineIconFill.FILL_OUTLINE} svgIcon={icon} />}
        </span>
        <TooltipBase
          target={this.state.targetId}
          data-test-id={makeTid(dataTestId, "popover")}
          {...tooltipProps}
        >
          {content}
        </TooltipBase>
      </span>
    );
  }
}

export { Tooltip };
