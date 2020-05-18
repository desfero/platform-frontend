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
