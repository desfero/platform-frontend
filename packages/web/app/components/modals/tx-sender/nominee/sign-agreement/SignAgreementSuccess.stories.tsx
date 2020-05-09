import { action } from "@storybook/addon-actions";
import { storiesOf } from "@storybook/react";
import * as React from "react";

import { ETxType } from "../../../../../lib/web3/types";
import { withModalBody } from "../../../../../utils/react-connected-components/storybookHelpers.unsafe";
import { SignNomineeAgreementSuccessLayout } from "./SignAgreementSuccess";

storiesOf("NomineeAgreements/Success", module)
  .addDecorator(withModalBody())
  .add("THA", () => (
    <SignNomineeAgreementSuccessLayout
      txType={ETxType.NOMINEE_THA_SIGN}
      onClose={action("CLOSE")}
    />
  ))
  .add("RAAA", () => (
    <SignNomineeAgreementSuccessLayout
      txType={ETxType.NOMINEE_RAAA_SIGN}
      onClose={action("CLOSE")}
    />
  ));
