import { storiesOf } from "@storybook/react";
import * as React from "react";

import { PaddedWrapper } from "../../storybook-decorators";
import { Eth } from "./Eth";

storiesOf("NDS/Formatters", module).add("Eth", () => (
  <PaddedWrapper>
    <Eth value="0" />
    <br />
    <Eth value={"4212376189" + "0".repeat(10)} />
    <br />
    <Eth value={"353212376189" + "0".repeat(10)} />
    <br />
    <Eth value={"1234567" + "0".repeat(18)} />
    <br />
  </PaddedWrapper>
));
