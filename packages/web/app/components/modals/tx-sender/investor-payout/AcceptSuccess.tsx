import { ButtonArrowRight } from "@neufund/design-system";
import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";

import { actions } from "../../../../modules/actions";
import { selectTxAdditionalData } from "../../../../modules/tx/sender/selectors";
import { TAcceptPayoutAdditionalData } from "../../../../modules/tx/transactions/payout/accept/types";
import { ETxType } from "../../../../modules/tx/types";
import { appConnect } from "../../../../store";
import { ConfettiEthereum } from "../../../shared/ethereum";
import { Message } from "../../message/Message";
import { AcceptTransactionDetails } from "./AcceptTransactionDetails";

interface IExternalProps {
  txTimestamp: number;
}

interface IStateProps {
  additionalData: TAcceptPayoutAdditionalData;
}

interface IDispatchProps {
  goToWallet: () => void;
}

type IProps = IExternalProps & IStateProps & IDispatchProps;

const InvestorAcceptPayoutSuccessLayout: React.FunctionComponent<IProps> = ({
  goToWallet,
  additionalData,
  txTimestamp,
}) => (
  <Message
    data-test-id="investor-payout.accept-success"
    image={<ConfettiEthereum className="mb-3" />}
    text={<FormattedMessage id="investor-payout.accept.success.text" />}
  >
    <AcceptTransactionDetails
      txTimestamp={txTimestamp}
      additionalData={additionalData}
      className="mb-4"
    />

    <ButtonArrowRight onClick={goToWallet}>
      <FormattedMessage id="menu.wallet.view" />
    </ButtonArrowRight>
  </Message>
);

const InvestorAcceptPayoutSuccess = appConnect<IStateProps, IDispatchProps>({
  stateToProps: state => ({
    additionalData: selectTxAdditionalData<ETxType.INVESTOR_ACCEPT_PAYOUT>(state)!,
  }),
  dispatchToProps: dispatch => ({
    goToWallet: () => dispatch(actions.routing.goToWallet()),
  }),
})(InvestorAcceptPayoutSuccessLayout);

export { InvestorAcceptPayoutSuccess, InvestorAcceptPayoutSuccessLayout };
