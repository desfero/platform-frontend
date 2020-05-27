import { IERC20TokenAdapter } from "@neufund/shared-modules";
import { BigNumber } from "bignumber.js";
import { providers, Signer } from "ethers";

import { IERC20Token } from "lib/contracts/IERC20Token";
import { IERC20TokenFactory } from "lib/contracts/IERC20TokenFactory";

class ERC20TokenAdapterFactory {
  static connect(
    address: string,
    signerOrProvider: Signer | providers.Provider,
  ): ERC20TokenAdapter {
    return new ERC20TokenAdapter(IERC20TokenFactory.connect(address, signerOrProvider));
  }
}

/**
 * An adapter for ERC20 Tokens to hide implementation differences between web3 and ethers generated contracts interfaces
 */
class ERC20TokenAdapter implements IERC20TokenAdapter {
  readonly address: string;

  constructor(private readonly tokenContract: IERC20Token) {
    this.address = tokenContract.address;
  }

  async balanceOf(address: string): Promise<BigNumber> {
    const result = await this.tokenContract.balanceOf(address);
    return new BigNumber(result.toString());
  }
}

export { ERC20TokenAdapterFactory };
