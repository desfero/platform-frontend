import { IUser } from "@neufund/shared-modules";
import {
  createLightWalletWithKeyPair,
  createUser,
  getJWT,
  TUserType,
  wrappedFetch,
} from "@neufund/shared-modules/tests";
import { toCamelCase } from "@neufund/shared-utils";

import { TEtoDataWithCompany } from "../../lib/api/eto/EtoApi.interfaces.unsafe";
import { OOO_TRANSACTION_TYPE, TxPendingWithMetadata } from "../../lib/api/users-tx/interfaces";
import { getVaultKey } from "../../modules/wallet-selector/light-wizard/utils";
import { assertLanding } from "./assertions";
import {
  DEFAULT_PASSWORD,
  JWT_KEY,
  TKycType,
  VAULT_API_ROOT,
  WALLET_STORAGE_KEY,
} from "./constants";
import { getAgreementHash } from "./getAgreementHash";
import { accountFixtureByName, removePendingExternalTransaction } from "./index";
import { tid } from "./selectors";

export const generateRandomEmailAddress = () =>
  `${Math.random()
    .toString(36)
    .substring(7)}@e2e.com`;

export const getJwtToken = () => JSON.parse(localStorage.getItem(JWT_KEY)!);
export const getWalletMetaData = () => JSON.parse(localStorage.getItem(WALLET_STORAGE_KEY)!);

type TCreateAndLoginParams = {
  type: TUserType;
  kyc?: TKycType;
  seed?: string;
  hdPath?: string;
  permissions?: string[];
  skipClearingPendingTransactions?: boolean;
  /**
   * In case it's a fixture account you can skip creating new user
   */
  skipCreatingNewUser?: boolean;
  /**
   * Signing TOS is useful to skip when we want to test the TOS modal flow
   * Otherwise we should always sign TOS automatically before even logging in
   */
  skipSigningTOS?: boolean;
  skipBackupCodesVerification?: boolean;
};

/*
 * Pre-login user for faster tests
 */
export const createAndLoginNewUser = ({
  skipClearingPendingTransactions,
  hdPath,
  kyc,
  permissions,
  seed,
  skipSigningTOS,
  skipCreatingNewUser,
  skipBackupCodesVerification,
  type,
}: TCreateAndLoginParams) =>
  cy.clearLocalStorage().then(async ls => {
    cy.log("Logging in...");

    const {
      lightWalletInstance,
      salt,
      address,
      privateKey,
      walletKey,
    } = await createLightWalletWithKeyPair(DEFAULT_PASSWORD, seed, hdPath);

    // set wallet data on local storage
    ls.setItem(
      WALLET_STORAGE_KEY,
      JSON.stringify({
        address,
        salt,
        userType: type,
        email: `${address.slice(0, 7).toLowerCase()}@neufund.org`,
        walletType: "LIGHT",
      }),
    );

    // fetch a token and store it in local storage
    const jwt = await getJWT(address, lightWalletInstance, walletKey, permissions);

    ls.setItem(JWT_KEY, `"${jwt}"`);

    await createVaultApi(salt, DEFAULT_PASSWORD, lightWalletInstance.serialize());

    if (!skipCreatingNewUser) {
      // create a user object on the backend
      await createUser(type, privateKey, kyc, 4);
    }

    if (!skipBackupCodesVerification) {
      // mark backup codes verified
      await markBackupCodesVerified(jwt);
    }

    if (!skipClearingPendingTransactions) {
      clearPendingTransactions();
    }

    if (!skipSigningTOS) {
      // This was done to maintain `signTosAgreement` without changing the interface of existing tests
      await setCorrectAgreement(jwt);
    }

    cy.log(`Logged in as ${type}`, `KYC: ${kyc}, seed: ${seed}`);

    // TODO: find why we need to `cy.wrap` as normal `return { address }` is not working
    return new Promise<{ address: string }>(resolve => resolve(cy.wrap({ address })));
  });

/*
 * Restore fixture account by name
 */
export const loginFixtureAccount = (
  accountFixtureName: string,
  params: Omit<
    Parameters<typeof createAndLoginNewUser>["0"],
    "type" | "seed" | "kyc" | "skipCreatingNewUser"
  > = {},
) => {
  cy.log(`Logging in as ${accountFixtureName}`);

  const fixture = accountFixtureByName(accountFixtureName);

  let hdPath: string | undefined = params.hdPath;

  // in case hd path is not provided derive one from fixture configuration
  if (hdPath === undefined) {
    const hdPathFull = fixture.definition.derivationPath;

    if (hdPathFull) {
      hdPath = hdPathFull.substr(0, hdPathFull.lastIndexOf("/"));
    }
  }

  return createAndLoginNewUser({
    type: fixture.type,
    seed: fixture.definition.seed,
    // fixtures should be already properly populated in the database,
    // therefore there is no need to create new user
    skipCreatingNewUser: true,
    hdPath,
    ...params,
  });
};

const USER_PATH = "/api/user/user/me";
const USER_TOS_PATH = USER_PATH + "/tos";

const KYC_PATH = "/api/kyc";
const KYC_STATUS_PATH = "/status";

export const getUserData = async (jwt: string) => {
  const headers = {
    "Content-Type": "application/json",
    authorization: `Bearer ${jwt}`,
  };
  return (
    await wrappedFetch(USER_PATH, {
      headers,
      method: "GET",
    })
  ).json();
};

export const getKycStatus = async (jwt: string) => {
  const headers = {
    "Content-Type": "application/json",
    authorization: `Bearer ${jwt}`,
  };

  const statusResponse = await wrappedFetch(KYC_PATH + KYC_STATUS_PATH, {
    headers,
    method: "GET",
  });

  const { status } = await statusResponse.json();

  return status;
};

export const markBackupCodesVerified = async (jwt: string) => {
  const headers = {
    "Content-Type": "application/json",
    authorization: `Bearer ${jwt}`,
  };

  const userJson = await getUserData(jwt);

  userJson.backup_codes_verified = true;
  await wrappedFetch(USER_PATH, {
    headers,
    method: "PUT",
    body: JSON.stringify(userJson),
  });
};

export const setCorrectAgreement = async (jwt: string) => {
  const headers = {
    "Content-Type": "application/json",
    authorization: `Bearer ${jwt}`,
  };

  const TosAgreementFromUniverse = await getAgreementHash();

  await wrappedFetch(USER_TOS_PATH, {
    headers,
    method: "PUT",
    body: JSON.stringify({
      latest_accepted_tos_ipfs: TosAgreementFromUniverse,
    }),
  });
};

const PENDING_TRANSACTIONS_PATH = "/api/user/pending_transactions/me";

export const addPendingTransactions = (
  tx: TxPendingWithMetadata,
): Cypress.Chainable<ReadonlyArray<{ transaction_type: string }>> =>
  cy
    .request({
      url: PENDING_TRANSACTIONS_PATH,
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${getJwtToken()}`,
      },
      body: {
        transaction: tx.transaction,
        transaction_type: tx.transactionType,
        transaction_additional_data: tx.transactionAdditionalData,
        transaction_timestamp: tx.transactionTimestamp,
        transaction_status: tx.transactionStatus,
        transaction_error: tx.transactionError,
      },
    })
    .then(response => response.body);

const MOCKED_PENDING_TX_PATH = "/api/external-services-mock/e2e-tests/pending_transactions/";

export const addFailedPendingTransactions = (
  uid: string,
  txHash: string,
  error: string,
): Cypress.Chainable<ReadonlyArray<{ transaction_type: string }>> =>
  cy
    .request({
      url: `${MOCKED_PENDING_TX_PATH}${uid}/failed/${txHash}?error=${error}`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${getJwtToken()}`,
      },
    })
    .then(response => response.body);

export const clearPendingTransactions = () =>
  cy
    .request({
      url: PENDING_TRANSACTIONS_PATH,
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${getJwtToken()}`,
      },
    })
    .then(async response => {
      const pendingTransactions = response.body;
      await pendingTransactions.map((tx: any) =>
        // no deserializer used, parse snake case
        tx.transaction_type === OOO_TRANSACTION_TYPE
          ? removePendingExternalTransaction()
          : cy.request({
              url: `${PENDING_TRANSACTIONS_PATH}/${tx.transaction.hash}`,
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
                authorization: `Bearer ${getJwtToken()}`,
              },
            }),
      );
    });

export const getPendingTransactions = (): Cypress.Chainable<ReadonlyArray<{
  transaction_type: string;
}>> =>
  cy
    .request({
      url: PENDING_TRANSACTIONS_PATH,
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${getJwtToken()}`,
      },
    })
    .then(response => response.body);

export const makeAuthenticatedCall = (path: string, config: RequestInit = {}) =>
  wrappedFetch(path, {
    ...config,
    headers: {
      ...config.headers,
      "Content-Type": "application/json",
      authorization: `Bearer ${getJwtToken()}`,
    },
  }).then(r => r.json());

export const logout = () => {
  cy.log("logging out");

  cy.get(tid("account-menu-open-button"))
    .click()
    .get(tid("menu-logout-button"))
    .click();

  assertLanding();

  cy.log("logged out");
};

export const createVaultApi = async (
  salt: string,
  password: string,
  serializedVault: string,
): Promise<any> => {
  const vaultKey = await getVaultKey(salt, password);

  const path = `${VAULT_API_ROOT}/vault/${vaultKey}`;
  const payload = { wallet: serializedVault };
  return wrappedFetch(path, {
    method: "POST",
    body: JSON.stringify(payload),
    headers: {
      Accept: "*/*",
      "Content-Type": "application/json",
    },
  });
};

const ETOS_PATH = "/api/eto-listing/etos";

export interface IHttpPartialResponse<T> {
  body: T;
}

export const getEto = (etoID: string): Cypress.Chainable<TEtoDataWithCompany> => {
  if (!etoID) {
    throw new Error("Cannot fetch undefined value please check if the fixtures are in sync");
  }

  return cy
    .request({ url: ETOS_PATH, method: "GET" })
    .then((etos: IHttpPartialResponse<TEtoDataWithCompany>) => {
      if (!etos.body) {
        throw new Error(`There is no body response from ${ETOS_PATH} ping backend about this`);
      }

      const result: TEtoDataWithCompany[] = toCamelCase(etos.body).filter(
        (eto: TEtoDataWithCompany) => eto.etoId === etoID,
      );

      if (result.length === 0) {
        throw new Error(
          "Something is wrong with the fixtures, this sometimes happens due to users changing fixtures from the platform. ",
        );
      }
      // If there is more than one eto just return the first one
      return result[0];
    });
};

const EMAIL_VERIFICATION_PATH = USER_PATH + "/email-verification";

export const verifyUserEmailCall = (activationLink: string): Cypress.Chainable<IUser> => {
  const activationLinkURL = new URL(activationLink);
  const activationLinkParams = new URLSearchParams(activationLinkURL.search);
  const verificationCode = activationLinkParams.get("code")!;

  return cy
    .request({
      url: EMAIL_VERIFICATION_PATH,
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${getJwtToken()}`,
      },
      body: JSON.stringify({ verification_code: verificationCode }),
    })
    .then(response => response.body);
};
