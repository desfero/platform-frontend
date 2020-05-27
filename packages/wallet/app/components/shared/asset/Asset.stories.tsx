import { toEquityTokenSymbol } from "@neufund/shared-utils";
import { storiesOf } from "@storybook/react-native";
import * as React from "react";

import { EIconType } from "components/shared/Icon";

import { Asset, EAssetType } from "./Asset";

storiesOf("Molecules|Asset", module)
  .add("normal", () => (
    <Asset
      tokenImage={EIconType.N_EUR}
      name="NEur"
      token={toEquityTokenSymbol("NEUR")}
      balance="15 000"
      analogBalance="15 000"
      analogToken={toEquityTokenSymbol("EUR")}
      type={EAssetType.NORMAL}
    />
  ))
  .add("reserved", () => (
    <Asset
      tokenImage={EIconType.ETH}
      name="ETH"
      token={toEquityTokenSymbol("ETH")}
      balance="1000"
      analogBalance="15 000"
      analogToken={toEquityTokenSymbol("EUR")}
      type={EAssetType.RESERVED}
    />
  ));
