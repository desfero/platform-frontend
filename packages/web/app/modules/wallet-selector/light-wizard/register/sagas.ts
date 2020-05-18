import { select } from "@neufund/sagas";
import { EUserType, EWalletType } from "@neufund/shared-modules";

import { userMayChooseWallet } from "../../../../components/wallet-selector/WalletSelectorLogin/utils";
import { TGlobalDependencies } from "../../../../di/setupBindings";
import { actions, TActionFromCreator } from "../../../actions";
import { signInUser } from "../../../auth/user/sagas";
import { neuCall } from "../../../sagasUtils";
import { registerForm } from "../../forms/sagas";
import { resetWalletSelectorState } from "../../sagas";
import { selectRegisterWalletDefaultFormValues } from "../../selectors";
import { EFlowType, TLightWalletFormValues } from "../../types";
import { handleLightWalletError } from "../sagas";
import { setupLightWallet } from "../signing/sagas";

function* connectLightWalletAndSignUser(userType: EUserType): Generator<any, boolean, any> {
  try {
    const registerFormDefaultValues: TLightWalletFormValues = yield select(
      selectRegisterWalletDefaultFormValues,
    );
    if (!registerFormDefaultValues) {
      throw new Error("registerFormDefaultValues should be defined at this stage");
    }
    yield neuCall(
      setupLightWallet,
      registerFormDefaultValues.email,
      registerFormDefaultValues.password,
      undefined,
    );
    yield neuCall(signInUser, {
      userType,
      email: registerFormDefaultValues.email,
      tos: registerFormDefaultValues.tos,
    });
    return true;
  } catch (e) {
    yield neuCall(handleLightWalletError, e);
    return false;
  }
}
export function* lightWalletRegister(
  _: TGlobalDependencies,
  {
    payload: { userType },
  }: TActionFromCreator<typeof actions.walletSelector.registerWithLightWallet>,
): Generator<any, void, any> {
  yield neuCall(resetWalletSelectorState);
  const baseUiData = {
    walletType: EWalletType.LIGHT,
    showWalletSelector: userMayChooseWallet(userType),
    rootPath: "/register",
    flowType: EFlowType.REGISTER,
  };
  const initialFormValues: TLightWalletFormValues = {
    email: "",
    password: "",
    repeatPassword: "",
    tos: false,
  };
  yield neuCall(registerForm, {
    afterRegistrationGenerator: () => connectLightWalletAndSignUser(userType),
    expectedAction: actions.walletSelector.lightWalletRegisterFormData,
    initialFormValues,
    baseUiData,
  });
}
