const path = require("path");

module.exports = {
  assets: path.join(__dirname, "../src/assets"),
  inlineIcons: path.join(__dirname, "../src/assets/img/inline_icons"),
  postCSSConfig: path.join(__dirname, "../postcss.config.js"),
  sassResource: path.join(__dirname, "../src/styles/neufund-theme.scss"),
  src: path.join(__dirname, "../src"),
  dist: path.join(__dirname, "../dist"),
};
