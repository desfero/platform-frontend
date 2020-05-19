import { createLibSymbol } from "../../utils";
import { EtoApi } from "./lib/http/eto-api/EtoApi";
import { EtoFileApi } from "./lib/http/eto-api/EtoFileApi";
import { EtoNomineeApi } from "./lib/http/eto-api/EtoNomineeApi";
import { EtoPledgeApi } from "./lib/http/eto-api/EtoPledgeApi";
import { EtoProductApi } from "./lib/http/eto-api/EtoProductApi";

export const symbols = {
  etoApi: createLibSymbol<EtoApi>("etoApi"),
  etoPledgeApi: createLibSymbol<EtoPledgeApi>("etoPledgeApi"),
  etoProductApi: createLibSymbol<EtoProductApi>("etoProductApi"),
  etoFileApi: createLibSymbol<EtoFileApi>("etoFileApi"),
  etoNomineeApi: createLibSymbol<EtoNomineeApi>("etoNomineeApi"),
};
