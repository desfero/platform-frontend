import { EUserType } from "@neufund/shared-modules";
import { assertNever } from "@neufund/shared-utils";
import * as React from "react";
import { compose } from "recompose";

import { selectUserType } from "../../../../modules/auth/selectors";
import { selectIsActionRequiredSettings } from "../../../../modules/notifications/selectors";
import { appConnect } from "../../../../store";
import { InvestorMenu } from "./InvestorMenu";
import { IssuerMenu } from "./IssuerMenu";
import { NomineeMenu } from "./NomineeMenu";

interface IStateProps {
  userType: EUserType;
  actionRequired: boolean;
}

const MenuLayout: React.FunctionComponent<IStateProps> = ({ userType, ...props }) => {
  switch (userType) {
    case EUserType.INVESTOR:
      return <InvestorMenu data-test-id="investor-menu" {...props} />;
    case EUserType.ISSUER:
      return <IssuerMenu data-test-id="issuer-menu" {...props} />;
    case EUserType.NOMINEE:
      return <NomineeMenu data-test-id="nominee-menu" {...props} />;
    default:
      return assertNever(userType);
  }
};

const Menu = compose<IStateProps, {}>(
  appConnect<IStateProps, {}>({
    stateToProps: state => {
      const userType = selectUserType(state);
      if (userType !== undefined) {
        return {
          userType,
          actionRequired: selectIsActionRequiredSettings(state),
        };
      } else {
        throw new Error("user type is invalid");
      }
    },
  }),
)(MenuLayout);

export { Menu, MenuLayout };
