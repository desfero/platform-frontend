import { ButtonArrowRight } from "@neufund/design-system";
import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";

import { actions } from "../../../../modules/actions";
import { selectTxAdditionalData } from "../../../../modules/tx/sender/selectors";
import { TInvestmentAdditionalData } from "../../../../modules/tx/transactions/investment/types";
import { ETxSenderType } from "../../../../modules/tx/types";
import { appConnect } from "../../../../store";
import { appRoutes } from "../../../appRoutes";
import { ConfettiEthereum } from "../../../shared/ethereum";
import { Message } from "../../message/Message";
import { InvestmentTransactionDetails } from "./InvestmentTransactionDetails";

interface IProps {
  txHash: string;
  txTimestamp: number;
}

interface IStateProps {
  additionalData: TInvestmentAdditionalData;
}

interface IDispatchProps {
  goToPortfolio: () => void;
}

const InvestmentSuccessComponent: React.FunctionComponent<IProps &
  IStateProps &
  IDispatchProps> = ({ additionalData, goToPortfolio, txTimestamp }) => (
  <Message
    data-test-id="investment-flow.success.title"
    image={<ConfettiEthereum className="mb-3" />}
    title={<FormattedMessage id="investment-flow.success.title" />}
    titleClassName="text-success"
    text={<FormattedMessage id="investment-flow.success.congratulation-text" />}
  >
    <InvestmentTransactionDetails
      additionalData={additionalData}
      className="mb-4"
      txTimestamp={txTimestamp}
    />

    <ButtonArrowRight
      data-test-id="investment-flow.success.view-your-portfolio"
      onClick={goToPortfolio}
    >
      <FormattedMessage id="investment-flow.success.view-portfolio" />
    </ButtonArrowRight>
  </Message>
);

const InvestmentSuccess = appConnect<IStateProps, IDispatchProps>({
  stateToProps: state => ({
    additionalData: selectTxAdditionalData<ETxSenderType.INVEST>(state)!,
  }),
  dispatchToProps: dispatch => ({
    goToPortfolio: () => {
      dispatch(actions.routing.push(appRoutes.portfolio));
      dispatch(actions.txSender.txSenderHideModal());
    },
  }),
})(InvestmentSuccessComponent);

export { InvestmentSuccess, InvestmentSuccessComponent };
