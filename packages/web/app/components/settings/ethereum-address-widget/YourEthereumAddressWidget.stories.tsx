import { EthereumAddress } from "@neufund/shared";
import { storiesOf } from "@storybook/react";
import * as React from "react";

import { YourEthereumAddressWidgetComponent } from "./YourEthereumAddressWidget";

const sampleEthereumAddress = "0xfb6916095ca1df60bb79ce92ce3ea74c37c5d359" as EthereumAddress;

storiesOf("YourEthereumAddressWidget", module).add("default", () => (
  <YourEthereumAddressWidgetComponent address={sampleEthereumAddress} />
));
