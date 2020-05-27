import { toEquityTokenSymbol, toEthereumTxHash } from "@neufund/shared-utils";
import { action } from "@storybook/addon-actions";
import { storiesOf } from "@storybook/react-native";
import * as React from "react";

import { EIconType } from "components/shared/Icon";

import { SuccessfulTransaction } from "./SuccessfulTransaction";
import { ETransactionDirection } from "./types";

storiesOf("Molecules|SuccessfulTransaction", module)
  .add("direction: out", () => (
    <SuccessfulTransaction
      icon={EIconType.PLACEHOLDER}
      name={"Purchased nEUR"}
      value={"1 000"}
      valueToken={toEquityTokenSymbol("nEUR")}
      valueDecimals={18}
      valueEquivalent={"1 000"}
      valueEquivalentToken={toEquityTokenSymbol("EUR")}
      valueEquivalentDecimals={18}
      direction={ETransactionDirection.OUT}
      timestamp={1580000255922}
      txHash={toEthereumTxHash(
        "0x438db1cd907cef39635aa97bdbd8f036b9dcd41805401826c22131bf055a754b",
      )}
      onPress={action("onPress")}
    />
  ))
  .add("direction: in", () => (
    <SuccessfulTransaction
      icon={EIconType.PLACEHOLDER}
      name={"Purchased nEUR"}
      value={"1 000"}
      valueToken={toEquityTokenSymbol("nEUR")}
      valueDecimals={18}
      valueEquivalent={"1 000"}
      valueEquivalentToken={toEquityTokenSymbol("EUR")}
      valueEquivalentDecimals={18}
      direction={ETransactionDirection.IN}
      timestamp={1580000255922}
      txHash={toEthereumTxHash(
        "0x438db1cd907cef39635aa97bdbd8f036b9dcd41805401826c22131bf055a754b",
      )}
      onPress={action("onPress")}
    />
  ));
