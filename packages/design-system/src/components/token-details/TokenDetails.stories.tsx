import { storiesOf } from "@storybook/react";
import * as React from "react";

import { TokenDetails } from "./TokenDetails";

import tokenIcon from "../../assets/img/token_icon.svg";

storiesOf("NDS|Molecules/TokenDetails", module)
  .add("default", () => (
    <TokenDetails
      equityTokenName="Storybook"
      equityTokenSymbol="STR"
      equityTokenImage={tokenIcon}
    />
  ))
  .add("with children", () => (
    <TokenDetails equityTokenName="Storybook" equityTokenSymbol="STR" equityTokenImage={tokenIcon}>
      ETO State widget
    </TokenDetails>
  ));
