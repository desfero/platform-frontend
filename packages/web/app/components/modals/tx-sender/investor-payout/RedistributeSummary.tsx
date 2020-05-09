import { Button } from "@neufund/design-system";
import { EthereumAddressWithChecksum } from "@neufund/shared-utils";
import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";
import { Container } from "reactstrap";

import { ETxType } from "../../../../lib/web3/types";
import { actions } from "../../../../modules/actions";
import { selectTxAdditionalData } from "../../../../modules/tx/sender/selectors";
import { TRedistributePayoutAdditionalData } from "../../../../modules/tx/transactions/payout/redistribute/types";
import { selectEthereumAddress } from "../../../../modules/web3/selectors";
import { appConnect } from "../../../../store";
import { commitmentStatusLink } from "../../../appRouteUtils";
import { EHeadingSize, Heading } from "../../../shared/Heading";
import { ExternalLink } from "../../../shared/links";
import { RedistributeTransactionDetails } from "./RedistributeTransactionDetails";

interface IStateProps {
  additionalData: TRedistributePayoutAdditionalData;
  walletAddress: EthereumAddressWithChecksum;
}

interface IDispatchProps {
  onAccept: () => void;
}

type TComponentProps = IStateProps & IDispatchProps;

const InvestorRedistributePayoutSummaryLayout: React.FunctionComponent<TComponentProps> = ({
  walletAddress,
  additionalData,
  onAccept,
}) => (
  <Container>
    <Heading size={EHeadingSize.SMALL} level={4} className="mb-4">
      <FormattedMessage id="investor-payout.redistribute.summary.title" />
    </Heading>

    <p className="mb-3">
      <FormattedMessage id="investor-payout.redistribute.summary.description" />
    </p>

    <RedistributeTransactionDetails additionalData={additionalData} className="mb-4" />

    <section className="text-center">
      <ExternalLink className="d-inline-block mb-3" href={commitmentStatusLink(walletAddress)}>
        <FormattedMessage id="investor-payout.summary.neu-tokenholder-agreement" />
      </ExternalLink>
      <small className="d-inline-block mb-3 mx-4">
        <FormattedMessage id="investor-payout.summary.hint" />
      </small>
      <Button onClick={onAccept} data-test-id="investor-payout.redistribute-summary.accept">
        <FormattedMessage id="investor-payout.redistribute.summary.accept" />
      </Button>
    </section>
  </Container>
);

const InvestorRedistributePayoutSummary = appConnect<IStateProps, IDispatchProps, {}>({
  stateToProps: state => ({
    walletAddress: selectEthereumAddress(state),
    additionalData: selectTxAdditionalData<ETxType.INVESTOR_REDISTRIBUTE_PAYOUT>(state)!,
  }),
  dispatchToProps: d => ({
    onAccept: () => d(actions.txSender.txSenderAccept()),
  }),
})(InvestorRedistributePayoutSummaryLayout);

export { InvestorRedistributePayoutSummary, InvestorRedistributePayoutSummaryLayout };
