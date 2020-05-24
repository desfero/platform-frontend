import { IRateOracleAdapter } from "@neufund/shared-modules";
import { BigNumber } from "bignumber.js";
import { providers, Signer } from "ethers";

import { ITokenExchangeRateOracle } from "../../../lib/contracts/ITokenExchangeRateOracle";
import { ITokenExchangeRateOracleFactory } from "../../../lib/contracts/ITokenExchangeRateOracleFactory";

class RateOracleAdapterFactory {
  static connect(
    address: string,
    signerOrProvider: Signer | providers.Provider,
  ): RateOracleAdapter {
    return new RateOracleAdapter(
      ITokenExchangeRateOracleFactory.connect(address, signerOrProvider),
    );
  }
}

/**
 * An adapter for RateOracle to hide implementation differences between web3 and ethers generated contracts interfaces
 */
class RateOracleAdapter implements IRateOracleAdapter {
  readonly address: string;

  constructor(private readonly rateOracleContract: ITokenExchangeRateOracle) {
    this.address = this.rateOracleContract.address;
  }

  async getExchangeRates(
    numeratorTokens: string[],
    denominatorTokens: string[],
  ): Promise<[BigNumber[], BigNumber[]]> {
    const result = await this.rateOracleContract.getExchangeRates(
      numeratorTokens,
      denominatorTokens,
    );

    // convert ethers bignumber to bignumber.js
    // TODO: Replace all instances of Bignumber.js in shared libraries with a custom implementation
    return [
      result[0].map(value => new BigNumber(value.toString())),
      result[1].map(value => new BigNumber(value.toString())),
    ];
  }
}

export { RateOracleAdapterFactory };
