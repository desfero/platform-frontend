import { EJwtPermissions } from "../../modules/auth/module";
import { createLightWalletWithKeyPair } from "./createLightWalletWithKeyPair";
import { getJWT } from "./getJWT";

/**
 * Signs a new using a the light wallet as a test wallet.
 *
 * @returns {jwt: a new jwt from the backend,
 * salt: new created salt,
 * address: user public AddressTable
 * privateKey:
 * email: user email}
 *
 */
export const createAndSignLightWalletWithKeyPair = async (
  baseUrl: string,
  permissions: EJwtPermissions[],
  hdPath?: string,
  seed?: string,
) => {
  const {
    lightWalletInstance,
    salt,
    address,
    privateKey,
    walletKey,
  } = await createLightWalletWithKeyPair(
    "we don't care about password during integration tests",
    seed,
    hdPath,
  );

  const jwt = await getJWT(address, lightWalletInstance, walletKey, permissions, baseUrl);

  return {
    jwt,
    salt,
    address,
    privateKey,
    email: `${address.slice(0, 7).toLowerCase()}@neufund.org`,
  };
};
