import { Button, EButtonLayout } from "@neufund/design-system";
import * as React from "react";

import { ENotificationType } from "../../../modules/notifications/types";
import { TDataTestId, TTranslatedString } from "../../../types";
import { InlineIcon } from "../../shared/icons/InlineIcon";
import { Notification } from "../../shared/notification-widget/Notification";

import arrow from "../../../assets/img/inline_icons/link_arrow.svg";
import * as styles from "./VerificationMethod.module.scss";

type TProps = {
  onClick?: () => void;
  logo: string;
  text: TTranslatedString;
  name: string;
  disabled?: boolean;
  errorText: TTranslatedString | undefined;
  infoText: TTranslatedString | undefined;
};

export const VerificationMethod: React.FunctionComponent<TProps & TDataTestId> = ({
  logo,
  name,
  onClick,
  text,
  disabled,
  errorText,
  infoText,
  "data-test-id": dataTestId,
}) => (
  <>
    {errorText && (
      <Notification text={errorText} className="mt-0 mb-4" type={ENotificationType.WARNING} />
    )}

    {infoText && (
      <Notification text={infoText} className="mt-0 mb-4" type={ENotificationType.INFO} />
    )}

    <Button
      layout={EButtonLayout.SECONDARY}
      className={styles.card}
      onClick={onClick}
      disabled={disabled}
      data-test-id={dataTestId}
    >
      <img className={styles.image} src={logo} alt={name} />
      <span className={styles.text}>{text}</span>
      <InlineIcon width="24px" height="24px" className={styles.icon} svgIcon={arrow} />
    </Button>
  </>
);
