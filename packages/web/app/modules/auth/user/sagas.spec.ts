import { expectSaga, matchers } from "@neufund/sagas/tests";
import { EthereumAddressWithChecksum } from "@neufund/shared-utils";
import { getContext } from "redux-saga-test-plan/matchers";
import { toChecksumAddress } from "web3-utils";

import {
  BACKEND_BASE_URL,
  setTestJWT,
  setupIntegrationTestContainer,
} from "../../../../test/sagaIntegrationTestHelpers";
import { EUserType } from "../../../lib/api/users/interfaces";
import { createUser } from "../../../test-e2e/utils/createUser";
import { actions } from "../../actions";
import { loadKycRequestData } from "../../kyc/sagas";
import { EWalletSubType, EWalletType } from "../../web3/types";
import { loadOrCreateUser } from "./sagas";

describe("Auth - User - Integration Test", () => {
  describe("loadOrCreateUser", async function(): Promise<void> {
    // TODO timeout bad, replace with mocked services
    this.timeout(10000);
    const { jwtStorage, apiUserService } = setupIntegrationTestContainer(BACKEND_BASE_URL);

    it("should create a new user with the correct data", async () => {
      const { jwt, salt, address } = await setTestJWT(BACKEND_BASE_URL, []);
      await jwtStorage.set(jwt);

      const walletMetaData = {
        walletType: EWalletType.LIGHT,
        walletSubType: EWalletSubType.UNKNOWN,
        salt,
        email: "mommyiloveyou@stu.com",
      };

      await expectSaga(
        loadOrCreateUser,
        {
          web3Manager: {
            personalWallet: {
              getMetadata: () => walletMetaData,
            } as any,
          },
          apiUserService,
        } as any,
        { userType: EUserType.INVESTOR },
      )
        .provide([
          [getContext("deps"), { apiUserService, jwtStorage }],
          [matchers.call.fn(loadKycRequestData), undefined],
        ])
        .not.call.fn(apiUserService.updateUser)
        .call(apiUserService.createAccount, {
          newEmail: walletMetaData.email,
          backupCodesVerified: false,
          salt,
          type: EUserType.INVESTOR,
          walletType: walletMetaData.walletType,
          walletSubtype: walletMetaData.walletSubType,
        })
        .put(
          actions.auth.setUser({
            backupCodesVerified: false,
            language: "en",
            latestAcceptedTosIpfs: "",
            type: EUserType.INVESTOR,
            unverifiedEmail: walletMetaData.email,
            userId: toChecksumAddress(address) as EthereumAddressWithChecksum,
            walletSubtype: EWalletSubType.UNKNOWN,
            walletType: EWalletType.LIGHT,
          }),
        )
        .run(true as any);
    });

    it("will not update the user with the correct data", async () => {
      const { email, jwt, salt, address, privateKey } = await setTestJWT(BACKEND_BASE_URL, []);
      await createUser(EUserType.INVESTOR, privateKey, undefined, 4, BACKEND_BASE_URL);

      const walletMetaData = {
        walletType: EWalletType.LIGHT,
        walletSubType: EWalletSubType.UNKNOWN,
        salt,
        email,
      };
      await jwtStorage.set(jwt);

      await expectSaga(
        loadOrCreateUser,
        {
          web3Manager: {
            personalWallet: {
              getMetadata: () => walletMetaData,
            } as any,
          },
          apiUserService,
        } as any,
        { userType: EUserType.INVESTOR },
      )
        .provide([
          [getContext("deps"), { apiUserService, jwtStorage }],
          [matchers.call.fn(loadKycRequestData), undefined],
        ])
        .not.call.fn(apiUserService.createAccount)
        .not.call.fn(apiUserService.updateUser)
        .put(
          actions.auth.setUser({
            backupCodesVerified: false,
            language: "en",
            latestAcceptedTosIpfs: "",
            type: EUserType.INVESTOR,
            verifiedEmail: walletMetaData.email,
            userId: address,
            walletSubtype: EWalletSubType.UNKNOWN,
            walletType: EWalletType.LIGHT,
          }),
        )
        .run(true as any);
    });

    it("will update the user wallet type", async () => {
      const { email, jwt, salt, address, privateKey } = await setTestJWT(BACKEND_BASE_URL, []);
      await createUser(EUserType.INVESTOR, privateKey, undefined, 4, BACKEND_BASE_URL);

      const walletMetaData = {
        walletType: EWalletType.LIGHT,
        walletSubType: EWalletSubType.UNKNOWN,
        salt,
        email,
      };
      await jwtStorage.set(jwt);

      const currentUser = await apiUserService.me();

      await apiUserService.updateUser({
        ...currentUser,
        walletType: EWalletType.BROWSER,
        walletSubtype: EWalletSubType.METAMASK,
      });

      await expectSaga(
        loadOrCreateUser,
        {
          web3Manager: {
            personalWallet: {
              getMetadata: () => walletMetaData,
            } as any,
          },
          apiUserService,
        } as any,
        { userType: EUserType.INVESTOR },
      )
        .provide([
          [getContext("deps"), { apiUserService, jwtStorage }],
          [matchers.call.fn(loadKycRequestData), undefined],
        ])
        .not.call.fn(apiUserService.createAccount)
        .call(apiUserService.updateUser, {
          verifiedEmail: walletMetaData.email,
          backupCodesVerified: false,
          language: "en",
          userId: address,
          latestAcceptedTosIpfs: "",
          type: EUserType.INVESTOR,
          walletType: walletMetaData.walletType,
          walletSubtype: walletMetaData.walletSubType,
          newEmail: undefined,
          salt: undefined,
        })
        .put(
          actions.auth.setUser({
            backupCodesVerified: false,
            language: "en",
            latestAcceptedTosIpfs: "",
            type: EUserType.INVESTOR,
            verifiedEmail: walletMetaData.email,
            userId: address,
            walletSubtype: EWalletSubType.UNKNOWN,
            walletType: EWalletType.LIGHT,
          }),
        )
        .run(true as any);
    });

    it("should update the user with the correct data when a new email is entered on recovery", async () => {
      const newEmail = "mommy@love.com";
      const { email, jwt, salt, address, privateKey } = await setTestJWT(BACKEND_BASE_URL, []);
      await createUser(EUserType.INVESTOR, privateKey, undefined, 4, BACKEND_BASE_URL);
      const walletMetaData = {
        walletType: EWalletType.LIGHT,
        walletSubType: EWalletSubType.UNKNOWN,
        salt,
        email,
      };
      await jwtStorage.set(jwt);

      await expectSaga(
        loadOrCreateUser,
        {
          web3Manager: {
            personalWallet: {
              getMetadata: () => walletMetaData,
            } as any,
          },
          apiUserService,
        } as any,
        { userType: EUserType.INVESTOR, email: newEmail, salt },
      )
        .provide([
          [getContext("deps"), { apiUserService, jwtStorage }],
          [matchers.call.fn(loadKycRequestData), undefined],
        ])
        .not.call.fn(apiUserService.createAccount)
        .call(apiUserService.updateUser, {
          verifiedEmail: walletMetaData.email,
          backupCodesVerified: false,
          language: "en",
          userId: address,
          latestAcceptedTosIpfs: "",
          salt,
          type: EUserType.INVESTOR,
          walletType: walletMetaData.walletType,
          walletSubtype: walletMetaData.walletSubType,
          newEmail,
        })
        .put(
          actions.auth.setUser({
            backupCodesVerified: false,
            language: "en",
            latestAcceptedTosIpfs: "",
            type: EUserType.INVESTOR,
            verifiedEmail: walletMetaData.email,
            unverifiedEmail: newEmail,
            userId: address,
            walletSubtype: EWalletSubType.UNKNOWN,
            walletType: EWalletType.LIGHT,
          }),
        )
        .run(true as any);
    });

    it("will update the user when a new email is entered equals verified email", async () => {
      const { email, jwt, salt, address, privateKey } = await setTestJWT(BACKEND_BASE_URL, []);
      await createUser(EUserType.INVESTOR, privateKey, undefined, 4, BACKEND_BASE_URL);

      const walletMetaData = {
        walletType: EWalletType.LIGHT,
        walletSubType: EWalletSubType.UNKNOWN,
        salt,
        email,
      };
      await jwtStorage.set(jwt);

      await expectSaga(
        loadOrCreateUser,
        {
          web3Manager: {
            personalWallet: {
              getMetadata: () => walletMetaData,
            } as any,
          },
          apiUserService,
        } as any,
        { userType: EUserType.INVESTOR, email: walletMetaData.email, salt },
      )
        .provide([
          [getContext("deps"), { apiUserService, jwtStorage }],
          [matchers.call.fn(loadKycRequestData), undefined],
        ])
        .not.call.fn(apiUserService.createAccount)
        .call(apiUserService.updateUser, {
          verifiedEmail: walletMetaData.email,
          backupCodesVerified: false,
          language: "en",
          userId: address,
          latestAcceptedTosIpfs: "",
          salt,
          type: EUserType.INVESTOR,
          walletType: walletMetaData.walletType,
          walletSubtype: walletMetaData.walletSubType,
          newEmail: walletMetaData.email,
        })
        .put(
          actions.auth.setUser({
            backupCodesVerified: false,
            language: "en",
            latestAcceptedTosIpfs: "",
            type: EUserType.INVESTOR,
            verifiedEmail: walletMetaData.email,
            userId: address,
            walletSubtype: EWalletSubType.UNKNOWN,
            walletType: EWalletType.LIGHT,
          }),
        )
        .run(true as any);
    });

    it("will update the user when a new email is entered similar to unverified email", async () => {
      const { email, jwt, salt, address, privateKey } = await setTestJWT(BACKEND_BASE_URL, []);
      await createUser(EUserType.INVESTOR, privateKey, undefined, 4, BACKEND_BASE_URL);
      const newEmail = "mommy2@love.test";

      const walletMetaData = {
        walletType: EWalletType.LIGHT,
        walletSubType: EWalletSubType.UNKNOWN,
        salt,
        email,
      };
      await jwtStorage.set(jwt);

      const currentUser = await apiUserService.me();

      await apiUserService.updateUser({
        ...currentUser,
        newEmail,
        salt,
      });

      await expectSaga(
        loadOrCreateUser,
        {
          web3Manager: {
            personalWallet: {
              getMetadata: () => walletMetaData,
            } as any,
          },
          apiUserService,
        } as any,
        { userType: EUserType.INVESTOR, email: newEmail, salt },
      )
        .provide([
          [getContext("deps"), { apiUserService, jwtStorage }],
          [matchers.call.fn(loadKycRequestData), undefined],
        ])
        .not.call.fn(apiUserService.createAccount)
        .call(apiUserService.updateUser, {
          verifiedEmail: email,
          unverifiedEmail: newEmail,
          backupCodesVerified: false,
          language: "en",
          userId: address,
          latestAcceptedTosIpfs: "",
          salt,
          type: EUserType.INVESTOR,
          walletType: walletMetaData.walletType,
          walletSubtype: walletMetaData.walletSubType,
          newEmail: newEmail,
        })
        .put(
          actions.auth.setUser({
            backupCodesVerified: false,
            language: "en",
            latestAcceptedTosIpfs: "",
            type: EUserType.INVESTOR,
            verifiedEmail: email,
            unverifiedEmail: newEmail,
            userId: address,
            walletSubtype: EWalletSubType.UNKNOWN,
            walletType: EWalletType.LIGHT,
          }),
        )
        .run(true as any);
      // it should also cancel verification if same as verified email
      await expectSaga(
        loadOrCreateUser,
        {
          web3Manager: {
            personalWallet: {
              getMetadata: () => walletMetaData,
            } as any,
          },
          apiUserService,
        } as any,
        { userType: EUserType.INVESTOR, email, salt },
      )
        .provide([
          [getContext("deps"), { apiUserService, jwtStorage }],
          [matchers.call.fn(loadKycRequestData), undefined],
        ])
        .not.call.fn(apiUserService.createAccount)
        .call(apiUserService.updateUser, {
          verifiedEmail: email,
          unverifiedEmail: newEmail,
          backupCodesVerified: false,
          language: "en",
          userId: address,
          latestAcceptedTosIpfs: "",
          salt,
          type: EUserType.INVESTOR,
          walletType: walletMetaData.walletType,
          walletSubtype: walletMetaData.walletSubType,
          newEmail: email,
        })
        .put(
          actions.auth.setUser({
            backupCodesVerified: false,
            language: "en",
            latestAcceptedTosIpfs: "",
            type: EUserType.INVESTOR,
            verifiedEmail: email,
            userId: address,
            walletSubtype: EWalletSubType.UNKNOWN,
            walletType: EWalletType.LIGHT,
          }),
        )
        .run(true as any);
    });
  });
});
