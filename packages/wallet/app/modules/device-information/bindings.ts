import { TLibSymbolType } from "@neufund/shared-modules";
import { ContainerModule } from "inversify";

import { DeviceInformation } from "./DeviceInformation";
import { symbols } from "./symbols";

export function setupBindings(): ContainerModule {
  return new ContainerModule(bind => {
    bind<TLibSymbolType<typeof symbols.deviceInformation>>(symbols.deviceInformation)
      .to(DeviceInformation)
      .inSingletonScope();
  });
}
