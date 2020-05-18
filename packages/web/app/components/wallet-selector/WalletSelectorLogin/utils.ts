import { EUserType } from "@neufund/shared-modules";

import { appRoutes } from "../../appRoutes";

export const userMayChooseWallet = (userType: EUserType) =>
  userType !== EUserType.NOMINEE &&
  !(userType === EUserType.ISSUER && process.env.NF_ISSUERS_CAN_LOGIN_WITH_ANY_WALLET !== "1");

export function getRedirectionUrl(rootPath: string): string {
  const { loginIssuer, registerIssuer, registerNominee } = appRoutes;

  switch (rootPath) {
    case loginIssuer:
    case registerIssuer:
      return `${rootPath}/ledger`;
    case registerNominee:
      return `${rootPath}/light`;
    default:
      return `${rootPath}/light`;
  }
}
