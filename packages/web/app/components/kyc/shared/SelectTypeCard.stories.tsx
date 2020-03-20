import { action } from "@storybook/addon-actions";
import { storiesOf } from "@storybook/react";
import * as React from "react";

import { EKycRequestType } from "../../../lib/api/kyc/KycApi.interfaces";
import { SelectTypeCard } from "./SelectTypeCard";

storiesOf("molecules|KYC/SelectTypeCard", module)
  .add("personal account", () => (
    <SelectTypeCard kycType={EKycRequestType.INDIVIDUAL} onClick={action("SELECT PERSONAL")} />
  ))
  .add("personal account is started", () => (
    <SelectTypeCard
      kycType={EKycRequestType.INDIVIDUAL}
      onClick={action("SELECT PERSONAL")}
      isStarted={true}
    />
  ))
  .add("company account", () => (
    <SelectTypeCard kycType={EKycRequestType.BUSINESS} onClick={action("SELECT INDIVIDUAL")} />
  ))
  .add("company account is started", () => (
    <SelectTypeCard
      kycType={EKycRequestType.BUSINESS}
      onClick={action("SELECT INDIVIDUAL")}
      isStarted={true}
    />
  ));
