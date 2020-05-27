const tsConfig = require("./tsconfig.json");

module.exports = {
  root: true,
  extends: "@neufund/eslint-config/react-native",
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ["./tsconfig.json", "./tsconfig.*.json"],
  },
  rules: {
    "@typescript-eslint/no-magic-numbers": [
      "error",
      {
        // 0 is often used to access first element of an array
        ignore: [0, 1, 2, 4, 10],
        ignoreEnums: true,
        ignoreNumericLiteralTypes: true,
        ignoreReadonlyClassProperties: true,
      },
    ],
    "import/order": [
      "error",
      {
        groups: [
          ["builtin", "external"],
          ["internal", "parent", "sibling", "index"],
        ],
        "newlines-between": "always",
        alphabetize: {
          order: "asc",
        },
        pathGroups: Object.keys(tsConfig.compilerOptions.paths).map(path => ({
          // e.g. "assets/*" => "assets/**"
          pattern: `${path}*`,
          group: "external",
          position: "after",
        })),
        pathGroupsExcludedImportTypes: ["builtin"],
      },
    ],
    "import/no-relative-parent-imports": "error",
  },
  overrides: [
    {
      files: ["**/*.stories.*", "**/*.spec.*", "**/e2e/**"],
      rules: {
        "@typescript-eslint/no-magic-numbers": "off",
      },
    },
  ],
};
