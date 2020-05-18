import { setupContractsModule } from "@neufund/shared-modules";

import { setupBindings } from "./lib/bindings";
import { symbols } from "./lib/symbols";
import { initializeContracts } from "./sagas";

type TModuleConfig = {
  universeContractAddress: string;
};

const MODULE_ID = "wallet:contracts";

const setupWalletContractsModule = (config: TModuleConfig) => {
  const walletContractsModule = {
    id: MODULE_ID,
    libs: [setupBindings(config.universeContractAddress)],
    api: walletContractsModuleApi,
  };

  return [
    setupContractsModule({
      contractsServiceSymbol: symbols.contractsService,
    }),
    walletContractsModule,
  ];
};

const walletContractsModuleApi = {
  symbols,
  sagas: {
    initializeContracts,
  },
};

export { setupWalletContractsModule, walletContractsModuleApi };
