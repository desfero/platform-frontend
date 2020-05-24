import { createLibSymbol } from "@neufund/shared-modules";

import { DeviceInformation } from "./DeviceInformation";

export const symbols = {
  deviceInformation: createLibSymbol<DeviceInformation>("deviceInformation"),
};
