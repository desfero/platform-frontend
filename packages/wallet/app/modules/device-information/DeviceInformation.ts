import { coreModuleApi, ILogger } from "@neufund/shared-modules";
import { inject, injectable } from "inversify";
import { Platform, PlatformOSType } from "react-native";
import { getUniqueId, isEmulator } from "react-native-device-info";

/**
 * @class DeviceInformation
 * Layer on top of react-native-device-info
 * Provides access to a device information, thought the API. Available methods are here https://github.com/react-native-community/react-native-device-info#api.
 *
 */
@injectable()
export class DeviceInformation {
  protected readonly logger: ILogger;

  constructor(@inject(coreModuleApi.symbols.logger) logger: ILogger) {
    this.logger = logger;
  }

  /**
   * Get unique device ID
   * On Android devices that have multiple users, each user appears as a completely separate device, so the ANDROID_ID value is unique to each user.
   * On iOS it uses the DeviceUID uid identifier.
   * iOS: "FCDBD8EF-62FC-4ECB-B2F5-92C9E79AC7F9"
   * Android: "dd96dec43fb81c97"
   * @returns {string} Unique device identifier
   */
  getUniqueId(): string {
    this.logger.info("Get the device ID");

    return getUniqueId();
  }

  /**
   * Checks if app is running on emulator
   * @returns {Promise<boolean>} if emulator
   */
  async isEmulator(): Promise<boolean> {
    this.logger.info("Check id emulator/simulator");

    return isEmulator();
  }

  /**
   * Returns device platform
   * @returns {string} ios or android
   */
  getPlatform(): PlatformOSType {
    this.logger.info("Get the device platform");

    return Platform.OS;
  }
}
