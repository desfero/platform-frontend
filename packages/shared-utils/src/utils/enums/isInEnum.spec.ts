import { AssertionError, expect } from "chai";

import { AssertEqual, assertType } from "../test/testUtils";
import { isInEnum } from "./isInEnum";

enum ECurrency {
  ETH = "eth",
  N_EUR = "n-eur",
}

describe("isInEnum", () => {
  it("should properly check if value is in enum", () => {
    expect(isInEnum(ECurrency, "eth")).to.be.true;
    expect(isInEnum(ECurrency, "foo")).to.be.false;
  });

  it("should properly narrow type", () => {
    const value: string = "eth";

    if (isInEnum(ECurrency, value)) {
      assertType<AssertEqual<typeof value, ECurrency>>(true);
    } else {
      throw new AssertionError("Type is not properly narrowed");
    }
  });
});
