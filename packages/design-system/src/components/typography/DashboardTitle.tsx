import * as React from "react";

import { TTranslatedString } from "../../types";

import * as styles from "./DashboardTitle.module.scss";

type TDashboardTitleProps = {
  titleText: TTranslatedString;
};

export const DashboardTitle: React.FunctionComponent<TDashboardTitleProps> = ({ titleText }) => (
  <div className={styles.dashboardTitleWrapper}>
    <h1 className={styles.dashboardTitle}>{titleText}</h1>
  </div>
);
