const path = require("path");
const paths = require("../webpack/paths");

module.exports = {
  stories: ["../src/**/*.stories.tsx"],
  webpackFinal: async config => {
    config.module.rules = [
      {
        oneOf: [
          {
            test: /\.module.scss$/,
            use: [
              {
                loader: "style-loader",
              },
              {
                loader: "css-loader",
                options: {
                  sourceMap: true,
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
                  config: { path: paths.postCSSConfig },
                },
              },
              {
                loader: "sass-loader",
              },
              {
                loader: "sass-resources-loader",
                options: {
                  resources: paths.sassResource,
                },
              },
            ],
          },
          {
            test: /\.scss$/,
            use: [
              {
                loader: "style-loader",
              },
              {
                loader: "css-loader",
                options: {
                  importLoaders: 2,
                },
              },
              {
                loader: "postcss-loader",
                options: {
                  config: { path: path.join(__dirname, "postcss.config.js") },
                },
              },
              { loader: "sass-loader" },
            ],
          },
          {
            test: /\.(tsx?)$/,
            use: [
              {
                loader: "ts-loader",
                options: {
                  configFile: "tsconfig.json",
                  transpileOnly: true,
                  experimentalWatchApi: true,
                },
              },
            ],
            include: paths.src,
          },
          {
            test: /\.(jpg|png|svg|gif|webm|mp4)$/,
            loader: "url-loader",
            include: paths.assets,
            exclude: paths.inlineIcons,
            options: {
              limit: 25000,
              publicPath: "/",
            },
          },
          {
            test: /\.(svg)$/,
            loader: "raw-loader",
            include: paths.inlineIcons,
          },
          {
            test: /\.md$/,
            loader: "raw-loader",
            include: paths.src,
          },
          {
            test: /\.(woff2|woff|ttf|eot|otf)$/,
            loader: "file-loader",
            options: {
              name: "fonts/[hash].[ext]",
            },
          },
        ],
      },
    ];

    config.resolve.extensions.push(".ts", ".tsx");

    return config;
  },
};
