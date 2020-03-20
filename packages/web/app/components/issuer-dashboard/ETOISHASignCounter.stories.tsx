import { storiesOf } from "@storybook/react";
import * as moment from "moment";
import * as React from "react";

import { withMockedDate } from "../../utils/react-connected-components/storybookHelpers.unsafe";
import { ETOISHASignCounterLayout } from "./ETOISHASignCounter";

const dummyNow = new Date(2018, 11, 17);
const date = moment
  .utc(dummyNow)
  .add(2, "day")
  .add(1, "hours")
  .add(37, "minutes");

storiesOf("ETOISHASignCounter", module)
  .addDecorator(withMockedDate(dummyNow))
  .add("default", () => <ETOISHASignCounterLayout countdownDate={date} />);
