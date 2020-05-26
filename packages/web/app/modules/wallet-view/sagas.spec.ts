import { select } from "@neufund/sagas";
import { expectSaga, matchers } from "@neufund/sagas/tests";
import { EUserType } from "@neufund/shared-modules";
import { EthereumAddressWithChecksum } from "@neufund/shared-utils";
import { getContext } from "redux-saga-test-plan/matchers";

import { EKycRequestStatus } from "../../lib/api/kyc/KycApi.interfaces";
import { EProcessState } from "../../utils/enums/processStates";
import { actions } from "../actions";
import { selectIsUserFullyVerified } from "../auth/selectors";
import { loadBankAccountDetails } from "../kyc/sagas";
import { selectBankAccount } from "../kyc/selectors";
import { loadWalletDataSaga } from "../wallet/sagas";
import {
  selectICBMLockedEtherBalance,
  selectICBMLockedEtherBalanceEuroAmount,
  selectICBMLockedEuroTokenBalance,
  selectIsEtherUpgradeTargetSet,
  selectIsEuroUpgradeTargetSet,
  selectLiquidEtherBalance,
  selectLiquidEtherBalanceEuroAmount,
  selectLiquidEuroTokenBalance,
  selectLockedEtherBalance,
  selectLockedEtherBalanceEuroAmount,
  selectLockedEuroTokenBalance,
  selectNEURStatus,
} from "../wallet/selectors";
import { selectEthereumAddress } from "../web3/selectors";
import { loadWalletView, populateWalletData } from "./sagas";
import { EBalanceViewType } from "./types";

const testWalletData = [
  {
    name: EBalanceViewType.ETH,
    hasFunds: true,
    amount: "300000",
    euroEquivalentAmount: "123456",
  },
  {
    name: EBalanceViewType.NEUR,
    hasFunds: true,
    amount: "87654",
    euroEquivalentAmount: "87654",
  },
  {
    name: EBalanceViewType.ICBM_ETH,
    hasFunds: false,
    amount: "0",
    euroEquivalentAmount: "0",
  },
  {
    name: EBalanceViewType.ICBM_NEUR,
    hasFunds: false,
    amount: "0",
    euroEquivalentAmount: "0",
  },
  {
    name: EBalanceViewType.LOCKED_ICBM_ETH,
    hasFunds: true,
    amount: "23456",
    euroEquivalentAmount: "876543",
  },
  {
    name: EBalanceViewType.LOCKED_ICBM_NEUR,
    hasFunds: false,
    amount: "0",
    euroEquivalentAmount: "0",
  },
];

describe("Wallet View", () => {
  describe("populateWalletData()", () => {
    it("will populate wallet data, no funds anywhere", async () => {
      await expectSaga(populateWalletData)
        .provide([
          [matchers.select(selectLiquidEtherBalance), "0"],
          [matchers.select(selectLiquidEtherBalanceEuroAmount), "0"],
          [matchers.select(selectLiquidEuroTokenBalance), "0"],
          [matchers.select(selectNEURStatus), "0"],
          [matchers.select(selectLockedEtherBalance), "0"],
          [matchers.select(selectLockedEtherBalanceEuroAmount), "0"],
          [matchers.select(selectLockedEuroTokenBalance), "0"],
          [matchers.select(selectICBMLockedEtherBalance), "0"],
          [matchers.select(selectICBMLockedEtherBalanceEuroAmount), "0"],
          [matchers.select(selectIsEtherUpgradeTargetSet), "0"],
          [matchers.select(selectICBMLockedEuroTokenBalance), "0"],
          [matchers.select(selectIsEuroUpgradeTargetSet), "0"],
        ])
        .returns([
          {
            name: EBalanceViewType.ETH,
            hasFunds: false,
            amount: "0",
            euroEquivalentAmount: "0",
          },
          {
            name: EBalanceViewType.NEUR,
            hasFunds: false,
            amount: "0",
            euroEquivalentAmount: "0",
          },
          {
            name: EBalanceViewType.ICBM_ETH,
            hasFunds: false,
            amount: "0",
            euroEquivalentAmount: "0",
          },
          {
            name: EBalanceViewType.ICBM_NEUR,
            hasFunds: false,
            amount: "0",
            euroEquivalentAmount: "0",
          },
          {
            name: EBalanceViewType.LOCKED_ICBM_ETH,
            hasFunds: false,
            amount: "0",
            euroEquivalentAmount: "0",
          },
          {
            name: EBalanceViewType.LOCKED_ICBM_NEUR,
            hasFunds: false,
            amount: "0",
            euroEquivalentAmount: "0",
          },
        ])
        .run();
    });
    it("will populate wallet data, some have funds anywhere", async () => {
      await expectSaga(populateWalletData)
        .provide([
          [matchers.select(selectLiquidEtherBalance), "300000"],
          [matchers.select(selectLiquidEtherBalanceEuroAmount), "123456"],
          [matchers.select(selectLiquidEuroTokenBalance), "87654"],
          [matchers.select(selectNEURStatus), "2345"],
          [matchers.select(selectLockedEtherBalance), "0"],
          [matchers.select(selectLockedEtherBalanceEuroAmount), "0"],
          [matchers.select(selectLockedEuroTokenBalance), "0"],
          [matchers.select(selectICBMLockedEtherBalance), "23456"],
          [matchers.select(selectICBMLockedEtherBalanceEuroAmount), "876543"],
          [matchers.select(selectIsEtherUpgradeTargetSet), "0"],
          [matchers.select(selectICBMLockedEuroTokenBalance), "0"],
          [matchers.select(selectIsEuroUpgradeTargetSet), "0"],
        ])
        .returns(testWalletData)
        .run();
    });
  });
  describe("loadWalletView", () => {
    const ethAddress = "0x295a803de79cd256ff544682a51435e549a080b2" as EthereumAddressWithChecksum;
    const bankAccount = {
      hasBankAccount: true,
      details: {
        bankAccountNumberLast4: "1234",
        bankName: "mBank",
        name: "Lorem Ipsum",
        isSepa: true,
        swiftCode: "33212",
      },
    } as const;

    it("loadWalletView", async () => {
      const context = {
        apiKycService: {
          getBankAccount: () => {},
        },
        notificationCenter: {
          error: () => {},
        },
        logger: {
          error: () => {},
          info: () => {},
        },
      };

      const resultBalanceData = [
        {
          name: EBalanceViewType.ETH,
          hasFunds: true,
          amount: "300000",
          euroEquivalentAmount: "123456",
        },
        {
          name: EBalanceViewType.NEUR,
          hasFunds: true,
          amount: "87654",
          euroEquivalentAmount: "87654",
        },
        {
          name: EBalanceViewType.LOCKED_ICBM_ETH,
          hasFunds: true,
          amount: "23456",
          euroEquivalentAmount: "876543",
        },
      ];

      await expectSaga(loadWalletView)
        .withState({
          user: {
            data: {
              type: EUserType.INVESTOR,
              verifiedEmail: "sdafas@dsafasdf.dd",
              backupCodesVerified: true,
            },
          },
          web3: {
            connected: true,
            wallet: { address: ethAddress },
          },
          kyc: {
            bankAccount,
            status: { status: EKycRequestStatus.ACCEPTED },
            claims: {
              isVerified: true,
              isAccountFrozen: false,
            },
          },
        })
        .provide([
          [getContext("deps"), context],
          [matchers.call.fn(loadWalletDataSaga), undefined],
          [matchers.call.fn(loadBankAccountDetails), undefined],
          [select(selectIsUserFullyVerified), true],
          [select(selectEthereumAddress), ethAddress],
          [select(selectBankAccount), bankAccount],
          [matchers.call.fn(populateWalletData), testWalletData],
        ])
        .put(
          actions.walletView.walletViewSetData({
            userIsFullyVerified: true,
            userAddress: ethAddress,
            balanceData: resultBalanceData,
            totalBalanceEuro: "1087653",
            bankAccount: bankAccount,
            processState: EProcessState.SUCCESS,
          }),
        )
        .run();
    });
  });
});
