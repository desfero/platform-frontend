import { EthereumHDPath } from "@neufund/shared-utils";
import isString from "lodash/fp/isString";
import * as yup from "yup";

import { StorageSchema } from "modules/storage";

import { oneOfSchema, singleValue, typedValue } from "utils/yupSchemas";

import { TSecureReference } from "./SecureStorage";
import { EWalletType } from "./types";
import { isAddress, isChecksumAddress, isMnemonic, isPrivateKey } from "./utils";

/**
 * A typed schema to validate secure reference
 */
const secureReference = () =>
  typedValue((value: unknown): value is TSecureReference => isString(value));

/**
 * A typed schema to validate eth address
 */
const ethereumAddressNoChecksum = () => typedValue(isAddress);

/**
 * A typed schema to validate eth address
 */
const ethereumAddress = () => typedValue(isChecksumAddress);

/**
 * A typed schema to validate hd path
 */
const ethereumHdPath = () =>
  typedValue((value: unknown): value is EthereumHDPath => isString(value));

/**
 * A typed schema to validate hd mnemonic
 */
const ethereumMnemonic = () => typedValue(isMnemonic);

/**
 * A typed schema to validate private key
 */
const ethereumPrivateKey = () => typedValue(isPrivateKey);

const HDWalletMetadataSchema = yup.object({
  type: singleValue<EWalletType.HD_WALLET>(EWalletType.HD_WALLET).required(),
  address: ethereumAddress().required(),
  name: yup.string().notRequired(),
  derivationPath: ethereumHdPath().required(),
  mnemonicReference: secureReference().required(),
  privateKeyReference: secureReference().required(),
});

const PrivateKeyWalletMetadataSchema = yup.object({
  type: singleValue<EWalletType.PRIVATE_KEY_WALLET>(EWalletType.PRIVATE_KEY_WALLET).required(),
  address: ethereumAddress().required(),
  name: yup.string().notRequired(),
  privateKeyReference: secureReference().required(),
});

export type THDWalletMetadata = yup.InferType<typeof HDWalletMetadataSchema>;

export type TPrivateKeyWalletMetadata = yup.InferType<typeof PrivateKeyWalletMetadataSchema>;

export type TWalletMetadata = THDWalletMetadata | TPrivateKeyWalletMetadata;

const WalletMetadataSchema = oneOfSchema([HDWalletMetadataSchema, PrivateKeyWalletMetadataSchema]);

const WalletMetadataStorageSchema = new StorageSchema<TWalletMetadata>(
  1,
  "WalletSchema",
  WalletMetadataSchema,
);

export {
  WalletMetadataStorageSchema,
  ethereumAddress,
  ethereumAddressNoChecksum,
  ethereumHdPath,
  ethereumPrivateKey,
  ethereumMnemonic,
};
