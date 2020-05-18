import {
  createLightWalletVault,
  deserializeLightWalletVault,
  getWalletKey,
} from "../../lib/web3/light-wallet/LightWalletUtils";

interface ISeedAndAddressGenerator {
  seed: string[];
  address: string;
}

export const generateRandomSeedAndAddress = async (
  hdPath: string,
  password: string = "testPass",
): Promise<ISeedAndAddressGenerator> => {
  const serializedLightWallet = await createLightWalletVault({
    password,
    hdPathString: hdPath,
  });

  const deserializedInstance = deserializeLightWalletVault(
    serializedLightWallet.serializedLightWallet,
    serializedLightWallet.salt,
  );

  const fetchedSeed = deserializedInstance.getSeed(
    await getWalletKey(deserializedInstance, password),
  );
  const fetchedAddress = deserializedInstance.getAddresses();

  return {
    seed: fetchedSeed.split(" "),
    address: fetchedAddress[0],
  };
};
