import * as React from "react";
import { Container } from "reactstrap";

import { actions } from "../../modules/actions";
import { appConnect } from "../../store";
import { LoadingIndicator } from "../shared/loading-indicator";

interface IEmailVerifyDispatchProps {
  verifyEmail: () => void;
}

export class EmailVerifyComponent extends React.Component<IEmailVerifyDispatchProps> {
  componentDidMount(): void {
    this.props.verifyEmail();
  }

  render(): React.ReactNode {
    return (
      <Container>
        <LoadingIndicator />
      </Container>
    );
  }
}

export const EmailVerify = appConnect<IEmailVerifyDispatchProps>({
  dispatchToProps: dispatch => ({
    verifyEmail: () => dispatch(actions.auth.verifyEmailLink()),
  }),
})(EmailVerifyComponent);
