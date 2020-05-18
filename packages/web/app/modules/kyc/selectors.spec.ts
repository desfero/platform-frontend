import { EUserType } from "@neufund/shared-modules";
import { DeepPartial } from "@neufund/shared-utils";
import { expect } from "chai";

import { EKycRequestStatus } from "../../lib/api/kyc/KycApi.interfaces";
import { TAppGlobalState } from "../../store";
import { selectKycRequestStatus } from "./selectors";

describe("selectKycRequestStatus", () => {
  const authState = {
    auth: {
      user: {
        type: EUserType.INVESTOR,
      },
    },
  };

  it("should return pending if kyc is approved and on chain claim is false", () => {
    const appState: DeepPartial<TAppGlobalState> = {
      kyc: {
        statusLoading: true,
        status: { status: EKycRequestStatus.ACCEPTED },
        claims: { isVerified: false },
      },
      router: {},
    };

    const actual = selectKycRequestStatus({ ...appState, auth: authState } as any);

    expect(actual).to.be.equal(EKycRequestStatus.PENDING);
  });
  it("should return approved if kyc is approved and on chain claim is true", () => {
    const appState: DeepPartial<TAppGlobalState> = {
      kyc: {
        statusLoading: true,
        status: { status: EKycRequestStatus.DRAFT },
        claims: { isVerified: true },
      },
      router: {},
    };

    const actual = selectKycRequestStatus({ ...appState, auth: authState } as any);

    expect(actual).to.be.equal(EKycRequestStatus.DRAFT);
  });
  it("should return approved if kyc is approved and on chain claim is true", () => {
    const appState: DeepPartial<TAppGlobalState> = {
      kyc: {
        statusLoading: true,
        status: { status: EKycRequestStatus.ACCEPTED },
        claims: { isVerified: false },
      },
      router: {},
    };

    const actual = selectKycRequestStatus({ ...appState, auth: authState } as any);

    expect(actual).to.be.equal(EKycRequestStatus.PENDING);
  });
});
