import { call, fork, put, select } from "@neufund/sagas";
import {
  EDelayTiming,
  EthereumAddressWithChecksum,
  getJwtExpiryDate,
  hasValidPermissions,
  safeDelay,
} from "@neufund/shared";

import { calculateTimeLeft } from "../../../components/shared/utils";
import { TMessage } from "../../../components/translatedMessages/utils";
import { TGlobalDependencies } from "../../../di/setupBindings";
import { ICreateJwtEndpointResponse } from "../../../lib/api/auth/SignatureAuthApi";
import { accessWalletAndRunEffect } from "../../access-wallet/sagas";
import { actions } from "../../actions";
import { neuCall, neuTakeLatestUntil } from "../../sagasUtils";
import { selectEthereumAddressWithChecksum } from "../../web3/selectors";
import { AUTH_JWT_TIMING_THRESHOLD, AUTH_TOKEN_REFRESH_THRESHOLD } from "../constants";
import { JwtNotAvailable, MessageSignCancelledError } from "../errors";
import { selectJwt } from "../selectors";

/**
 * Load to store jwt from browser storage
 */
export function* loadJwt({ jwtStorage }: TGlobalDependencies): Generator<any, any, any> {
  return jwtStorage.get();
}

/**
 * Save jwt to the browser storage and update the store
 */
export function* setJwt(
  { jwtStorage }: TGlobalDependencies,
  jwt: string,
): Generator<any, any, any> {
  jwtStorage.set(jwt);

  yield put(actions.auth.setJWT(jwt));
}

/**
 * Generates and invokes a signer to sign a challenge.
 */
function* signChallenge(
  { web3Manager, signatureAuthApi, cryptoRandomString, logger }: TGlobalDependencies,
  permissions: Array<string> = [],
): Generator<any, any, any> {
  const address: EthereumAddressWithChecksum = yield select(selectEthereumAddressWithChecksum);

  const salt = cryptoRandomString({ length: 64 });

  if (!web3Manager.personalWallet) {
    throw new Error("Wallet unavailable Error");
  }

  const signerType = web3Manager.personalWallet.getSignerType();

  logger.info("Obtaining auth challenge from api");

  const {
    body: { challenge },
  } = yield signatureAuthApi.challenge(address, salt, signerType, permissions);

  logger.info("Signing challenge");

  const signedChallenge = yield web3Manager.personalWallet.signMessage(challenge);

  logger.info("Challenge signed");

  return {
    challenge,
    signedChallenge,
    signerType,
  };
}
/**
 * Create new JWT from the authentication server.
 */
export function* createJwt(
  { signatureAuthApi, logger }: TGlobalDependencies,
  permissions: Array<string> = [],
): Generator<any, any, any> {
  logger.info("Creating jwt");

  const { signedChallenge, challenge, signerType } = yield neuCall(signChallenge, permissions);

  logger.info("Sending signed challenge back to api");
  console.log("challenge signed")
  const { jwt }: ICreateJwtEndpointResponse = yield signatureAuthApi.createJwt(
    challenge,
    signedChallenge,
    signerType,
  );

  yield neuCall(setJwt, jwt);

  logger.info("Jwt created successfully");
}

/**
 * Escalate JWT with the authentication server.
 * Used to add additional permissions to existing JWT
 */
export function* escalateJwt(
  { signatureAuthApi, logger }: TGlobalDependencies,
  permissions: Array<string> = [],
): Generator<any, any, any> {
  const currentJwt: string = yield select(selectJwt);
  if (!currentJwt) {
    throw new JwtNotAvailable();
  }

  logger.info("Escalating jwt");

  const { signedChallenge, challenge, signerType } = yield neuCall(signChallenge, permissions);

  logger.info("Sending signed challenge back to api");

  const { jwt }: ICreateJwtEndpointResponse = yield signatureAuthApi.escalateJwt(
    challenge,
    signedChallenge,
    signerType,
  );

  yield neuCall(setJwt, jwt);

  logger.info("Jwt escalated successfully");
}

/**
 * Refresh JWT with new default expire date.
 * Permissions expire dates left untouched.
 */
export function* refreshJWT({
  signatureAuthApi,
  logger,
}: TGlobalDependencies): Generator<any, any, any> {
  logger.info("Refreshing jwt");

  const { jwt }: ICreateJwtEndpointResponse = yield signatureAuthApi.refreshJwt();

  yield neuCall(setJwt, jwt);

  logger.info("Jwt refreshed successfully");
}

/**
 * Saga to ensure all the needed permissions are present and still valid on the current jwt
 * If needed permissions are not present/valid will escalate permissions with authentication server
 */
export function* ensurePermissionsArePresentAndRunEffect(
  { logger }: TGlobalDependencies,
  effect: Generator<any, any, any>,
  permissions: Array<string> = [],
  title: TMessage,
  message?: TMessage,
  inputLabel?: TMessage,
): Generator<any, any, any> {
  const jwt: string = yield select(selectJwt);

  // check whether all permissions are present and still valid
  if (jwt && hasValidPermissions(jwt, permissions)) {
    yield effect;

    return;
  }

  // obtain a freshly signed token with missing permissions
  try {
    const obtainJwtEffect = neuCall(escalateJwt, permissions);
    yield call(accessWalletAndRunEffect, obtainJwtEffect, title, message, inputLabel);
    yield effect;
  } catch (error) {
    if (error instanceof MessageSignCancelledError) {
      logger.info("Signing Cancelled");
    } else {
      throw error;
    }
  }
}

/**
 * Refresh jwt before timing out.
 * In case it's not possible will log out user.
 */
export function* handleJwtTimeout({ logger }: TGlobalDependencies): Generator<any, any, any> {
  try {
    const jwt: string | undefined = yield select(selectJwt);

    if (!jwt) {
      throw new JwtNotAvailable();
    }

    const expiryDate = getJwtExpiryDate(jwt);

    const timeLeft = calculateTimeLeft(expiryDate, true, "milliseconds");

    const timeLeftWithThreshold =
      timeLeft >= AUTH_TOKEN_REFRESH_THRESHOLD ? timeLeft - AUTH_TOKEN_REFRESH_THRESHOLD : timeLeft;

    if (AUTH_JWT_TIMING_THRESHOLD > AUTH_TOKEN_REFRESH_THRESHOLD) {
      throw new Error("Timing threshold should be smaller than token refresh threshold");
    }

    const timing: EDelayTiming = yield safeDelay(timeLeftWithThreshold, {
      threshold: AUTH_JWT_TIMING_THRESHOLD,
    });

    // If timing matches exact refresh jwt
    // in case timeout was delayed (for e.g. hibernation), logout with session timeout message
    switch (timing) {
      case EDelayTiming.EXACT:
        yield neuCall(refreshJWT);
        break;
      case EDelayTiming.DELAYED:
        yield put(actions.auth.jwtTimeout());
        break;
    }
  } catch (e) {
    logger.error("Failed to handle jwt timeout", e);
    throw e;
  }
}

export function* authJwtSagas(): Generator<any, any, any> {
  yield fork(neuTakeLatestUntil, actions.auth.setJWT, actions.auth.logout, handleJwtTimeout);
}
