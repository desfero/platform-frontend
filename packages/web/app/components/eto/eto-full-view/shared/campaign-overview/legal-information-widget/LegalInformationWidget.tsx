import { Eur } from "@neufund/design-system";
import { ENumberInputFormat, ENumberOutputFormat } from "@neufund/shared";
import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";

import { TCompanyEtoData } from "../../../../../../lib/api/eto/EtoApi.interfaces.unsafe";
import { Container, EColumnSpan } from "../../../../../layouts/Container";
import { ChartDoughnutLazy } from "../../../../../shared/charts/ChartDoughnutLazy";
import { generateColor } from "../../../../../shared/charts/utils";
import { DashboardHeading } from "../../../../../shared/DashboardHeading";
import { FormatNumber } from "../../../../../shared/formatters/FormatNumber";
import { Panel } from "../../../../../shared/Panel";
import { CHART_COLORS, FUNDING_ROUNDS } from "../../../../shared/constants";
import { generateShareholders } from "../../../../utils";

import * as styles from "./LegalInformationWidget.module.scss";

interface IProps {
  companyData: TCompanyEtoData;
  columnSpan?: EColumnSpan;
}

export type TShareholder = {
  fullName: string;
  percentageOfShares: number;
};

export const LegalInformationWidget: React.FunctionComponent<IProps> = ({
  companyData,
  columnSpan,
}) => {
  const shareholdersData = generateShareholders(
    companyData.shareholders,
    companyData.companyShareCapital,
  );

  return (
    <Container columnSpan={EColumnSpan.TWO_COL}>
      <DashboardHeading title={<FormattedMessage id="eto.public-view.legal-information.title" />} />
      <Panel className={styles.legalInformation} columnSpan={columnSpan}>
        <section>
          {companyData.name && (
            <div className={styles.entry}>
              <span className={styles.label}>
                <FormattedMessage id="eto.public-view.legal-information.legal-company-name" />
              </span>
              <span className={styles.value}>{companyData.name}</span>
            </div>
          )}
          {companyData.name && (
            <div className={styles.entry}>
              <span className={styles.label}>
                <FormattedMessage id="eto.public-view.legal-information.legal-form" />
              </span>
              <span className={styles.value}>{companyData.legalForm}</span>
            </div>
          )}
          {companyData.foundingDate && (
            <div className={styles.entry}>
              <span className={styles.label}>
                <FormattedMessage id="eto.public-view.legal-information.incorporation-date" />
              </span>
              <span className={styles.value}>{companyData.foundingDate}</span>
            </div>
          )}
          {!!companyData.registrationNumber && (
            <div className={styles.entry}>
              <span className={styles.label}>
                <FormattedMessage id="eto.public-view.legal-information.registration-number" />
              </span>
              <span className={styles.value}>{companyData.registrationNumber}</span>
            </div>
          )}
          {!!companyData.numberOfFounders && (
            <div className={styles.entry}>
              <span className={styles.label}>
                <FormattedMessage id="eto.public-view.legal-information.number-of-founders" />
              </span>
              <span className={styles.value}>
                <FormatNumber
                  value={companyData.numberOfFounders.toString()}
                  outputFormat={ENumberOutputFormat.INTEGER}
                  inputFormat={ENumberInputFormat.FLOAT}
                />
              </span>
            </div>
          )}
          {!!companyData.numberOfEmployees && (
            <div className={styles.entry}>
              <span className={styles.label}>
                <FormattedMessage id="eto.public-view.legal-information.number-of-employees" />
              </span>
              <span className={styles.value}>{companyData.numberOfEmployees}</span>
            </div>
          )}
          {companyData.companyStage && (
            <div className={styles.entry}>
              <span className={styles.label}>
                <FormattedMessage id="eto.public-view.legal-information.last-funding-round" />
              </span>
              <span className={styles.value}>{FUNDING_ROUNDS[companyData.companyStage]}</span>
            </div>
          )}
          {!!companyData.lastFundingSizeEur && (
            <div className={styles.entry}>
              <span className={styles.label}>
                <FormattedMessage id="eto.public-view.legal-information.last-funding-amount" />
              </span>
              <span className={styles.value}>
                <Eur
                  value={companyData.lastFundingSizeEur.toString()}
                  inputFormat={ENumberInputFormat.FLOAT}
                  outputFormat={ENumberOutputFormat.INTEGER}
                />
              </span>
            </div>
          )}
          {!!companyData.companyShareCapital && (
            <div className={styles.entry}>
              <span className={styles.label}>
                <FormattedMessage id="eto.public-view.legal-information.existing-share-capital" />
              </span>
              <span className={styles.value}>
                <FormatNumber
                  value={companyData.companyShareCapital.toString()}
                  outputFormat={ENumberOutputFormat.INTEGER}
                  inputFormat={ENumberInputFormat.FLOAT}
                />
                {` ${companyData.shareCapitalCurrencyCode}`}
              </span>
            </div>
          )}
        </section>

        {!!(companyData.shareholders && companyData.shareholders.length > 0) && (
          <ChartDoughnutLazy
            data={{
              datasets: [
                {
                  data: shareholdersData.map(d => d && d.percentageOfShares),
                  backgroundColor: shareholdersData.map(
                    (shareholder: TShareholder, i: number) =>
                      // Use predefined colors first, then use generated colors
                      CHART_COLORS[i] || generateColor(`${i}${shareholder.fullName}`),
                  ),
                },
              ],
              labels: shareholdersData.map(d => d && d.fullName),
            }}
          />
        )}
      </Panel>
    </Container>
  );
};
