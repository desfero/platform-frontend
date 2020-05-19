import { ECountries, minutesToMs } from "@neufund/shared-utils";

import { EJurisdiction } from "./lib/http/eto-api/EtoProductsApi.interfaces";

export const etoInProgressPollingDelay = minutesToMs(1);
export const etoNormalPollingDelay = minutesToMs(10);

// {USER_JURISDICTION: [Array of jurisdictions that should be hidden]}
export const hiddenJurisdictions: { [key: string]: EJurisdiction[] } = {
  [ECountries.LIECHTENSTEIN]: [EJurisdiction.GERMANY],
};
