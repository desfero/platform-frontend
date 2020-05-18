import { EUserType } from "@neufund/shared-modules";
import { assertNever } from "@neufund/shared-utils";
import * as React from "react";
import { compose } from "recompose";

import { actions } from "../../../../modules/actions";
import { selectUserType } from "../../../../modules/auth/selectors";
import { selectIsActionRequiredSettings } from "../../../../modules/notifications/selectors";
import { appConnect } from "../../../../store";
import { MenuBase } from "../MenuBase";
import { TMenuEntry } from "../MenuEntry";
import { InvestorMobileMenu } from "./InvestorMobileMenu";
import { IssuerMobileMenu } from "./IssuerMobileMenu";
import { NomineeMobileMenu } from "./NomineeMobileMenu";

import close from "../../../../assets/img/close.svg";
import hamburger from "../../../../assets/img/hamburger.svg";
import * as styles from "./MobileMenu.module.scss";

interface IStateProps {
  userType: EUserType | undefined;
  actionRequired: boolean;
}

interface IDispatchProps {
  logout: () => void;
}

interface IUserType {
  userType: EUserType;
}

interface IMenuDataByUserType {
  menuDataByUserType: TMenuEntry[];
}

interface IMobileMenuExternalProps {
  actionRequired: boolean;
  logout: () => void;
}

const MenuByUserType: React.FunctionComponent<IUserType & IMobileMenuExternalProps> = ({
  userType,
  ...props
}) => {
  switch (userType) {
    case EUserType.INVESTOR:
      return <InvestorMobileMenu data-test-id="investor-menu" {...props} />;
    case EUserType.ISSUER:
      return <IssuerMobileMenu data-test-id="issuer-menu" {...props} />;
    case EUserType.NOMINEE:
      return <NomineeMobileMenu data-test-id="nominee-menu" {...props} />;
    default:
      return assertNever(userType);
  }
};

const MobileMenuLayout: React.FunctionComponent<IUserType & IMobileMenuExternalProps> = props => (
  <MenuBase
    closedElement={<img src={hamburger} alt="menu" />}
    openElement={<img src={close} alt="menu" />}
    className={styles.mobileMenu}
    renderMenu={<MenuByUserType {...props} />}
  />
);

const MobileMenu = compose<IUserType & IMobileMenuExternalProps, {}>(
  appConnect<IStateProps, IDispatchProps>({
    stateToProps: state => {
      const userType = selectUserType(state);
      if (userType !== undefined) {
        return {
          userType,
          actionRequired: selectIsActionRequiredSettings(state),
        };
      } else {
        throw new Error("invalid user type");
      }
    },
    dispatchToProps: dispatch => ({
      logout: () => {
        dispatch(actions.auth.logout());
      },
    }),
  }),
)(MobileMenuLayout);

export { IMenuDataByUserType, IMobileMenuExternalProps, MobileMenuLayout, MobileMenu };
