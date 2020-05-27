const tsConfig = require("./tsconfig.json");

// transform {"assets/*": ["app/assets/*"]} => {"assets": "./app/assets" }
const alias = Object.entries(tsConfig.compilerOptions.paths).reduce((alias, path) => {
  const aliasName = path[0].replace("/*", "");
  alias[aliasName] = "./" + path[1][0].replace("/*", "");
  return alias;
}, {});

module.exports = {
  presets: ["module:metro-react-native-babel-preset"],
  plugins: [
    ["@babel/plugin-proposal-decorators", { legacy: true }],
    "babel-plugin-parameter-decorator",
    [
      "module-resolver",
      {
        root: ["."],
        extensions: [".ts", ".tsx", ".js", ".ios.js", ".android.js"],
        alias,
      },
    ],
  ],
};
