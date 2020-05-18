import { EthereumAddressWithChecksum } from "@neufund/shared-utils";

enum EImportPhrase {
  PRIVATE_KEY = "private_key",
  MNEMONICS = "mnemonics",
}

const UNSUPPORTED_IMPORT_PHRASE = "unsupported" as const;

/**
 * A reduced version of Eth wallet metadata to have only what we need to show on UI during auth flow
 */
export type TAuthWalletMetadata = {
  /**
   * `name` represent a user defined custom wallet name (now only stores fixture name)
   */
  name: string | undefined;
  address: EthereumAddressWithChecksum;
};

export { EImportPhrase, UNSUPPORTED_IMPORT_PHRASE };
