import { EUserType } from "@neufund/shared-modules";
import { assertNever, nonNullable } from "@neufund/shared-utils";
import * as React from "react";
import { Redirect, Route } from "react-router-dom";

import { selectUserType } from "../../modules/auth/selectors";
import { appConnect } from "../../store";
import { SwitchConnected } from "../../utils/react-connected-components/connectedRouting";
import { KYCBeneficialOwners } from "./business/BeneficialOwners";
import { KycBusinessData } from "./business/BusinessData";
import { KycLegalRepresentative } from "./business/LegalRepresentative";
import { ManagingDirectors } from "./business/ManagingDirectors";
import { KYCPersonalAddress } from "./personal/Address";
import { KycPersonalDocumentVerification } from "./personal/DocumentVerification";
import { KYCFinancialDisclosure } from "./personal/FinancialDisclosure";
import { KYCPersonalStart } from "./personal/Start";
import { KYCPersonalUpload } from "./personal/Upload";
import { kycRoutes } from "./routes";
import { KYCStart } from "./start/Start";
import { KycSuccess } from "./Success";
import { isManualVerificationEnabled } from "./utils";

interface IStateProps {
  userType: EUserType;
}

export const NormalKycRouter: React.FunctionComponent = () => (
  <SwitchConnected>
    <Route path={kycRoutes.start} component={KYCStart} exact />
    <Route path={kycRoutes.success} component={KycSuccess} exact />

    {/* Personal */}
    <Route path={kycRoutes.individualStart} component={KYCPersonalStart} />
    <Route path={kycRoutes.individualAddress} component={KYCPersonalAddress} />
    <Route path={kycRoutes.financialDisclosure} component={KYCFinancialDisclosure} />
    <Route
      path={kycRoutes.individualDocumentVerification}
      component={KycPersonalDocumentVerification}
    />
    {isManualVerificationEnabled() && (
      <Route path={kycRoutes.individualUpload} component={KYCPersonalUpload} />
    )}

    {/* Business */}
    <Route path={kycRoutes.businessData} component={KycBusinessData} />
    <Route path={kycRoutes.managingDirectors} component={ManagingDirectors} />
    <Route path={kycRoutes.beneficialOwners} component={KYCBeneficialOwners} />
    <Route path={kycRoutes.legalRepresentative} component={KycLegalRepresentative} />

    <Redirect to={kycRoutes.start} />
  </SwitchConnected>
);

export const EtoKycRouter: React.FunctionComponent = () => (
  <SwitchConnected>
    <Route path={kycRoutes.start} component={KycBusinessData} exact />

    {/* Business Only*/}
    <Route path={kycRoutes.businessData} component={KycBusinessData} />
    <Route path={kycRoutes.managingDirectors} component={ManagingDirectors} />
    <Route path={kycRoutes.beneficialOwners} component={KYCBeneficialOwners} />
    <Route path={kycRoutes.legalRepresentative} component={KycLegalRepresentative} />

    <Redirect to={kycRoutes.legalRepresentative} />
  </SwitchConnected>
);

export const KycRouterComponent: React.FunctionComponent<IStateProps> = ({ userType }) => {
  switch (userType) {
    case EUserType.INVESTOR:
      return <NormalKycRouter />;
    case EUserType.ISSUER:
    case EUserType.NOMINEE:
      return <EtoKycRouter />;
    default:
      assertNever(userType, "Unknown user type");
  }
};

export const KycRouter = appConnect<IStateProps, {}>({
  stateToProps: s => ({
    userType: nonNullable(selectUserType(s)),
  }),
})(KycRouterComponent);
