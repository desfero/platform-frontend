import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";
import { Modal } from "reactstrap";

import { actions } from "../../../modules/actions";
import { appConnect } from "../../../store";

import { ModalComponentBody } from "../ModalComponentBody";

import { Button, EButtonLayout } from "../../shared/buttons";

interface IStateProps {
  isOpen: boolean;
}

interface IDispatchProps {
  onAccept: () => void;
  onDownloadTos: () => void;
}

interface IState {
  tosDownloaded: boolean;
}

export class AcceptTosModalInner extends React.Component<IStateProps & IDispatchProps, IState> {
  state = {
    tosDownloaded: false,
  };

  onDownloadTos = () => {
    this.setState({
      tosDownloaded: true,
    });
    this.props.onDownloadTos();
  };

  render(): React.ReactNode {
    return (
      <div className="text-center">
        <h1>
          <FormattedMessage id="settings.modal.accept-tos.title" />
        </h1>
        <p className="mt-4 mb-2">
          <FormattedMessage id="settings.modal.accept-tos.text" />
        </p>
        <div className="mt-2 mb-2">
          <Button
            onClick={this.onDownloadTos}
            layout={EButtonLayout.SECONDARY}
            data-test-id="modals.accept-tos.download-button"
          >
            <FormattedMessage id="settings.modal.accept-tos.download-button" />
          </Button>
        </div>
        <div className="mt-4 mb-2">
          <Button
            onClick={this.props.onAccept}
            layout={EButtonLayout.PRIMARY}
            disabled={!this.state.tosDownloaded}
            data-test-id="modals.accept-tos.accept-button"
          >
            <FormattedMessage id="settings.modal.accept-tos.accept-button" />
          </Button>
        </div>
      </div>
    );
  }
}

const AcceptTosModalComponent: React.SFC<IStateProps & IDispatchProps> = props => (
  <Modal isOpen={props.isOpen} centered>
    <ModalComponentBody>
      <AcceptTosModalInner {...props} />
    </ModalComponentBody>
  </Modal>
);

export const AcceptTosModal = appConnect<IStateProps, IDispatchProps>({
  stateToProps: s => ({
    isOpen: !!(s.auth.user && s.auth.user.latestAcceptedTosIpfs !== s.auth.currentAgreementHash),
    hasEverAccepted: !!(s.auth.user && s.auth.user.latestAcceptedTosIpfs),
  }),
  dispatchToProps: dispatch => ({
    onDownloadTos: () => dispatch(actions.auth.downloadCurrentAgreement()),
    onAccept: () => dispatch(actions.auth.acceptCurrentAgreement()),
  }),
})(AcceptTosModalComponent);
