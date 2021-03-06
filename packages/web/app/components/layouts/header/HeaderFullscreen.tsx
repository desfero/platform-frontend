import { Button, EButtonLayout, EIconPosition } from "@neufund/design-system";
import * as React from "react";

import { CommonHtmlProps, TTranslatedString } from "../../../types";
import { LogoFullScreen } from "./Header";

import close from "../../../assets/img/inline_icons/close.svg";
import * as styles from "./Header.module.scss";

export type THeaderFullscreenProps = {
  buttonAction?: () => void;
  buttonText?: TTranslatedString;
};

const ActionButton: React.FunctionComponent<THeaderFullscreenProps & CommonHtmlProps> = ({
  buttonAction,
  buttonText,
  className,
}) => (
  <Button
    layout={EButtonLayout.LINK}
    className={className}
    svgIcon={close}
    iconPosition={EIconPosition.ICON_AFTER}
    onClick={buttonAction}
    iconProps={{ className: styles.actionButtonIcon }}
  >
    {buttonText}
  </Button>
);

const HeaderFullscreen: React.FunctionComponent<THeaderFullscreenProps> = ({
  buttonAction,
  buttonText,
}) => (
  <header className={styles.headerUnauth}>
    <LogoFullScreen />
    {buttonAction && (
      <ActionButton className={styles.button} buttonAction={buttonAction} buttonText={buttonText} />
    )}
  </header>
);

export { HeaderFullscreen };
