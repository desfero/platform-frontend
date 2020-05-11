import { minutesToMs, secondsToMs } from "@neufund/shared-utils";

import { EUserType } from "../lib/api/users/interfaces";

export const AUTH_JWT_TIMING_THRESHOLD = secondsToMs(10);

export const AUTH_INACTIVITY_THRESHOLD =
  process.env.NF_CYPRESS_RUN === "1" ? minutesToMs(5) : minutesToMs(10);
export const INACTIVITY_THROTTLE_THRESHOLD = secondsToMs(5);

export const LIGHT_WALLET_PASSWORD_CACHE_TIME = 1000 * 10;
// If running in cypress wait for a short time
export const LIGHT_WALLET_PRIVATE_DATA_CACHE_TIME =
  process.env.NF_CYPRESS_RUN === "1" ? 1000 * 60 : 1000 * 60 * 3;

/**
 * We assume common digits for all currencies on our platform.
 */
export const DEFAULT_DECIMAL_PLACES = 4;

/**
 * Constants for react components
 */
export const TOAST_COMPONENT_DELAY = 4000;

export const BROWSER_WALLET_RECONNECT_INTERVAL = 1000;
export const NOMINEE_BANK_ACCOUNT_WATCHER_DELAY = 1000 * 60 * 5;
export const PAYOUT_POLLING_DELAY = 1000;
export const USERS_WITH_ACCOUNT_SETUP = [EUserType.NOMINEE, EUserType.INVESTOR];

export const WC_DEFAULT_SESSION_REQUEST_TIMEOUT = minutesToMs(10);
export const WC_DEFAULT_SIGN_TIMEOUT = minutesToMs(10);
