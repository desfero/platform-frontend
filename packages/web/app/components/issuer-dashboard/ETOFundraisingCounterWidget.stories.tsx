import { storiesOf } from "@storybook/react";
import * as moment from "moment";
import * as React from "react";

import { testEto } from "../../../test/fixtures";
import {
  EETOStateOnChain,
  TEtoContractData,
  TEtoWithCompanyAndContractReadonly,
} from "../../modules/eto/types";
import { withMockedDate } from "../../utils/react-connected-components/storybookHelpers.unsafe";
import { ETOFundraisingCounterWidget } from "./ETOFundraisingCounterWidget";

const dummyNow = new Date(2018, 11, 17);
const date = moment
  .utc(dummyNow)
  .add(2, "day")
  .add(1, "hours")
  .add(37, "minutes");

const presaleEto: TEtoWithCompanyAndContractReadonly = {
  ...testEto,
  contract: {
    ...testEto.contract,
    timedState: EETOStateOnChain.Whitelist,
    startOfStates: {
      ...testEto.contract!.startOfStates,
      [EETOStateOnChain.Public]: date.toDate(),
    },
  } as TEtoContractData,
};

const publicEto: TEtoWithCompanyAndContractReadonly = {
  ...testEto,
  contract: {
    ...testEto.contract,
    timedState: EETOStateOnChain.Public,
    startOfStates: {
      ...testEto.contract!.startOfStates,
      [EETOStateOnChain.Signing]: date.toDate(),
    },
  } as TEtoContractData,
};

storiesOf("ETOFundraisingCounterWidget", module)
  .addDecorator(withMockedDate(dummyNow))
  .add("presale", () => <ETOFundraisingCounterWidget eto={presaleEto} />)
  .add("public", () => <ETOFundraisingCounterWidget eto={publicEto} />);
