import { ContainerModule } from "inversify";

import { TLibSymbolType, TModuleState } from "../../types";
import { generateSharedModuleId } from "../../utils";
import { etoActions } from "./actions";
import { EtoApi } from "./lib/http/eto-api/EtoApi";
import { EtoFileApi } from "./lib/http/eto-api/EtoFileApi";
import { EtoNomineeApi } from "./lib/http/eto-api/EtoNomineeApi";
import { EtoPledgeApi } from "./lib/http/eto-api/EtoPledgeApi";
import { EtoProductApi } from "./lib/http/eto-api/EtoProductApi";
import { etoReducerMap } from "./reducer";
import { setupEtoSagas } from "./sagas";
import * as selectors from "./selectors";
import { symbols } from "./symbols";
export * from "./messages";

const MODULE_ID = generateSharedModuleId("eto");

const setupContainerModule = () =>
  new ContainerModule(bind => {
    bind<TLibSymbolType<typeof symbols.etoApi>>(symbols.etoApi)
      .to(EtoApi)
      .inSingletonScope();

    bind<TLibSymbolType<typeof symbols.etoPledgeApi>>(symbols.etoPledgeApi)
      .to(EtoPledgeApi)
      .inSingletonScope();

    bind<TLibSymbolType<typeof symbols.etoProductApi>>(symbols.etoProductApi)
      .to(EtoProductApi)
      .inSingletonScope();

    bind<TLibSymbolType<typeof symbols.etoFileApi>>(symbols.etoFileApi)
      .to(EtoFileApi)
      .inSingletonScope();

    bind<TLibSymbolType<typeof symbols.etoNomineeApi>>(symbols.etoNomineeApi)
      .to(EtoNomineeApi)
      .inSingletonScope();
  });

const setupEtoModule = () => {
  const module = {
    id: MODULE_ID,
    api: etoApi,
    libs: [setupContainerModule()],
    sagas: [setupEtoSagas()],
    reducerMap: etoReducerMap,
  };
  return module;
};

const etoApi = {
  actions: etoActions,
  selectors,
};

export { setupEtoModule, etoApi };

export type TEtoModuleState = TModuleState<typeof setupEtoModule>;
