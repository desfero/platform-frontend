import { ButtonArrowRight, EButtonLayout } from "@neufund/design-system";
import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";

import { ETxType } from "../../../../lib/web3/types";
import { actions } from "../../../../modules/actions";
import { selectTxAdditionalData } from "../../../../modules/tx/sender/selectors";
import { TNEurRedeemAdditionalDetails } from "../../../../modules/tx/transactions/redeem/types";
import { appConnect } from "../../../../store";
import { Message } from "../../message/Message";
import { TxHashAndBlock } from "../shared/TxHashAndBlock";
import { BankTransferRedeemDetails } from "./BankTransferRedeemDetails";

import neurEurTransfer from "../../../../assets/img/bank-transfer/neur-eur.svg";
import * as styles from "./BankTransferRedeemSuccess.module.scss";

interface IExternalProps {
  txHash: string;
  txTimestamp: number;
}

interface IStateProps {
  additionalData: TNEurRedeemAdditionalDetails;
}

interface IDispatchProps {
  goToWallet: () => void;
}

type IComponentProps = IExternalProps & IStateProps & IDispatchProps;

const BankTransferRedeemSuccessComponent: React.FunctionComponent<IComponentProps> = ({
  txHash,
  txTimestamp,
  additionalData,
  goToWallet,
}) => (
  <Message
    image={<img className={styles.image} src={neurEurTransfer} alt="" />}
    title={<FormattedMessage id="bank-transfer.redeem.success.congratulations" />}
    titleClassName="text-success"
    text={<FormattedMessage id="bank-transfer.redeem.success.explanation" />}
  >
    <BankTransferRedeemDetails
      additionalData={additionalData}
      className="mb-4"
      txTimestamp={txTimestamp}
    />

    <TxHashAndBlock txHash={txHash} className="mb-4" />

    <ButtonArrowRight
      onClick={goToWallet}
      layout={EButtonLayout.LINK}
      data-test-id="bank-transfer.redeem.success.go-to-wallet"
    >
      <FormattedMessage id="bank-transfer.redeem.success.go-to-wallet" />
    </ButtonArrowRight>
  </Message>
);

const BankTransferRedeemSuccess = appConnect<IStateProps, IDispatchProps>({
  stateToProps: state => ({
    additionalData: selectTxAdditionalData<ETxType.NEUR_REDEEM>(state)!,
  }),
  dispatchToProps: dispatch => ({
    goToWallet: () => dispatch(actions.routing.goToWallet()),
  }),
})(BankTransferRedeemSuccessComponent);

export { BankTransferRedeemSuccess, BankTransferRedeemSuccessComponent };
