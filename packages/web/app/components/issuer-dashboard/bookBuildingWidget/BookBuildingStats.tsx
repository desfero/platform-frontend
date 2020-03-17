import { Eur } from "@neufund/design-system";
import { ENumberInputFormat } from "@neufund/shared";
import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";

import { IBookBuildingStats } from "../../../lib/api/eto/EtoPledgeApi.interfaces.unsafe";
import { Document } from "../../shared/Document";
import { DocumentButton } from "../../shared/DocumentLink";

import * as styles from "./BookBuildingStats.module.scss";

interface IBookBuilding {
  bookBuildingStats: IBookBuildingStats;
  downloadCSV: () => void;
  maxPledges: number | null;
}

const BookBuildingStats: React.FunctionComponent<IBookBuilding> = ({
  bookBuildingStats,
  maxPledges,
  downloadCSV,
}) => (
  <>
    <div className={styles.groupWrapper}>
      <span className={styles.label}>
        <FormattedMessage id="shared-component.eto-overview.amount-backed" />
      </span>
      <Eur
        data-test-id="bookbuilding-widget.stats.amount-backed"
        value={bookBuildingStats.pledgedAmount.toString()}
        inputFormat={ENumberInputFormat.FLOAT}
      />
      <span className={styles.label}>
        <FormattedMessage id="shared-component.eto-overview.investors-backed" />
      </span>
      {maxPledges !== null ? (
        <span data-test-id="bookbuilding-widget.stats.number-of-pledges">
          <FormattedMessage
            id="settings.book-building-stats-widget.number-of-pledges"
            values={{ pledges: bookBuildingStats.investorsCount, maxPledges }}
          />
        </span>
      ) : null}
    </div>

    {bookBuildingStats.investorsCount > 0 ? (
      <DocumentButton
        onClick={downloadCSV}
        title={<FormattedMessage id="eto-bookbuilding-widget.download-bookbuilding-stats" />}
        altIcon={<Document extension="csv" />}
        data-test-id="bookbuilding-widget.stats.download"
      />
    ) : null}
  </>
);

export { BookBuildingStats };
