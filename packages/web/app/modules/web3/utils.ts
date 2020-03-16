import {
  compareBigNumbers,
  convertToUlps,
  ERoundingMode,
  ETH_DECIMALS,
  ETHEREUM_ADDRESS_LENGTH,
  EthereumAddress,
  EthereumAddressWithChecksum,
  EthereumNetworkId,
  formatMoney,
} from "@neufund/shared";
import { isAddress, randomHex, toChecksumAddress } from "web3-utils";

import { TBigNumberVariants } from "../../lib/web3/types";

export function makeEthereumAddressChecksummed(
  ethereumAddress: EthereumAddress,
): EthereumAddressWithChecksum {
  return toChecksumAddress(ethereumAddress) as EthereumAddressWithChecksum;
}

export const generateRandomEthereumAddress = () => randomHex(ETHEREUM_ADDRESS_LENGTH / 2);
export const generateRandomPrivateKey = () => randomHex(32);

// remove 0x prefix from private key
export const remove0x = (key: string) => key.slice(2).toUpperCase();

export function ethereumNetworkIdToNetworkName(networkId: EthereumNetworkId): string {
  switch (networkId) {
    case "0":
      return "Dev";
    case "1":
      return "Mainnet";
    case "2":
      return "Morden";
    case "3":
      return "Ropsten";
    case "4":
      return "Rinkeby";
    default:
      return "Unknown";
  }
}

export const isAddressValid = (value: string): value is EthereumAddress =>
  !!(value && isAddress(value));

export const doesUserHaveEnoughEther = (
  value: TBigNumberVariants,
  maxEther: TBigNumberVariants,
): boolean => {
  if (value === "") return false;
  return compareBigNumbers(convertToUlps(value || "0"), maxEther) < 0;
};

export const doesUserHaveEnoughNEuro = (
  value: TBigNumberVariants,
  maxNEuro: TBigNumberVariants,
): boolean => {
  if (value === "") return false;
  const formattedMax = formatMoney(maxNEuro, ETH_DECIMALS, 2, ERoundingMode.DOWN);

  return compareBigNumbers(convertToUlps(value || "0"), convertToUlps(formattedMax)) <= 0;
};

export const doesUserWithdrawMinimal = (
  value: TBigNumberVariants,
  minNEuro: TBigNumberVariants,
): boolean => {
  if (value === "") return false;
  return compareBigNumbers(convertToUlps(value || "0"), minNEuro) >= 0;
};
