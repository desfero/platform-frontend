import { Button, Image, ISrcSet } from "@neufund/design-system";
import { EWalletSubType, EWalletType } from "@neufund/shared-modules";
import * as cn from "classnames";
import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";

import { selectIsAccessWalletModalOpen } from "../../../modules/access-wallet/selectors";
import { actions } from "../../../modules/actions";
import { selectWalletSubType, selectWalletType } from "../../../modules/web3/selectors";
import { appConnect } from "../../../store";
import { TTranslatedString } from "../../../types";
import { WarningAlert } from "../../shared/WarningAlert";
import { getMessageTranslation } from "../../translatedMessages/messages";
import { Modal } from "../Modal";
import { AccessLightWalletPrompt } from "./AccessLightWalletPrompt";

import ledgerConfirm from "../../../assets/img/wallet_selector/ledger_confirm.svg";
import lockIcon from "../../../assets/img/wallet_selector/lock_icon.svg";
import logoGnosis1x from "../../../assets/img/wallet_selector/logo_gnosis.png";
import logoGnosis2x from "../../../assets/img/wallet_selector/logo_gnosis@2x.png";
import logoGnosis3x from "../../../assets/img/wallet_selector/logo_gnosis@3x.png";
import logoMetamask1x from "../../../assets/img/wallet_selector/logo_metamask.png";
import logoMetamask2x from "../../../assets/img/wallet_selector/logo_metamask@2x.png";
import logoMetamask3x from "../../../assets/img/wallet_selector/logo_metamask@3x.png";
import * as styles from "./AccessWalletModal.module.scss";

interface IStateProps {
  errorMessage?: TTranslatedString;
  title?: TTranslatedString;
  message?: TTranslatedString;
  walletType: EWalletType | undefined;
  walletSubType: EWalletSubType | undefined;
  inputLabel?: TTranslatedString;
}

interface IDispatchProps {
  onAccept: (password?: string) => void;
  tryToAccessWalletAgain: () => void;
}

interface IExternalProps {
  title?: TTranslatedString;
  message?: TTranslatedString;
}

const logoGnosisSrcSet: ISrcSet = {
  "1x": logoGnosis1x,
  "2x": logoGnosis2x,
  "3x": logoGnosis3x,
};

const logoMetamaskSrcSet: ISrcSet = {
  "1x": logoMetamask1x,
  "2x": logoMetamask2x,
  "3x": logoMetamask3x,
};

export const AccessWalletContainerComponent: React.FunctionComponent<IStateProps &
  IDispatchProps> = ({
  title,
  message,
  errorMessage,
  onAccept,
  tryToAccessWalletAgain,
  walletType,
  walletSubType,
  inputLabel,
}) => (
  <div className="text-center">
    {title && <h1 className={styles.title}>{title}</h1>}
    {message && <p>{message}</p>}
    {walletType === EWalletType.LIGHT && (
      <div>
        <img src={lockIcon} className="mt-3 mb-3" alt="" />
        <AccessLightWalletPrompt onAccept={onAccept} inputLabel={inputLabel} />
      </div>
    )}
    {walletType === EWalletType.LEDGER && (
      <div>
        <img src={ledgerConfirm} className="mt-1 mb-3" alt="" />
        <div className={cn("mt-2", styles.info)}>
          <FormattedMessage id="modal.access-wallet.ledger-info" />
        </div>
      </div>
    )}
    {walletType === EWalletType.BROWSER && (
      <div>
        <Image
          srcSet={walletSubType === EWalletSubType.GNOSIS ? logoGnosisSrcSet : logoMetamaskSrcSet}
          alt={walletSubType || ""}
          title={walletSubType}
          className="mt-3 mb-3"
        />
        <div className={cn("mt-2", styles.info)}>
          {walletSubType === EWalletSubType.GNOSIS ? (
            <FormattedMessage id="modal.access-wallet.gnosis-info" />
          ) : (
            <FormattedMessage id="modal.access-wallet.metamask-info" />
          )}
        </div>
      </div>
    )}
    {errorMessage && (
      <>
        <WarningAlert className="my-4" data-test-id="access-wallet.error-msg">
          {errorMessage}
        </WarningAlert>

        {walletType !== EWalletType.LIGHT && (
          <Button onClick={tryToAccessWalletAgain} data-test-id="access-wallet.try-again">
            <FormattedMessage id="common.try-again" />
          </Button>
        )}
      </>
    )}
  </div>
);

export const AccessWalletContainer = appConnect<IStateProps, IDispatchProps, IExternalProps>({
  stateToProps: (s, props) => ({
    errorMessage: s.accessWallet.errorMessage
      ? getMessageTranslation(s.accessWallet.errorMessage)
      : undefined,
    title: props.title
      ? props.title
      : s.accessWallet.modalTitle && getMessageTranslation(s.accessWallet.modalTitle),
    message: props.message
      ? props.message
      : s.accessWallet.modalMessage && getMessageTranslation(s.accessWallet.modalMessage),
    inputLabel: s.accessWallet.inputLabel && getMessageTranslation(s.accessWallet.inputLabel),
    walletType: selectWalletType(s),
    walletSubType: selectWalletSubType(s.web3),
  }),
  dispatchToProps: dispatch => ({
    onAccept: (password?: string) => {
      dispatch(actions.accessWallet.tryToAccessWalletAgain());
      dispatch(actions.accessWallet.accept(password));
    },
    tryToAccessWalletAgain: () => dispatch(actions.accessWallet.tryToAccessWalletAgain()),
  }),
})(AccessWalletContainerComponent);

interface IModalStateProps {
  isOpen: boolean;
}

interface IModalDispatchProps {
  onCancel: () => void;
}

const AccessWalletModalComponent: React.FunctionComponent<IModalStateProps &
  IModalDispatchProps> = props => (
  <Modal isOpen={props.isOpen} onClose={props.onCancel}>
    <AccessWalletContainer />
  </Modal>
);

export const AccessWalletModal = appConnect<IModalStateProps, IModalDispatchProps>({
  stateToProps: s => ({
    isOpen: selectIsAccessWalletModalOpen(s),
  }),
  dispatchToProps: dispatch => ({
    onCancel: () => dispatch(actions.accessWallet.hideAccessWalletModal()),
  }),
})(AccessWalletModalComponent);
