const path = require("path");

const ARTIFACTS_PATH_FROM_SCRIPTS = `/git_modules/platform-contracts-artifacts/`;

const getArtifactsSubmoduleRelativePath = () => {
  return path.join(__dirname, "../../..", ARTIFACTS_PATH_FROM_SCRIPTS);
};

const getArtifactsRelativePath = artifactsVersion => {
  return path.join(getArtifactsSubmoduleRelativePath(), artifactsVersion);
};

const getArtifactsMeta = artifactsVersion => {
  return require(`${getArtifactsRelativePath(artifactsVersion)}/meta.json`);
};

const getArtifactsFixtures = artifactsVersion => {
  return require(`${getArtifactsRelativePath(artifactsVersion)}/fixtures.json`);
};

module.exports = {
  getArtifactsRelativePath,
  getArtifactsSubmoduleRelativePath,
  getArtifactsFixtures,
  getArtifactsMeta,
};
