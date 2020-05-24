module.exports = {
  extends: [
    "./react",
    "plugin:import/react-native",
    "plugin:react-native-a11y/all",
  ],
  plugins: ["react-native"],
  settings: {
    "import/resolver": {
      node: {
        extensions: [
          ".js",
          ".jsx",
          ".ts",
          ".tsx",
          ".d.ts",
          ".android.js",
          ".android.jsx",
          ".android.ts",
          ".android.tsx",
          ".ios.js",
          ".ios.jsx",
          ".ios.ts",
          ".ios.tsx",
          ".web.js",
          ".web.jsx",
          ".web.ts",
          ".web.tsx",
        ],
      },
    },
  },
  rules: {
    "react-native/no-unused-styles": "error",
    "react-native/split-platform-components": "error",
    "react-native/no-inline-styles": "error",
    "react-native/no-color-literals": "error",
  },
  overrides: [
    {
      files: ["**/*.stories.*"],
      rules: {
        "react-native/no-inline-styles": "off",
        "react-native/no-color-literals": "off",
      },
    },
  ],
};
