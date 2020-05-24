/* eslint-disable @typescript-eslint/no-explicit-any */

import isFunction from "lodash/fp/isFunction";

const callGuard = (methodName: string) => (...args: any[]) => {
  throw new Error(`Unexpected call to method: '${methodName}' with args: ${args}`);
};

/**
 * A jest util to mock class methods.
 * Useful to mock partially class and be confident that all other class methods are never used.
 *
 * @param clazz - A class to mock
 * @param mockImpl - A mocked methods
 */
function createMock<T>(clazz: new (...args: any[]) => T, mockImpl: Partial<T>): T {
  const methods = clazz.prototype ?? {};

  const allMethods = new Set<string>([
    ...Object.getOwnPropertyNames(methods),
    ...Object.keys(mockImpl),
  ]);

  allMethods.delete("constructor");

  const mock: any = {};

  allMethods.forEach(methodName => {
    const userProvidedMock = (mockImpl as any)[methodName];

    if (userProvidedMock) {
      mock[methodName] = isFunction(userProvidedMock)
        ? jest.fn(userProvidedMock)
        : userProvidedMock;
    } else {
      mock[methodName] = callGuard(methodName);
    }
  });

  return mock;
}

export { createMock };
