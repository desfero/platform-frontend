import { ButtonArrowRight } from "@neufund/design-system";
import { ECurrency, ENumberInputFormat, ENumberOutputFormat } from "@neufund/shared";
import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";
import { branch, compose, renderComponent, StateHandler, withStateHandlers } from "recompose";

import { selectBankTransferMinAmount } from "../../../../modules/bank-transfer-flow/selectors";
import { appConnect } from "../../../../store";
import { Money } from "../../../shared/formatters/Money";
import { Message } from "../../message/Message";
import { BankTransferAgreement } from "../shared/BankTransferAgreement";

import bankVaultIcon from "../../../../assets/img/bank-transfer/bank-vault.svg";

export enum EBankTransferInitState {
  INFO,
  AGREEMENT,
}

interface IStateProps {
  minEuroUlps: string;
}

interface ILocalState {
  state: EBankTransferInitState;
}

type ILocalStateUpdater = {
  goToAgreement: StateHandler<ILocalState>;
};

type IProps = IStateProps & { goToAgreement: () => void };

const BankTransferVerifyInfoLayout: React.FunctionComponent<IProps> = ({
  goToAgreement,
  minEuroUlps,
}) => (
  <Message
    data-test-id="bank-verification.info"
    image={<img src={bankVaultIcon} alt="" className="mb-3" />}
    title={<FormattedMessage id="bank-verification.info.title" />}
    text={
      <FormattedMessage
        id="bank-verification.info.text"
        values={{
          min: (
            <Money
              value={minEuroUlps}
              inputFormat={ENumberInputFormat.ULPS}
              valueType={ECurrency.EUR}
              outputFormat={ENumberOutputFormat.FULL}
            />
          ),
        }}
      />
    }
  >
    <ButtonArrowRight data-test-id="bank-verification.link-now" onClick={goToAgreement}>
      <FormattedMessage id="bank-verification.info.link-now" />
    </ButtonArrowRight>
  </Message>
);

const BankTransferVerifyAgreement = compose<IProps, {}>(
  appConnect<IStateProps>({
    stateToProps: state => ({
      minEuroUlps: selectBankTransferMinAmount(state),
    }),
  }),
  withStateHandlers<ILocalState, ILocalStateUpdater>(
    {
      state: EBankTransferInitState.INFO,
    },
    {
      goToAgreement: () => () => ({
        state: EBankTransferInitState.AGREEMENT,
      }),
    },
  ),
  branch<ILocalState>(
    props => props.state === EBankTransferInitState.AGREEMENT,
    renderComponent(BankTransferAgreement),
  ),
)(BankTransferVerifyInfoLayout);

export { BankTransferVerifyAgreement, BankTransferVerifyInfoLayout };
