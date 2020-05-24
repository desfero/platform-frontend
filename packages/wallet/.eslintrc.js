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
        ignore: [0, 0.5, 1, 2, 4, 10],
        ignoreEnums: true,
        ignoreNumericLiteralTypes: true,
        ignoreReadonlyClassProperties: true,
      },
    ],
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
