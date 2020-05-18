import BigNumber from "bignumber.js";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import chaiBignumber from "chai-bignumber";
import crypto from "crypto";
import fetch from "node-fetch";
import "reflect-metadata";
import sinonChai from "sinon-chai";

chai.use(chaiAsPromised);
chai.use(chaiBignumber(BigNumber));
chai.use(sinonChai);

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

// make sure that tests fail on unhandled promise rejection
process.on("unhandledRejection", (reason, p) => {
  // tslint:disable-next-line
  console.log("Unhandled Rejection at: Promise", p, "reason:", reason);
  process.exit(1);
});
