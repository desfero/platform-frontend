import {Eur} from '@neufund/design-system';
import {
  EAbbreviatedNumberOutputFormat,
  XOR,
} from "@neufund/shared";
import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";
import { branch, compose, renderComponent } from "recompose";

import { TMockEto } from "../../../../data/etoCompanies";
import { NEXT_FUNDING_ROUNDS } from "../../../../lib/api/eto/EtoApiUtils";
import { TEtoWithCompanyAndContractReadonly } from "../../../../modules/eto/types";
import { isComingSoon } from "../../../../modules/eto/utils";
import { routingActions } from "../../../../modules/routing/actions";
import { appConnect } from "../../../../store";
import { CommonHtmlProps } from "../../../../types";
import { appRoutes } from "../../../appRoutes";
import { etoPublicViewLink } from "../../../appRouteUtils";
import {
  ComingSoonEtoState,
  ETOInvestorState,
  SuccessEtoState,
} from "../../../shared/eto-state/ETOState";
import { VALUES } from "../../../shared/forms/fields/form-select-fields/FormSelectCountryField";
import { EHeadingSize, Heading } from "../../../shared/Heading";
import { FUNDING_ROUNDS } from "../../shared/constants";
import { Cover } from "./Cover";
import { EtoCardButton, EtoCardPanelButton } from "./EtoCardPanel";
import { EtoCardStatusManager } from "./EtoCardStatusManager";
import { GreenInfo } from "./Info";

import * as styles from "./EtoOverviewThumbnail.module.scss";

type TMockEtoProps = {
  mockedEto: TMockEto;
};

type TEtoProps = {
  eto: TEtoWithCompanyAndContractReadonly;
};

type TCommonExternalProps = { shouldOpenInNewWindow?: boolean };

type TExternalProps = XOR<TEtoProps, TMockEtoProps> & TCommonExternalProps;

interface IDispatchProps {
  openEtoView: (url: string) => void;
}

const defaultEmpty = "-";

const getCompanyHeadquarters = (eto: TEtoWithCompanyAndContractReadonly) => {
  if (eto.company.city && eto.company.country) {
    return `${eto.company.city}, ${VALUES[eto.company.country]}`;
  }

  return undefined;
};

const getNextFundingRound = ({ company }: TEtoWithCompanyAndContractReadonly) => {
  if (company.companyStage) {
    const nextFundingRound = NEXT_FUNDING_ROUNDS[company.companyStage];

    return nextFundingRound ? FUNDING_ROUNDS[nextFundingRound] : undefined;
  }

  return undefined;
};

const MockEtoOverviewLayout: React.FunctionComponent<TMockEtoProps &
  CommonHtmlProps &
  IDispatchProps> = ({ mockedEto, openEtoView }) => (
  <EtoCardPanelButton
    data-test-id={`eto-overview-${mockedEto.id}`}
    onClick={() => openEtoView(mockedEto.url)}
  >
    <Cover
      className={styles.cover}
      companyBanner={{
        alt: mockedEto.brandName,
        srcSet: {
          "1x": mockedEto.companyPreviewCardBanner,
        },
      }}
      tags={mockedEto.categories}
      jurisdiction={undefined}
    />

    {mockedEto.totalAmount ? (
      <SuccessEtoState className={styles.statusOfEto} />
    ) : (
      <ComingSoonEtoState className={styles.statusOfEto} />
    )}

    <section className={styles.content}>
      <Heading titleClassName="text-truncate" decorator={false} level={2} size={EHeadingSize.HUGE}>
        {mockedEto.brandName}
      </Heading>

      <p data-test-id="eto-overview-status-founders-quote" className={styles.quote}>
        {mockedEto.keyQuoteFounder}
      </p>

      {!!mockedEto.totalAmount && (
        <GreenInfo
          upperText={
            <FormattedMessage id="eto-overview-thumbnail.success.successful-fundraising" />
          }
          lowerText={
            <FormattedMessage
              id="eto-overview-thumbnail.success.raised-amount"
              values={{
                totalAmount: (
                  <Eur
                    value={mockedEto.totalAmount}
                    outputFormat={EAbbreviatedNumberOutputFormat.SHORT}
                  />
                ),
              }}
            />
          }
        />
      )}
    </section>
  </EtoCardPanelButton>
);

const EtoOverviewLayoutBase: React.FunctionComponent<TEtoProps> = ({ eto }) => (
  <>
    <Cover
      className={styles.cover}
      companyBanner={{
        alt: eto.company.brandName,
        srcSet: {
          "1x": eto.company.companyPreviewCardBanner,
        },
      }}
      tags={eto.company.categories}
      jurisdiction={eto.product.jurisdiction}
    />

    <ETOInvestorState className={styles.statusOfEto} eto={eto} />

    <section className={styles.content}>
      <Heading titleClassName="text-truncate" decorator={false} level={2} size={EHeadingSize.HUGE}>
        {eto.company.brandName}
      </Heading>

      {isComingSoon(eto.state) ? (
        <p data-test-id="eto-overview-status-founders-quote" className={styles.quote}>
          {eto.company.keyQuoteFounder}
        </p>
      ) : (
        <>
          <div className={styles.groupWrapper}>
            <div className={styles.group}>
              <span className={styles.label}>
                <FormattedMessage id="eto-overview-thumbnail.token-name" />
              </span>
              <span className={styles.value}>
                {eto.equityTokenName} ({eto.equityTokenSymbol})
              </span>
            </div>

            <div className={styles.group}>
              <span className={styles.label}>
                <FormattedMessage id="eto-overview-thumbnail.funding-round" />
              </span>
              <span className={styles.value}>{getNextFundingRound(eto) || defaultEmpty}</span>
            </div>

            <div className={styles.group}>
              <span className={styles.label}>
                <FormattedMessage id="eto-overview-thumbnail.headquarters" />
              </span>
              <span className={styles.value}>{getCompanyHeadquarters(eto) || defaultEmpty}</span>
            </div>
          </div>

          <EtoCardStatusManager eto={eto} />
        </>
      )}
    </section>
  </>
);

const EtoOverviewGridLayout: React.FunctionComponent<TEtoProps &
  CommonHtmlProps &
  IDispatchProps> = ({ eto, openEtoView }) => (
  <EtoCardPanelButton
    data-test-id={`eto-overview-${eto.etoId}`}
    onClick={() => openEtoView(etoPublicViewLink(eto.previewCode, eto.product.jurisdiction))}
  >
    <EtoOverviewLayoutBase eto={eto} />
  </EtoCardPanelButton>
);

const EtoOverviewComponent: React.FunctionComponent<TEtoProps &
  CommonHtmlProps &
  IDispatchProps> = ({ eto, openEtoView }) => (
  <EtoCardButton
    data-test-id={`eto-overview-${eto.etoId}`}
    onClick={() => openEtoView(appRoutes.etoIssuerView)}
  >
    <EtoOverviewLayoutBase eto={eto} />
  </EtoCardButton>
);

const connectEtoOverviewThumbnail = <T extends {}>(
  WrappedComponent: React.ComponentType<TEtoProps & CommonHtmlProps & IDispatchProps & T>,
) =>
  compose<
    TEtoProps & CommonHtmlProps & IDispatchProps & T,
    TExternalProps & TCommonExternalProps & CommonHtmlProps
  >(
    appConnect<{}, IDispatchProps, TCommonExternalProps>({
      dispatchToProps: (dispatch, { shouldOpenInNewWindow }) => ({
        openEtoView: (url: string) =>
          dispatch(
            shouldOpenInNewWindow ? routingActions.openInNewWindow(url) : routingActions.push(url),
          ),
      }),
    }),
    branch<TExternalProps>(props => !!props.mockedEto, renderComponent(MockEtoOverviewLayout)),
  )(WrappedComponent);

const EtoOverviewThumbnail = connectEtoOverviewThumbnail(EtoOverviewGridLayout);
const NomineeEtoOverviewThumbnail = connectEtoOverviewThumbnail(EtoOverviewComponent);

export { EtoOverviewGridLayout, EtoOverviewThumbnail, NomineeEtoOverviewThumbnail };
