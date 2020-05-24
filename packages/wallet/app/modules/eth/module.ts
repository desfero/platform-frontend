import { utils as ethersUtils } from "ethers";

import { setupBindings } from "./lib/bindings";
import {
  ethereumAddress,
  ethereumHdPath,
  ethereumMnemonic,
  ethereumPrivateKey,
} from "./lib/schemas";
import { symbols } from "./lib/symbols";
import { isAddress, isMnemonic, isPrivateKey } from "./lib/utils";

type TEthModuleConfig = {
  rpcUrl: string;
};

const MODULE_ID = "wallet:eth";

const utils = {
  isAddress,
  isMnemonic,
  isPrivateKey,
  ethereumAddress,
  ethereumHdPath,
  ethereumPrivateKey,
  ethereumMnemonic,
  BigNumber: ethersUtils.BigNumber,
};

const setupWalletEthModule = (config: TEthModuleConfig) => ({
  id: MODULE_ID,
  libs: [setupBindings(config.rpcUrl)],
  api: walletEthModuleApi,
});

const walletEthModuleApi = {
  symbols,
  utils,
};

export { setupWalletEthModule, walletEthModuleApi };
