import { Button } from "@neufund/design-system";
import { EthereumAddressWithChecksum, selectUnits } from "@neufund/shared";
import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";
import { Container } from "reactstrap";

import { actions } from "../../../../modules/actions";
import { selectTxAdditionalData } from "../../../../modules/tx/sender/selectors";
import { TAcceptPayoutAdditionalData } from "../../../../modules/tx/transactions/payout/accept/types";
import { ETxSenderType } from "../../../../modules/tx/types";
import { selectEthereumAddressWithChecksum } from "../../../../modules/web3/selectors";
import { appConnect } from "../../../../store";
import { commitmentStatusLink } from "../../../appRouteUtils";
import { EHeadingSize, Heading } from "../../../shared/Heading";
import { ExternalLink } from "../../../shared/links";
import { AcceptTransactionDetails } from "./AcceptTransactionDetails";

interface IStateProps {
  additionalData: TAcceptPayoutAdditionalData;
  walletAddress: EthereumAddressWithChecksum;
}

interface IDispatchProps {
  onAccept: () => void;
}

type TComponentProps = IStateProps & IDispatchProps;

const InvestorAcceptPayoutSummaryLayout: React.FunctionComponent<TComponentProps> = ({
  walletAddress,
  additionalData,
  onAccept,
}) => (
  <Container>
    <Heading size={EHeadingSize.SMALL} level={4} className="mb-4">
      <FormattedMessage id="investor-payout.accept.summary.title" />
    </Heading>

    <p className="mb-3">
      {additionalData.tokensDisbursals.length === 1 ? (
        <FormattedMessage
          id="investor-payout.accept.summary.single.description"
          values={{ token: selectUnits(additionalData.tokensDisbursals[0].token) }}
        />
      ) : (
        <FormattedMessage id="investor-payout.accept.summary.combined.description" />
      )}
    </p>

    <AcceptTransactionDetails additionalData={additionalData} className="mb-4" />

    <section className="text-center">
      <ExternalLink className="d-inline-block mb-3" href={commitmentStatusLink(walletAddress)}>
        <FormattedMessage id="investor-payout.summary.neu-tokenholder-agreement" />
      </ExternalLink>
      <small className="d-inline-block mb-3 mx-4">
        <FormattedMessage id="investor-payout.summary.hint" />
      </small>
      <Button onClick={onAccept} data-test-id="investor-payout.accept-summary.accept">
        <FormattedMessage id="investor-payout.accept.summary.accept" />
      </Button>
    </section>
  </Container>
);

const InvestorAcceptPayoutSummary = appConnect<IStateProps, IDispatchProps, {}>({
  stateToProps: state => ({
    walletAddress: selectEthereumAddressWithChecksum(state),
    additionalData: selectTxAdditionalData<ETxSenderType.INVESTOR_ACCEPT_PAYOUT>(state)!,
  }),
  dispatchToProps: d => ({
    onAccept: () => d(actions.txSender.txSenderAccept()),
  }),
})(InvestorAcceptPayoutSummaryLayout);

export { InvestorAcceptPayoutSummary, InvestorAcceptPayoutSummaryLayout };
