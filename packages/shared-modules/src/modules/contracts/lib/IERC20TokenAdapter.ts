import { BigNumber } from "bignumber.js";

import { IBasicContractAdapter } from "./IBasicContractAdapter";

/**
 * An adapter interface for ERC 20 Tokens contracts.
 * Given that interfaces between web3 and ethers.js are incompatible
 * an adapter is provided to align them to be used in shared code
 */
interface IERC20TokenAdapter extends IBasicContractAdapter {
  balanceOf(address: string): Promise<BigNumber>;
}

export { IERC20TokenAdapter };
