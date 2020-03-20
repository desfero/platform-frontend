import * as React from "react";

import { Button, EButtonLayout, EButtonWidth, EIconPosition } from "./Button";

import ArrowLeftIcon from "../../assets/img/inline_icons/arrow-left.svg";
import ArrowRightIcon from "../../assets/img/inline_icons/arrow-right.svg";
import CloseIcon from "../../assets/img/inline_icons/close.svg";

type TButtonProps = React.ComponentProps<typeof Button>;

type TButtonArrowProps = Omit<TButtonProps, "svgIcon" | "iconPosition">;

const ButtonArrowRight: React.FunctionComponent<TButtonArrowProps> = props => (
  <Button
    {...props}
    layout={EButtonLayout.GHOST}
    iconPosition={EIconPosition.ICON_AFTER}
    svgIcon={ArrowRightIcon}
  />
);

const ButtonArrowLeft: React.FunctionComponent<TButtonArrowProps> = props => (
  <Button
    {...props}
    layout={EButtonLayout.GHOST}
    iconPosition={EIconPosition.ICON_BEFORE}
    svgIcon={ArrowLeftIcon}
  />
);

const ButtonClose: React.FunctionComponent<Omit<TButtonProps, "svgIcon">> = ({
  iconProps = {},
  ...props
}) => (
  <Button
    layout={EButtonLayout.GHOST}
    width={EButtonWidth.NO_PADDING}
    svgIcon={CloseIcon}
    iconProps={iconProps}
    {...props}
  />
);

export { ButtonClose, ButtonArrowRight, ButtonArrowLeft };
