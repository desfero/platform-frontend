import { Button, EButtonLayout } from "@neufund/design-system";
import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";

import { ETxType } from "../../../../lib/web3/types";
import { actions } from "../../../../modules/actions";
import { selectTxAdditionalData } from "../../../../modules/tx/sender/selectors";
import { TClaimAdditionalData } from "../../../../modules/tx/transactions/claim/types";
import { appConnect } from "../../../../store";
import { ConfettiEthereum } from "../../../shared/ethereum";
import { Message } from "../../message/Message";
import { ClaimTransactionDetails } from "./ClaimTransactionDetails";

interface IExternalProps {
  txTimestamp: number;
}

interface IDispatchProps {
  goToPortfolio: () => void;
}

interface IStateProps {
  additionalData: TClaimAdditionalData;
}

type IProps = IDispatchProps & IStateProps & IExternalProps;

export const UserClaimSuccessComponent: React.FunctionComponent<IProps> = ({
  txTimestamp,
  goToPortfolio,
  additionalData,
}) => (
  <Message
    data-test-id="modals.tx-sender.user-claim-flow.success"
    image={<ConfettiEthereum className="mb-3" />}
    title={<FormattedMessage id="withdraw-flow.success" />}
    titleClassName="text-success"
    text={
      <FormattedMessage
        id="user-claim-flow.success.congrats"
        values={{ token: additionalData.tokenName }}
      />
    }
  >
    <ClaimTransactionDetails
      additionalData={additionalData}
      className="mb-4"
      txTimestamp={txTimestamp}
    />

    <Button
      onClick={goToPortfolio}
      layout={EButtonLayout.LINK}
      data-test-id="modals.tx-sender.user-claim-flow.success.go-to-portfolio"
    >
      <FormattedMessage id="menu.portfolio.view" />s
    </Button>
  </Message>
);

export const UserClaimSuccess = appConnect<IStateProps, IDispatchProps>({
  stateToProps: state => ({
    additionalData: selectTxAdditionalData<ETxType.USER_CLAIM>(state)!,
  }),
  dispatchToProps: dispatch => ({
    goToPortfolio: () => dispatch(actions.routing.goToPortfolio()),
  }),
})(UserClaimSuccessComponent);
