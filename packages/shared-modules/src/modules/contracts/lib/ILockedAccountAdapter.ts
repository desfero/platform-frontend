import { BigNumber } from "bignumber.js";

import { IBasicContractAdapter } from "./IBasicContractAdapter";

/**
 * An adapter interface for all Locked Account contract.
 * Given that interfaces between web3 and ethers.js are incompatible
 * an adapter is provided to align them to be used in shared code
 */
interface ILockedAccountAdapter extends IBasicContractAdapter {
  balanceOf(address: string): Promise<[BigNumber, BigNumber, BigNumber]>;
}

interface IICBMLockedAccountAdapter extends ILockedAccountAdapter {
  readonly currentMigrationTarget: Promise<string>;
}

export { ILockedAccountAdapter, IICBMLockedAccountAdapter };
