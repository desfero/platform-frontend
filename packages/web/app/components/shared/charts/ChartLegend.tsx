import { ENumberFormat, ENumberInputFormat, ENumberOutputFormat } from "@neufund/shared";
import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";

import { OTHERS_NAME } from "../../eto/utils";
import { Money } from "../formatters/Money";

import * as styles from "./ChartLegend.module.scss";

interface IDataset {
  data: number[];
  backgroundColor: string[];
}

interface IData {
  datasets: IDataset[];
  labels: string[];
}

interface IProps {
  data: IData;
}

export const ChartLegend: React.FunctionComponent<IProps> = ({ data }) => (
  <>
    {data.datasets.map(dataset =>
      dataset.data.map((value, index) => (
        <div className={styles.chartLegend} key={data.labels[index]}>
          <div
            className={styles.indicator}
            style={{ backgroundColor: dataset.backgroundColor[index] }}
          />
          <div>
            {data.labels[index] === OTHERS_NAME ? (
              <FormattedMessage id="shared.chart-doughnut.others" />
            ) : (
              data.labels[index]
            )}{" "}
            <Money
              value={value.toString()}
              inputFormat={ENumberInputFormat.FLOAT}
              outputFormat={ENumberOutputFormat.FULL}
              valueType={ENumberFormat.PERCENTAGE}
            />
          </div>
        </div>
      )),
    )}
  </>
);
