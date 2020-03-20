import { storiesOf } from "@storybook/react";
import * as React from "react";

import { ProgressBarSimple } from "./ProgressBarSimple";

storiesOf("NDS|Atoms/progress/ProgressBarSimple", module)
  .add("0%", () => <ProgressBarSimple progress="0" />)
  .add("25%", () => <ProgressBarSimple progress="25" />)
  .add("50%", () => <ProgressBarSimple progress="50" />)
  .add("75%", () => <ProgressBarSimple progress="75" />)
  .add("100%", () => <ProgressBarSimple progress="100" />);
