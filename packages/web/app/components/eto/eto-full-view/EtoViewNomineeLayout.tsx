import * as React from "react";

import { TEtoViewData } from "../../../modules/eto-view/shared/types";
import { CoverBanner } from "./shared/cover-banner/CoverBanner";
import { EtoViewLayout } from "./shared/EtoViewLayout";
import { initEtoViewLayout } from "./shared/initEtoViewLayout";

const EtoViewNomineeLayout: React.FunctionComponent<TEtoViewData> = ({
  eto,
  userIsFullyVerified,
  campaignOverviewData,
}) => (
  <EtoViewLayout
    eto={eto}
    userIsFullyVerified={userIsFullyVerified}
    campaignOverviewData={campaignOverviewData}
    publicView={false}
  >
    <CoverBanner
      jurisdiction={eto.product.jurisdiction}
      etoState={eto.state}
      etoStateOnChain={eto.contract?.timedState}
    />
  </EtoViewLayout>
);

const EtoViewNominee = initEtoViewLayout(EtoViewNomineeLayout);

export { EtoViewNomineeLayout, EtoViewNominee };
