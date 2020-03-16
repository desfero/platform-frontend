import { ECurrency, ENumberInputFormat, ENumberOutputFormat } from "@neufund/shared";
import * as cn from "classnames";
import * as React from "react";
import { FormattedHTMLMessage, FormattedMessage } from "react-intl-phraseapp";

import { IPledge } from "../../../../../lib/api/eto/EtoPledgeApi.interfaces.unsafe";
import { appRoutes } from "../../../../appRoutes";
import { ButtonLink } from "../../../../shared/buttons/ButtonLink";
import { Money } from "../../../../shared/formatters/Money";
import { Tooltip } from "../../../../shared/tooltips";
import { CampaigningActivatedInvestorApprovedWidget } from "./CampaigningActivatedInvestorApprovedWidget";

import * as styles from "../EtoOverviewStatus.module.scss";

type TWhitelistingActiveProps = {
  pledge?: IPledge;
  pledgedAmount: number;
  investorsLimit: number;
  investorsCount: number;
  isInvestor: boolean;
  isVerifiedInvestor: boolean;
  etoId: string;
  minPledge: number;
  maxPledge?: number;
};

export const WhitelistingActive: React.FunctionComponent<TWhitelistingActiveProps> = ({
  pledge,
  pledgedAmount,
  investorsLimit,
  investorsCount,
  isInvestor,
  isVerifiedInvestor,
  etoId,
  minPledge,
  maxPledge,
}) => (
  <>
    <div className={styles.groupWrapper} data-test-id="eto-overview-status-whitelisting-active">
      <div className={cn(styles.group, styles.groupNoPadding)}>
        <span className={styles.label}>
          <FormattedMessage id="eto-overview.campaigning.whitelist-status" />
        </span>
        <span className={styles.value}>
          {pledge ? (
            <FormattedMessage id="eto-overview.campaigning.whitelist-status.label-subscribed" />
          ) : (
            <>
              <FormattedMessage id="eto-overview.campaigning.whitelist-status.label-not-subscribed" />
              <Tooltip
                content={
                  <FormattedHTMLMessage
                    tagName="div"
                    id="eto-overview.campaigning.whitelist-status.label-not-subscribed-description-text"
                  />
                }
              />
            </>
          )}
        </span>
      </div>
      <div className={cn(styles.group, styles.groupNoPadding)}>
        <span className={styles.label}>
          <FormattedMessage id="shared-component.eto-overview.amount-backed" />
        </span>
        <span className={styles.value} data-test-id="eto-bookbuilding-amount-backed">
          <Money
            value={pledgedAmount ? pledgedAmount.toString() : undefined}
            valueType={ECurrency.EUR}
            inputFormat={ENumberInputFormat.FLOAT}
            outputFormat={ENumberOutputFormat.ONLY_NONZERO_DECIMALS}
          />
        </span>
      </div>
      <div className={cn(styles.group, styles.groupNoPadding)}>
        <span className={styles.label}>
          <FormattedMessage id="shared-component.eto-overview.investors-backed" />
        </span>
        <span className={styles.value}>
          <FormattedMessage
            id="eto-overview.campaigning.whitelist-status.slots-remaining"
            values={{
              remaining: (
                <span data-test-id="eto-bookbuilding-remaining-slots">
                  {investorsLimit - investorsCount}
                </span>
              ),
              investorsLimit,
            }}
          />
        </span>
      </div>
      {isInvestor && isVerifiedInvestor && (
        <CampaigningActivatedInvestorApprovedWidget
          etoId={etoId}
          minPledge={minPledge}
          maxPledge={maxPledge}
          pledge={pledge}
        />
      )}
    </div>
    {isInvestor && !isVerifiedInvestor && (
      <ButtonLink
        className={styles.etoOverviewStatusButton}
        to={appRoutes.profile}
        data-test-id="eto-overview-settings-update-required-to-invest"
      >
        <FormattedMessage id="shared-component.eto-overview.verify-to-whitelist" />
      </ButtonLink>
    )}
  </>
);
