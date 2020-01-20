import { EquityToken } from "@neufund/shared";

import { ETxSenderState } from "../../modules/tx/sender/reducer";
import { ETxSenderType } from "./../../modules/tx/types";

export const generalPendingTxFixture = (
  from: string,
  transactionStatus: ETxSenderState = ETxSenderState.MINING,
) => ({
  transaction: {
    from,
    gas: "0xe890",
    gasPrice: "0xd693a400",
    hash: "0x0000000000000000000000000000000000000000000000000000000000000000",
    input:
      "0x64663ea600000000000000000000000016cd5ac5a1b77fb72032e3a09e91a98bb21d89880000000000000000000000000000000000000000000000008ac7230489e80000",
    nonce: "0x0",
    to: "0xf538ca71b753e5fa634172c133e5f40ccaddaa80",
    value: "0x1",
    blockHash: undefined,
    blockNumber: undefined,
    chainId: undefined,
    status: undefined,
    transactionIndex: undefined,
    failedRpcError: undefined,
  },
  transactionAdditionalData: {
    to: "0x16cd5aC5A1b77FB72032E3A09E91A98bB21D8988",
    total: "10000000000000000000",
    amount: "10000000000000000000",
    amountEur: "10000000000000000000",
    totalEur: "10000000000000000000",
    tokenSymbol: "QTT" as EquityToken,
    tokenImage: "test",
    tokenDecimals: 18,
  },
  transactionStatus,
  transactionTimestamp: 1553762875525,
  transactionType: ETxSenderType.WITHDRAW,
  transactionError: undefined,
});

export const mismatchedPendingTxFixture = (from: string) => ({
  ...generalPendingTxFixture(from),
  transactionAdditionalData: {
    to: "0x16cd5aC5A1b77FB72032E3A09E91A98bB21D8988",
    value: "10000000000000000000",
  },
});
