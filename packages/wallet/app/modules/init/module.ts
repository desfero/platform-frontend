import { setupCoreModule, setupTokenPriceModule } from "@neufund/shared-modules";

import { setupAuthModule } from "modules/auth/module";
import { setupWalletContractsModule } from "modules/contracts/module";
import { setupDeviceInformationModule } from "modules/device-information/module";
import { setupWalletEthModule } from "modules/eth/module";
import { setupNotificationUIModule } from "modules/notification-ui/module";
import { setupNotificationsModule } from "modules/notifications/module";
import { setupPermissionsModule } from "modules/permissions/module";
import { setupSignerUIModule } from "modules/signer-ui/module";
import { setupStorageModule } from "modules/storage";
import { setupWalletConnectModule } from "modules/wallet-connect/module";

import { initActions } from "./actions";
import { initReducersMap } from "./reducer";
import { initSaga } from "./sagas";
import { selectInitStatus } from "./selectors";
import { EInitStatus } from "./types";

const MODULE_ID = "wallet:init";

type TConfig = { backendRootUrl: string; rpcUrl: string; universeContractAddress: string };

const setupInitModule = (config: TConfig) => {
  const initModule = {
    id: MODULE_ID,
    reducerMap: initReducersMap,
    sagas: [initSaga],
    api: initModuleApi,
  };

  return [
    setupCoreModule({ backendRootUrl: config.backendRootUrl }),
    setupStorageModule(),
    setupNotificationsModule(),
    setupPermissionsModule(),
    setupDeviceInformationModule(),
    setupWalletEthModule({ rpcUrl: config.rpcUrl }),
    setupSignerUIModule(),
    setupNotificationUIModule(),
    setupWalletConnectModule(),
    setupTokenPriceModule({
      // TODO: When we have a proper block watching flow for mobile app provide proper refresh action
      refreshOnAction: undefined,
    }),
    ...setupAuthModule(),
    ...setupWalletContractsModule({ universeContractAddress: config.universeContractAddress }),
    initModule,
  ];
};

const initModuleApi = {
  actions: initActions,
  selectors: {
    selectInitStatus,
  },
};

export { setupInitModule, initModuleApi, EInitStatus };
