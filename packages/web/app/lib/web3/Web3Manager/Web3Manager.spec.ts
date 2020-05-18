import { EWalletSubType, EWalletType, noopLogger } from "@neufund/shared-modules";
import { createMock } from "@neufund/shared-utils/tests";
import { expect } from "chai";
import { spy } from "sinon";
import * as Web3 from "web3";

import {
  dummyConfig,
  dummyEthereumAddressWithChecksum,
  dummyNetworkId,
} from "../../../../test/fixtures";
import { ILedgerWalletMetadata } from "../../../modules/web3/types";
import { LedgerWallet } from "../ledger-wallet/LedgerWallet";
import { EWeb3ManagerEvents, Web3Manager } from "./Web3Manager";

describe("Web3Manager", () => {
  const expectedNetworkId = dummyNetworkId;

  it("should plug personal wallet when connection works", async () => {
    const expectedDerivationPath = "44'/60'/0'/1";
    const pluggedListener = spy();
    const ledgerWalletMock = createMock(LedgerWallet, {
      ethereumAddress: dummyEthereumAddressWithChecksum,
      testConnection: async () => true,
      walletType: EWalletType.LEDGER,
      walletSubType: EWalletSubType.UNKNOWN,
      derivationPath: expectedDerivationPath,
      getMetadata: (): ILedgerWalletMetadata => ({
        walletType: EWalletType.LEDGER,
        walletSubType: EWalletSubType.UNKNOWN,
        derivationPath: expectedDerivationPath,
        address: dummyEthereumAddressWithChecksum,
        salt: undefined,
        email: undefined,
      }),
      isUnlocked: () => true,
    });

    const web3FactoryMock = (...args: any[]) => new Web3(...args);

    const web3Manager = new Web3Manager(dummyConfig.ethereumNetwork, noopLogger, web3FactoryMock);
    web3Manager.networkId = expectedNetworkId;
    web3Manager.on(EWeb3ManagerEvents.NEW_PERSONAL_WALLET_PLUGGED, pluggedListener);

    await web3Manager.plugPersonalWallet(ledgerWalletMock);

    expect(web3Manager.personalWallet).to.be.eq(ledgerWalletMock);
    expect(pluggedListener).to.be.calledWithExactly({
      metaData: {
        address: dummyEthereumAddressWithChecksum,
        walletType: EWalletType.LEDGER,
        walletSubType: EWalletSubType.UNKNOWN,
        derivationPath: expectedDerivationPath,
        salt: undefined,
        email: undefined,
      },
      isUnlocked: true,
    });
  });
});
