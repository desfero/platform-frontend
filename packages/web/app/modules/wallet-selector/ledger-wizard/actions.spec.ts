import { expectSaga } from "@neufund/sagas/tests";
import { Dictionary } from "@neufund/shared-utils";
import { createMock } from "@neufund/shared-utils/tests";
import { BigNumber } from "bignumber.js";
import { expect } from "chai";
import { spy } from "sinon";

import { TGlobalDependencies } from "../../../di/setupBindings";
import { Neumark } from "../../../lib/contracts/Neumark";
import { ContractsService } from "../../../lib/web3/ContractsService";
import { LedgerWalletConnector } from "../../../lib/web3/ledger-wallet/LedgerConnector";
import { IDerivationPathToAddress } from "../../../lib/web3/ledger-wallet/types";
import { Web3Manager } from "../../../lib/web3/Web3Manager/Web3Manager";
import { TAppGlobalState } from "../../../store";
import { actions } from "../../actions";
import { DEFAULT_DERIVATION_PATH_PREFIX } from "./constants";
import { loadLedgerAccountsEffect } from "./sagas";
import {
  goToNextPageAndLoadData,
  goToPreviousPageAndLoadData,
  setDerivationPathPrefix,
} from "./ui/sagas";

describe("Wallet selector > Ledger wizard > actions", () => {
  describe("loadLedgerAccountsEffect", () => {
    it("should load accounts from ledger connector", async () => {
      const dummyState: Partial<TAppGlobalState> = {
        ledgerWizardState: {
          isInitialConnectionInProgress: false,
          index: 1,
          numberOfAccountsPerPage: 10,
          derivationPathPrefix: "44'/60'/0'/0",
          accounts: [],
          isLoading: false,
          isConnectionEstablished: true,
          advanced: true,
        },
      };
      const expectedAccounts: IDerivationPathToAddress = {
        "44'/60'/0'/1": "0x131213123123",
        "44'/60'/0'/2": "0xab2245c",
      };
      const expectedAccountsToBalancesETH: Dictionary<number> = {
        "0x131213123123": 4,
        "0xab2245c": 15,
      };

      const expectedAccountsToBalancesNEU: Dictionary<number> = {
        "0x131213123123": 40,
        "0xab2245c": 150,
      };

      const ledgerWalletConnectorMock = createMock(LedgerWalletConnector, {
        getMultipleAccountsFromDerivationPrefix: spy(() => expectedAccounts),
      });
      const web3ManagerMock = createMock(Web3Manager, {
        getBalance: (address: string) =>
          Promise.resolve(new BigNumber(expectedAccountsToBalancesETH[address].toString())),
      });

      const contractsMock = createMock(ContractsService, {
        neumark: createMock(Neumark, {
          balanceOf: (address: string) =>
            Promise.resolve(new BigNumber(expectedAccountsToBalancesNEU[address].toString())),
        }),
      });

      await expectSaga(loadLedgerAccountsEffect, {
        ledgerWalletConnector: ledgerWalletConnectorMock as any,
        web3Manager: web3ManagerMock as any,
        contractsService: contractsMock as any,
      } as TGlobalDependencies)
        .withState(dummyState)
        .put(
          actions.walletSelector.setLedgerAccounts(
            [
              {
                address: expectedAccounts["44'/60'/0'/1"],
                balanceETH: expectedAccountsToBalancesETH[
                  expectedAccounts["44'/60'/0'/1"]
                ].toString(),
                balanceNEU: expectedAccountsToBalancesNEU[
                  expectedAccounts["44'/60'/0'/1"]
                ].toString(),
                derivationPath: "44'/60'/0'/1",
              },
              {
                address: expectedAccounts["44'/60'/0'/2"],
                balanceETH: expectedAccountsToBalancesETH[
                  expectedAccounts["44'/60'/0'/2"]
                ].toString(),
                balanceNEU: expectedAccountsToBalancesNEU[
                  expectedAccounts["44'/60'/0'/2"]
                ].toString(),
                derivationPath: "44'/60'/0'/2",
              },
            ],
            DEFAULT_DERIVATION_PATH_PREFIX,
          ),
        )
        .run();

      expect(
        ledgerWalletConnectorMock.getMultipleAccountsFromDerivationPrefix,
      ).to.calledWithExactly(
        dummyState.ledgerWizardState!.derivationPathPrefix,
        dummyState.ledgerWizardState!.index,
        dummyState.ledgerWizardState!.numberOfAccountsPerPage,
      );
    });
  });

  describe("goToNextPageAndLoadDataAction", () => {
    it("should work", () =>
      expectSaga(goToNextPageAndLoadData)
        .put(actions.walletSelector.ledgerWizardAccountsListNextPage())
        .put(actions.walletSelector.ledgerLoadAccounts())
        .run());
  });

  describe("goToPreviousPageAndLoadDataAction", () => {
    it("should work", () =>
      expectSaga(goToPreviousPageAndLoadData)
        .put(actions.walletSelector.ledgerWizardAccountsListPreviousPage())
        .put(actions.walletSelector.ledgerLoadAccounts())
        .run());
  });

  describe("setDerivationPathPrefixAction", () => {
    const newDP = "test";
    const dummyState: Partial<TAppGlobalState> = {
      ledgerWizardState: {
        isInitialConnectionInProgress: false,
        index: 1,
        numberOfAccountsPerPage: 10,
        derivationPathPrefix: DEFAULT_DERIVATION_PATH_PREFIX,
        accounts: [],
        isLoading: false,
        isConnectionEstablished: true,
        advanced: false,
      },
    };

    it("should do not fire when there is no change in derivationPathPrefix", () =>
      expectSaga(
        setDerivationPathPrefix,
        {} as TGlobalDependencies,
        actions.walletSelector.ledgerSetDerivationPathPrefix(DEFAULT_DERIVATION_PATH_PREFIX),
      )
        .withState(dummyState)
        .not.put(actions.walletSelector.ledgerLoadAccounts())
        .not.put(actions.walletSelector.setLedgerWizardDerivationPathPrefix(newDP))
        .run());

    it("should fire when there is change in derivationPathPrefix", () =>
      expectSaga(
        setDerivationPathPrefix,
        {} as TGlobalDependencies,
        actions.walletSelector.ledgerSetDerivationPathPrefix(newDP),
      )
        .withState(dummyState)
        .put(actions.walletSelector.ledgerLoadAccounts())
        .put(actions.walletSelector.setLedgerWizardDerivationPathPrefix(newDP))
        .run());
  });
});
