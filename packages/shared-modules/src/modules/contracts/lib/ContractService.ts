import { EthereumAddressWithChecksum } from "@neufund/shared-utils";
import { BigNumber } from "bignumber.js";

import { IERC20TokenAdapter } from "./IERC20TokenAdapter";
import { IICBMLockedAccountAdapter, ILockedAccountAdapter } from "./ILockedAccountAdapter";
import { IRateOracleAdapter } from "./IRateOracleAdapter";

/**
 * An interface syncing ContractsService implementation between platforms (web and mobile)
 */
interface IContractsService {
  /**
   * Special functions (ether balance)
   */
  // TODO: move to new eth module
  balanceOf: (address: EthereumAddressWithChecksum) => Promise<BigNumber>;

  /**
   * Tokens
   */
  neumark: IERC20TokenAdapter;
  etherToken: IERC20TokenAdapter;
  euroToken: IERC20TokenAdapter;

  /**
   * Locked acccounts
   */
  icbmEuroLock: IICBMLockedAccountAdapter;
  icbmEtherLock: IICBMLockedAccountAdapter;
  euroLock: ILockedAccountAdapter;
  etherLock: ILockedAccountAdapter;

  /**
   * Services
   */
  rateOracle: IRateOracleAdapter;
}

export { IContractsService };
