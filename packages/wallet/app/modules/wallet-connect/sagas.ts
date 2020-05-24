import {
  neuTakeLatest,
  put,
  fork,
  take,
  race,
  cancel,
  call,
  neuTakeOnly,
  neuCall,
  cancelled,
  TActionFromCreator,
} from "@neufund/sagas";
import { coreModuleApi, neuGetBindings } from "@neufund/shared-modules";
import { assertNever } from "@neufund/shared-utils";

import { EAppRoutes } from "../../appRoutes";
import { navigate } from "../../routeUtils";
import { notificationUIModuleApi } from "../notification-ui/module";
import { signerUIModuleApi } from "../signer-ui/module";
import { ESignerType } from "../signer-ui/types";
import { reduxify } from "../utils";
import { walletConnectActions } from "./actions";
import { WalletConnectManager } from "./lib/WalletConnectManager";
import { privateSymbols } from "./lib/symbols";
import { EWalletConnectManagerEvents, TWalletConnectManagerEmit } from "./lib/types";
import { InvalidWalletConnectUriError, isValidWalletConnectUri } from "./lib/utils";

// TODO: Remove when we get rid of saga `deps` in neu wrappers
type TGlobalDependencies = unknown;

function* connectToURI(
  _: TGlobalDependencies,
  action: TActionFromCreator<
    typeof walletConnectActions,
    typeof walletConnectActions.connectToPeer
  >,
): Generator<unknown, void> {
  const { walletConnectManagerFactory, logger } = yield* neuGetBindings({
    walletConnectManagerFactory: privateSymbols.walletConnectManagerFactory,
    logger: coreModuleApi.symbols.logger,
  });

  const uri = action.payload.uri;

  try {
    if (!isValidWalletConnectUri(uri)) {
      throw new InvalidWalletConnectUriError();
    }

    navigate(EAppRoutes.home);

    const walletConnectManager = walletConnectManagerFactory(uri);

    const session = yield* call(() => walletConnectManager.createSession());

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
      session.approveSession(chainId, address);

      yield neuCall(connectEvents, walletConnectManager);
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

function* connectEvents(
  _: TGlobalDependencies,
  wcManager: WalletConnectManager,
): Generator<unknown, void> {
  const { logger } = yield* neuGetBindings({
    logger: coreModuleApi.symbols.logger,
  });

  const peerId = wcManager.getPeerId();

  try {
    yield put(walletConnectActions.connectedToPeer({ id: peerId, meta: wcManager.getPeerMeta() }));

    // start watching for events from wallet connect and UI actions
    yield race({
      walletConnectEvents: call(connectWalletConnectEvents, wcManager),
      walletActions: call(connectModuleActions, wcManager),
    });
  } catch (e) {
    // in case of unknown error stop session
    yield wcManager.disconnectSession();

    logger.error("Wallet connect event watcher failed. Disconnected.", e);
  } finally {
    if (yield cancelled()) {
      // in case of events saga gets cancelled stop session
      yield wcManager.disconnectSession();

      logger.info(`Events saga cancelled . Wallet connect session disconnected.`);
    }

    logger.info(`Wallet connect session with ${peerId} ended`);

    yield put(walletConnectActions.disconnectedFromPeer(peerId));
  }
}

function* connectModuleActions(wcManager: WalletConnectManager): Generator<unknown, void, unknown> {
  while (true) {
    const moduleAction: ReturnType<typeof walletConnectActions.disconnectFromPeer> = yield* neuTakeOnly(
      walletConnectActions.disconnectFromPeer,
      {
        peerId: wcManager.getPeerId(),
      },
    );

    switch (moduleAction.type) {
      case walletConnectActions.disconnectFromPeer.getType(): {
        yield wcManager.disconnectSession();

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

function* connectWalletConnectEvents(wcManager: WalletConnectManager): Generator<unknown, void> {
  const channel = reduxify<TWalletConnectManagerEmit>(wcManager);

  while (true) {
    const managerEvent: TWalletConnectManagerEmit = yield* take(channel);

    switch (managerEvent.type) {
      case EWalletConnectManagerEvents.SIGN_MESSAGE: {
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

      case EWalletConnectManagerEvents.SEND_TRANSACTION: {
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

      case EWalletConnectManagerEvents.DISCONNECT: {
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

export function* walletConnectSaga(): Generator<unknown, void, unknown> {
  yield fork(neuTakeLatest, walletConnectActions.connectToPeer, connectToURI);
}
