import { action } from "@storybook/addon-actions";
import { storiesOf } from "@storybook/react-native";
import * as React from "react";

import { Switcher } from "./Switcher";

const switcherItemsWithTitleAndSubTitle = [
  {
    id: "0x429123b08DF32b0006fd1F3b0Ef893A8993802f3",
    title: "INV_ETH_ICBM_NO_KYC",
    subTitle: "0x429123b08DF32b0006fd1F3b0Ef893A8993802f3",
  },
  {
    id: "0xDE185A5c2Bd3913fAC1F64102e3DEFD9E1797C4d",
    title: "INV_ETH_EUR_ICBM_KYC_ICBM_UNLOCK",
    subTitle: "0xDE185A5c2Bd3913fAC1F64102e3DEFD9E1797C4d",
  },
  {
    id: "0xBA9807E260E1E162F46a5ACd228153EdFE2604eC",
    title: "INV_ETH_ICBM_NO_KYC_2",
    subTitle: "0xBA9807E260E1E162F46a5ACd228153EdFE2604eC",
  },
  {
    id: "0x844C5c9cE2Ad620592A5D686Fc8e76866f039c56",
    title: "INV_ETH_ICBM_HAS_KYC",
    subTitle: "0x844C5c9cE2Ad620592A5D686Fc8e76866f039c56",
  },
];

const switcherItemsWithTitle = [
  {
    id: "0x429123b08DF32b0006fd1F3b0Ef893A8993802f3",
    title: "INV_ETH_ICBM_NO_KYC",
  },
  {
    id: "0xDE185A5c2Bd3913fAC1F64102e3DEFD9E1797C4d",
    title: "INV_ETH_EUR_ICBM_KYC_ICBM_UNLOCK",
  },
  {
    id: "0xBA9807E260E1E162F46a5ACd228153EdFE2604eC",
    title: "INV_ETH_ICBM_NO_KYC_2",
  },
  {
    id: "0x844C5c9cE2Ad620592A5D686Fc8e76866f039c56",
    title: "INV_ETH_ICBM_HAS_KYC",
  },
];

storiesOf("Atoms|Switcher", module)
  .add("with title and sub title", () => (
    <Switcher
      onChangeItem={action("onChangeItem")}
      selectedItemId="0xBA9807E260E1E162F46a5ACd228153EdFE2604eC"
      items={switcherItemsWithTitleAndSubTitle}
    />
  ))
  .add("with title", () => (
    <Switcher
      onChangeItem={action("onChangeItem")}
      selectedItemId="0x429123b08DF32b0006fd1F3b0Ef893A8993802f3"
      items={switcherItemsWithTitle}
    />
  ))
  .add("disabled", () => (
    <Switcher
      onChangeItem={action("onChangeItem")}
      selectedItemId="0x429123b08DF32b0006fd1F3b0Ef893A8993802f3"
      disabled
      items={switcherItemsWithTitleAndSubTitle}
    />
  ))
  .add("invalid", () => (
    <Switcher
      onChangeItem={action("onChangeItem")}
      selectedItemId="0x429123b08DF32b0006fd1F3b0Ef893A8993802f3"
      invalid
      items={switcherItemsWithTitleAndSubTitle}
    />
  ));

export { switcherItemsWithTitle, switcherItemsWithTitleAndSubTitle };
