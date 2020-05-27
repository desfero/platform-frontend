import { walletEthModuleApi } from "modules/eth/module";

import { EImportPhrase, UNSUPPORTED_IMPORT_PHRASE } from "./types";

const parseImportPhrase = (importPhrase: string) => {
  if (walletEthModuleApi.utils.isPrivateKey(importPhrase)) {
    return EImportPhrase.PRIVATE_KEY;
  }

  if (walletEthModuleApi.utils.isMnemonic(importPhrase)) {
    return EImportPhrase.MNEMONICS;
  }

  return UNSUPPORTED_IMPORT_PHRASE;
};

export { parseImportPhrase };
