const merge = require("webpack-merge");
const devConfig = require("./webpack.config.dev");

const loadAppEnv = require("./loadAppEnv");
const applicationEnv = loadAppEnv(process.env);

if (!applicationEnv.NF_REMOTE_BACKEND_PROXY_ROOT) {
  throw new Error("Missing NF_REMOTE_BACKEND_PROXY_ROOT env variable. Add it to your .env file");
}

const backendUrl = applicationEnv.NF_REMOTE_BACKEND_PROXY_ROOT;

const localDevConfig = merge(devConfig, {
  devServer: {
    proxy: {
      "/node": {
        target: "http://localhost:8545",
        pathRewrite: { "^/node": "" },
      },
      "/api/signature": {
        target: backendUrl + "signature",
        pathRewrite: { "^/api/signature": "" },
        changeOrigin: true,
      },
      "/api/wallet": {
        target: backendUrl + "wallet",
        pathRewrite: { "^/api/wallet": "" },
        changeOrigin: true,
      },
      "/api/user": {
        target: backendUrl + "user",
        pathRewrite: { "^/api/user": "" },
        changeOrigin: true,
      },
      "/api/kyc": {
        target: backendUrl + "kyc",
        pathRewrite: { "^/api/kyc": "" },
        changeOrigin: true,
      },
    },
  },
});

module.exports = localDevConfig;
