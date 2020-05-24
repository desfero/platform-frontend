import { expect } from "chai";

import { AUTH_TOKEN_REFRESH_THRESHOLD } from "./constants";
import { minutesToMs, secondsToMs } from "./DateUtils";
import {
  getJwtExpiryDate,
  hasValidPermissions,
  isJwtExpiringLateEnough,
  isValid,
  parseJwt,
} from "./JWTUtils";
import { setupFakeClock } from "./test/setupFakeClock";

const tokenWithPermissions = {
  parsed: {
    permissions: {
      "do-bookbuilding": 1560460166,
      "sign-tos": 1560460144,
    },
    iat: 1560459566.477146,
    exp: 1560545966,
  },
  jwt:
    "eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzUxMiJ9.eyJzdWIiOiIweDc0MTgwQjU2REQ3NEJDNTZhMkU5RDU3MjBGMzkyNDdjNTVGMjMzMjgiLCJ1aWQiOiIweDc0MTgwQjU2REQ3NEJDNTZhMkU5RDU3MjBGMzkyNDdjNTVGMjMzMjgiLCJ1aWRfdHlwZSI6IndhbGxldF9hZGRyZXNzIiwiZXhwIjoxNTYwNTQ1OTY2LCJpc3MiOiJuZXVmdW5kIiwiYXVkIjoiZXh0ZXJuYWwiLCJpYXQiOjE1NjA0NTk1NjYuNDc3MTQ2LCJqdGkiOiI2ZmJmMjU1Mi1jZjlmLTRmZTAtODBiNC0xNGMzZGYwYzk2MDAiLCJwZXJtaXNzaW9ucyI6eyJkby1ib29rYnVpbGRpbmciOjE1NjA0NjAxNjYsInNpZ24tdG9zIjoxNTYwNDYwMTQ0fX0.AR2h-_-Iu__YuVb7i0wUNfXB61nd3HpB48hsC_7my1D-IHQCfWzfWYOY0KuI5eMyvZ2DThHquj_-1YciZ2gdvC69AJE5vqH2Yzlc4Hq-LHqjw9Fh1kWh_QVHTBX5_TtAQFwEzyocvrbAtJ83UnqRSRbgyQsi1zPwf_b6qY_ECsbByBk1",
};

const tokenWithoutPermissions = {
  parsed: {
    permissions: [],
    iat: 1560461473,
    exp: 1560547873,
  },
  jwt:
    "eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzUxMiJ9.eyJzdWIiOiIweDc0MTgwQjU2REQ3NEJDNTZhMkU5RDU3MjBGMzkyNDdjNTVGMjMzMjgiLCJ1aWQiOiIweDc0MTgwQjU2REQ3NEJDNTZhMkU5RDU3MjBGMzkyNDdjNTVGMjMzMjgiLCJ1aWRfdHlwZSI6IndhbGxldF9hZGRyZXNzIiwiZXhwIjoxNTYwNTQ3ODczLCJpc3MiOiJuZXVmdW5kIiwiYXVkIjoiZXh0ZXJuYWwiLCJpYXQiOjE1NjA0NjE0NzMuMjczNDA4NywianRpIjoiMzg0ZDJiMGQtMzVlMy00MGU5LWJkYmMtZjllOWNjZTMyNzA0IiwicGVybWlzc2lvbnMiOnt9fQ.ADlSax5yr6U3npaBXPV0nkOmWvFaQjeteMbaxLWdrAjpE3Lv8GDG3_4t_wkWxwRfK-Anw6RUsqMuIrCdrYuqZt8-AFvtUaZgoBMqxawMdjugywEF7_tVsELSbbL53wOoIpeCzR1B-45Wj7sOgruOJMf2zjVb__894PnIqER5ULnZeW0D",
};

describe("JWT Utils", () => {
  describe("hasValidPermissions", () => {
    describe("with permissions", () => {
      const { jwt, parsed } = tokenWithPermissions;

      const clock = setupFakeClock(secondsToMs(parsed.iat));

      it("should return true when permissions are valid", () => {
        const result = hasValidPermissions(jwt, ["sign-tos", "do-bookbuilding"]);

        expect(result).to.be.true;
      });

      it("should return true when permissions are empty array", () => {
        const result = hasValidPermissions(jwt, []);

        expect(result).to.be.true;
      });

      it("should return false when permissions are not valid", () => {
        clock.fakeClock.tick(minutesToMs(10));

        const result = hasValidPermissions(jwt, ["sign-tos", "do-bookbuilding"]);

        expect(result).to.be.false;
      });
    });

    describe("without permissions", () => {
      const { jwt, parsed } = tokenWithoutPermissions;

      setupFakeClock(secondsToMs(parsed.iat));

      it("should return false when  is without permissions", () => {
        const result = hasValidPermissions(jwt, ["sign-tos"]);

        expect(result).to.be.false;
      });
    });

    it("should return false when failed to parse jwt", () => {
      const brokenToken = "i'm broken jwt ";
      const result = hasValidPermissions(brokenToken, ["sign-tos"]);

      expect(result).to.be.false;
    });
  });

  describe("isValid", () => {
    const { parsed, jwt } = tokenWithPermissions;

    const clock = setupFakeClock(secondsToMs(parsed.iat));

    it("should return true when jwt is valid", () => {
      const result = isValid(jwt);

      expect(result).to.be.true;
    });

    it("should return false when jwt is expired", () => {
      clock.fakeClock.tick(secondsToMs(parsed.exp - parsed.iat));
      clock.fakeClock.tick(1);

      const result = isValid(jwt);

      expect(result).to.be.false;
    });

    it("should return false when failed to parse jwt", () => {
      const brokenToken = "i'm broken jwt ";
      const result = isValid(brokenToken);

      expect(result).to.be.false;
    });
  });

  describe("parseJwt", () => {
    const { jwt, parsed } = tokenWithPermissions;

    it("should parse jwt", () => {
      const result = parseJwt(jwt);

      expect(result).to.deep.include({
        exp: parsed.exp,
        iat: parsed.iat,
        permissions: parsed.permissions,
      });
    });

    it("should throw when failed to parse jwt", () => {
      const brokenToken = "i'm broken jwt ";

      expect(() => parseJwt(brokenToken)).to.throw(Error);
    });
  });

  describe("getJwtExpiryDate", () => {
    const { jwt, parsed } = tokenWithPermissions;

    it("should return correct expire date", () => {
      const result = getJwtExpiryDate(jwt);

      expect(result.getTime() / 1000).to.equal(parsed.exp);
    });

    it("should throw when failed to get jwt expiry date", () => {
      const brokenToken = "i'm broken jwt ";

      expect(() => getJwtExpiryDate(brokenToken)).to.throw(Error);
    });
  });

  describe("isJwtExpiringLateEnough", () => {
    const { jwt, parsed } = tokenWithPermissions;

    const clock = setupFakeClock(secondsToMs(parsed.iat));

    it("should return true when jwt expiry is late enough", () => {
      clock.fakeClock.tick(secondsToMs(parsed.exp - parsed.iat) - AUTH_TOKEN_REFRESH_THRESHOLD);

      const result = isJwtExpiringLateEnough(jwt);

      expect(result).to.be.true;
    });

    it("should return false when jwt expiry overflows threshold", () => {
      clock.fakeClock.tick(secondsToMs(parsed.exp - parsed.iat) - AUTH_TOKEN_REFRESH_THRESHOLD + 1);
      clock.fakeClock.tick(1);

      const result = isJwtExpiringLateEnough(jwt);

      expect(result).to.be.false;
    });

    it("should throw when failed to get jwt expiry date", () => {
      const brokenToken = "i'm broken jwt ";

      expect(() => isJwtExpiringLateEnough(brokenToken)).to.throw(Error);
    });
  });
});
