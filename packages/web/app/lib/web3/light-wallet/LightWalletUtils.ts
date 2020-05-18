import { promisify } from "@neufund/shared-utils";
import { isValid as isMnemonicValid } from "bitcore-mnemonic";
import * as LightWalletProvider from "eth-lightwallet";
import * as ethSig from "eth-sig-util";
import { addHexPrefix, hashPersonalMessage, toBuffer } from "ethereumjs-util";
import * as nacl from "tweetnacl";
import * as naclUtil from "tweetnacl-util";
import * as Web3Utils from "web3-utils";

import { ICreateVault } from "./LightWallet";

export class LightWalletUtilError extends Error {}
export class LightWrongPasswordSaltError extends LightWalletUtilError {}
export class LightCreationError extends LightWalletUtilError {}
export class LightKeyEncryptError extends LightWalletUtilError {}
export class LightDeserializeError extends LightWalletUtilError {}
export class LightWalletWrongMnemonic extends LightWalletUtilError {}

export interface ILightWalletInstance {
  generateNewAddress: (pwDerivedKey: any, n: number) => void;
  serialize: () => string;
  deriveKeyFromPasswordAndSalt: (password: string, salt: string, derkeyLen: number) => Uint8Array;
  keyFromPassword: (password: string) => Uint8Array;
  exportPrivateKey: (address: string, pwDerivedKey: Uint8Array) => string;
  addresses: string[];
  getSeed: (pwDerivedKey: Uint8Array) => string;
  passwordProvider: (callback: any) => any;
  getAddresses: () => string[];
}

export const deserializeLightWalletVault = (
  serializedWallet: string,
  salt: string,
): ILightWalletInstance => {
  try {
    return LightWalletProvider.keystore.deserialize(serializedWallet, salt);
  } catch (e) {
    throw new LightDeserializeError();
  }
};

export const createLightWalletVault = async ({
  password,
  hdPathString,
  recoverSeed,
  customSalt,
}: ICreateVault): Promise<{ serializedLightWallet: string; salt: string }> => {
  try {
    const create = promisify<ILightWalletInstance>(LightWalletProvider.keystore.createVault);
    //256bit strength generates a 24 word mnemonic
    const entropyStrength = 256;
    const seed = recoverSeed
      ? recoverSeed
      : LightWalletProvider.keystore.generateRandomSeed(undefined, entropyStrength);
    //salt strength should be 32 bit. see https://github.com/ConsenSys/eth-lightwallet/blob/master/lib/keystore.js#L107
    const salt = customSalt ? customSalt : LightWalletProvider.keystore.generateSalt(32);
    const lightWalletInstance = await create({
      password,
      seedPhrase: seed,
      hdPathString,
      salt,
    }).catch(e => {
      throw new LightWalletWrongMnemonic(e);
    });
    const unlockedWallet = await getWalletKey(lightWalletInstance, password);
    lightWalletInstance.generateNewAddress(unlockedWallet, 1);
    return { serializedLightWallet: lightWalletInstance.serialize(), salt };
  } catch (e) {
    if (e instanceof LightWalletWrongMnemonic) throw new LightWalletWrongMnemonic();
    throw new LightCreationError();
  }
};

export const encryptString = ({
  string,
  pwDerivedKey,
}: {
  string: string;
  pwDerivedKey: Uint8Array;
}): string => {
  try {
    // nacl.secretbox nonce must be 24 bytes @see https://github.com/dchest/tweetnacl-js#naclsecretboxnoncelength--24
    const encObj = nacl.secretbox(
      naclUtil.decodeUTF8(string),
      pwDerivedKey.slice(32, 56),
      pwDerivedKey.slice(0, 32),
    );
    const encString = Buffer.from(encObj).toString("hex");
    return encString;
  } catch (e) {
    throw new LightKeyEncryptError();
  }
};

export const getWalletKeyFromSaltAndPassword = async (
  salt: string,
  password: string,
  keySize: number = 32,
): Promise<Uint8Array> => {
  try {
    const keyFromSaltAndPassword = promisify<Uint8Array>(
      LightWalletProvider.keystore.deriveKeyFromPasswordAndSalt,
    );
    return keyFromSaltAndPassword(password, salt, keySize);
  } catch (e) {
    throw new LightWrongPasswordSaltError();
  }
};

export const getWalletKey = async (
  lightWalletInstance: ILightWalletInstance,
  password: string,
): Promise<Uint8Array> => {
  try {
    const keyFromPassword = promisify<Uint8Array>(
      lightWalletInstance.keyFromPassword.bind(lightWalletInstance),
    );
    return await keyFromPassword(password);
  } catch (e) {
    throw new LightWrongPasswordSaltError();
  }
};

export const getWalletSeed = async (
  lightWalletInstance: ILightWalletInstance,
  password: string,
): Promise<string> => {
  try {
    const key = await getWalletKey(lightWalletInstance, password);
    return lightWalletInstance.getSeed(key);
  } catch (e) {
    throw new LightWrongPasswordSaltError();
  }
};

export const testWalletPassword = async (
  lightWalletInstance: any,
  password: string,
): Promise<boolean> => {
  const key = await getWalletKey(lightWalletInstance, password);
  return lightWalletInstance.isDerivedKeyCorrect(key);
};

/**
 * A utility method that signs messages from a hd path and seed
 *
 * @param data a string that represents the data that is required to sign
 *
 * @note this method creates a temporary lightwallet that will be used only for the signing the message
 * The light wallet is discarded later on
 */
export const signMessage = async (
  hdPathString: string,
  recoverSeed: string,
  data: string,
): Promise<string> => {
  const customSalt: string = LightWalletProvider.keystore.generateSalt(32);
  const password = LightWalletProvider.keystore.generateSalt(32);

  const { serializedLightWallet: walletInstance } = await createLightWalletVault({
    password,
    hdPathString,
    recoverSeed,
    customSalt,
  });

  const deserializedInstance = deserializeLightWalletVault(walletInstance, customSalt);
  const addresses = deserializedInstance.getAddresses();
  const msgHash = hashPersonalMessage(toBuffer(addHexPrefix(data)));
  const rawSignedMsg = await LightWalletProvider.signing.signMsgHash(
    deserializedInstance,
    await getWalletKey(deserializedInstance, password),
    msgHash.toString("hex"),
    addresses[0],
  );

  return ethSig.concatSig(rawSignedMsg.v, rawSignedMsg.r, rawSignedMsg.s);
};

/**
 * a method that returns a wallets private key
 * @param lightWalletInstance an already initialized lightwallet instance
 *
 * @param password a string that decrypts the instance
 */

export const getWalletPrivKey = async (
  lightWalletInstance: ILightWalletInstance,
  password: string,
): Promise<string> => {
  try {
    const keyFromPassword = promisify<Uint8Array>(
      lightWalletInstance.keyFromPassword.bind(lightWalletInstance),
    );

    // Take first address only
    return lightWalletInstance.exportPrivateKey(
      lightWalletInstance.addresses[0],
      await keyFromPassword(password),
    );
  } catch (e) {
    throw new LightWrongPasswordSaltError();
  }
};

/** a method that returns the first ethereum address from a seed and a derivation path */
export const getWalletAddress = async (
  recoverSeed: string,
  hdPathString: string,
): Promise<string> => {
  try {
    // Take first address only
    const customSalt: string = LightWalletProvider.keystore.generateSalt(32);
    const password = LightWalletProvider.keystore.generateSalt(32);

    const { serializedLightWallet: walletInstance } = await createLightWalletVault({
      password,
      hdPathString,
      recoverSeed,
      customSalt,
    });
    const deserializedVault = deserializeLightWalletVault(walletInstance, customSalt);
    return Web3Utils.toChecksumAddress(`0x${deserializedVault.addresses[0]}`);
  } catch (e) {
    throw new LightWrongPasswordSaltError();
  }
};

export const testWalletSeed = (seed: string): boolean => isMnemonicValid(seed);
