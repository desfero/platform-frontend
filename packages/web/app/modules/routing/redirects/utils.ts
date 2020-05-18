import { EUserType } from "@neufund/shared-modules";
import { CallHistoryMethodAction } from "connected-react-router";

import { actions } from "../../actions";

export function walletSelectorRegisterRedirect(userType: EUserType): CallHistoryMethodAction {
  switch (userType) {
    case EUserType.INVESTOR:
      return actions.routing.goToLightWalletRegister();
    case EUserType.ISSUER:
      return actions.routing.goToIssuerLightWalletRegister();
    case EUserType.NOMINEE:
      return actions.routing.goToNomineeLightWalletRegister();
  }
}
