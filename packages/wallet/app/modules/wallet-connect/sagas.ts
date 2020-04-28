import {
  put,
  takeLatest,
  take,
  race,
  cancel,
  call,
  neuTakeOnly,
  TActionFromCreator,
  SagaGenerator,
  cancelled,
} from "@neufund/sagas";
import { coreModuleApi, neuGetBindings } from "@neufund/shared-modules";
import { assertNever, nonNullable } from "@neufund/shared-utils";

import { EAppRoutes } from "../../appRoutes";
import { navigate } from "../../routeUtils";
import { notificationUIModuleApi } from "../notification-ui/module";
import { signerUIModuleApi } from "../signer-ui/module";
import { ESignerType } from "../signer-ui/types";
import { reduxify } from "../utils";
import { walletConnectActions } from "./actions";
import { WalletConnectAdapter } from "./lib/WalletConnectAdapter";
import { privateSymbols } from "./lib/symbols";
import { EWalletConnectAdapterEvents, TWalletConnectAdapterEmit } from "./lib/types";
import { InvalidWalletConnectUriError, isValidWalletConnectUri } from "./lib/utils";

function* connectToURI(
  action: TActionFromCreator<
    typeof walletConnectActions,
    typeof walletConnectActions.connectToPeer
  >,
): Generator<unknown, void> {
  const { walletConnectManager, logger } = yield* neuGetBindings({
    walletConnectManager: privateSymbols.walletConnectManager,
    logger: coreModuleApi.symbols.logger,
  });

  const uri = action.payload.uri;

  try {
    if (!isValidWalletConnectUri(uri)) {
      throw new InvalidWalletConnectUriError();
    }

    navigate(EAppRoutes.home);

    const session = yield* call(() => walletConnectManager.createSession(uri));

    yield put(
      signerUIModuleApi.actions.sign({
        type: ESignerType.WC_SESSION_REQUEST,
        data: {
          peerId: session.peer.id,
          peerName: session.peer.meta.name,
          peerUrl: session.peer.meta.url,
        },
      }),
    );

    const { approved, denied } = yield* race({
      approved: take(signerUIModuleApi.actions.signed),
      denied: take(signerUIModuleApi.actions.denied),
    });

    if (approved) {
      const { chainId, address } = approved.payload.data;

      const walletConnect = session.approveSession(chainId, address);

      yield* call(connectEvents, walletConnect);
    }

    if (denied) {
      session.rejectSession();

      logger.info("Wallet connect session rejected");
    }
  } catch (e) {
    yield put(
      notificationUIModuleApi.actions.showInfo("Failed to start session with wallet connect"),
    );
    logger.error("Wallet connect failed to connect to a new URI", e);
  }
}

export function* tryToConnectExistingSession(): SagaGenerator<void> {
  const { walletConnectManager, logger } = yield* neuGetBindings({
    walletConnectManager: privateSymbols.walletConnectManager,
    logger: coreModuleApi.symbols.logger,
  });

  try {
    const hasExistingSession = yield* call(() => walletConnectManager.hasExistingSession());

    logger.info(`Existing wallet connect session ${hasExistingSession ? "FOUND" : "NOT FOUND"}`);

    if (hasExistingSession) {
      const wcAdapter = yield* call(() => walletConnectManager.useExistingSession());

      yield* call(connectEvents, wcAdapter);
    }
  } catch (e) {
    logger.error("Wallet connect failed to use existing session", e);
  }
}

function* connectEvents(wcAdapter: WalletConnectAdapter): SagaGenerator<void> {
  const { logger } = yield* neuGetBindings({
    logger: coreModuleApi.symbols.logger,
    walletConnectSessionStorage: privateSymbols.walletConnectSessionStorage,
  });

  const peerId = wcAdapter.getPeerId();

  try {
    yield put(
      walletConnectActions.connectedToPeer({
        id: peerId,
        meta: wcAdapter.getPeerMeta(),
        connectedAt: nonNullable(wcAdapter.getConnectedAt()),
      }),
    );

    // start watching for events from wallet connect and UI actions
    yield* race({
      walletConnectEvents: call(connectWalletConnectEvents, wcAdapter),
      walletActions: call(connectModuleActions, wcAdapter),
    });
  } catch (e) {
    // in case of unknown error stop session
    yield* call(() => wcAdapter.disconnectSession());

    logger.error("Wallet connect event watcher failed. Disconnected.", e);
  } finally {
    if (yield cancelled()) {
      // in case of events saga gets cancelled stop session
      yield* call(() => wcAdapter.disconnectSession());

      logger.info(`Events saga cancelled. Wallet connect session disconnected.`);
    }

    logger.info(`Wallet connect session with ${peerId} ended`);

    yield put(walletConnectActions.disconnectedFromPeer(peerId));
  }
}

function* connectModuleActions(wcAdapter: WalletConnectAdapter): SagaGenerator<void> {
  while (true) {
    const moduleAction: ReturnType<typeof walletConnectActions.disconnectFromPeer> = yield* neuTakeOnly(
      walletConnectActions.disconnectFromPeer,
      {
        peerId: wcAdapter.getPeerId(),
      },
    );

    switch (moduleAction.type) {
      case walletConnectActions.disconnectFromPeer.getType(): {
        yield* call(() => wcAdapter.disconnectSession());

        // stop all watcher and disconnect
        yield cancel();

        break;
      }
      default:
        assertNever(moduleAction.type, "Invalid action");
        break;
    }
  }
}

function* connectWalletConnectEvents(wcAdapter: WalletConnectAdapter): SagaGenerator<void> {
  const channel = reduxify<TWalletConnectAdapterEmit>(wcAdapter);

  while (true) {
    const managerEvent: TWalletConnectAdapterEmit = yield* take(channel);

    switch (managerEvent.type) {
      case EWalletConnectAdapterEvents.SIGN_MESSAGE: {
        yield put(
          signerUIModuleApi.actions.sign({
            type: ESignerType.SIGN_MESSAGE,
            data: managerEvent.payload,
          }),
        );

        const { approved, denied } = yield* race({
          approved: take(signerUIModuleApi.actions.signed),
          denied: take(signerUIModuleApi.actions.denied),
        });

        if (approved) {
          managerEvent.meta.approveRequest(approved.payload.data.signedData);
        }

        if (denied) {
          managerEvent.meta.rejectRequest();
        }

        break;
      }

      case EWalletConnectAdapterEvents.SEND_TRANSACTION: {
        yield put(
          signerUIModuleApi.actions.sign({
            type: ESignerType.SEND_TRANSACTION,
            data: managerEvent.payload,
          }),
        );

        const { approved, denied } = yield* race({
          approved: take(signerUIModuleApi.actions.signed),
          denied: take(signerUIModuleApi.actions.denied),
        });

        if (approved) {
          managerEvent.meta.approveRequest(approved.payload.data.transactionHash);
        }

        if (denied) {
          managerEvent.meta.rejectRequest();
        }

        break;
      }

      case EWalletConnectAdapterEvents.CONNECTED: {
        // Nothing to do on UI

        break;
      }
      case EWalletConnectAdapterEvents.DISCONNECTED: {
        yield put(notificationUIModuleApi.actions.showInfo("Wallet connect disconnected"));

        // stop all watcher and disconnect
        yield cancel();

        break;
      }
      default:
        assertNever(managerEvent, "Invalid wallet connect event");
    }
  }
}

export function* walletConnectSaga(): SagaGenerator<void> {
  yield takeLatest(walletConnectActions.connectToPeer, connectToURI);
}
