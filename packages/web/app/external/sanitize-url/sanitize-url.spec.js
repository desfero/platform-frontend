// taken from @braintree/sanitize-url
import { expect } from "chai";

import { sanitizeUrl } from "./sanitize-url";

describe("sanitizeUrl", () => {
  it("replaces javascript urls with an empty string", () => {
    expect(sanitizeUrl("javascript:alert(document.domain)")).to.eq("");
  });

  it("disregards capitalization for JavaScript urls", () => {
    expect(sanitizeUrl("jAvasCrIPT:alert(document.domain)")).to.eq("");
  });

  it("ignores ctrl characters in javascript urls", () => {
    expect(sanitizeUrl(decodeURIComponent("JaVaScRiP%0at:alert(document.domain)"))).to.eq("");
  });

  it("replaces javascript urls with an empty string when javascript url begins with %20", () => {
    expect(sanitizeUrl("%20%20%20%20javascript:alert(document.domain)")).to.eq("");
  });

  it("replaces javascript urls with an empty string when javascript url begins with spaces", () => {
    expect(sanitizeUrl("    javascript:alert(document.domain)")).to.eq("");
  });

  it("does not replace javascript: if it is not in the scheme of the URL", () => {
    expect(sanitizeUrl("http://example.com#myjavascript:foo")).to.eq(
      "http://example.com#myjavascript:foo",
    );
  });

  it("replaces data urls with an empty string", () => {
    expect(
      sanitizeUrl("data:text/html;base64,PH%3Cscript%3Ealert(document.domain)%3C/script%3E"),
    ).to.eq("");
  });

  it("replaces data urls with an empty string when data url begins with %20", () => {
    expect(
      sanitizeUrl(
        "%20%20%20%20data:text/html;base64,PH%3Cscript%3Ealert(document.domain)%3C/script%3E",
      ),
    ).to.eq("");
  });

  it("replaces data urls with an empty string when data url begins with spaces", () => {
    expect(
      sanitizeUrl("    data:text/html;base64,PH%3Cscript%3Ealert(document.domain)%3C/script%3E"),
    ).to.eq("");
  });

  it("disregards capitalization for data urls", () => {
    expect(
      sanitizeUrl("dAtA:text/html;base64,PH%3Cscript%3Ealert(document.domain)%3C/script%3E"),
    ).to.eq("");
  });

  it("ignores ctrl characters in data urls", () => {
    expect(
      sanitizeUrl(
        decodeURIComponent(
          "dat%0aa:text/html;base64,PH%3Cscript%3Ealert(document.domain)%3C/script%3E",
        ),
      ),
    ).to.eq("");
  });

  it("does not alter http URLs", () => {
    expect(sanitizeUrl("http://example.com/path/to:something")).to.eq(
      "http://example.com/path/to:something",
    );
  });

  it("does not alter http URLs with ports", () => {
    expect(sanitizeUrl("http://example.com:4567/path/to:something")).to.eq(
      "http://example.com:4567/path/to:something",
    );
  });

  it("does not alter https URLs", () => {
    expect(sanitizeUrl("https://example.com")).to.eq("https://example.com");
  });

  it("does not alter https URLs with ports", () => {
    expect(sanitizeUrl("https://example.com:4567/path/to:something")).to.eq(
      "https://example.com:4567/path/to:something",
    );
  });

  it("does not alter relative-path reference URLs", () => {
    expect(sanitizeUrl("./path/to/my.json")).to.eq("./path/to/my.json");
  });

  it("does not alter absolute-path reference URLs", () => {
    expect(sanitizeUrl("/path/to/my.json")).to.eq("/path/to/my.json");
  });

  it("does not alter protocol-less network-path URLs", () => {
    expect(sanitizeUrl("//google.com/robots.txt")).to.eq("//google.com/robots.txt");
  });

  it("does not alter protocol-less URLs", () => {
    expect(sanitizeUrl("www.example.com")).to.eq("www.example.com");
  });

  it("does not alter deep-link urls", () => {
    expect(sanitizeUrl("com.braintreepayments.demo://example")).to.eq(
      "com.braintreepayments.demo://example",
    );
  });

  it("does not alter mailto urls", () => {
    expect(sanitizeUrl("mailto:test@example.com?subject=hello+world")).to.eq(
      "mailto:test@example.com?subject=hello+world",
    );
  });

  it("does not alter urls with accented characters", () => {
    expect(sanitizeUrl("www.example.com/with-áccêntš")).to.eq("www.example.com/with-áccêntš");
  });

  it("replaces blank urls with an empty string", () => {
    expect(sanitizeUrl("")).to.eq("");
  });

  it("replaces null values with an empty string", () => {
    expect(sanitizeUrl(null)).to.eq("");
  });

  it("replaces undefined values with an empty string", () => {
    expect(sanitizeUrl()).to.eq("");
  });

  it("removes whitespace from urls", () => {
    expect(sanitizeUrl("   http://example.com/path/to:something    ")).to.eq(
      "http://example.com/path/to:something",
    );
  });
});
