import { EUserType, EWalletType } from "@neufund/shared-modules";
import { assertNever } from "@neufund/shared-utils";
import { RouterState } from "connected-react-router";
import * as queryString from "query-string";
import * as React from "react";
import { Redirect, Route } from "react-router-dom";
import { branch, compose, renderComponent } from "recompose";

import { selectIsAuthorized, selectUserType } from "../../../modules/auth/selectors";
import { selectWalletTypeFromQueryString } from "../../../modules/routing/selectors";
import { appConnect } from "../../../store";
import { appRoutes } from "../../appRoutes";
import { walletLoginRoutes } from "../../wallet-selector/WalletSelectorLogin/wallet-routes";

interface IStateProps {
  isAuthorized: boolean;
  userType?: EUserType;
  walletType: EWalletType;
  routerState: RouterState;
}

interface IExternalProps {
  path: string;
  exact?: boolean;
  investorComponent?: React.ElementType;
  issuerComponent?: React.ElementType;
  nomineeComponent?: React.ElementType;
}

interface IComponentProps {
  walletType: EWalletType;
  userType: EUserType;
  routerState: RouterState;
}

interface ISelectComponent {
  userType: EUserType;
  investorComponent?: React.ElementType;
  issuerComponent?: React.ElementType;
  nomineeComponent?: React.ElementType;
}

type TProps = IExternalProps & IStateProps;

const selectRouteBasedOnWalletType = (walletType: EWalletType): string => {
  switch (walletType) {
    case EWalletType.LEDGER:
      return walletLoginRoutes.ledger;
    case EWalletType.BROWSER:
      return walletLoginRoutes.browser;
    default:
      return walletLoginRoutes.light;
  }
};

const OnlyAuthorizedRouteRedirectionComponent: React.FunctionComponent<TProps> = ({
  walletType,
  routerState,
  ...rest
}) => {
  const redirectionPath = {
    pathname: selectRouteBasedOnWalletType(walletType),
    search: queryString.stringify({
      redirect: routerState.location.pathname + routerState.location.search,
    }),
  };

  return <Route {...rest} render={() => <Redirect to={redirectionPath} />} />;
};

const selectComponent = ({
  userType,
  investorComponent: InvestorComponent,
  issuerComponent: IssuerComponent,
  nomineeComponent: NomineeComponent,
}: ISelectComponent): React.ElementType | undefined => {
  switch (userType) {
    case EUserType.INVESTOR:
      return InvestorComponent;
    case EUserType.ISSUER:
      return IssuerComponent;
    case EUserType.NOMINEE:
      return NomineeComponent;
    default:
      return assertNever(userType);
  }
};

/**
 * This component will only attempt to redirect on entering the route. So when user gets logged in you need to trigger redirection on your own.
 */
const OnlyAuthorizedRouteComponent: React.FunctionComponent<IComponentProps &
  IExternalProps> = props => {
  const Component = selectComponent(props);

  return (
    <Route
      {...props}
      render={routeProps =>
        Component ? <Component {...routeProps} /> : <Redirect to={appRoutes.dashboard} />
      }
    />
  );
};

export const OnlyAuthorizedRoute = compose<IComponentProps & IExternalProps, IExternalProps>(
  appConnect<IStateProps, {}, IExternalProps>({
    stateToProps: state => ({
      isAuthorized: selectIsAuthorized(state),
      userType: selectUserType(state),
      walletType: selectWalletTypeFromQueryString(state),
      routerState: state.router,
    }),
  }),
  branch<IStateProps>(
    (props: IStateProps) => !props.isAuthorized,
    renderComponent(OnlyAuthorizedRouteRedirectionComponent),
  ),
)(OnlyAuthorizedRouteComponent);
