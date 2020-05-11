import { call, neuCall, put, take } from "@neufund/sagas";

import { GenericErrorMessage } from "../../../components/translatedMessages/messages";
import { createMessage } from "../../../components/translatedMessages/utils";
import { TGlobalDependencies } from "../../../di/setupBindings";
import { actions } from "../../actions";
import { isEmailAvailablePromise } from "../../auth/email/sagas";
import { TBaseUiData } from "../sagas";
import {
  ECommonWalletRegistrationFlowState,
  TGenericWalletFormValues,
  TLightWalletFormValues,
} from "../types";

/**
 *
 * @generator that is initiated when a user is required to fill in the registration form
 * @param afterRegistrationGenerator A special generator that conducts all the necessary operations once all
 * necessary form checks are done
 *
 * @note `afterRegistrationGenerator` has to return a boolean value depending on if the connection with the wallet
 * was successful or not
 *
 *
 */
export function* registerForm(
  _: TGlobalDependencies,
  {
    afterRegistrationGenerator,
    expectedAction,
    initialFormValues,
    baseUiData,
    userEmail,
  }: {
    afterRegistrationGenerator: (() => Generator<any, unknown, any>) | undefined;
    expectedAction:
      | typeof actions.walletSelector.lightWalletRegisterFormData
      | typeof actions.walletSelector.genericWalletRegisterFormData;
    initialFormValues: TGenericWalletFormValues | TLightWalletFormValues;
    baseUiData: TBaseUiData;
    userEmail?: string;
  },
): Generator<any, void, any> {
  yield put(
    actions.walletSelector.setWalletRegisterData({
      ...baseUiData,
      initialFormValues,
      uiState: ECommonWalletRegistrationFlowState.REGISTRATION_FORM,
    }),
  );
  while (true) {
    const { payload } = yield take(expectedAction);
    yield put(
      actions.walletSelector.setWalletRegisterData({
        uiState: ECommonWalletRegistrationFlowState.REGISTRATION_VERIFYING_EMAIL,
        showWalletSelector: false,
      }),
    );

    const isEmailAvailable = yield neuCall(isEmailAvailablePromise, payload.email);

    if (!isEmailAvailable && userEmail !== payload.email) {
      const error = createMessage(GenericErrorMessage.USER_ALREADY_EXISTS);
      yield put(
        actions.walletSelector.setWalletRegisterData({
          uiState: ECommonWalletRegistrationFlowState.REGISTRATION_EMAIL_VERIFICATION_ERROR,
          errorMessage: error,
          showWalletSelector: true,
          initialFormValues: {
            ...initialFormValues,
            email: payload.email,
          },
        }),
      );
    } else {
      // At this point we should hide the wallet selector
      yield put(
        actions.walletSelector.setWalletRegisterData({
          ...baseUiData,
          showWalletSelector: false,
          uiState: ECommonWalletRegistrationFlowState.REGISTRATION_WALLET_SIGNING,
          initialFormValues: {
            ...initialFormValues,
            ...payload,
          },
        }),
      );

      if (!afterRegistrationGenerator) return;
      const result = yield* call(afterRegistrationGenerator);
      if (result) return;

      yield put(
        actions.walletSelector.setWalletRegisterData({
          ...baseUiData,
          showWalletSelector: true,
          uiState: ECommonWalletRegistrationFlowState.REGISTRATION_FORM,
          initialFormValues: {
            ...initialFormValues,
            email: payload.email,
          },
        }),
      );
    }
  }
}
