import { storiesOf } from "@storybook/react";
import * as React from "react";

import { ButtonBase } from "./ButtonBase";

storiesOf("NDS|Atoms/Button", module).add("ButtonBase", () => (
  <>
    <ButtonBase>Normal</ButtonBase>
    <br />
    <br />
    <ButtonBase autoFocus>Focused</ButtonBase>
    <br />
    <br />
    <ButtonBase disabled>Disabled</ButtonBase>
  </>
));
