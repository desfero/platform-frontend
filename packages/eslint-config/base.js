module.exports = {
  env: {
    es6: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:import/typescript",
    "prettier",
    "prettier/@typescript-eslint",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    sourceType: "module",
  },
  plugins: ["@typescript-eslint", "import"],
  rules: {
    // turn off some recommended options that don't align with our styleguide
    "require-yield": "off",
    "@typescript-eslint/no-unused-vars": "off",
    "@typescript-eslint/interface-name-prefix": "off",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/no-use-before-define": "off",

    complexity: ["error", { max: 10 }],
    "no-await-in-loop": "error",
    "no-console": "error",
    "no-template-curly-in-string": "error",
    "require-atomic-updates": "error",
    "default-case": "error",
    "no-constructor-return": "error",
    "no-extend-native": "error",
    "no-extra-bind": "error",
    "no-extra-label": "error",
    "no-return-assign": "error",
    "no-return-await": "error",

    "@typescript-eslint/array-type": ["error", { default: "array-simple" }],
    "@typescript-eslint/consistent-type-assertions": [
      "error",
      { assertionStyle: "as", objectLiteralTypeAssertions: "never" },
    ],
    "@typescript-eslint/no-base-to-string": "error",
    "@typescript-eslint/no-dynamic-delete": "error",
    "@typescript-eslint/no-extra-non-null-assertion": "error",
    "@typescript-eslint/no-implied-eval": "error",
    "@typescript-eslint/no-non-null-asserted-optional-chain": "error",
    "@typescript-eslint/no-require-imports": "error",
    "@typescript-eslint/no-throw-literal": "error",
    "@typescript-eslint/no-unnecessary-boolean-literal-compare": "error",
    "@typescript-eslint/no-unnecessary-qualifier": "error",
    "@typescript-eslint/no-unnecessary-type-arguments": "error",
    "@typescript-eslint/prefer-as-const": "error",
    "@typescript-eslint/prefer-function-type": "error",
    "@typescript-eslint/prefer-optional-chain": "error",
    "@typescript-eslint/prefer-readonly": "error",
    "@typescript-eslint/prefer-reduce-type-parameter": "error",
    "@typescript-eslint/require-array-sort-compare": "error",
    "@typescript-eslint/switch-exhaustiveness-check": "error",
    "@typescript-eslint/unified-signatures": "error",

    /**
     * Import eslint rules
     */
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
      },
    ],
    "import/no-useless-path-segments": "error",
    "import/first": "error",
    "import/no-duplicates": "error",
    "import/newline-after-import": "error",
    "import/max-dependencies": ["error", { max: 15 }],
    "import/no-named-default": "error",
    "import/no-default-export": "error",
  },
};
