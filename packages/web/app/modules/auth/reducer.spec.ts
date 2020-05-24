import { EUserType, EWalletSubType, EWalletType } from "@neufund/shared-modules";
import { EthereumAddressWithChecksum } from "@neufund/shared-utils";
import { expect } from "chai";

import { TAppGlobalState } from "../../store";
import { EAuthStatus, IAuthState } from "./reducer";
import { selectIsAuthorized, selectUserEmail } from "./selectors";

describe("auth > selectors", () => {
  describe("selectIsAuthorized", () => {
    it("should return true for authorized users", () => {
      const authState: Partial<IAuthState> = {
        status: EAuthStatus.AUTHORIZED,
      };

      const userState = {
        data: {
          userId: "user-id" as EthereumAddressWithChecksum,
          type: EUserType.INVESTOR,
          walletType: EWalletType.LIGHT,
          walletSubtype: EWalletSubType.UNKNOWN,
        },
      };

      const jwtState = {
        token: "jwt token",
      };

      const actualValue = selectIsAuthorized({
        auth: authState,
        jwt: jwtState,
        user: userState,
      } as TAppGlobalState);

      expect(actualValue).to.be.true;
    });

    it("should return false for not authorized users", () => {
      // this should only happen in the middle of auth process
      const authState: Partial<IAuthState> = {
        status: EAuthStatus.NON_AUTHORIZED,
      };

      const jwtState = {
        token: "jwt token",
      };

      const userState = {
        data: undefined,
      };

      const actualValue = selectIsAuthorized({
        auth: authState,
        jwt: jwtState,
        user: userState,
      } as TAppGlobalState);

      expect(actualValue).to.be.false;
    });

    it("should return false when jwt token is not present", () => {
      const authState: Partial<IAuthState> = {
        status: EAuthStatus.AUTHORIZED,
      };

      const userState = {
        data: {
          userId: "user-id" as EthereumAddressWithChecksum,
          type: EUserType.INVESTOR,
          walletType: EWalletType.LIGHT,
          walletSubtype: EWalletSubType.UNKNOWN,
        },
      };

      const jwtState = {
        token: undefined,
      };

      const actualValue = selectIsAuthorized({
        auth: authState,
        jwt: jwtState,
        user: userState,
      } as TAppGlobalState);

      expect(actualValue).to.be.false;
    });
  });

  describe("selectUserEmail", () => {
    it("should prefer unverified user email", () => {
      const userState = {
        data: {
          userId: "user-id" as EthereumAddressWithChecksum,
          unverifiedEmail: "unverified@email.com",
          verifiedEmail: "some.verified@email.com",
          type: EUserType.INVESTOR,
          walletType: EWalletType.LIGHT,
          walletSubtype: EWalletSubType.UNKNOWN,
        },
      };

      const actualValue = selectUserEmail({ user: userState } as TAppGlobalState);

      expect(actualValue).to.be.eq(userState.data.unverifiedEmail);
    });

    it("should return undefined when user is missing", () => {
      const authState: IAuthState = {
        status: EAuthStatus.NON_AUTHORIZED,
        currentAgreementHash: undefined,
      };

      const userState = {
        data: undefined,
      };

      const actualValue = selectUserEmail({ auth: authState, user: userState } as TAppGlobalState);

      expect(actualValue).to.be.undefined;
    });
  });
});
