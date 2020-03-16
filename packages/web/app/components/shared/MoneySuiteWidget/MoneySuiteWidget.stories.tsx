import { ECurrency } from "@neufund/shared";
import { storiesOf } from "@storybook/react";
import * as React from "react";

import {
  ESize,
  ETextPosition,
  ETheme,
  MoneySingleSuiteWidget,
  MoneySuiteWidget,
  StaticMoneyWidget,
} from "./MoneySuiteWidget";

import ethIcon from "../../../assets/img/eth_icon.svg";
import neuIcon from "../../../assets/img/neu_icon.svg";

storiesOf("Core|Molecules/MoneySuiteWidget", module)
  .add("with icon", () => (
    <MoneySuiteWidget
      currency={ECurrency.NEU}
      largeNumber={"1100000000000000000"}
      value={"3050000000000000000"}
      currencyTotal={ECurrency.EUR}
      theme={ETheme.BLACK}
      size={ESize.NORMAL}
      icon={neuIcon}
    />
  ))
  .add("aligned to right", () => (
    <MoneySuiteWidget
      textPosition={ETextPosition.RIGHT}
      currency={ECurrency.NEU}
      largeNumber={"1100000000000000000"}
      value={"3050000000000000000"}
      currencyTotal={ECurrency.EUR}
      theme={ETheme.BLACK}
      size={ESize.NORMAL}
      icon={neuIcon}
    />
  ))
  .add("with icon and wallet name", () => (
    <MoneySuiteWidget
      currency={ECurrency.NEU}
      largeNumber={"1100000000000000000"}
      value={"3050000000000000000"}
      currencyTotal={ECurrency.EUR}
      theme={ETheme.BLACK}
      size={ESize.NORMAL}
      walletName={"NEU Balance"}
      icon={neuIcon}
    />
  ))
  .add("with tilde sign", () => (
    <MoneySuiteWidget
      currency={ECurrency.NEU}
      largeNumber={"1100000000000000000"}
      value={"3050000000000000000"}
      currencyTotal={ECurrency.EUR}
      theme={ETheme.BLACK}
      size={ESize.NORMAL}
      icon={neuIcon}
      useTildeSign={true}
    />
  ))
  .add("with single value", () => (
    <MoneySingleSuiteWidget
      currency={ECurrency.NEU}
      value={"3050000000000000000"}
      theme={ETheme.BLACK}
      size={ESize.NORMAL}
      icon={neuIcon}
    />
  ))
  .add("with constant value value", () => (
    <StaticMoneyWidget
      icon={ethIcon}
      upperText="< 0.0001 ETH"
      lowerText="< 0.0001 EUR"
      theme={ETheme.BLACK}
      size={ESize.MEDIUM}
      data-test-id="modals.tx-sender.withdraw-flow.summary.cost"
      textPosition={ETextPosition.RIGHT}
    />
  ));
