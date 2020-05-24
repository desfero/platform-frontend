import { EUserType } from "@neufund/shared-modules";
import * as React from "react";
import { Redirect, Route } from "react-router-dom";

import { SwitchConnected } from "../../utils/react-connected-components/connectedRouting";
import { KYCAdditionalUpload as KYCBusinessAdditionalUpload } from "./business/AdditionalUpload";
import { KYCAdditionalUpload } from "./personal/AdditionalUpload";
import { kycRoutes } from "./routes";
import { KycSuccess } from "./Success";

interface IStateProps {
  userType?: EUserType;
}

export const KycSubmitedRouter: React.FunctionComponent<IStateProps> = () => (
  <SwitchConnected>
    <Route path={kycRoutes.success} component={KycSuccess} exact />
    <Route path={kycRoutes.individualUpload} component={KYCAdditionalUpload} />
    <Route path={kycRoutes.businessUpload} component={KYCBusinessAdditionalUpload} />

    <Redirect to={kycRoutes.success} />
  </SwitchConnected>
);
