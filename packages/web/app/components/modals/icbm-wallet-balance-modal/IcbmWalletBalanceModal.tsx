import { walletApi } from "@neufund/shared-modules";
import * as React from "react";
import { compose } from "recompose";

import { actions } from "../../../modules/actions";
import { selectIsUserVerified } from "../../../modules/auth/selectors";
import {
  IWalletMigrationData,
  TWalletMigrationSteps,
} from "../../../modules/icbm-wallet-balance-modal/reducer";
import {
  selectEtherBalanceIcbmModal,
  selectEtherNeumarksDueIcbmModal,
  selectIcbmModalIsFirstTransactionDone,
  selectIcbmModalIsMigrating,
  selectIcbmModalIsSecondTransactionDone,
  selectIcbmWalletEthAddress,
  selectWalletMigrationCurrentStep,
  selectWalletMigrationData,
} from "../../../modules/icbm-wallet-balance-modal/selectors";
import { ETokenType } from "../../../modules/tx/types";
import { appConnect } from "../../../store";
import { LoadingIndicator } from "../../shared/loading-indicator";
import { Modal } from "../Modal";
import { BalanceModal } from "./BalanceModal";
import { MigrateModal } from "./MigrateModal";

import * as styles from "./IcbmWalletBalanceModal.module.scss";

interface IStateProps {
  isOpen: boolean;
  etherBalance: string;
  ethAddress?: string;
  neumarksDue: string;
  isLoading: boolean;
  walletMigrationData?: ReadonlyArray<IWalletMigrationData>;
  isUserVerified: boolean;
  lockedWalletConnected: boolean;
  currentMigrationStep: TWalletMigrationSteps;
  isEtherMigrationTargetSet: boolean;
  isWalletMigrating: boolean;
  isFirstTxDone: boolean;
  isSecondTxDone: boolean;
}

interface IDispatchProps {
  onCancel: () => void;
  onGotoWallet: () => void;
  startWalletMigration: () => void;
  goToNextStep: () => void;
  downloadICBMAgreement: () => void;
}
type IProps = IStateProps &
  IDispatchProps & {
    // For testing purpose and visual regression
    isMigrating?: boolean;
    success?: boolean;
  };

export const IcbmWalletBalanceComponentInner: React.FunctionComponent<IProps> = ({
  onGotoWallet,
  isUserVerified,
  walletMigrationData,
  ethAddress,
  neumarksDue,
  isEtherMigrationTargetSet,
  etherBalance,
  isLoading,
  startWalletMigration,
  isWalletMigrating,
  isFirstTxDone,
  isSecondTxDone,
  currentMigrationStep,
  goToNextStep,
  downloadICBMAgreement,
}) => (
  <div className={styles.content}>
    {!walletMigrationData || !ethAddress || isLoading ? (
      <LoadingIndicator />
    ) : isWalletMigrating ? (
      <MigrateModal
        walletMigrationData={walletMigrationData[currentMigrationStep - 1]}
        migrationStep={currentMigrationStep}
        onGotoWallet={onGotoWallet}
        goToNextStep={goToNextStep}
        success={
          (currentMigrationStep === 1 && isFirstTxDone) ||
          (currentMigrationStep === 2 && isSecondTxDone)
        }
        // TODO: Make better
      />
    ) : (
      <BalanceModal
        startMigration={startWalletMigration}
        isUserVerified={isUserVerified && isEtherMigrationTargetSet}
        ethAddress={ethAddress}
        neumarksDue={neumarksDue}
        etherBalance={etherBalance}
        downloadICBMAgreement={downloadICBMAgreement}
      />
    )}
  </div>
);

const IcbmWalletBalanceComponent: React.FunctionComponent<IProps> = (props: IProps) => (
  <Modal isOpen={props.isOpen} onClose={props.onCancel}>
    <IcbmWalletBalanceComponentInner {...props} />
  </Modal>
);

const IcbmWalletBalanceModal = compose<IStateProps & IDispatchProps, {}>(
  appConnect<IStateProps, IDispatchProps>({
    stateToProps: state => ({
      isOpen: state.icbmWalletBalanceModal.isOpen,
      isLoading: state.icbmWalletBalanceModal.loading,
      ethAddress: selectIcbmWalletEthAddress(state),
      neumarksDue: selectEtherNeumarksDueIcbmModal(state),
      etherBalance: selectEtherBalanceIcbmModal(state),
      isUserVerified: selectIsUserVerified(state),
      walletMigrationData: selectWalletMigrationData(state.icbmWalletBalanceModal),
      lockedWalletConnected: walletApi.selectors.selectLockedWalletConnected(state),
      currentMigrationStep: selectWalletMigrationCurrentStep(state),
      isEtherMigrationTargetSet: walletApi.selectors.selectIsEtherUpgradeTargetSet(state),
      isWalletMigrating: selectIcbmModalIsMigrating(state),
      isFirstTxDone: selectIcbmModalIsFirstTransactionDone(state),
      isSecondTxDone: selectIcbmModalIsSecondTransactionDone(state),
    }),
    dispatchToProps: dispatch => ({
      onCancel: () => dispatch(actions.icbmWalletBalanceModal.hideIcbmWalletBalanceModal()),
      onGotoWallet: () => {
        dispatch(actions.icbmWalletBalanceModal.hideIcbmWalletBalanceModal());
        dispatch(actions.routing.goToWallet());
      },
      startWalletMigration: () => dispatch(actions.icbmWalletBalanceModal.startMigrationFlow()),
      goToNextStep: () => dispatch(actions.icbmWalletBalanceModal.setMigrationStepToNextStep()),
      downloadICBMAgreement: () =>
        dispatch(actions.icbmWalletBalanceModal.downloadICBMWalletAgreement(ETokenType.ETHER)),
    }),
  }),
)(IcbmWalletBalanceComponent);

export { IcbmWalletBalanceComponent, IcbmWalletBalanceModal };
