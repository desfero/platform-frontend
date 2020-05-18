import {
  EquityToken,
  EthereumAddress,
  EthereumAddressWithChecksum,
  EthereumHDMnemonic,
  EthereumHDPath,
  EthereumPrivateKey,
} from "./types";

const toEquityTokenSymbol = (symbol: string) => symbol as EquityToken;

/**
 * @deprecated Prefer always checksum address for consistency (`toEthereumChecksumAddress` method).
 * @todo When we migrate to checksum address rename method to `toEthereumAddressNoChecksum` and `toEthereumChecksumAddress` to `toEthereumAddress`
 */
const toEthereumAddress = (address: string) => address as EthereumAddress;

const toEthereumChecksumAddress = (address: string) => address as EthereumAddressWithChecksum;

const toEthereumHDPath = (path: string) => path as EthereumHDPath;

const toEthereumPrivateKey = (privateKey: string) => privateKey as EthereumPrivateKey;

const toEthereumHDMnemonic = (mnemonic: string) => mnemonic as EthereumHDMnemonic;

export {
  toEquityTokenSymbol,
  toEthereumAddress,
  toEthereumHDPath,
  toEthereumPrivateKey,
  toEthereumHDMnemonic,
  toEthereumChecksumAddress,
};
