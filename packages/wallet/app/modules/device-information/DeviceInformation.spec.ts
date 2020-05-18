import { noopLogger } from "@neufund/shared-modules";

import { DeviceInformation } from "./DeviceInformation";
import { TEST_DEVICE_ID } from "./__mocks__/react-native-device-info";

describe("DeviceInformation", () => {
  const deviceId = TEST_DEVICE_ID;
  let deviceInformation: DeviceInformation;

  beforeEach(() => {
    deviceInformation = new DeviceInformation(noopLogger);
  });

  it("should return device ID", () => {
    const testDeviceId = deviceInformation.getUniqueId();

    expect(testDeviceId).toBe(deviceId);
  });

  it("should check if simulator", async () => {
    const isEmulator = await deviceInformation.isEmulator();
    expect(isEmulator).toBeTruthy();
  });
});
