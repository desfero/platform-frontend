import detox from "detox";
import adapter from "detox/runners/jest/adapter";

import { detox as config } from "../../package.json";

// Set the default timeout
jest.setTimeout(120000);

// Typings for jasmine are not properly defined in jest
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(jasmine as any).getEnv().addReporter(adapter);

beforeAll(async () => {
  await detox.init(config, { initGlobals: false });
}, 300000);

beforeEach(async () => {
  await adapter.beforeEach();
});

afterAll(async () => {
  await adapter.afterAll();
  await detox.cleanup();
});
