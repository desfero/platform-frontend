import { ButtonArrowRight } from "@neufund/design-system";
import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";
import { Container } from "reactstrap";
import { compose } from "recompose";

import { ETxType } from "../../../../lib/web3/types";
import { actions } from "../../../../modules/actions";
import { selectTxAdditionalData } from "../../../../modules/tx/sender/selectors";
import { TNEurRedeemAdditionalDetails } from "../../../../modules/tx/transactions/redeem/types";
import { appConnect } from "../../../../store";
import { EHeadingSize, Heading } from "../../../shared/Heading";
import { BankTransferRedeemDetails } from "./BankTransferRedeemDetails";

import * as styles from "../investment-flow/Summary.module.scss";

interface IStateProps {
  additionalData: TNEurRedeemAdditionalDetails;
}

interface IDispatchProps {
  confirm: () => void;
}

type IComponentProps = IDispatchProps & IStateProps;

const BankTransferRedeemSummaryLayout: React.FunctionComponent<IComponentProps> = ({
  confirm,
  additionalData,
}) => (
  <Container className={styles.container}>
    <Heading size={EHeadingSize.SMALL} level={4} className="mb-4">
      <FormattedMessage id="bank-transfer.redeem.summary.title" />
    </Heading>

    <BankTransferRedeemDetails additionalData={additionalData} className="mb-4" />

    <p className="text-warning mx-4 text-center">
      <FormattedMessage id="bank-transfer.redeem.summary.note" />
    </p>

    <section className="text-center">
      <ButtonArrowRight onClick={confirm} data-test-id="bank-transfer.redeem-summary.continue">
        <FormattedMessage id="bank-transfer.redeem.summary.continue" />
      </ButtonArrowRight>
    </section>
  </Container>
);

const BankTransferRedeemSummary = compose<IComponentProps, {}>(
  appConnect<IStateProps, IDispatchProps>({
    stateToProps: state => ({
      additionalData: selectTxAdditionalData<ETxType.NEUR_REDEEM>(state)!,
    }),
    dispatchToProps: dispatch => ({
      confirm: () => dispatch(actions.txSender.txSenderAccept()),
    }),
  }),
)(BankTransferRedeemSummaryLayout);

export { BankTransferRedeemSummaryLayout, BankTransferRedeemSummary };
