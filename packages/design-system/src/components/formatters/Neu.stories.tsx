import { storiesOf } from "@storybook/react";
import * as React from "react";
import { PaddedWrapper } from "../../storybook-decorators";

import { Neu } from "./Neu";

storiesOf("NDS/Formatters", module).add("Neu", () => (
  <PaddedWrapper>
    <Neu />
    <br />
    <Neu value="0" />
    <br />
    <Neu value={"353212376189" + "0".repeat(10)} />
    <br />
    <Neu value={"1234567" + "0".repeat(18)} />
    <br />
  </PaddedWrapper>
));
