/*
 * taken from @braintree/sanitize-url, slightly modified and repacked as UMD
 */

(function(global, factory) {
  if (typeof exports !== "undefined") {
    factory(exports);
  } else {
    var exports = {};
    factory(exports);

    Object.assign(global, exports);
  }
})(this, function(exports) {
  "use strict";

  var invalidProtocolRegex = /^(%20|\s)*(javascript|data)/im;
  var ctrlCharactersRegex = /[^\x20-\x7EÀ-ž]/gim;
  var urlSchemeRegex = /^([^:]+):/gm;
  var relativeFirstCharacters = [".", "/"];
  var fallback = "";

  function isRelativeUrlWithoutProtocol(url) {
    return relativeFirstCharacters.indexOf(url[0]) > -1;
  }

  function sanitizeUrl(url) {
    var urlScheme, urlSchemeParseResults, sanitizedUrl;

    if (!url) {
      return fallback;
    }

    sanitizedUrl = url.replace(ctrlCharactersRegex, "").trim();

    if (isRelativeUrlWithoutProtocol(sanitizedUrl)) {
      return sanitizedUrl;
    }

    urlSchemeParseResults = sanitizedUrl.match(urlSchemeRegex);

    if (!urlSchemeParseResults) {
      return sanitizedUrl;
    }

    urlScheme = urlSchemeParseResults[0];

    if (invalidProtocolRegex.test(urlScheme)) {
      return fallback;
    }

    return sanitizedUrl;
  }

  exports.sanitizeUrl = sanitizeUrl;
});
