import { Button, EButtonLayout } from "@neufund/design-system";
import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";
import { compose } from "recompose";

import { actions } from "../../../../../modules/actions";
import { selectTxType } from "../../../../../modules/tx/sender/selectors";
import { ETxType } from "../../../../../modules/tx/types";
import { appConnect } from "../../../../../store";
import { EHeadingSize, Heading } from "../../../../shared/Heading";
import { isRAASign } from "./utils";

interface IStateProps {
  txType?: ETxType;
}

interface IDispatchProps {
  onClose: () => void;
}

type TComponentProps = IStateProps & IDispatchProps;

const SignNomineeAgreementSuccessLayout: React.FunctionComponent<TComponentProps> = ({
  onClose,
  txType,
}) => (
  <section
    className="text-center"
    data-test-id={
      isRAASign(txType) ? "nominee-sign-raaa-modal-success" : "nominee-sign-tha-modal-success"
    }
  >
    <Heading decorator={false} level={2} size={EHeadingSize.HUGE}>
      <FormattedMessage id="nominee.sign-agreement.success.title" />
    </Heading>
    <p className="my-4">
      {isRAASign(txType) ? (
        <FormattedMessage id="nominee.sign-raaa.success.text" />
      ) : (
        <FormattedMessage id="nominee.sign-tha.success.text" />
      )}
    </p>

    <Button
      layout={EButtonLayout.PRIMARY}
      data-test-id="nominee-sign-agreement-success-close"
      onClick={onClose}
    >
      <FormattedMessage id="nominee.sign-agreement.success.close" />
    </Button>
  </section>
);

const SignNomineeAgreementSuccess = compose<TComponentProps, {}>(
  appConnect<IStateProps, IDispatchProps>({
    stateToProps: state => ({
      txType: selectTxType(state),
    }),
    dispatchToProps: dispatch => ({
      onClose: () => dispatch(actions.txSender.txSenderHideModal()),
    }),
  }),
)(SignNomineeAgreementSuccessLayout);

export { SignNomineeAgreementSuccessLayout, SignNomineeAgreementSuccess };
