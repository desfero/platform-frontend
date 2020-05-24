import { call } from "@neufund/sagas";
import {
  authModuleAPI,
  EJwtPermissions,
  ESignerType,
  IUser,
  neuGetBindings,
} from "@neufund/shared-modules";
import cryptoRandomString from "crypto-random-string";

import { TGlobalDependencies } from "../../../../di/setupBindings";
import {
  createLightWalletVault,
  deserializeLightWalletVault,
  getWalletAddress,
  signMessage,
} from "../../../../lib/web3/light-wallet/LightWalletUtils";
import { ILightWalletMetadata } from "../../../web3/types";
import { DEFAULT_HD_PATH } from "../sagas";
import { getVaultKey } from "../utils";

/**
 * Signs a challange and returns a user object without logging the user in
 *
 * @returns IUser or undefined depending on if the user exists or not
 */
export function* getUserMeWithSeedOnly(
  _: TGlobalDependencies,
  seed: string,
): Generator<any, IUser | undefined, any> {
  const { apiUserService, signatureAuthApi } = yield* neuGetBindings({
    apiUserService: authModuleAPI.symbols.apiUserService,
    signatureAuthApi: authModuleAPI.symbols.signatureAuthApi,
  });

  const salt = cryptoRandomString({ length: 64 });
  const address = yield getWalletAddress(seed, DEFAULT_HD_PATH);

  //We can't use `getSignerType` at the moment as the wallet is not plugged
  const {
    body: { challenge },
  } = yield signatureAuthApi.challenge(address, salt, ESignerType.ETH_SIGN, [
    EJwtPermissions.CHANGE_EMAIL_PERMISSION,
  ]);

  const signedChallenge = yield* call(() => signMessage(DEFAULT_HD_PATH, seed, challenge));

  const { jwt } = yield* call(() =>
    signatureAuthApi.createJwt(challenge, signedChallenge, ESignerType.ETH_SIGN),
  );

  try {
    const user = yield* call(() => apiUserService.meWithJWT(jwt));
    return user;
  } catch (e) {
    if (e instanceof authModuleAPI.error.UserNotExisting) {
      return undefined;
    } else {
      throw e;
    }
  }
}

/**
 *
 * Initializes a new light wallet instance either from a new random seed or for a given seed.
 * and creates a vault entry in the vault API
 *
 * @param email
 * @param password
 * @param seed optional seed to generate a new wallet for a given seed
 *
 */
export function* setupLightWallet(
  { vaultApi, lightWalletConnector, web3Manager, logger }: TGlobalDependencies,
  email: string,
  password: string,
  seed: string | undefined,
): Generator<any, ILightWalletMetadata, any> {
  try {
    const { salt, serializedLightWallet } = yield* call(createLightWalletVault, {
      password,
      hdPathString: DEFAULT_HD_PATH,
      recoverSeed: seed,
    });

    const walletInstance = deserializeLightWalletVault(serializedLightWallet, salt);

    const vaultKey = yield* call(getVaultKey, salt, password);
    yield vaultApi.store(vaultKey, serializedLightWallet);
    const lightWallet = yield* call(
      lightWalletConnector.connect,
      {
        walletInstance,
        salt,
      },
      email,
    );

    yield lightWallet.unlock(password);
    yield web3Manager.plugPersonalWallet(lightWallet);
    return lightWallet.getMetadata() as ILightWalletMetadata;
  } catch (e) {
    logger.warn("Error while trying to connect with light wallet: ", e);
    throw e;
  }
}
