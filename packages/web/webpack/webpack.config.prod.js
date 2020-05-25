const path = require("path");
const TerserPlugin = require("terser-webpack-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const webpack = require("webpack");
const merge = require("webpack-merge");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

const configCommon = require("./webpack.config.common");
const paths = require("./paths");

const isCircleCI = () => process.env.CI === "true" && process.env.CIRCLECI === "true";

/**
 * @webpack a special webpack configuration that should used on when deploying production code
 */
module.exports = merge.smart(configCommon, {
  devtool: false,
  mode: "production",
  optimization: {
    splitChunks: {
      chunks: "all",
    },
    runtimeChunk: true,
    minimizer: [
      new TerserPlugin({
        // CircleCI doesn't provide real available CPU's
        // see: https://github.com/webpack-contrib/terser-webpack-plugin/issues/202
        parallel: isCircleCI() ? 1 : true,
        terserOptions: {
          mangle: {
            // for details see https://github.com/ethereum/web3.js/issues/1356
            reserved: ["BigNumber"],
          },
          output: {
            // do not preserve any kind of comments in the final bundle
            comments: false,
          },
        },
      }),
      new OptimizeCSSAssetsPlugin(),
      new webpack.HashedModuleIdsPlugin(),
    ],
  },
  output: {
    filename: "[chunkhash].[name].min.js",
  },
  plugins: [
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: "[contenthash].[name].css",
    }),
  ],
  module: {
    rules: [
      {
        oneOf: [
          {
            test: /\.module.scss$/,
            use: [
              {
                loader: "css-loader",
                options: {
                  importLoaders: 3,
                  modules: {
                    localIdentName: "[name]__[local]___[hash:base64:5]",
                  },
                  localsConvention: "dashesOnly",
                },
              },
              {
                loader: "postcss-loader",
                options: {
                  config: {
                    path: path.join(__dirname, "postcss.config.js"),
                  },
                },
              },
              {
                loader: "sass-loader",
              },
              {
                loader: "sass-resources-loader",
                options: {
                  resources: [paths.neufundTheme],
                },
              },
            ],
          },
          {
            test: /\.scss$/,
            use: [
              MiniCssExtractPlugin.loader,
              {
                loader: "css-loader",
                options: {
                  importLoaders: 2,
                },
              },
              {
                loader: "postcss-loader",
                options: {
                  config: {
                    path: path.join(__dirname, "postcss.config.js"),
                  },
                },
              },
              {
                loader: "sass-loader",
              },
            ],
          },
          {
            test: /\.css$/,
            use: [
              MiniCssExtractPlugin.loader,
              {
                loader: "css-loader",
              },
            ],
          },
          {
            test: /\.(tsx?)$/,
            use: [
              {
                loader: "ts-loader",
                options: {
                  configFile: "tsconfig.json",
                },
              },
            ],
            include: paths.app,
          },
        ],
      },
    ],
  },
});
