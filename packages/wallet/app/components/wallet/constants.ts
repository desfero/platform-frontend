/* eslint-disable @typescript-eslint/no-magic-numbers */

import { toEquityTokenSymbol, toEthereumTxHash } from "@neufund/shared-utils";
import flatMap from "lodash/fp/flatMap";
import noop from "lodash/fp/noop";
import times from "lodash/fp/times";
import uniqueId from "lodash/fp/uniqueId";

import { EIconType } from "../shared/Icon";
import { ETransactionType } from "./transactions/Transactions";
import { ETransactionDirection } from "./transactions/types";

export const MOCK_TRANSACTIONS = [
  {
    id: uniqueId(""),
    type: ETransactionType.PENDING,
    icon: EIconType.PLACEHOLDER,
    name: "Purchased nEUR",
    value: "1 000",
    valueToken: toEquityTokenSymbol("nEUR"),
    valueDecimals: 18,
    valueEquivalent: "1 000",
    valueEquivalentToken: toEquityTokenSymbol("EUR"),
    valueEquivalentDecimals: 18,
    direction: ETransactionDirection.OUT,
    timestamp: 1590000255922,
    txHash: toEthereumTxHash("0x438db1cd907cef39635aa97bdbd8f036b9dcd41805401826c22131bf055a754b"),
  },
  ...flatMap(
    () => [
      {
        id: uniqueId(""),
        type: ETransactionType.SUCCESSFUL,
        icon: EIconType.PLACEHOLDER,
        name: "Purchased nEUR",
        value: "1 000",
        valueToken: toEquityTokenSymbol("nEUR"),
        valueDecimals: 18,
        valueEquivalent: "1 000",
        valueEquivalentToken: toEquityTokenSymbol("EUR"),
        valueEquivalentDecimals: 18,
        direction: ETransactionDirection.OUT,
        timestamp: 1580000255922,
        txHash: toEthereumTxHash(
          "0x438db1cd907cef39635aa97bdbd8f036b9dcd41805401826c22131bf055a754b",
        ),
      },
      {
        id: uniqueId(""),
        type: ETransactionType.SUCCESSFUL,
        icon: EIconType.PLACEHOLDER,
        name: "Received ETH",
        value: "1 000",
        valueToken: toEquityTokenSymbol("ETH"),
        valueDecimals: 18,
        valueEquivalent: "10 000",
        valueEquivalentToken: toEquityTokenSymbol("EUR"),
        valueEquivalentDecimals: 18,
        direction: ETransactionDirection.IN,
        timestamp: 1588200255922,
        txHash: toEthereumTxHash(
          "0x438db1cd907cef39635aa97bdbd8f036b9dcd41805401826c22131bf055a754b",
        ),
      },
    ],
    times(noop, 25),
  ),
];
