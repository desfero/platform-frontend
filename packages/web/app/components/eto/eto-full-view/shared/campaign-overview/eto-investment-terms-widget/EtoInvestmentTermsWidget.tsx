import { Eur } from "@neufund/design-system";
import {
  divideBigNumbers,
  ECurrency,
  ENumberInputFormat,
  ENumberOutputFormat,
  EPriceFormat,
  ESpecialNumber,
  selectUnits,
} from "@neufund/shared";
import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";
import { compose } from "recompose";

import {
  EEtoDocumentType,
  IEtoDocument,
} from "../../../../../../lib/api/eto/EtoFileApi.interfaces";
import { canShowDocument } from "../../../../../../lib/api/eto/EtoFileUtils";
import { EAssetType, EJurisdiction } from "../../../../../../lib/api/eto/EtoProductsApi.interfaces";
import { actions } from "../../../../../../modules/actions";
import { getDocumentByType } from "../../../../../../modules/eto-documents/utils";
import { TEtoWithCompanyAndContractReadonly } from "../../../../../../modules/eto/types";
import { appConnect } from "../../../../../../store";
import { DocumentButton } from "../../../../../shared/DocumentLink";
import { Entry } from "../../../../../shared/Entry";
import { FormatNumber } from "../../../../../shared/formatters/FormatNumber";
import { FormatNumberRange } from "../../../../../shared/formatters/FormatNumberRange";
import { Money } from "../../../../../shared/formatters/Money";
import { MoneyRange } from "../../../../../shared/formatters/MoneyRange";
import { Panel } from "../../../../../shared/Panel";
import { Percentage } from "../../../../../shared/Percentage";
import { Tooltip } from "../../../../../shared/tooltips/Tooltip";
import { ToBeAnnounced, ToBeAnnouncedTooltip } from "../../../../shared/ToBeAnnouncedTooltip";
import { InvestmentAmount } from "./InvestmentAmount";

import * as styles from "./EtoInvestmentTermsWidget.module.scss";

type TExternalProps = {
  eto: TEtoWithCompanyAndContractReadonly;
  isUserFullyVerified: boolean;
};

type TDispatchProps = {
  downloadDocument: (document: IEtoDocument) => void;
};

const DownloadIshaOrTermsheetLink: React.FunctionComponent<TExternalProps & TDispatchProps> = ({
  eto,
  downloadDocument,
  isUserFullyVerified,
}) => {
  // TODO remove once server sends empty collection
  if (!eto.documents) {
    return null;
  }

  const getDocument = getDocumentByType(eto.documents);

  const signedIshaDoc = getDocument(EEtoDocumentType.SIGNED_INVESTMENT_AND_SHAREHOLDER_AGREEMENT);
  if (signedIshaDoc && canShowDocument(signedIshaDoc, isUserFullyVerified)) {
    return (
      <DocumentButton
        data-test-id={`eto-public-view.investment-terms.document.${signedIshaDoc.documentType}`}
        title={<FormattedMessage id="eto.documents.signed-investment-and-shareholder-agreement" />}
        onClick={() => downloadDocument(signedIshaDoc)}
      />
    );
  }

  const ishaDoc = getDocument(EEtoDocumentType.INVESTMENT_AND_SHAREHOLDER_AGREEMENT_PREVIEW);
  if (ishaDoc && canShowDocument(ishaDoc, isUserFullyVerified)) {
    return (
      <DocumentButton
        data-test-id={`eto-public-view.investment-terms.document.${ishaDoc.documentType}`}
        title={<FormattedMessage id="eto.documents.investment-and-shareholder-agreement-preview" />}
        onClick={() => downloadDocument(ishaDoc)}
      />
    );
  }
  const signedTermsheetDoc = getDocument(EEtoDocumentType.SIGNED_TERMSHEET);
  if (signedTermsheetDoc) {
    return (
      <DocumentButton
        data-test-id={`eto-public-view.investment-terms.document.${signedTermsheetDoc.documentType}`}
        title={<FormattedMessage id="eto.documents.signed-termsheet" />}
        onClick={() => downloadDocument(signedTermsheetDoc)}
      />
    );
  }
  return null;
};

const EtoInvestmentTermsWidgetLayout: React.FunctionComponent<TExternalProps & TDispatchProps> = ({
  eto,
  downloadDocument,
  isUserFullyVerified,
}) => {
  const newSharePrice = eto.investmentCalculatedValues
    ? eto.investmentCalculatedValues.sharePrice
    : undefined;

  return (
    <Panel className={styles.tokenTerms}>
      <div className={styles.content} data-test-id="eto-public-view-token-terms">
        <div className={styles.group}>
          <div className={styles.groupTitle}>
            <FormattedMessage id="eto.public-view.token-terms.group-title.equity" />
          </div>
          <div className={styles.groupContent}>
            <Entry
              label={<FormattedMessage id="eto.public-view.token-terms.pre-money-valuation" />}
              value={
                <Eur
                  value={eto.preMoneyValuationEur ? eto.preMoneyValuationEur.toString() : undefined}
                  inputFormat={ENumberInputFormat.FLOAT}
                  outputFormat={ENumberOutputFormat.INTEGER}
                  defaultValue={<ToBeAnnouncedTooltip />}
                />
              }
              data-test-id="eto-public-view-pre-money-valuation"
            />
            <Entry
              label={<FormattedMessage id="eto.public-view.token-terms.existing-share-capital" />}
              value={
                <>
                  <FormatNumber
                    value={
                      eto.existingShareCapital ? eto.existingShareCapital.toString() : undefined
                    }
                    outputFormat={ENumberOutputFormat.INTEGER}
                    inputFormat={ENumberInputFormat.FLOAT}
                    defaultValue={<ToBeAnnounced />}
                  />
                  {` ${eto.company.shareCapitalCurrencyCode}`}
                </>
              }
              data-test-id="eto-public-view-existing-share-capital"
            />
            {eto.authorizedCapital && (
              <Entry
                label={<FormattedMessage id="eto.public-view.token-terms.authorized-capital" />}
                value={
                  <>
                    <FormatNumber
                      value={eto.authorizedCapital.toString()}
                      outputFormat={ENumberOutputFormat.INTEGER}
                      inputFormat={ENumberInputFormat.FLOAT}
                      defaultValue={<ToBeAnnounced />}
                    />
                    {` ${eto.company.shareCapitalCurrencyCode}`}
                  </>
                }
                data-test-id="eto-public-view-authorized-capital"
              />
            )}
            {eto.newShareNominalValue && (
              <Entry
                label={<FormattedMessage id="eto.public-view.new-share-nominal-value" />}
                value={
                  <>
                    <FormatNumber
                      value={eto.newShareNominalValue.toString()}
                      outputFormat={ENumberOutputFormat.INTEGER}
                      inputFormat={ENumberInputFormat.FLOAT}
                      defaultValue={<ToBeAnnounced />}
                    />
                    {` ${eto.company.shareCapitalCurrencyCode}`}
                  </>
                }
                data-test-id="eto-public-view-new-share-nominal-value"
              />
            )}
            <Entry
              label={<FormattedMessage id="eto.public-view.token-terms.new-shares-to-issue" />}
              value={
                <FormatNumberRange
                  valueFrom={
                    eto.minimumNewSharesToIssue ? eto.minimumNewSharesToIssue.toString() : undefined
                  }
                  valueUpto={eto.newSharesToIssue ? eto.newSharesToIssue.toString() : undefined}
                  outputFormat={ENumberOutputFormat.INTEGER}
                  inputFormat={ENumberInputFormat.FLOAT}
                  defaultValue={<ToBeAnnounced />}
                />
              }
              data-test-id="eto-public-view-new-shares-to-issue"
            />
            {!!eto.newSharesToIssueInWhitelist && (
              <Entry
                label={
                  <FormattedMessage id="eto.public-view.token-terms.new-shares-to-issue-in-whitelist" />
                }
                value={
                  <FormatNumber
                    value={eto.newSharesToIssueInWhitelist.toString()}
                    outputFormat={ENumberOutputFormat.INTEGER}
                    inputFormat={ENumberInputFormat.FLOAT}
                    defaultValue={<ToBeAnnounced />}
                  />
                }
                data-test-id="eto-public-view-new-shares-to-issue-in-whitelist"
              />
            )}
            <Entry
              label={<FormattedMessage id="eto.public-view.token-terms.new-share-price" />}
              value={
                <Money
                  value={newSharePrice ? newSharePrice.toString() : undefined}
                  valueType={EPriceFormat.SHARE_PRICE}
                  inputFormat={ENumberInputFormat.FLOAT}
                  outputFormat={ENumberOutputFormat.FULL}
                  defaultValue={<ToBeAnnounced />}
                />
              }
              data-test-id="eto-public-view-new-share-price"
            />
            <InvestmentAmount eto={eto} />
            <DownloadIshaOrTermsheetLink
              eto={eto}
              downloadDocument={downloadDocument}
              isUserFullyVerified={isUserFullyVerified}
            />
          </div>
        </div>

        <div className={styles.divider} />

        <div className={styles.group}>
          <div className={styles.groupTitle}>
            <FormattedMessage id="eto.public-view.token-terms.group-title.token-sale" />
          </div>
          <div className={styles.groupContent}>
            <Entry
              label={<FormattedMessage id="eto.public-view.token-terms.tokens-per-share" />}
              value={
                <FormatNumber
                  value={eto.equityTokensPerShare ? eto.equityTokensPerShare.toString() : undefined}
                  outputFormat={ENumberOutputFormat.INTEGER}
                  inputFormat={ENumberInputFormat.FLOAT}
                  defaultValue={<ToBeAnnounced />}
                />
              }
              data-test-id="eto-public-view-tokens-per-share"
            />
            <Entry
              label={<FormattedMessage id="eto.public-view.token-terms.token-price" />}
              value={
                <Money
                  value={
                    newSharePrice && eto.equityTokensPerShare
                      ? divideBigNumbers(
                          newSharePrice.toString(),
                          eto.equityTokensPerShare.toString(),
                        )
                      : undefined
                  }
                  inputFormat={ENumberInputFormat.FLOAT}
                  valueType={EPriceFormat.EQUITY_TOKEN_PRICE_EURO}
                  outputFormat={ENumberOutputFormat.FULL}
                  defaultValue={<ToBeAnnounced />}
                />
              }
              data-test-id="eto-public-view-token-price"
            />
            {!!eto.whitelistDiscountFraction && (
              <Entry
                label={<FormattedMessage id="eto.public-view.token-terms.whitelist-discount" />}
                value={<Percentage>{eto.whitelistDiscountFraction}</Percentage>}
                data-test-id="eto-public-view-whitelist-discount"
              />
            )}
            {!!eto.publicDiscountFraction && (
              <Entry
                label={<FormattedMessage id="eto.public-view.token-terms.public-discount" />}
                value={<Percentage>{eto.publicDiscountFraction}</Percentage>}
                data-test-id="eto-public-view-public-discount"
              />
            )}
            <Entry
              label={
                <>
                  <FormattedMessage id="eto.public-view.token-terms.ticket-size" />
                  <Tooltip
                    content={
                      <FormattedMessage id="eto.public-view.token-terms.ticket-size.tooltip" />
                    }
                  />
                </>
              }
              value={
                <MoneyRange
                  valueFrom={eto.minTicketEur ? eto.minTicketEur.toString() : undefined}
                  valueUpto={
                    eto.maxTicketEur ? eto.maxTicketEur.toString() : ESpecialNumber.UNLIMITED
                  }
                  inputFormat={ENumberInputFormat.FLOAT}
                  valueType={ECurrency.EUR}
                  outputFormat={ENumberOutputFormat.INTEGER}
                  defaultValue={<ToBeAnnounced />}
                />
              }
              data-test-id="eto-public-view-ticket-size"
            />
            <Entry
              label={<FormattedMessage id="eto.public-view.token-terms.currencies.label" />}
              value={
                eto.currencies ? eto.currencies.map(selectUnits).join(", ") : <ToBeAnnounced />
              }
              data-test-id="eto-public-view-currencies"
            />
            <Entry
              label={<FormattedMessage id="eto.public-view.token-terms.pre-eto-duration" />}
              value={
                eto.whitelistDurationDays ? (
                  <FormattedMessage
                    id="eto.public-view.token-terms.days"
                    values={{ days: eto.whitelistDurationDays }}
                  />
                ) : (
                  <ToBeAnnounced />
                )
              }
              data-test-id="eto-public-view-pre-eto-duration"
            />
            <Entry
              label={<FormattedMessage id="eto.public-view.token-terms.public-eto-duration" />}
              value={
                eto.publicDurationDays ? (
                  <FormattedMessage
                    id="eto.public-view.token-terms.days"
                    values={{ days: eto.publicDurationDays }}
                  />
                ) : (
                  <ToBeAnnounced />
                )
              }
              data-test-id="eto-public-view-public-eto-duration"
            />
            <Entry
              label={
                <FormattedMessage id="eto.public-view.token-terms.public-eto.product.jurisdiction" />
              }
              value={
                <>
                  {eto.product.jurisdiction === EJurisdiction.GERMANY && (
                    <FormattedMessage
                      id={`eto.public-view.token-terms.public-eto.product.jurisdiction.de`}
                    />
                  )}
                  {eto.product.jurisdiction === EJurisdiction.LIECHTENSTEIN && (
                    <FormattedMessage
                      id={`eto.public-view.token-terms.public-eto.product.jurisdiction.li`}
                    />
                  )}
                </>
              }
              data-test-id="eto-public-view-public-eto-duration"
            />
            {eto.templates && eto.templates.reservationAndAcquisitionAgreement && (
              <DocumentButton
                title={
                  <FormattedMessage id="eto.documents.reservation-and-acquisition-agreement" />
                }
                onClick={() => downloadDocument(eto.templates.reservationAndAcquisitionAgreement)}
              />
            )}
          </div>
        </div>

        <div className={styles.divider} />

        <div className={styles.group}>
          <div className={styles.groupTitle}>
            <FormattedMessage id="eto.public-view.token-terms.group-title.token-holder-rights" />
          </div>
          <div className={styles.groupContent}>
            <Entry
              label={<FormattedMessage id="eto.public-view.token-terms.nominee" />}
              value={eto.nominee ? eto.nomineeDisplayName : <ToBeAnnounced />}
              data-test-id="eto-public-view-nominee"
            />
            <Entry
              label={<FormattedMessage id="eto.public-view.token-terms.public-offer-duration" />}
              value={
                eto.signingDurationDays ? (
                  <FormattedMessage
                    id="eto.public-view.token-terms.days"
                    values={{ days: eto.signingDurationDays }}
                  />
                ) : (
                  <ToBeAnnounced />
                )
              }
              data-test-id="eto-public-view-public-offer-duration"
            />

            <Entry
              label={<FormattedMessage id="eto.public-view.token-transferability" />}
              value={
                eto.enableTransferOnSuccess === undefined ? (
                  <ToBeAnnounced />
                ) : eto.enableTransferOnSuccess === true ? (
                  <FormattedMessage id="eto.public-view.token-transferability.yes" />
                ) : (
                  <FormattedMessage id="eto.public-view.token-transferability.no" />
                )
              }
              data-test-id="eto-public-view-token-transferability"
            />

            <Entry
              label={<FormattedMessage id="eto.public-view.asset-type" />}
              value={
                eto.product.assetType === EAssetType.SECURITY ? (
                  <FormattedMessage id={`eto.public-view.asset-type.security`} />
                ) : (
                  <FormattedMessage id={`eto.public-view.asset-type.vma`} />
                )
              }
              data-test-id="eto-public-view-asset-type"
            />

            <Entry
              label={<FormattedMessage id="eto.public-view.token-terms.voting-rights" />}
              value={
                eto.generalVotingRule === undefined ? (
                  <ToBeAnnounced />
                ) : eto.generalVotingRule === "negative" ? (
                  <FormattedMessage id="eto.public-view.token-terms.no" />
                ) : (
                  <FormattedMessage id="eto.public-view.token-terms.yes" />
                )
              }
              data-test-id="eto-public-view-voting-rights"
            />

            <Entry
              label={<FormattedMessage id="eto.public-view.dividend-rights" />}
              value={
                eto.hasDividendRights ? (
                  <FormattedMessage id="form.select.yes" />
                ) : (
                  <ToBeAnnounced />
                )
              }
              data-test-id="eto-public-view-dividend-rights"
            />

            {eto.templates && eto.templates.companyTokenHolderAgreement && (
              <DocumentButton
                title={<FormattedMessage id="eto.documents.tokenholder-agreement" />}
                onClick={() => downloadDocument(eto.templates.companyTokenHolderAgreement)}
              />
            )}
          </div>
        </div>
      </div>
    </Panel>
  );
};

const EtoInvestmentTermsWidget = compose<TExternalProps & TDispatchProps, TExternalProps>(
  appConnect<{}, TDispatchProps, TExternalProps>({
    dispatchToProps: (dispatch, { eto }) => ({
      downloadDocument: (document: IEtoDocument) =>
        dispatch(actions.eto.downloadEtoDocument(document, eto)),
    }),
  }),
)(EtoInvestmentTermsWidgetLayout);

export { EtoInvestmentTermsWidget, EtoInvestmentTermsWidgetLayout, Entry };
