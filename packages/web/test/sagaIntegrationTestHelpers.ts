import { EthereumAddressWithChecksum } from "@neufund/shared";
import { noopLogger } from "@neufund/shared-modules";
import { EJwtPermissions } from "@neufund/shared/src/utils/constants";
import { Container } from "inversify";
import { toChecksumAddress } from "web3-utils";

import { symbols } from "../app/di/symbols";
import { createLightWalletWithKeyPair } from "../app/test-e2e/utils/createLightWalletWithKeyPair";
import { getJWT } from "../app/test-e2e/utils/getJWT";
import { IBackendRoot } from "./../app/config/getConfig";
import { AuthorizedJsonHttpClient } from "./../app/lib/api/client/AuthJsonHttpClient";
import { IHttpClient } from "./../app/lib/api/client/IHttpClient";
import { JsonHttpClient } from "./../app/lib/api/client/JsonHttpClient";
import { UsersApi } from "./../app/lib/api/users/UsersApi";
import { STORAGE_JWT_KEY } from "./../app/lib/persistence/JwtObjectStorage";
import { ObjectStorage } from "./../app/lib/persistence/ObjectStorage";
import { Storage } from "./../app/lib/persistence/Storage";

export const BACKEND_BASE_URL = "https://platform.neufund.io";

/**
 * A Integration test helper method that provides some basic functionality the provided classes are a replica
 * of the web application container
 *
 * @note This will be a continues work in progress where you will need to add containers by requirement
 *
 * @note Once a new container is added please add the container name as a return value
 *
 * @returns `apiUserService` A working version of users API
 *
 *
 */
export const setupIntegrationTestContainer = (backendUrl: string) => {
  const myContainer = new Container();
  myContainer
    .bind<IHttpClient>(symbols.jsonHttpClient)
    .to(JsonHttpClient)
    .inSingletonScope();

  myContainer
    .bind<IHttpClient>(symbols.authorizedJsonHttpClient)
    .to(AuthorizedJsonHttpClient)
    .inSingletonScope();

  myContainer
    .bind<ObjectStorage<string>>(symbols.jwtStorage)
    .toDynamicValue(
      ctx =>
        new ObjectStorage<string>(
          ctx.container.get(symbols.storage),
          ctx.container.get(symbols.logger),
          STORAGE_JWT_KEY,
        ),
    )
    .inSingletonScope();

  myContainer.bind<Storage>(symbols.storage).toConstantValue(new Storage({} as any));

  myContainer
    .bind<UsersApi>(symbols.usersApi)
    .to(UsersApi)
    .inSingletonScope();

  // We don't need any logging in integration tests
  myContainer.bind<any>(symbols.logger).toConstantValue(noopLogger);

  myContainer.bind<IBackendRoot>(symbols.backendRootConfig).toConstantValue({ url: backendUrl });

  const apiUserService = myContainer.get<UsersApi>(symbols.usersApi);
  const jwtStorage = myContainer.get<ObjectStorage<string>>(symbols.jwtStorage);

  return { apiUserService, jwtStorage };
};

/**
 * Signs a new using a the light wallet as a test wallet.
 * @param param0
 *
 * @returns {jwt: a new jwt from the backend,
 * salt: new created salt,
 * address: user public AddressTable
 * privateKey:
 * email: user email}
 *
 */
export const setTestJWT = async (
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
  } = await createLightWalletWithKeyPair(seed, hdPath);
  const jwt = await getJWT(address, lightWalletInstance, walletKey, permissions, baseUrl);
  return {
    jwt,
    salt,
    address: toChecksumAddress(address) as EthereumAddressWithChecksum,
    privateKey,
    email: `${address.slice(0, 7).toLowerCase()}@neufund.org`,
  };
};
