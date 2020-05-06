import { Button } from "@neufund/design-system";
import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";
import { Col, Container, Row } from "reactstrap";
import { compose } from "recompose";

import { ITxData } from "../../../../lib/web3/types";
import { actions } from "../../../../modules/actions";
import { selectTxAdditionalData, selectTxDetails } from "../../../../modules/tx/sender/selectors";
import { TUnlockAdditionalData } from "../../../../modules/tx/transactions/unlock/types";
import { ETxType } from "../../../../modules/tx/types";
import { appConnect } from "../../../../store";
import { EHeadingSize, Heading } from "../../../shared/Heading";
import { UnlockWalletTransactionDetails } from "./UnlockWalletTransactionDetails";

interface IStateProps {
  txData: Readonly<ITxData>;
  additionalData: TUnlockAdditionalData;
}
interface IDispatchProps {
  onAccept: () => void;
}

type TComponentProps = IStateProps & IDispatchProps;

export const UnlockFundsSummaryComponent: React.FunctionComponent<TComponentProps> = ({
  txData,
  additionalData,
  onAccept,
}) => (
  <Container>
    <Heading className="mb-4" size={EHeadingSize.SMALL} level={4}>
      <FormattedMessage id="unlock-funds-flow.summary" />
    </Heading>

    <UnlockWalletTransactionDetails
      txData={txData}
      additionalData={additionalData}
      className="mb-4"
    />

    <Row>
      <Col className="text-center">
        <Button
          onClick={onAccept}
          className="mt-4"
          data-test-id="modals.tx-sender.withdraw-flow.summery.unlock-funds-summary.accept"
        >
          <FormattedMessage id="general-flow.confirm" />
        </Button>
      </Col>
    </Row>
  </Container>
);

export const UnlockWalletSummary = compose<TComponentProps, any>(
  appConnect<IStateProps, IDispatchProps>({
    stateToProps: state => ({
      txData: selectTxDetails(state)!,
      additionalData: selectTxAdditionalData<ETxType.UNLOCK_FUNDS>(state)!,
    }),
    dispatchToProps: d => ({
      onAccept: () => d(actions.txSender.txSenderAccept()),
    }),
  }),
)(UnlockFundsSummaryComponent);
