import { connect, InferableComponentEnhancerWithProps, Options } from "react-redux";

import { TLibSymbol, TModuleActions, TModuleSetup, TModuleState } from "./types";

const createLibSymbol = <T>(name: string) => Symbol(name) as TLibSymbol<T>;

/**
 * If react-redux connection function receive `undefined` as a `dispatchToProps` method it then pass `dispatch` method to wrapped component.
 * Often it's not needed as it leads to problems when wrapped component spread all props to any dom element
 *
 * @param omitDispatch - Whether you want to omit `dispatch` method in the props or no
 *
 * @see https://github.com/reduxjs/react-redux/blob/master/src/connect/mapDispatchToProps.js#L10
 */
const getDispatchToProps = (omitDispatch: boolean) => (omitDispatch ? () => ({}) : undefined);

type TCustomOptions = {
  omitDispatch?: boolean;
};

type TModuleStateOrNever<T extends TModuleSetup<any, any> | never> = T extends TModuleSetup<
  any,
  any
>
  ? TModuleState<T>
  : never;

type TModuleActionsOrNever<
  Module extends TModuleSetup<any, any> | never
> = Module extends TModuleSetup<any, any> ? TModuleActions<Module> : never;

type TAppConnectOptions<
  State,
  Dispatch,
  Props,
  GlobalActions,
  GlobalState,
  Module extends TModuleSetup<any, any> | never
> = {
  stateToProps?: (state: GlobalState | TModuleStateOrNever<Module>, ownProps: Props) => State;
  dispatchToProps?: (
    dispatch: (a: GlobalActions | TModuleActionsOrNever<Module>) => void,
    ownProps: Props,
  ) => Dispatch;
  options?: Options<GlobalState, State, Props> & TCustomOptions;
};

/**
 * A wrapper around react-redux connect with build in modules support
 * @param options - An object with `stateToProps`, `dispatchToProps` and `options` keys.
 * @param options.stateToProps - A function that will receive a state and returns a part of a state
 * @param options.dispatchToProps - A function that will receive a dispatch and returns an object with available actions to invoke
 * @param options.options - Same options that you can pass to `react-redux` connect method with additional `omitDispatch`
 * @param options.options.omitDispatch (defaults to true) - Will not pass `dispatch` function to child's when `options.dispatchToProps` is omitted
 */
function appConnect<
  StateToProps = {},
  DispatchToProps = {},
  Props = {},
  GlobalActions = {},
  GlobalState = {},
  Module extends TModuleSetup<any, any> | never = never
>({
  stateToProps,
  dispatchToProps,
  options = {},
}: TAppConnectOptions<
  StateToProps,
  DispatchToProps,
  Props,
  GlobalActions,
  GlobalState,
  Module
>): InferableComponentEnhancerWithProps<StateToProps & DispatchToProps, Props> {
  const { omitDispatch = false, ...connectOptions } = options;

  return connect<StateToProps, DispatchToProps, Props, GlobalState | TModuleState<Module>>(
    stateToProps,
    dispatchToProps || (getDispatchToProps(omitDispatch) as any),
    undefined,
    connectOptions,
  );
}

export { createLibSymbol, appConnect, TAppConnectOptions };
