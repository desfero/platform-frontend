import { Q18 } from "@neufund/shared-utils";
import { expect } from "chai";

import { getUnlockedWalletEtherAmountAfterFee } from "./utils";

describe("should calculate unlock fee when", () => {
  const etherLockedBalance = Q18.mul("23.11");
  const etherLockedUnlockDate = 1569888000;

  it("current date is earlier than unlock date", () => {
    expect(
      getUnlockedWalletEtherAmountAfterFee(
        etherLockedBalance,
        etherLockedUnlockDate,
        etherLockedUnlockDate - 1,
      ).toString(),
    ).to.be.eq(etherLockedBalance.minus(etherLockedBalance.mul("0.1")).toString());
  });
  it("current date is same as the unlock date", () => {
    expect(
      getUnlockedWalletEtherAmountAfterFee(
        etherLockedBalance,
        etherLockedUnlockDate,
        etherLockedUnlockDate,
      ).toString(),
    ).to.be.eq(etherLockedBalance.toString());
  });
  it("current date is after the unlock date", () => {
    expect(
      getUnlockedWalletEtherAmountAfterFee(
        etherLockedBalance,
        etherLockedUnlockDate,
        etherLockedUnlockDate + 1,
      ).toString(),
    ).to.be.eq(etherLockedBalance.toString());
  });
});
