/**
 * Expose promise `resolve` and `reject` methods outside of promise constructor to inverse control
 */
const unwrapPromise = <T>() => {
  let resolve: ((value?: T | PromiseLike<T>) => void) | undefined = undefined;
  let reject: ((reason?: Error) => void) | undefined = undefined;

  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return {
    promise,
    resolve: (resolve as unknown) as (value?: T | PromiseLike<T>) => void,
    reject: (reject as unknown) as (reason?: Error) => void,
  };
};

export { unwrapPromise };
