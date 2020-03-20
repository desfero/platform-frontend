import { storiesOf } from "@storybook/react";
import * as moment from "moment";
import * as React from "react";

import { withMockedDate } from "../../utils/react-connected-components/storybookHelpers.unsafe";
import { TimeLeftWithUTC } from "./TimeLeftWithUTC";

const dummyNow = new Date(2018, 11, 17);
const date = moment
  .utc(dummyNow)
  .add(2, "day")
  .add(1, "hours")
  .add(37, "minutes");

const dateAfter = moment.utc(dummyNow).subtract("1", "second");

storiesOf("TimeLeftWithUTC", module)
  .addDecorator(withMockedDate(dummyNow))
  .add("default", () => <TimeLeftWithUTC countdownDate={date} />)
  .add("with label", () => <TimeLeftWithUTC countdownDate={date} label={"Label:"} />)
  .add("no time left", () => <TimeLeftWithUTC countdownDate={dateAfter} />);
