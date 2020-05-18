import { call, SagaGenerator } from "@neufund/sagas";
import cryptoRandomString from "crypto-random-string";

import { neuGetBindings } from "../../../utils";
import { coreModuleApi } from "../../core/module";
import { symbols } from "../lib/symbols";
import { WalletNotAvailableError } from "./errors";
import { EJwtPermissions, TSignedChallenge } from "./types";

/**
 * Generates and invokes a signer to sign a challenge.
 */
function* signChallenge(permissions: EJwtPermissions[] = []): SagaGenerator<TSignedChallenge> {
  const { logger, signatureAuthApi, ethManager } = yield* neuGetBindings({
    logger: coreModuleApi.symbols.logger,
    ethManager: symbols.ethManager,
    signatureAuthApi: symbols.signatureAuthApi,
  });

  const salt = cryptoRandomString({ length: 64 });

  const hasPluggedWallet = yield* call(() => ethManager.hasPluggedWallet());

  if (!hasPluggedWallet) {
    throw new WalletNotAvailableError();
  }

  const address = yield* call(() => ethManager.getWalletAddress());

  const signerType = yield* call(() => ethManager.getWalletSignerType());

  logger.info("Obtaining auth challenge from api");

  const {
    body: { challenge },
  } = yield* call(() => signatureAuthApi.challenge(address, salt, signerType, permissions));

  logger.info("Signing challenge");

  const signedChallenge = yield* call(() => ethManager.signMessage(challenge));

  logger.info("Challenge signed");

  return {
    challenge,
    signedChallenge,
    signerType,
  };
}

export { signChallenge };
