const { join } = require("path");
const { mapValues } = require("lodash");
const dotenv = require("dotenv");

const { getArtifactsMeta } = require("../scripts/getArtifacts");

module.exports = function loadAppEnv() {
  const universeAddressExists = !!process.env.NF_UNIVERSE_CONTRACT_ADDRESS;
  const envs = dotenv.load({ path: join(__dirname, "../.env") }).parsed;

  // we are combining the NODE_ENV variable with the local variables from the .env file
  // we can't simply pass all envs from process.env because they would become part of the bundle
  const bundle = {
    NODE_ENV: process.env.NODE_ENV || "development",
  };
  if (process.env.NF_ENABLE_TRANSLATE_OVERLAY) {
    bundle.NF_ENABLE_TRANSLATE_OVERLAY = process.env.NF_ENABLE_TRANSLATE_OVERLAY;
  }
  if (!process.env.NF_CONTRACT_ARTIFACTS_VERSION) {
    bundle.NF_CONTRACT_ARTIFACTS_VERSION = "localhost";
  }

  const allEnvs = Object.assign({}, bundle, envs);

  // extract universe address from contract artifacts repo meta.json
  // overrides .env value, if meta.json exists, but not process.env
  if (!universeAddressExists) {
    try {
      const { UNIVERSE_ADDRESS } = getArtifactsMeta(allEnvs.NF_CONTRACT_ARTIFACTS_VERSION);

      allEnvs.NF_UNIVERSE_CONTRACT_ADDRESS = UNIVERSE_ADDRESS;
    } catch (e) {
      console.error("cannot read universe address from meta.json in contract artifacts", e.message);
      console.error("not overriding NF_UNIVERSE_CONTRACT_ADDRESS");
    }
  }

  return mapValues(allEnvs, JSON.stringify);
};
