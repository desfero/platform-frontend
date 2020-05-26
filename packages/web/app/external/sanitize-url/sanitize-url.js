//slightly modified @braintree/sanitize-url

"use strict";

var invalidPrototcolRegex = /^(%20|\s)*(javascript|data)/im;
var ctrlCharactersRegex = /[^\x20-\x7EÀ-ž]/gim;
var urlSchemeRegex = /^([^:]+):/gm;
var relativeFirstCharacters = [".", "/"];

function isRelativeUrlWithoutProtocol(url) {
  return relativeFirstCharacters.indexOf(url[0]) > -1;
}

function sanitizeUrl(url) {
  var urlScheme, urlSchemeParseResults, sanitizedUrl;

  if (!url) {
    return "";
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

  if (invalidPrototcolRegex.test(urlScheme)) {
    return "";
  }

  return sanitizedUrl;
}
