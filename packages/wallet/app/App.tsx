import { assertNever } from "@neufund/shared-utils";
import { NavigationContainer } from "@react-navigation/native";
import React from "react";
import { InteractionManager } from "react-native";
import RNBootSplash from "react-native-bootsplash";

import { AppAuthRouter } from "./AppAuthRouter";
import { AppNoAuthRouter } from "./AppNoAuthRouter";
import { CriticalError } from "./components/CriticalError";
import { SignerModal } from "./components/signer/SignerModal";
import { usePrevious } from "./hooks/usePrevious";
import { EAuthState, authModuleAPI } from "./modules/auth/module";
import { initModuleApi, EInitStatus } from "./modules/init/module";
import { navigationRef } from "./routeUtils";
import { appConnect } from "./store/utils";
import { useTheme } from "./themes/ThemeProvider";

type TStateProps = {
  initStatus: ReturnType<typeof initModuleApi.selectors.selectInitStatus>;
  authState: ReturnType<typeof authModuleAPI.selectors.selectAuthState>;
  authWallet: ReturnType<typeof authModuleAPI.selectors.selectAuthWallet>;
};

type TDispatchProps = {
  init: () => void;
};

type TLayoutProps = TStateProps & TDispatchProps;

const AppRouter: React.FunctionComponent<Pick<TLayoutProps, "authState" | "authWallet">> = ({
  authState,
  authWallet,
}) => {
  switch (authState) {
    case EAuthState.NOT_AUTHORIZED:
    case EAuthState.AUTHORIZING:
      return <AppNoAuthRouter authWallet={authWallet} />;
    case EAuthState.AUTHORIZED:
      return (
        <>
          <AppAuthRouter />

          <SignerModal />
        </>
      );
    default:
      assertNever(authState, "Invalid auth state");
  }
};

const AppLayout: React.FunctionComponent<TLayoutProps> = ({
  init,
  authState,
  authWallet,
  initStatus,
}) => {
  const { navigationTheme } = useTheme();
  const previousInitStatus = usePrevious(initStatus);

  React.useEffect(() => {
    init();
  }, [init]);

  React.useEffect(() => {
    if (previousInitStatus === EInitStatus.IN_PROGRESS) {
      // wait for all interactions to finish before showing app
      // otherwise for a moment a white screen will appear for a user
      InteractionManager.runAfterInteractions(() => {
        RNBootSplash.hide();
      });
    }
  }, [previousInitStatus]);

  switch (initStatus) {
    case EInitStatus.NOT_STARTER:
    case EInitStatus.IN_PROGRESS:
      // We still show launch screen while init is in progress
      return null;
    case EInitStatus.DONE:
      return (
        <NavigationContainer ref={navigationRef} theme={navigationTheme}>
          <AppRouter authState={authState} authWallet={authWallet} />
        </NavigationContainer>
      );
    case EInitStatus.ERROR:
      return <CriticalError />;
    default:
      assertNever(initStatus, "Invalid init status");
  }
};

const App = appConnect<TStateProps, TDispatchProps>({
  stateToProps: state => ({
    initStatus: initModuleApi.selectors.selectInitStatus(state),
    authState: authModuleAPI.selectors.selectAuthState(state),
    authWallet: authModuleAPI.selectors.selectAuthWallet(state),
  }),
  dispatchToProps: dispatch => ({
    init: () => dispatch(initModuleApi.actions.start()),
  }),
})(AppLayout);

export { App };
