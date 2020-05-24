import { createStore, getSagaExtension } from "@neufund/sagas";
import { getLoadContextExtension } from "@neufund/shared-modules";
import { Container } from "inversify";
import Config from "react-native-config";

import { setupInitModule } from "../modules/init/module";
import { TAppGlobalState } from "./types";

export const createAppStore = (container: Container) => {
  // TODO: Take universe address from artifacts meta.json
  const UNIVERSE_ADDRESS = "0x9bad13807cd939c7946008e3772da819bd98fa7b";

  const config: Parameters<typeof setupInitModule>[0] = {
    backendRootUrl: Config.NF_BACKEND_URL,
    rpcUrl: Config.NF_NODE_RPC_URL,
    universeContractAddress: UNIVERSE_ADDRESS,
  };

  const appModule = setupInitModule(config);

  const context: { container: Container } = {
    container,
  };

  return createStore<TAppGlobalState>(
    {
      extensions: [getLoadContextExtension(context.container), getSagaExtension(context)],
    },
    ...appModule,
  );
};
