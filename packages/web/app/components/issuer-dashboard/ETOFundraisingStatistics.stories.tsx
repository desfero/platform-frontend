import { convertToUlps } from "@neufund/shared";
import { storiesOf } from "@storybook/react";
import * as React from "react";

import { testEto } from "../../../test/fixtures";
import { ETOFundraisingStatisticsLayout } from "./ETOFundraisingStatistics";

storiesOf("ETOFundraisingStatistics", module).add("default", () => (
  <ETOFundraisingStatisticsLayout
    eto={testEto}
    etherTokenEurEquivUlps={convertToUlps("623.42")}
    averageInvestmentEurUlps={convertToUlps("125552.21")}
  />
));
