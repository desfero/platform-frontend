import { ECurrency } from "@neufund/shared";

import { TGlobalDependencies } from "../../di/setupBindings";

export function* getTokenAddress(
  { contractsService }: TGlobalDependencies,
  token: ECurrency,
): Generator<any, any, any> {
  switch (token) {
    case ECurrency.ETH:
      return contractsService.etherToken.address;
    case ECurrency.EUR_TOKEN:
      return contractsService.euroToken.address;
    case ECurrency.NEU:
      return contractsService.neumark.address;
    default:
      throw new Error(`Unsupported ${token} token`);
  }
}
