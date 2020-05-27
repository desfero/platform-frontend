module.exports = {
  plugins: ["react", "react-hooks"],
  extends: ["./base.js", "plugin:import/react", "prettier/react"],
  settings: {
    "import/resolver": {
      node: {
        extensions: [".js", ".jsx", ".ts", ".tsx", ".d.ts"],
      },
    },
    react: {
      version: "detect",
    },
  },
  rules: {
    /**
     * Provide a little help for core unused variables rule by marking manually jsx elements and vars
     */
    "react/jsx-uses-vars": "error",
    "react/jsx-uses-react": "error",

    /**
     * Lint hooks rules
     */
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "error",

    /**
     * Props
     */
    "react/jsx-boolean-value": "error",
  },
};
