import { promisify, toEthereumChecksumAddress } from "@neufund/shared-utils";
import LightWalletProvider from "eth-lightwallet";
import { toChecksumAddress } from "web3-utils";

export const DEFAULT_HD_PATH = "m/44'/60'/0'";

export const createLightWalletWithKeyPair = async (
  password: string,
  seed?: string,
  hdPathString: string = DEFAULT_HD_PATH,
) => {
  // promisify some stuff
  const create = promisify<any>(LightWalletProvider.keystore.createVault);
  // create a new wallet
  const entropyStrength = 256;
  seed = seed ? seed : LightWalletProvider.keystore.generateRandomSeed(undefined, entropyStrength);
  const salt = LightWalletProvider.keystore.generateSalt(32);
  const lightWalletInstance = await create({
    password,
    seedPhrase: seed,
    hdPathString,
    salt,
  });
  // create keypair
  const keyFromPassword = promisify<any>(
    lightWalletInstance.keyFromPassword.bind(lightWalletInstance),
  );
  const walletKey: any = await keyFromPassword(password);
  lightWalletInstance.generateNewAddress(walletKey, 1);
  let address = lightWalletInstance.getAddresses()[0];
  address = toEthereumChecksumAddress(toChecksumAddress(address));
  const privateKey = lightWalletInstance.exportPrivateKey(address, walletKey);
  return { lightWalletInstance, salt, address, privateKey, walletKey };
};
