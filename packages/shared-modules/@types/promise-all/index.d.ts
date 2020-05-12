declare module "promise-all" {
  type Promised<T> = { [P in keyof T]: Promise<T[P]> };
  function promiseAll<T>(o: Promised<T>): Promise<T>;

  namespace promiseAll {}

  export = promiseAll;
}
