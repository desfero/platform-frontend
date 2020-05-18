import { call, put, race, TActionFromCreator, take } from "@neufund/sagas";
import { coreModuleApi, neuGetBindings } from "@neufund/shared-modules";
import { EAppRoutes } from "../../../appRoutes";
import { navigate } from "../../../routeUtils";
import { notificationUIModuleApi } from "../../notification-ui/module";
import { signerUIModuleApi } from "../../signer-ui/module";
import { ESignerType } from "../../signer-ui/types";
import { walletConnectActions } from "../actions";
import { privateSymbols } from "../lib/symbols";
import { InvalidWalletConnectUriError, isValidWalletConnectUri } from "../lib/utils";
import { MODULE_ID } from "../module";
import { connectEvents } from "./connectEvents";

export function* connectToURI(
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
      const walletConnectAdapter = session.approveSession(chainId, address);
      yield* call(connectEvents, walletConnectAdapter);
    }

    if (denied) {
      session.rejectSession();
      logger.info(`${MODULE_ID}: Session rejected`);
    }
  } catch (e) {
    yield put(
      notificationUIModuleApi.actions.showInfo("Failed to start session with wallet connect"),
    );
    logger.error(`${MODULE_ID}: Failed to connect to a new URI`, e);
  }
}
