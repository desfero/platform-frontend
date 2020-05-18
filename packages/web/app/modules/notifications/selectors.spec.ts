import { EUserType } from "@neufund/shared-modules";
import { DeepPartial } from "@neufund/shared-utils";
import { expect } from "chai";

import { appRoutes } from "../../components/appRoutes";
import { TAppGlobalState } from "../../store";
import { selectIsVisibleSecurityNotification } from "./selectors";

describe("selectIsVisibleSecurityNotification", () => {
  it("should return false if KYC data is still loading", () => {
    const appState: DeepPartial<TAppGlobalState> = {
      kyc: {
        statusLoading: true,
      },
      user: {
        data: {
          type: EUserType.INVESTOR,
        },
      },
      router: {},
    };

    const actual = selectIsVisibleSecurityNotification(appState as any);

    expect(actual).to.be.false;
  });

  it("should return false if route is whitelisted", () => {
    const appState: DeepPartial<TAppGlobalState> = {
      kyc: {},
      user: {
        data: {
          type: EUserType.INVESTOR,
        },
      },
      router: {
        location: {
          pathname: appRoutes.kyc,
        },
      },
    };

    const actual = selectIsVisibleSecurityNotification(appState as any);

    expect(actual).to.be.false;
  });
});
