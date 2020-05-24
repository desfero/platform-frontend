import { expectSaga, matchers } from "@neufund/sagas/tests";
import { EUserType, EWalletType } from "@neufund/shared-modules";

import { userMayChooseWallet } from "../../../components/wallet-selector/WalletSelectorLogin/utils";
import { actions } from "../../actions";
import { isEmailAvailablePromise } from "../../auth/email/sagas";
import { walletSelectorInitialState, walletSelectorReducer } from "../reducer";
import { ECommonWalletRegistrationFlowState, EFlowType } from "../types";
import { registerForm } from "./sagas";

describe("Wallet selector form sagas", () => {
  const baseUiData = {
    walletType: EWalletType.LIGHT,
    showWalletSelector: userMayChooseWallet(EUserType.INVESTOR),
    rootPath: "/register",
    flowType: EFlowType.REGISTER,
  };

  const initialFormValues = {
    email: "",
    password: "",
    repeatPassword: "",
    tos: false,
  };

  const payload = {
    email: "ilovemom@test.com",
    password: "bass",
    tos: true,
  };

  const expectedFinalState = {
    isMessageSigning: false,
    messageSigningError: undefined,
    walletConnectError: undefined,
    isLoading: false,
    walletType: "LIGHT",
    uiState: ECommonWalletRegistrationFlowState.REGISTRATION_WALLET_SIGNING,
    flowType: "register",
    showWalletSelector: false,
    rootPath: "/register",
    initialFormValues: {
      email: "ilovemom@test.com",
      password: "bass",
      repeatPassword: "",
      tos: true,
    },
  };

  describe("registerForm", () => {
    it("Runs the happy path when an email is available", async () => {
      const walletSignUpSaga = function*(): any {
        return true;
      };

      await expectSaga(registerForm, {} as any, {
        afterRegistrationGenerator: walletSignUpSaga,
        expectedAction: actions.walletSelector.lightWalletRegisterFormData,
        initialFormValues,
        baseUiData,
      })
        .withReducer(walletSelectorReducer)
        .provide([[matchers.call.fn(isEmailAvailablePromise), true]])
        .take(actions.walletSelector.lightWalletRegisterFormData)
        .dispatch(
          actions.walletSelector.lightWalletRegisterFormData(
            payload.email,
            payload.password,
            payload.tos,
          ),
        )
        .put(
          actions.walletSelector.setWalletRegisterData({
            uiState: ECommonWalletRegistrationFlowState.REGISTRATION_VERIFYING_EMAIL,
            showWalletSelector: false,
          }),
        )
        .put(
          actions.walletSelector.setWalletRegisterData({
            ...baseUiData,
            showWalletSelector: false,
            uiState: ECommonWalletRegistrationFlowState.REGISTRATION_WALLET_SIGNING,
            initialFormValues: {
              ...initialFormValues,
              ...payload,
            },
          }),
        )
        .call(walletSignUpSaga)
        .not.take(actions.walletSelector.lightWalletRegisterFormData)
        .hasFinalState({
          ...expectedFinalState,
          uiState: ECommonWalletRegistrationFlowState.REGISTRATION_WALLET_SIGNING,
          initialFormValues: { ...initialFormValues, ...payload },
        })
        .run(false);
    });
    it("Runs when an email is available and signing in saga returns false", async () => {
      const walletSignUpSaga = function*(): any {
        return false;
      };
      await expectSaga(registerForm, {} as any, {
        afterRegistrationGenerator: walletSignUpSaga,
        expectedAction: actions.walletSelector.lightWalletRegisterFormData,
        initialFormValues,
        baseUiData,
      })
        .withReducer(walletSelectorReducer, walletSelectorInitialState)
        .provide([[matchers.call.fn(isEmailAvailablePromise), true]])
        .take(actions.walletSelector.lightWalletRegisterFormData)
        .dispatch(
          actions.walletSelector.lightWalletRegisterFormData(
            payload.email,
            payload.password,
            payload.tos,
          ),
        )
        .put(
          actions.walletSelector.setWalletRegisterData({
            uiState: ECommonWalletRegistrationFlowState.REGISTRATION_VERIFYING_EMAIL,
            showWalletSelector: false,
          }),
        )
        .put(
          actions.walletSelector.setWalletRegisterData({
            ...baseUiData,
            showWalletSelector: false,
            uiState: ECommonWalletRegistrationFlowState.REGISTRATION_WALLET_SIGNING,
            initialFormValues: {
              ...initialFormValues,
              ...payload,
            },
          }),
        )
        .take(actions.walletSelector.lightWalletRegisterFormData)
        .call(walletSignUpSaga)
        .hasFinalState({
          ...expectedFinalState,
          ...baseUiData,
          uiState: ECommonWalletRegistrationFlowState.REGISTRATION_FORM,
          initialFormValues: { ...initialFormValues, email: payload.email },
        })
        .silentRun();
    });
    it("should show `REGISTRATION_EMAIL_VERIFICATION_ERROR` when an email is not available", async () => {
      const walletSignUpSaga = function*(): any {};
      await expectSaga(registerForm, {} as any, {
        afterRegistrationGenerator: walletSignUpSaga,
        expectedAction: actions.walletSelector.lightWalletRegisterFormData,
        initialFormValues,
        baseUiData,
      })
        .withReducer(walletSelectorReducer, walletSelectorInitialState)
        .provide([[matchers.call.fn(isEmailAvailablePromise), false]])
        .take(actions.walletSelector.lightWalletRegisterFormData)
        .dispatch(
          actions.walletSelector.lightWalletRegisterFormData(
            payload.email,
            payload.password,
            payload.tos,
          ),
        )
        .put(
          actions.walletSelector.setWalletRegisterData({
            uiState: ECommonWalletRegistrationFlowState.REGISTRATION_VERIFYING_EMAIL,
            showWalletSelector: false,
          }),
        )
        .take(actions.walletSelector.lightWalletRegisterFormData)
        .hasFinalState({
          ...walletSelectorInitialState,
          uiState: ECommonWalletRegistrationFlowState.REGISTRATION_EMAIL_VERIFICATION_ERROR,
          initialFormValues: { ...initialFormValues, email: payload.email },
          showWalletSelector: true,
          rootPath: baseUiData.rootPath,
          errorMessage: { messageType: "userAlreadyExists", messageData: undefined },
        })
        .silentRun();
    });
  });
});
