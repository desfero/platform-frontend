import {
  TBookbuildingStatsType,
  TCompanyEtoData,
  TEtoSpecsData,
} from "../../lib/api/eto/EtoApi.interfaces.unsafe";
import { TEtoProducts } from "../../lib/api/eto/EtoProductsApi.interfaces";

export interface IEtoFlowState {
  eto: TEtoSpecsData | undefined;
  company: TCompanyEtoData | undefined;
  products?: TEtoProducts;
  loading: boolean;
  saving: boolean;
  bookbuildingStats: TBookbuildingStatsType[];
  newStartDate?: Date;
  etoDateSaving: boolean;
}

