import { wrappedFetch } from "../wrapperFetch";
import { TKycType } from "./constants";

const CREATE_USER_PATH = "/api/external-services-mock/e2e-tests/user/";

/**
 * Create a user object with the dev services
 * User will have an accepted email address as well as
 * an accepted kyc, if requested
 */

export type TUserType = "investor" | "issuer" | "nominee";

export const createUser = (
  userType: TUserType,
  privateKey?: string,
  kyc?: TKycType,
  timeoutInSeconds?: number,
  basePath = "",
) => {
  let path = `${basePath}${CREATE_USER_PATH}?user_type=${userType}`;
  if (kyc) {
    path += `&kyc=${kyc}`;
  }
  if (privateKey) {
    path += `&private_key=0x${privateKey}`;
  }
  if (timeoutInSeconds) {
    path += `&max_verification_wait=${timeoutInSeconds}`;
  }
  return wrappedFetch(path, {
    method: "POST",
  }).then(r => r.json());
};
