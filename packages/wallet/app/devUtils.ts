/* eslint-disable no-console */
/**
 * A utils method useful for developer and debugging
 *
 * @important Only import in a development build
 */

import AsyncStorage from "@react-native-community/async-storage";
import { YellowBox } from "react-native";

/**
 * Clears the AsyncStorage
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(global as any).clearStorage = () => {
  AsyncStorage.clear()
    .then(() => console.log("AsyncStorage cleared"))
    // catch the error and forward to warning to not break the app completely
    .catch(e => console.warn(e));
};

// List of annoying warnings that we're ignoring
YellowBox.ignoreWarnings(["Remote debugger is in a background tab"]);
