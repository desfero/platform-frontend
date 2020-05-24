import {
  appConnect as sharedAppConnect,
  TAppConnectOptions,
  TModuleSetup,
} from "@neufund/shared-modules";
import { InferableComponentEnhancerWithProps } from "react-redux";

import { TAppGlobalActions, TAppGlobalState } from "./types";

/**
 * Helper to use instead of redux connect. It's bound with our app state and it uses dictionary to pass arguments
 * @param options - An object with `stateToProps`, `dispatchToProps` and `options` keys.
 * @param options.stateToProps - A function that will receive a state and returns a part of a state
 * @param options.dispatchToProps - A function that will receive a dispatch and returns an object with available actions to invoke
 * @param options.options - Same options that you can pass to `react-redux` connect method with additional `omitDispatch`
 * @param options.options.omitDispatch (defaults to true) - Will not pass `dispatch` function to child's when `options.dispatchToProps` is omitted
 */
export function appConnect<
  StateToProps = {},
  DispatchToProps = {},
  Props = {},
  Module extends TModuleSetup<unknown, unknown> | never = never
>(
  options: TAppConnectOptions<
    StateToProps,
    DispatchToProps,
    Props,
    TAppGlobalActions,
    TAppGlobalState,
    Module
  >,
): InferableComponentEnhancerWithProps<StateToProps & DispatchToProps, Props> {
  return sharedAppConnect(options);
}
