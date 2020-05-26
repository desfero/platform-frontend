import { ContainerModule } from "inversify";

import { TLibSymbolType } from "../../types";
import { AnalyticsApi } from "./lib/http/analytics-api/AnalyticsApi";
import { symbols } from "./symbols";

export const setupContainerModule = () =>
  new ContainerModule(bind => {
    bind<TLibSymbolType<typeof symbols.analyticsApi>>(symbols.analyticsApi)
      .to(AnalyticsApi)
      .inSingletonScope();
  });
