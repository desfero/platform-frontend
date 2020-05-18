import * as BigNumber from "bignumber.js";
import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";
import * as chaiBignumber from "chai-bignumber";
import * as crypto from "crypto";
import "ignore-styles";
import { JSDOM } from "jsdom";
import * as fetch from "node-fetch";
import "reflect-metadata";
import * as sinonChai from "sinon-chai";

chai.config.truncateThreshold = 0;
interface IGlobalWithWindow extends NodeJS.Global {
  window: Window;
  // Window object is injected later
}

// Adds random bytes for lightwallet generation
// Note: we are forced to use `self` because one of the libraries that the light wallet uses, utilizes self
(self as any).crypto = {
  getRandomValues: (n: Uint8Array) => {
    const length = n.length;
    crypto.randomBytes(length);
  },
};

// Adds fetch to our unit/integration tests
(global as any).fetch = fetch;

chai.use(chaiAsPromised);
chai.use(chaiBignumber(BigNumber));
chai.use(sinonChai);

// @SEE https://github.com/jsdom/jsdom/issues/2383
const { window } = new JSDOM(``, {
  url: "http://localhost",
});

(global as IGlobalWithWindow).window = window;

// make sure that tests fail on unhandled promise rejection
process.on("unhandledRejection", (reason, p) => {
  // tslint:disable-next-line
  console.log("Unhandled Rejection at: Promise", p, "reason:", reason);
  process.exit(1);
});
