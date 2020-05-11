import * as React from "react";
import { compose } from "recompose";

import { selectIsUserVerified } from "../../../modules/auth/selectors";
import { TEtoWithCompanyAndContractReadonly } from "../../../modules/eto/types";
import { selectActiveNomineeEto } from "../../../modules/nominee-flow/selectors";
import { appConnect } from "../../../store";
import { AccountSetupContainer } from "./AccountSetupContainer";
import { LinkedNomineeDashboardContainer } from "./LinkedNomineeDashboardContainer";
import { NotLinkedNomineeDashboardContainer } from "./NotLinkedNomineeDashboardContainer";

interface IStateProps {
  verificationIsComplete: boolean;
  nomineeEto: TEtoWithCompanyAndContractReadonly | undefined;
}

const NomineeDashboardContainerBase: React.FunctionComponent<IStateProps> = ({
  verificationIsComplete,
  nomineeEto,
  children,
}) => {
  if (nomineeEto !== undefined) {
    return <LinkedNomineeDashboardContainer children={children} />;
  } else if (!verificationIsComplete) {
    return <AccountSetupContainer children={children} />;
  } else {
    return <NotLinkedNomineeDashboardContainer children={children} />;
  }
};

const NomineeDashboardContainer = compose<IStateProps, {}>(
  appConnect<IStateProps>({
    stateToProps: state => ({
      nomineeEto: selectActiveNomineeEto(state),
      verificationIsComplete: selectIsUserVerified(state),
    }),
  }),
)(NomineeDashboardContainerBase);

export { NomineeDashboardContainer };
