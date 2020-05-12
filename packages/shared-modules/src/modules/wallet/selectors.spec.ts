import { Q18 } from "@neufund/shared-utils";
import { expect } from "chai";

import { TWalletModuleState } from "./module";
import {
  selectICBMLockedEuroTotalAmount,
  selectLiquidEuroTotalAmount,
  selectLockedEuroTotalAmount,
  selectNeuBalance,
  selectNeuBalanceEuroAmount,
  selectTotalEtherBalance,
  selectTotalEtherBalanceEuroAmount,
  selectTotalEuroBalance,
  selectTotalEuroTokenBalance,
} from "./selectors";

describe("Wallet > selectors", () => {
  const etherLockedBalance = Q18.mul("23.11");
  const etherLockedUnlockDate = 1569888000;

  const defaultState = {
    wallet: {
      loading: false,
      data: {
        etherTokenLockedWallet: {
          LockedBalance: etherLockedBalance.toString(),
          neumarksDue: "0",
          unlockDate: etherLockedUnlockDate.toString(), //10/01/2019 @ 12:00am (UTC)
        },
        euroTokenLockedWallet: {
          LockedBalance: Q18.mul("18.11").toString(),
          neumarksDue: "0",
          unlockDate: "0",
        },

        etherTokenICBMLockedWallet: {
          LockedBalance: Q18.mul("50").toString(),
          neumarksDue: "0",
          unlockDate: "0",
        },
        euroTokenICBMLockedWallet: {
          LockedBalance: Q18.mul("5").toString(),
          neumarksDue: "0",
          unlockDate: "0",
        },
        etherTokenBalance: Q18.mul("10").toString(),
        euroTokenBalance: Q18.mul("10.12").toString(),
        etherBalance: Q18.mul("100").toString(),
        neuBalance: Q18.mul("1000").toString(),
      },
    },
    tokenPrice: {
      tokenPriceData: {
        etherPriceEur: "10",
        neuPriceEur: "10000",
      },
    },
  };

  it("should calculate total value correctly", () => {
    const fullStateMock = (defaultState as any) as TWalletModuleState;

    const totalEther = Q18.mul((10 + 23.11 + 50 + 100).toString());
    expect(selectTotalEtherBalance(fullStateMock)).to.be.eq(totalEther.toString());

    expect(selectTotalEtherBalanceEuroAmount(fullStateMock)).to.be.eq(
      totalEther.mul("10").toString(),
    );

    const totalEuro = Q18.mul((10.12 + 5 + 18.11).toString());
    expect(selectTotalEuroTokenBalance(fullStateMock)).to.be.eq(totalEuro.toString());

    expect(selectLiquidEuroTotalAmount(fullStateMock)).to.be.eq(
      Q18.mul("10.12")
        .add(Q18.mul((100 + 10).toString()).mul("10"))
        .toString(),
    );

    expect(selectLockedEuroTotalAmount(fullStateMock)).to.be.eq(
      Q18.mul("18.11")
        .add(Q18.mul("23.11").mul("10"))
        .toString(),
    );

    expect(selectICBMLockedEuroTotalAmount(fullStateMock)).to.be.eq(
      Q18.mul((5 + 50 * 10).toString()).toString(),
    );

    expect(selectTotalEuroBalance(fullStateMock)).to.be.eq(
      totalEther
        .mul("10")
        .add(totalEuro)
        .toString(),
    );

    expect(selectNeuBalance(fullStateMock)).to.eq(Q18.mul("1000").toString());
    expect(selectNeuBalanceEuroAmount(fullStateMock)).to.eq(
      Q18.mul("1000")
        .mul("10000")
        .toString(),
    );
  });
});
