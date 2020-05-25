module.exports = {
  preset: "react-native",
  setupFiles: ["./jest-setup-file.specUtils.ts"],
  modulePathIgnorePatterns: ["<rootDir>/tests/e2e/"],
  setupFilesAfterEnv: ["@testing-library/react-native/cleanup-after-each"],
};
