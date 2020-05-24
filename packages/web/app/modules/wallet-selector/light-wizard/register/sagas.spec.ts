import { expectSaga, matchers, providers as sagaProvider } from "@neufund/sagas/tests";
import { EUserType, EWalletType } from "@neufund/shared-modules";
import { combineReducers } from "redux";

import { actions } from "../../../actions";
import { isEmailAvailablePromise } from "../../../auth/email/sagas";
import { signInUser } from "../../../auth/user/sagas";
import { walletSelectorInitialState, walletSelectorReducer } from "../../reducer";
import { ECommonWalletRegistrationFlowState, EFlowType } from "../../types";
import { handleLightWalletError } from "../sagas";
import { setupLightWallet } from "../signing/sagas";
import { lightWalletRegister } from "./sagas";

describe("Wallet selector - Light Wallet Register", () => {
  const payload = {
    email: "ilovemom@test.com",
    password: "bass",
    tos: true,
  };

  describe("lightWalletRegister", () => {
    const baseUiData = {
      walletType: EWalletType.LIGHT,
      showWalletSelector: true,
      rootPath: "/register",
      flowType: EFlowType.REGISTER,
    };

    const initialFormValues = {
      email: "",
      password: "",
      repeatPassword: "",
      tos: false,
    };

    it("Runs the happy path when an email is available and login is successful", async () => {
      await expectSaga(
        lightWalletRegister,
        {} as any,
        { payload: { userType: EUserType.INVESTOR } } as any,
      )
        .provide([
          [matchers.call.fn(isEmailAvailablePromise), true],
          [matchers.call.fn(setupLightWallet), undefined],
          [matchers.call.fn(signInUser), undefined],
        ])
        .withReducer(combineReducers({ walletSelector: walletSelectorReducer }))
        .dispatch(
          actions.walletSelector.lightWalletRegisterFormData(
            payload.email,
            payload.password,
            payload.tos,
          ),
        )
        .hasFinalState({
          walletSelector: {
            ...walletSelectorInitialState,
            ...baseUiData,
            showWalletSelector: false,
            initialFormValues: { ...initialFormValues, ...payload },
            uiState: ECommonWalletRegistrationFlowState.REGISTRATION_WALLET_SIGNING,
          },
        })
        .run();
    });
    it("Runs the happy path when an email is available and application throws during lightwallet setup", async () => {
      await expectSaga(
        lightWalletRegister,
        {} as any,
        { payload: { userType: EUserType.INVESTOR } } as any,
      )
        .provide([
          [matchers.call.fn(isEmailAvailablePromise), true],
          [matchers.call.fn(setupLightWallet), sagaProvider.throwError(new Error("error"))],
          [matchers.call.fn(signInUser), undefined],
          [matchers.call.fn(handleLightWalletError), undefined],
        ])
        .withReducer(combineReducers({ walletSelector: walletSelectorReducer }))
        .dispatch(
          actions.walletSelector.lightWalletRegisterFormData(
            payload.email,
            payload.password,
            payload.tos,
          ),
        )
        .hasFinalState({
          walletSelector: {
            ...walletSelectorInitialState,
            ...baseUiData,
            showWalletSelector: true,
            initialFormValues: { ...initialFormValues, email: payload.email },
            uiState: ECommonWalletRegistrationFlowState.REGISTRATION_FORM,
          },
        })
        .silentRun();
    });
  });
});
