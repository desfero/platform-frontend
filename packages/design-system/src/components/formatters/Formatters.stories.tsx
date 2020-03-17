import { storiesOf } from "@storybook/react";
import * as React from "react";

import { PaddedWrapper } from "../../storybook-decorators";
import { Eth } from "./Eth";
import { Eur } from "./Eur";
import { Neu } from "./Neu";

storiesOf("NDS/Formatters", module)
  .add("Eth", () => (
    <PaddedWrapper>
      <Eth defaultValue="TBA" value={undefined} />
      <br />
      <Eth value="0" />
      <br />
      <Eth value={"4212376189" + "0".repeat(10)} />
      <br />
      <Eth value={"353212376189" + "0".repeat(10)} />
      <br />
      <Eth value={"1234567" + "0".repeat(18)} />
      <br />
    </PaddedWrapper>
  ))
  .add("Eur", () => (
    <PaddedWrapper>
      <Eur defaultValue="TBA" value={undefined} />
      <br />
      <Eur value="0" />
      <br />
      <Eur value={"4212376189" + "0".repeat(10)} />
      <br />
      <Eur value={"353212376189" + "0".repeat(10)} />
      <br />
      <Eur value={"1234567" + "0".repeat(18)} />
      <br />
    </PaddedWrapper>
  ))
  .add("Neu", () => (
    <PaddedWrapper>
      <Neu defaultValue="TBA" value={undefined} />
      <br />
      <Neu value="0" />
      <br />
      <Neu value={"353212376189" + "0".repeat(10)} />
      <br />
      <Neu value={"1234567" + "0".repeat(18)} />
      <br />
    </PaddedWrapper>
  ));
