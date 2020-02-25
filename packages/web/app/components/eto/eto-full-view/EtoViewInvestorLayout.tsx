import * as React from "react";

import { TEtoViewData } from "../../../modules/eto-view/shared/types";
import { CoverBanner } from "./shared/cover-banner/CoverBanner";
import { EtoViewLayout } from "./shared/EtoViewLayout";
import { initEtoViewLayout } from "./shared/initEtoViewLayout";

const EtoViewInvestorLayout: React.FunctionComponent<TEtoViewData> = ({
  eto,
  userIsFullyVerified,
  campaignOverviewData,
}) => (
  <EtoViewLayout
    eto={eto}
    userIsFullyVerified={userIsFullyVerified}
    campaignOverviewData={campaignOverviewData}
    publicView={true}
  >
    <CoverBanner
      jurisdiction={eto.product.jurisdiction}
      etoStateOnChain={eto.contract?.timedState}
      etoState={eto.state}
    />
  </EtoViewLayout>
);

const EtoViewInvestor = initEtoViewLayout(EtoViewInvestorLayout);

export { EtoViewInvestorLayout, EtoViewInvestor };
