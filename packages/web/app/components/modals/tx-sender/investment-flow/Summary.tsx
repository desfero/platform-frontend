import { Button, EButtonLayout } from "@neufund/design-system";
import { nonNullable } from "@neufund/shared-utils";
import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";
import { Container } from "reactstrap";
import { compose, setDisplayName } from "recompose";

import { EEtoDocumentType } from "../../../../lib/api/eto/EtoFileApi.interfaces";
import { actions } from "../../../../modules/actions";
import { selectIsRestrictedInvestor } from "../../../../modules/auth/selectors";
import { selectTxAdditionalData } from "../../../../modules/tx/sender/selectors";
import { TInvestmentAdditionalData } from "../../../../modules/tx/transactions/investment/types";
import { ETxType } from "../../../../modules/tx/types";
import { appConnect } from "../../../../store";
import { ErrorAlert } from "../../../shared/Alerts";
import { DocumentButton } from "../../../shared/DocumentLink";
import { EHeadingSize, Heading } from "../../../shared/Heading";
import { InvestmentTransactionDetails } from "./InvestmentTransactionDetails";

import * as styles from "./Summary.module.scss";

interface IStateProps {
  additionalData: TInvestmentAdditionalData;
  isRestrictedCountryInvestor: boolean;
}

type IDispatchProps = {
  onAccept: () => void;
  onChange: () => void;
  downloadAgreement: (etoId: string) => void;
};

type IProps = IStateProps & IDispatchProps;

const InvestmentSummaryComponent: React.FunctionComponent<IProps> = ({
  onAccept,
  onChange,
  downloadAgreement,
  additionalData,
  isRestrictedCountryInvestor,
}) => (
  <Container className={styles.container}>
    <Heading size={EHeadingSize.SMALL} level={4} className="mb-4">
      <FormattedMessage id="investment-flow.investment-summary" />
    </Heading>

    <InvestmentTransactionDetails additionalData={additionalData} className="mb-4" />

    <div className="text-center mb-4">
      <DocumentButton
        onClick={() => downloadAgreement(additionalData.eto.etoId)}
        title={<FormattedMessage id="investment-flow.summary.download-agreement" />}
      />
    </div>

    {isRestrictedCountryInvestor ? (
      <ErrorAlert>
        <FormattedMessage
          id="investment-flow.restricted-country-investor"
          values={{
            lineBreak: <br />,
          }}
        />
      </ErrorAlert>
    ) : (
      <div className="text-center">
        <Button
          layout={EButtonLayout.SECONDARY}
          type="button"
          onClick={onAccept}
          data-test-id="invest-modal-summary-confirm-button"
        >
          <FormattedMessage id="investment-flow.confirm" />
        </Button>
        <Button
          layout={EButtonLayout.LINK}
          type="button"
          onClick={onChange}
          data-test-id="invest-modal-summary-change-button"
        >
          <FormattedMessage id="investment-flow.change" />
        </Button>
      </div>
    )}
  </Container>
);

const InvestmentSummary = compose<IProps, {}>(
  setDisplayName("InvestmentSummary"),
  appConnect<IStateProps, IDispatchProps>({
    stateToProps: state => ({
      additionalData: nonNullable(selectTxAdditionalData<ETxType.INVEST>(state)),
      isRestrictedCountryInvestor: selectIsRestrictedInvestor(state),
    }),
    dispatchToProps: d => ({
      onAccept: () => d(actions.txSender.txSenderAccept()),
      onChange: () => d(actions.txSender.txSenderChange()),
      downloadAgreement: (etoId: string) =>
        d(
          actions.eto.downloadEtoTemplateByType(
            etoId,
            EEtoDocumentType.RESERVATION_AND_ACQUISITION_AGREEMENT,
          ),
        ),
    }),
  }),
)(InvestmentSummaryComponent);

export { InvestmentSummaryComponent, InvestmentSummary };
