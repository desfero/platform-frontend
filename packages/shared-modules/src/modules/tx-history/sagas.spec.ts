import { expectSaga } from "@neufund/sagas/tests";
import {
  ECurrency,
  ENumberInputFormat,
  EthereumAddressWithChecksum,
  EthereumTxHash,
} from "@neufund/shared-utils";

import { noopLogger } from "../core/lib/logger";
import {
  ETransactionDirection,
  ETransactionType,
  TAnalyticsTransaction,
} from "./lib/http/analytics-api/interfaces";
import { mapAnalyticsApiTransactionResponse } from "./sagas";
import { ETransactionStatus } from "./types";

describe("Tx History sagas", () => {
  describe("mapAnalyticsApiTransactionResponse", () => {
    it("should correctly process NEUR_REDEEM", async () => {
      const transaction: TAnalyticsTransaction = {
        blockNumber: 8,
        blockTime: "2019-08-07T06:58:48.736923+00:00",
        extraData: {
          amount: 29083350986799034000,
          fromAddress: "0xfA1Af2E251ee739F83e14d7daCfd77B3d0E930b7" as EthereumAddressWithChecksum,
          reference: "XNKAPOMXNOAS",
          settledAmount: 29083350986799030000,
          assetTokenMetadata: undefined,
          baseCurrencyEquivalent: undefined,
          byAddress: undefined,
          grantedAmount: undefined,
          isClaimed: undefined,
          isRefunded: undefined,
          neumarkReward: undefined,
          toAddress: undefined,
          tokenAddress: undefined,
          tokenInterface: undefined,
          tokenMetadata: undefined,
          walletAddress: undefined,
        },
        logIndex: 0,
        transactionDirection: ETransactionDirection.OUT,
        transactionIndex: 0,
        txHash: "0xea3145cf6334a8fe5a9570c05fef7ebb2b3c728369fccae5cf8f30809d99be94" as EthereumTxHash,
        type: ETransactionType.NEUR_REDEEM,
        version: 9,
      };

      await expectSaga(
        mapAnalyticsApiTransactionResponse,
        {
          logger: noopLogger,
        },
        transaction,
      )
        .returns({
          amount: "29083350986799034000",
          amountFormat: ENumberInputFormat.ULPS,
          blockNumber: 8,
          date: "2019-08-07T06:58:48.736923+00:00",
          id: "8_0_0",
          logIndex: 0,
          transactionDirection: ETransactionDirection.OUT,
          transactionIndex: 0,
          txHash: "0xea3145cf6334a8fe5a9570c05fef7ebb2b3c728369fccae5cf8f30809d99be94",
          settledAmount: "29083350986799030000",
          subType: ETransactionStatus.COMPLETED,
          type: ETransactionType.NEUR_REDEEM,
          currency: ECurrency.EUR_TOKEN,
          reference: "XNKAPOMXNOAS",
          fromAddress: "0xfA1Af2E251ee739F83e14d7daCfd77B3d0E930b7",
          feeAmount: "4000",
        })
        .run();
    });
  });
});
