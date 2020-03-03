import { Button, EButtonLayout } from "@neufund/design-system";
import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";
import { compose, withProps } from "recompose";

import { actions } from "../../modules/actions";
import { ENomineeEtoSpecificTask, ENomineeTask } from "../../modules/nominee-flow/types";
import { appConnect } from "../../store";

interface IExternalProps {
  task: ENomineeTask | ENomineeEtoSpecificTask;
}

interface IDispatchProps {
  sign: () => void;
}

type IComponentProps = IDispatchProps & IExternalProps;

const isRAAA = (task: ENomineeTask | ENomineeEtoSpecificTask): boolean =>
  task === ENomineeEtoSpecificTask.ACCEPT_RAAA;

export const AcceptAgreementLayout: React.FunctionComponent<IComponentProps> = ({ sign, task }) => (
  <section data-test-id={isRAAA(task) ? "nominee-flow-sign-raaa" : "nominee-flow-sign-tha"}>
    <h4>
      {isRAAA(task) ? (
        <FormattedMessage id="nominee-flow.sign-raaa.title" />
      ) : (
        <FormattedMessage id="nominee-flow.sign-tha.title" />
      )}
    </h4>
    <p>
      {isRAAA(task) ? (
        <FormattedMessage id="nominee-flow.sign-raaa.text" />
      ) : (
        <FormattedMessage id="nominee-flow.sign-tha.text" />
      )}
    </p>
    <Button
      layout={EButtonLayout.PRIMARY}
      data-test-id="eto-nominee-sign-agreement-action"
      onClick={sign}
    >
      <FormattedMessage id="nominee-flow.sign-agreement.sign-button" />
    </Button>
  </section>
);

const acceptAgreement = compose<IComponentProps, {}>(
  appConnect<{}, IDispatchProps, IExternalProps>({
    dispatchToProps: (dispatch, ownProps: IExternalProps) => {
      const signAction = isRAAA(ownProps.task)
        ? actions.txTransactions.startNomineeRAAASign()
        : actions.txTransactions.startNomineeTHASign();

      return {
        sign: () => dispatch(signAction),
      };
    },
  }),
);

const AcceptTHA = compose<IComponentProps, {}>(
  withProps({ task: ENomineeEtoSpecificTask.ACCEPT_THA }),
  acceptAgreement,
)(AcceptAgreementLayout);

const AcceptRAAA = compose<IComponentProps, {}>(
  withProps({ task: ENomineeEtoSpecificTask.ACCEPT_RAAA }),
  acceptAgreement,
)(AcceptAgreementLayout);

export { AcceptRAAA, AcceptTHA };
