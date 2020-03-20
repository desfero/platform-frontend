import { expectSaga } from "@neufund/sagas/tests";
import { convertToUlps, divideBigNumbers, multiplyBigNumbers, Q18 } from "@neufund/shared";
import BigNumber from "bignumber.js";
import { omit } from "lodash/fp";
import { getContext } from "redux-saga-test-plan/matchers";

import { testCompany, testContract, testEto } from "../../../test/fixtures";
import { EUserType } from "../../lib/api/users/interfaces";
import { actions } from "../actions";
import { loadEtos } from "./sagas";
import { EETOStateOnChain, TEtoContractData } from "./types";

const tokenData = {
  balance: new BigNumber("123"),
  tokensPerShare: new BigNumber("1"),
  totalCompanyShares: new BigNumber("112"),
  companyValuationEurUlps: new BigNumber("123"),
};

const commitmentContractData = {
  timedState: new BigNumber(testContract.timedState.toString()),
  totalInvestment: () => [
    new BigNumber(testContract.totalInvestment.totalEquivEurUlps.toString()),
    new BigNumber(testContract.totalInvestment.totalTokensInt.toString()),
    new BigNumber(testContract.totalInvestment.totalInvestors.toString()),
  ],
  startOfStates: [
    new BigNumber("0"),
    new BigNumber(testContract.startOfStates[1].getTime().toString()).div("1000"),
    new BigNumber(testContract.startOfStates[2].getTime().toString()).div("1000"),
    new BigNumber(testContract.startOfStates[3].getTime().toString()).div("1000"),
    new BigNumber(testContract.startOfStates[4].getTime().toString()).div("1000"),
    new BigNumber(testContract.startOfStates[5].getTime().toString()).div("1000"),
    new BigNumber("0"),
  ],
  equityToken: testContract.equityTokenAddress,
  etoTerms: testContract.etoTermsAddress,
};

const globalDependencies = {
  logger: {
    info: (_: string) => {},
    error: (_: string) => {},
  },
  notificationCenter: {
    error: (_: string) => {},
  },
  apiEtoService: {
    getEtos: (_: string) => [testEto],
  },
  contractsService: {
    getEquityToken: (_: string) => ({
      balanceOf: (_1: string) => tokenData.balance,
      tokensPerShare: tokenData.tokensPerShare,
      tokenController: "",
      shareNominalValueUlps: new BigNumber("123"),
    }),
    getControllerGovernance: (_: string) => ({
      shareholderInformation: () => [
        tokenData.totalCompanyShares,
        tokenData.companyValuationEurUlps,
      ],
    }),
    getTokenController: (_: string) => ({
      onTransfer: (_1: string, _2: string, _3: string, _4: BigNumber) => true,
    }),
    getETOCommitmentContract: (_: string) => commitmentContractData,
    etherToken: {
      balanceOf: (_: string) => new BigNumber(testContract.totalInvestment.etherTokenBalance),
    },
    euroToken: {
      balanceOf: (_: string) => new BigNumber(testContract.totalInvestment.euroTokenBalance),
    },
  },
} as any;

const etosByPreviewCode = {
  [testEto.previewCode]: omit("company", testEto),
};

describe("loadEtos", () => {
  it("should work", () => {
    expectSaga(loadEtos, globalDependencies)
      .provide([[getContext("deps"), globalDependencies]])
      .withState({
        kyc: {
          individualData: {
            country: undefined,
          },
        },
        auth: {
          user: {
            type: EUserType.ISSUER,
          },
        },
      })
      .put(actions.bookBuilding.loadBookBuildingListStats([testEto.etoId]))
      .put(
        actions.eto.setEtoDataFromContract(
          testEto.previewCode,
          testEto.contract as TEtoContractData,
        ),
      )
      // Should not load investor ticket for not INVESTOR user type
      .not.put(actions.investorEtoTicket.loadInvestorTickets(etosByPreviewCode))
      .put(
        actions.eto.setEtos({
          etos: etosByPreviewCode,
          companies: { [testCompany.companyId]: testEto.company },
        }),
      )
      .put(actions.eto.setEtosDisplayOrder([testEto.previewCode]))
      .run();
  });

  it("should load investor ticket for investor", () => {
    expectSaga(loadEtos, globalDependencies)
      .provide([[getContext("deps"), globalDependencies]])
      .withState({
        kyc: {
          individualData: {
            country: undefined,
          },
        },
        auth: {
          user: {
            type: EUserType.INVESTOR,
          },
        },
      })
      .put(actions.bookBuilding.loadBookBuildingListStats([testEto.etoId]))
      .put(
        actions.eto.setEtoDataFromContract(
          testEto.previewCode,
          testEto.contract as TEtoContractData,
        ),
      )
      .put(actions.investorEtoTicket.loadInvestorTickets(etosByPreviewCode))
      .put(
        actions.eto.setEtos({
          etos: etosByPreviewCode,
          companies: { [testCompany.companyId]: testEto.company },
        }),
      )
      .put(actions.eto.setEtosDisplayOrder([testEto.previewCode]))
      .run();
  });

  it("should load token data for investor with eto in claim state", () => {
    const deps = {
      ...globalDependencies,
      contractsService: {
        ...globalDependencies.contractsService,
        getETOCommitmentContract: (_: string) => ({
          ...commitmentContractData,
          timedState: new BigNumber(EETOStateOnChain.Claim.toString()),
        }),
      },
    };

    const etoInClaim = {
      ...testEto,
      contract: {
        ...testEto.contract,
        timedState: EETOStateOnChain.Claim,
      },
    };

    const tokenDataProcessed = {
      balance: tokenData.balance.toString(),
      tokensPerShare: tokenData.tokensPerShare.toString(),
      companyValuationEurUlps: tokenData.companyValuationEurUlps.toString(),
      totalCompanyShares: convertToUlps(tokenData.totalCompanyShares).toString(),
      tokenPrice: new BigNumber(
        divideBigNumbers(
          divideBigNumbers(
            multiplyBigNumbers([tokenData.companyValuationEurUlps, new BigNumber("123")]),
            tokenData.totalCompanyShares.mul(Q18),
          ),
          tokenData.tokensPerShare,
        ),
      ).toString(),
      canTransferToken: true,
    };

    expectSaga(loadEtos, deps)
      .provide([[getContext("deps"), deps]])
      .withState({
        kyc: {
          individualData: {
            country: undefined,
          },
        },
        auth: {
          user: {
            type: EUserType.INVESTOR,
          },
        },
        web3: {
          connected: true,
          wallet: {
            address: "0xf7784a74cc59d1e6e1c10ca2053f34d68d280ae7",
          },
        },
      })
      .put(actions.bookBuilding.loadBookBuildingListStats([etoInClaim.etoId]))
      .put(
        actions.eto.setEtoDataFromContract(
          etoInClaim.previewCode,
          etoInClaim.contract as TEtoContractData,
        ),
      )
      .put(actions.investorEtoTicket.loadInvestorTickets(etosByPreviewCode))
      .put(actions.eto.setTokenData(etoInClaim.previewCode, tokenDataProcessed))
      .put(actions.eto.setTokensLoadingDone())
      .put(
        actions.eto.setEtos({
          etos: etosByPreviewCode,
          companies: { [testCompany.companyId]: testEto.company },
        }),
      )
      .put(actions.eto.setEtosDisplayOrder([testEto.previewCode]))
      .run();
  });
});
