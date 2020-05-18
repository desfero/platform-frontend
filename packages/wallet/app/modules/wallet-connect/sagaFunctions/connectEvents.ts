import {
  call,
  cancel,
  cancelled,
  neuTakeOnly,
  put,
  race,
  SagaGenerator,
  take,
} from "@neufund/sagas";
import { coreModuleApi, neuGetBindings } from "@neufund/shared-modules";
import { assertNever, nonNullable } from "@neufund/shared-utils";

import { authModuleAPI } from "../../auth/module";
import { notificationUIModuleApi } from "../../notification-ui/module";
import { signerUIModuleApi } from "../../signer-ui/module";
import { ESignerType } from "../../signer-ui/types";
import { reduxify } from "../../utils";
import { walletConnectActions } from "../actions";
import { WalletConnectAdapter } from "../lib/WalletConnectAdapter";
import { privateSymbols } from "../lib/symbols";
import { EWalletConnectAdapterEvents, TWalletConnectAdapterEmit } from "../lib/types";
import { MODULE_ID } from "../module";

function* watchWalletConnectEvents(wcAdapter: WalletConnectAdapter): SagaGenerator<void> {
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

        // stop all watchers and disconnect
        yield cancel();
        break;
      }
      default:
        assertNever(managerEvent, "Invalid wallet connect event");
    }
  }
}

export function* connectEvents(wcAdapter: WalletConnectAdapter): SagaGenerator<void> {
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
    const result = yield* race({
      walletConnectEvents: call(watchWalletConnectEvents, wcAdapter),
      disconnectFromPeer: neuTakeOnly(walletConnectActions.disconnectFromPeer, {
        peerId: wcAdapter.getPeerId(),
      }),
      importAccount: take(authModuleAPI.actions.importAccount),
      logout: take(authModuleAPI.actions.logout),
    });
    logger.info(
      `${MODULE_ID}: Event watcher ended because: ` + Object.keys(result).filter(key => key)[0],
    );
  } catch (e) {
    // in case of unknown error stop session
    logger.error(`${MODULE_ID}: Event watcher failed.`, e);
  } finally {
    if (yield cancelled()) {
      // if connectEvents saga gets cancelled then stop session
      logger.info(`${MODULE_ID}: Event watcher was cancelled.`);
    }
    yield* call(() => wcAdapter.disconnectSession());
    logger.info(`${MODULE_ID}: Session with peer ${peerId} ended`);
    yield put(walletConnectActions.disconnectedFromPeer(peerId));
  }
}
