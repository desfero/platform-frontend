import { ILockedAccountAdapter } from "@neufund/shared-modules";
import { BigNumber } from "bignumber.js";
import { providers, Signer } from "ethers";

import { LockedAccount } from "lib/contracts/LockedAccount";
import { LockedAccountFactory } from "lib/contracts/LockedAccountFactory";

class LockedAccountAdapterFactory {
  static connect(
    address: string,
    signerOrProvider: Signer | providers.Provider,
  ): LockedAccountAdapter {
    return new LockedAccountAdapter(LockedAccountFactory.connect(address, signerOrProvider));
  }
}

/**
 * An adapter for ERC20 Tokens to hide implementation differences between web3 and ethers generated contracts interfaces
 */
class LockedAccountAdapter implements ILockedAccountAdapter {
  readonly address: string;

  constructor(private readonly accountContract: LockedAccount) {
    this.address = accountContract.address;
  }

  async balanceOf(address: string): Promise<[BigNumber, BigNumber, BigNumber]> {
    const result = await this.accountContract.balanceOf(address);
    return [
      new BigNumber(result[0].toString()),
      new BigNumber(result[1].toString()),
      new BigNumber(result[2].toString()),
    ];
  }
}

export { LockedAccountAdapterFactory };
