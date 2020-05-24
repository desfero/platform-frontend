import { withContainer } from "@neufund/shared-utils";
import * as React from "react";
import { compose } from "redux";

import { actions } from "../../../modules/actions";
import { selectBackupCodesVerified } from "../../../modules/auth/selectors";
import { IWalletPrivateData } from "../../../modules/web3/reducer";
import { selectWalletPrivateData } from "../../../modules/web3/selectors";
import { appConnect } from "../../../store";
import { Layout } from "../../layouts/Layout";
import { createErrorBoundary } from "../../shared/errorBoundary/ErrorBoundary.unsafe";
import { ErrorBoundaryLayout } from "../../shared/errorBoundary/ErrorBoundaryLayout";
import { LoadingIndicator } from "../../shared/loading-indicator";

const BackupSeedFlowContainer = React.lazy(() =>
  import("./BackupSeedFlowContainer.unsafe").then(imp => ({
    default: imp.BackupSeedFlowContainer,
  })),
);

interface IDispatchProps {
  verifyBackupPhrase: () => void;
  onCancel: () => void;
  clearSeed: () => void;
  getSeed: () => void;
}

interface IStateProps {
  walletPrivateData?: IWalletPrivateData;
  backupCodesVerified: boolean;
}

class BackupSeedComponent extends React.Component<IDispatchProps & IStateProps> {
  componentDidMount(): void {
    this.props.getSeed();
  }

  componentDidUpdate(prevProps: IStateProps): void {
    if (prevProps.walletPrivateData && !this.props.walletPrivateData) {
      // request seed phrase and private key again after password cache expire
      this.props.getSeed();
    }
  }

  componentWillUnmount(): void {
    this.props.clearSeed();
  }

  render(): React.ReactNode {
    if (this.props.walletPrivateData) {
      return (
        <BackupSeedFlowContainer
          backupCodesVerified={this.props.backupCodesVerified}
          verifyBackupPhrase={this.props.verifyBackupPhrase}
          onCancel={this.props.onCancel}
          walletPrivateData={this.props.walletPrivateData}
        />
      );
    }
    return <LoadingIndicator />;
  }
}

export const BackupSeed = compose<React.FunctionComponent>(
  createErrorBoundary(ErrorBoundaryLayout),
  appConnect<IStateProps, IDispatchProps>({
    stateToProps: s => ({
      walletPrivateData: selectWalletPrivateData(s.web3),
      backupCodesVerified: selectBackupCodesVerified(s),
    }),
    dispatchToProps: dispatch => ({
      verifyBackupPhrase: () => dispatch(actions.walletSelector.lightWalletBackedUp()),
      onCancel: () => dispatch(actions.routing.goToProfile()),
      getSeed: () => dispatch(actions.profile.loadSeedOrReturnToProfile()),
      clearSeed: () => dispatch(actions.web3.clearWalletPrivateDataFromState()),
    }),
  }),
  withContainer(Layout),
)(BackupSeedComponent);
