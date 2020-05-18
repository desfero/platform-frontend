import * as React from "react";

import { Image } from "../..";
import { CommonHtmlProps } from "../../types";

import * as styles from "./IconWithBadge.module.scss";

export type TIconWithBadgeProps = {
  badge: string;
  icon: string;
};

export const IconWithBadge: React.FunctionComponent<TIconWithBadgeProps & CommonHtmlProps> = ({
  className,
  badge,
  icon,
}) => (
  <div className={styles.iconWithBadge}>
    <Image srcSet={{ "1x": badge }} className={styles.badge} alt="" />
    <Image srcSet={{ "1x": icon }} className={className} alt="" />
  </div>
);
