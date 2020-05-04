import { ActionMatchingPattern } from "@redux-saga/types";
import { Container } from "inversify";
import { isMatch } from "lodash/fp";
import { CallEffect, SagaReturnType, Tail } from "redux-saga/effects";

import {
  ActionPattern,
  call,
  delay,
  fork,
  getContext,
  race,
  SagaGenerator,
  spawn,
  take,
  takeEvery,
  takeLatest,
  throttle,
} from "./sagaEffects";

export type TActionPayload<T> = T extends any ? any : never;

/**
 * For now global dependencies are marked as `any` until we find a good way to type them type safely
 * You still preserve proper typesafety while using dependencies.
 * @example
 *  type TDependencies = TModuleSymbols<typeof coreModuleApi>;
 *
 *  function* saga({ logger }: TDependencies): Generator<any, any, any> {
 *    // ...
 *  }
 */
type TGlobalDependencies = any;

type TSagaWithDeps = (deps: TGlobalDependencies, ...args: any[]) => any;
type TSagaWithDepsAndArgs<R, T extends any[]> = (deps: TGlobalDependencies, ...args: T) => R;

function* neuGetDeps(): Generator<any, TGlobalDependencies, any> {
  const deps: unknown = yield getContext("deps");
  return deps as TGlobalDependencies;
}

export function* neuGetContainer(): Generator<any, Container, any> {
  const container: unknown = yield getContext("container");
  return container as Container;
}

export function* neuTakeLatest(type: ActionPattern, saga: TSagaWithDeps): Generator<any, any, any> {
  const deps = yield* neuGetDeps();
  yield takeLatest(type, saga, deps);
}

export function* neuTakeEvery<T extends any[]>(
  type: ActionPattern,
  saga: TSagaWithDeps,
  ...args: T
): Generator<any, any, any> {
  const deps = yield* neuGetDeps();
  yield takeEvery(type, saga, deps, ...args);
}

export function* neuFork<R, T extends any[]>(
  saga: TSagaWithDepsAndArgs<R, T>,
  ...args: T
): Generator<any, any, any> {
  const deps = yield* neuGetDeps();
  return yield (fork as any)(saga, deps, ...args);
}

export function* neuSpawn<R, T extends any[]>(
  saga: TSagaWithDepsAndArgs<R, T>,
  ...args: T
): Generator<any, any, any> {
  const deps = yield* neuGetDeps();
  return yield (spawn as any)(saga, deps, ...args);
}

export function* neuCall<
  Args extends any[],
  FN extends (deps: TGlobalDependencies, ...args: Args) => any
>(fn: FN, ...args: Args): SagaGenerator<SagaReturnType<FN>, CallEffect<SagaReturnType<FN>>> {
  const deps = yield* neuGetDeps();

  return yield* call(fn, ...([deps, ...args] as Parameters<typeof fn>));
}

/**
 * Starts saga on `startAction`, cancels on `stopAction`, loops...
 */
export function* neuTakeUntil<
  P extends ActionPattern,
  Fn extends (action: ActionMatchingPattern<P>, ...args: any[]) => any
>(
  startAction: ActionPattern,
  stopAction: ActionPattern,
  saga: TSagaWithDeps,
  ...args: Tail<Parameters<Fn>>
): any {
  while (true) {
    const action = yield take(startAction);
    // We need to help compiler by manually joining types
    const sagaArgsTyped = [action, ...args] as Parameters<Fn>;
    // No direct concurrent requests like `fork` or `spawn` should be in the loop
    yield race({
      task: neuCall(saga, ...sagaArgsTyped),
      cancel: take(stopAction),
    });
  }
}

/**
 * Starts saga on `startAction`, cancels on `stopAction`, loops...
 */
export function* neuTakeLatestUntil<
  P extends ActionPattern,
  Fn extends (action: ActionMatchingPattern<P>, ...args: any[]) => any
>(
  startAction: P,
  stopAction: ActionPattern | string,
  saga: Fn,
  ...args: Tail<Parameters<Fn>>
): SagaGenerator<void> {
  yield takeLatest(startAction, function*(action: ActionMatchingPattern<P>): SagaGenerator<void> {
    // We need to help compiler by manually joining types
    const sagaArgsTyped = [action, ...args] as Parameters<Fn>;

    yield* race({
      // we need to help compiler here by joining params manually
      task: call(saga, ...sagaArgsTyped),
      cancel: take(stopAction),
    });
  });
}

/**
 *  Awaits an Action with specific payload.
 *  You can pass only a part of the payload that you want to match.
 */
export function* neuTakeOnly<T extends ActionPattern>(
  type: T,
  payload: Partial<TActionPayload<T>>,
): any {
  while (true) {
    const takenAction: any = yield take(type);
    if (
      // TODO: Update prettier to allow `.?` operator
      (takenAction && takenAction.payload === undefined) ||
      isMatch(payload as object, takenAction.payload as object)
    ) {
      return takenAction;
    }
  }
}

/**
 *  Executes the generator and repeats if repeatAction was dispatched. Exits when endAction
 *  is dispatched.
 */
export function* neuRepeatIf<R, T extends any[]>(
  repeatAction: ActionPattern,
  endAction: ActionPattern,
  saga: TSagaWithDepsAndArgs<R, T>,
  ...args: T
): any {
  while (true) {
    yield neuCall(saga, ...args);

    const { repeat, end } = yield race({
      repeat: take(repeatAction),
      end: take(endAction),
    });
    if (repeat) {
      continue;
    }
    if (end) {
      return;
    }
  }
}

/**
 *  Executes the generator and restarts running job if a specific actions is fired
 */
export function* neuRestartIf<R, T extends any[]>(
  cancelAction: ActionPattern,
  saga: TSagaWithDepsAndArgs<R, T>,
  ...args: T
): any {
  while (true) {
    yield race({
      task: neuCall(saga, ...args),
      cancel: take(cancelAction),
    });
  }
}

/**
 * Ignore incoming actions for a given period of time while processing a task.
 * After spawning a task, it's still accepting incoming actions into the underlying buffer, keeping at most 1.
 */
export function* neuThrottle(
  ms: number,
  type: ActionPattern,
  saga: TSagaWithDeps,
): Generator<any, any, any> {
  const deps = yield* neuGetDeps();
  yield throttle(ms, type, saga, deps);
}

function* next<R, T extends any[]>(
  ms: number,
  task: TSagaWithDepsAndArgs<R, T>,
  ...args: T
): Generator<any, any, any> {
  yield delay(ms);
  yield neuCall(task, ...args);
}

// TODO: Add tests for debounce
export function* neuDebounce<R, T extends any[]>(
  ms: number,
  pattern: ActionPattern,
  saga: TSagaWithDepsAndArgs<R, T>,
  ...args: T
): Generator<any, any, any> {
  yield (takeLatest as any)(pattern, next, ms, saga, ...args);
}
