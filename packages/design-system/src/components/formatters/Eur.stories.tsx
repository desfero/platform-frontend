import { storiesOf } from "@storybook/react";
import * as React from "react";

import { PaddedWrapper } from "../../storybook-decorators";
import { Eur } from "./Eur";

storiesOf("NDS/Formatters", module).add("Eur", () => (
  <PaddedWrapper>
    <Eur value="0" />
    <br />
    <Eur value={"4212376189" + "0".repeat(10)} />
    <br />
    <Eur value={"353212376189" + "0".repeat(10)} />
    <br />
    <Eur value={"1234567" + "0".repeat(18)} />
    <br />
  </PaddedWrapper>
));
