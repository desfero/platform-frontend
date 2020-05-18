import { call, Effect, put, race, select, take } from "@neufund/sagas";
import { EWalletType } from "@neufund/shared-modules";
import { assertNever, invariant } from "@neufund/shared-utils";

import { GenericErrorMessage } from "../../components/translatedMessages/messages";
import { TMessage } from "../../components/translatedMessages/utils";
import { TGlobalDependencies } from "../../di/setupBindings";
import { BrowserWalletConnector } from "../../lib/web3/browser-wallet/BrowserWalletConnector";
import { LedgerWalletConnector } from "../../lib/web3/ledger-wallet/LedgerConnector";
import { LightWallet } from "../../lib/web3/light-wallet/LightWallet";
import { LightWalletConnector } from "../../lib/web3/light-wallet/LightWalletConnector";
import {
  deserializeLightWalletVault,
  ILightWalletInstance,
} from "../../lib/web3/light-wallet/LightWalletUtils";
import { IPersonalWallet } from "../../lib/web3/PersonalWeb3";
import { WalletConnectConnector } from "../../lib/web3/wallet-connect/WalletConnectConnector";
import { SignerError, Web3Manager } from "../../lib/web3/Web3Manager/Web3Manager";
import { TAppGlobalState } from "../../store";
import { actions, TActionFromCreator } from "../actions";
import { MessageSignCancelledError } from "../auth/errors";
import { neuCall } from "../sagasUtils";
import { retrieveMetadataFromVaultAPI } from "../wallet-selector/light-wizard/metadata/sagas";
import { selectWalletType } from "../web3/selectors";
import {
  ILedgerWalletMetadata,
  ILightWalletMetadata,
  ILightWalletRetrieveMetadata,
} from "../web3/types";
import { mapSignMessageErrorToErrorMessage, MismatchedWalletAddressError } from "./errors";
import { selectIsSigning } from "./reducer";

export function* ensureWalletConnection(
  {
    web3Manager,
    walletStorage,
    lightWalletConnector,
    ledgerWalletConnector,
    browserWalletConnector,
    walletConnectConnector,
  }: TGlobalDependencies,
  password?: string,
): Generator<any, IPersonalWallet, any> {
  let wallet = web3Manager.personalWallet;
  if (!wallet) {
    const metadata = yield* call(() => walletStorage.get());
    invariant(metadata, "User has JWT but doesn't have wallet metadata!");

    switch (metadata.walletType) {
      case EWalletType.LEDGER:
        wallet = yield connectLedger(ledgerWalletConnector, web3Manager, metadata);
        break;
      case EWalletType.BROWSER:
        wallet = yield connectBrowser(browserWalletConnector, web3Manager);
        break;
      case EWalletType.LIGHT:
        invariant(password, "Light Wallet user without a password");
        wallet = yield connectLightWallet(lightWalletConnector, metadata, password);
        break;
      case EWalletType.WALLETCONNECT:
        // TODO: having a side effect in wallet selector is not nice, should we wire those events in AppInit?
        yield put(actions.walletSelector.walletConnectInit());
        wallet = yield connectWalletConnect(walletConnectConnector);
        break;
      default:
        assertNever(metadata, "Wallet type unrecognized");
    }

    yield web3Manager.plugPersonalWallet(wallet!);

    // verify if newly plugged wallet address is the same as before. Mismatch can happen for multiple reasons:
    //  - user selects different wallet in user interface (metamask)
    //  - user attaches different ledger device
    const isSameAddress = wallet!.ethereumAddress.toLowerCase() === metadata.address.toLowerCase();
    if (!isSameAddress) {
      throw new MismatchedWalletAddressError(metadata.address, wallet!.ethereumAddress);
    }
  }
  invariant(wallet, "Must have wallet plugged");

  if (!wallet.isUnlocked()) {
    invariant(password, "Light Wallet user without a password");
    yield wallet.unlock(password);
  }

  return wallet;
}

async function connectLedger(
  ledgerWalletConnector: LedgerWalletConnector,
  web3Manager: Web3Manager,
  metadata: ILedgerWalletMetadata,
): Promise<IPersonalWallet> {
  await ledgerWalletConnector.connect();
  return await ledgerWalletConnector.finishConnecting(
    metadata.derivationPath,
    web3Manager.networkId,
  );
}

async function connectBrowser(
  browserWalletConnector: BrowserWalletConnector,
  web3Manager: Web3Manager,
): Promise<IPersonalWallet> {
  return await browserWalletConnector.connect(web3Manager.networkId);
}

export function* connectLightWallet(
  lightWalletConnector: LightWalletConnector,
  metadata: ILightWalletMetadata,
  password: string,
): Generator<any, LightWallet, any> {
  const walletVault: ILightWalletRetrieveMetadata = yield neuCall(
    retrieveMetadataFromVaultAPI,
    password,
    metadata.salt,
    metadata.email,
  );
  const walletInstance: ILightWalletInstance = deserializeLightWalletVault(
    walletVault.vault,
    metadata.salt,
  );

  const wallet = yield lightWalletConnector.connect(
    {
      walletInstance,
      salt: metadata.salt,
    },
    metadata.email,
  );

  return wallet;
}

async function connectWalletConnect(
  walletConnectConnector: WalletConnectConnector,
): Promise<IPersonalWallet> {
  return walletConnectConnector.connect();
}

export function* connectWallet(): Generator<any, any, any> {
  while (true) {
    try {
      const walletType: EWalletType | undefined = yield select((state: TAppGlobalState) =>
        selectWalletType(state),
      );

      if (walletType === EWalletType.LIGHT) {
        const { payload }: TActionFromCreator<typeof actions.accessWallet.accept> = yield take(
          actions.accessWallet.accept,
        );

        yield neuCall(ensureWalletConnection, payload.password);
      } else {
        // Password is undefined if its Metamask or Ledger
        yield neuCall(ensureWalletConnection);
      }

      return;
    } catch (e) {
      const error = mapSignMessageErrorToErrorMessage(e);
      yield put(actions.accessWallet.signingError(error));

      if (e instanceof SignerError || error.messageType === GenericErrorMessage.GENERIC_ERROR) {
        throw e;
      } else {
        yield take(actions.accessWallet.tryToAccessWalletAgain);
      }
    }
  }
}

export function* accessWalletAndRunEffect(
  effect: Effect | Generator<any, any, any>,
  title: TMessage,
  message?: TMessage,
  inputLabel?: TMessage,
): Generator<any, any, any> {
  // guard against multiple modals
  const isSigning: boolean = yield select((s: TAppGlobalState) => selectIsSigning(s.accessWallet));
  if (isSigning) {
    throw new Error("Signing already in progress");
  }
  yield put(actions.accessWallet.showAccessWalletModal(title, message, inputLabel));
  // do required operation, or finish in case cancel button was hit
  const { cancel } = yield race({
    result: call(connectWallet),
    cancel: take("HIDE_ACCESS_WALLET_MODAL"),
  });

  // if the cancel action was called
  // throw here
  if (cancel) {
    throw new MessageSignCancelledError("Cancelled");
  }

  // always hide the current modal
  yield put(actions.accessWallet.hideAccessWalletModal());

  return yield effect;
}
