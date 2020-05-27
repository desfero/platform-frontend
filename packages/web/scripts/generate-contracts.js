const tc = require("typechain");
const path = require("path");
const fs = require("fs");
const os = require("os");

const { getArtifactsMeta, getArtifactsRelativePath } = require("./getArtifacts");
const loadAppEnv = require("../webpack/loadAppEnv");

loadAppEnv();

const artifactsVersion = process.env.NF_CONTRACT_ARTIFACTS_VERSION || "localhost";

const outDir = "app/lib/contracts";

const filteredArtifacts = [/Gov\.json/, /Test.+\.json/, /Mock.+\.json/];

// @ts-ignore
global.IS_CLI = true;

function generateKnownInterfaces() {
  const { KNOWN_INTERFACES } = getArtifactsMeta(artifactsVersion);
  fs.writeFileSync(
    path.resolve(__dirname, "..", outDir, "knownInterfaces.json"),
    JSON.stringify(KNOWN_INTERFACES, null, "  "),
  );
}

async function filterArtifacts(sourcePath) {
  const tmpdir = await fs.promises.mkdtemp(path.join(os.tmpdir(), "neufund-artifacts"));
  const dir = await fs.promises.opendir(sourcePath);
  for await (const dirent of dir) {
    if (!filteredArtifacts.some(p => p.test(dirent.name))) {
      await fs.promises.copyFile(`${sourcePath}${dirent.name}`, `${tmpdir}/${dirent.name}`);
    }
  }
  return tmpdir;
}

async function main() {
  try {
    const filteredPath = await filterArtifacts(
      `${getArtifactsRelativePath(artifactsVersion)}/contracts/`,
    );
    await tc.generateTypeChainWrappers({
      outDir,
      glob: `${filteredPath}/*.json`,
      force: true,
    });
  } catch (e) {
    console.error("Failed to generate typechain contract wrappers");
    console.error(e.message);
    process.exit(1);
  }
  try {
    generateKnownInterfaces();
  } catch (e) {
    console.error("Failed to read meta.json and generate knownInterfaces.json");
    console.error(e.message);
    process.exit(1);
  }
}

main();
