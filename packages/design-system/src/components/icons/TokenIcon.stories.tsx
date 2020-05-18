import { storiesOf } from "@storybook/react";
import * as React from "react";

import { TokenIcon } from "./TokenIcon";

import tokenIcon from "../../assets/img/token_icon.svg";

storiesOf("NDS|Atoms/TokenIcon", module).add("default", () => (
  <TokenIcon srcSet={{ "1x": tokenIcon }} alt="" />
));

