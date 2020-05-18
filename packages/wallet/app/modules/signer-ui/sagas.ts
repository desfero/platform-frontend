import { takeLatest, put, take, call, TActionFromCreator, SagaGenerator } from "@neufund/sagas";
import { coreModuleApi, neuGetBindings } from "@neufund/shared-modules";
import { assertNever, invariant } from "@neufund/shared-utils";

import { walletEthModuleApi } from "../eth/module";
import { signerUIActions } from "./actions";
import { ESignerType } from "./types";

function* sign(
  action: TActionFromCreator<typeof signerUIActions, typeof signerUIActions.sign>,
): SagaGenerator<void> {
  const { ethManager, logger } = yield* neuGetBindings({
    ethManager: walletEthModuleApi.symbols.ethManager,
    logger: coreModuleApi.symbols.logger,
  });

  const payload = action.payload;

  try {
    // wait until signing request get's approved by the user
    yield* take(signerUIActions.approved);

    switch (payload.type) {
      case ESignerType.WC_SESSION_REQUEST: {
        const address = yield* call(() => ethManager.getWalletAddress());
        const chainId = yield* call(() => ethManager.getChainId());

        yield put(signerUIActions.signed({ type: payload.type, data: { address, chainId } }));

        break;
      }
      case ESignerType.SIGN_MESSAGE: {
        const signedData = yield* call(() => ethManager.signMessageHash(payload.data.digest));

        yield put(signerUIActions.signed({ type: payload.type, data: { signedData } }));

        break;
      }
      case ESignerType.SEND_TRANSACTION: {
        const transactionResponse = yield* call(() =>
          ethManager.sendTransaction(payload.data.transaction),
        );

        invariant(transactionResponse.hash, "Transaction hash do not exist");

        yield put(
          signerUIActions.signed({
            type: payload.type,
            data: {
              transactionHash: transactionResponse.hash,
            },
          }),
        );

        break;
      }
      default:
        assertNever(payload);
    }
  } catch (e) {
    logger.error(`Failed to sign ${payload.type}`, e);

    // in case of an error deny signing request
    // TODO: handle signing error on UI
    yield put(signerUIActions.denied());
  }
}

export function* signedUISaga(): Generator<unknown, void> {
  yield takeLatest(signerUIActions.sign, sign);
}
