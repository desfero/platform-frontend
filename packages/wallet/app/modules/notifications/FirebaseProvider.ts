import { coreModuleApi, ILogger } from "@neufund/shared-modules";
import messaging, { FirebaseMessagingTypes } from "@react-native-firebase/messaging";
import { inject, injectable } from "inversify";

import { INotificationsProvider } from "./INotificationsProvider";

/**
 * @class FirebaseProvider
 * A class to manage subscription with a remote notification provider, e.g. Firebase.
 * @note this works together with a native code in AppDelegate.m on IOS.
 */
@injectable()
class FirebaseProvider implements INotificationsProvider {
  private readonly app: FirebaseMessagingTypes.Module;
  private readonly logger: ILogger;

  constructor(@inject(coreModuleApi.symbols.logger) logger: ILogger) {
    this.app = messaging();
    this.logger = logger;
  }

  /**
   * @method subscribeForNotifications
   * Subscribes for a remote notifications service.
   */
  async subscribeForNotifications(): Promise<void> {
    this.logger.info("Subscribe for remote notifications");

    return this.app.registerDeviceForRemoteMessages();
  }

  /**
   * @method unsubscribeForNotifications
   * Unsubscribes from a remote notifications service.
   */
  async unsubscribeForNotifications(): Promise<void> {
    this.logger.info("Unsubscribe for remote notifications");

    return this.app.unregisterDeviceForRemoteMessages();
  }

  /**
   * @method getRegistrationToken
   * Get a registration token from the provider.
   * @returns {string} Registration (FCM) token.
   */
  async getRegistrationToken(): Promise<string> {
    this.logger.info("Get registration token");

    return this.app.getToken();
  }

  /**
   * @method deleteRegistrationToken
   * Deletes a registration token from the provider.
   */
  async deleteRegistrationToken(): Promise<void> {
    this.logger.info("Delete registration token");

    return this.app.deleteToken();
  }

  /**
   * @method refreshRegistrationToken
   * Manually enforces a new token.
   * @note this method makes sure that a new registration token is returned upon a request, as a getToken method might return an old token, depending if it is still valid or not expired.
   */
  async refreshRegistrationToken(): Promise<string> {
    this.logger.info("Refresh registration token");

    await this.deleteRegistrationToken();

    const newRegistrationToken = await this.getRegistrationToken();
    return newRegistrationToken;
  }

  /**
   * @event onTokenRemoteRefresh
   * Fires when token is refreshed in a native code or remotely.
   * @param {function} A callback to call when token is refreshed.
   */
  onTokenRemoteRefresh(listener: (token: string) => void) {
    this.app.onTokenRefresh(listener);
  }
}

export { FirebaseProvider };
