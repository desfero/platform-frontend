import { withContainer } from "@neufund/shared-utils";
import * as React from "react";
import { FormattedMessage } from "react-intl";
import { compose, withProps } from "recompose";

import { actions } from "../../../../../modules/actions";
import { DEFAULT_DERIVATION_PATH_SUB_PREFIX_1 } from "../../../../../modules/wallet-selector/ledger-wizard/constants";
import {
  ILedgerAccount,
  selectHasPreviousPage,
  selectLedgerWizardError,
} from "../../../../../modules/wallet-selector/ledger-wizard/reducer";
import { appConnect } from "../../../../../store";
import { EContentWidth } from "../../../../layouts/Content";
import { FullscreenProgressLayout } from "../../../../layouts/FullscreenProgressLayout";
import { TContentExternalProps } from "../../../../layouts/Layout";
import {
  IWalletLedgerChooserDispatchProps,
  IWalletLedgerChooserStateProps,
  WalletLedgerChooserBase,
} from "./WalletLedgerChooserBase";

export const WalletLedgerChooser = compose<
  IWalletLedgerChooserStateProps & IWalletLedgerChooserDispatchProps,
  IWalletLedgerChooserStateProps & IWalletLedgerChooserDispatchProps
>(
  appConnect<IWalletLedgerChooserStateProps, IWalletLedgerChooserDispatchProps>({
    stateToProps: state => ({
      loading: state.ledgerWizardState.isLoading,
      accounts: state.ledgerWizardState.accounts,
      derivationPath: state.ledgerWizardState.derivationPathPrefix,
      hasPreviousPage: selectHasPreviousPage(state.ledgerWizardState),
      advanced: state.ledgerWizardState.advanced,
      ledgerError: selectLedgerWizardError(state),
    }),
    dispatchToProps: dispatch => ({
      closeAccountChooser: () => {
        dispatch(actions.walletSelector.ledgerCloseAccountChooser());
      },
      onSearch: (derivationPathPrefix: string) => {
        dispatch(
          actions.walletSelector.ledgerSetDerivationPathPrefix(
            DEFAULT_DERIVATION_PATH_SUB_PREFIX_1 + derivationPathPrefix,
          ),
        );
      },
      handleAddressChosen: (account: ILedgerAccount) => {
        dispatch(
          actions.walletSelector.ledgerFinishSettingUpLedgerConnector(account.derivationPath),
        );
      },
      showNextAddresses: () => dispatch(actions.walletSelector.ledgerGoToNextPageAndLoadData()),
      showPrevAddresses: () => dispatch(actions.walletSelector.ledgerGoToPreviousPageAndLoadData()),
      toggleAdvanced: () => {
        dispatch(actions.walletSelector.toggleLedgerAccountsAdvanced());
        dispatch(actions.walletSelector.ledgerLoadAccounts());
      },
    }),
  }),

  withContainer(
    withProps<TContentExternalProps, { closeAccountChooser: () => void }>(
      ({ closeAccountChooser }) => ({
        width: EContentWidth.FULL,
        buttonProps: {
          buttonText: <FormattedMessage id="account-recovery.step.cancel" />,
          buttonAction: closeAccountChooser,
        },
      }),
    )(FullscreenProgressLayout),
  ),
)(WalletLedgerChooserBase);
