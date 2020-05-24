const { tsGenerator } = require("ts-generator");
const { TypeChain } = require("typechain/dist/TypeChain");
const fs = require("fs");
const path = require("path");
const mapValues = require("lodash/fp/mapValues");

const {
  getArtifactsRelativePath,
  getArtifactsMeta,
  getArtifactsFixtures,
} = require("./get-artifacts");

// TODO: Find a way to inject process.env
const artifactsVersion = process.env.NF_CONTRACT_ARTIFACTS_VERSION || "localhost";

const outDir = "app/lib/contracts";

async function generateKnownInterfaces() {
  const { KNOWN_INTERFACES } = getArtifactsMeta(artifactsVersion);

  fs.writeFileSync(
    path.resolve(__dirname, "..", outDir, "knownInterfaces.json"),
    JSON.stringify(KNOWN_INTERFACES, null, 2),
  );
}

async function generateFixtures() {
  let fixtures = {};

  // fixtures are only available for localhost artifacts version
  if (artifactsVersion === "localhost") {
    const artifactsFixtures = getArtifactsFixtures(artifactsVersion);

    fixtures = mapValues(
      value => ({
        name: value.name,
        type: value.type,
        privateKey: value.definition.privateKey,
        address: value.definition.address,
      }),
      artifactsFixtures,
    );
  }

  fs.writeFileSync(
    path.resolve(__dirname, "..", outDir, "fixtures.json"),
    JSON.stringify(fixtures, null, 2),
  );
}

async function generateTypechainWrappers() {
  const cwd = process.cwd();

  await tsGenerator(
    { cwd },
    new TypeChain({
      cwd,
      rawConfig: {
        outDir,
        files: `${getArtifactsRelativePath(artifactsVersion)}/contracts/*.json`,
        target: "ethers",
      },
    }),
  );
}

async function main() {
  try {
    await generateTypechainWrappers();
  } catch (e) {
    console.error("Failed to generate typechain contract wrappers");
    console.error(e.message);
    process.exit(1);
  }

  try {
    await generateKnownInterfaces();
  } catch (e) {
    console.error("Failed to read meta.json and generate knownInterfaces.json");
    console.error(e.message);
    process.exit(1);
  }

  try {
    await generateFixtures();
  } catch (e) {
    console.error("Failed to read fixtures");
    console.error(e.message);
    process.exit(1);
  }
}

main();
