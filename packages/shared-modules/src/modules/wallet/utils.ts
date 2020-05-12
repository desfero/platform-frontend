import { PLATFORM_UNLOCK_FEE } from "@neufund/shared-utils";
import BigNumber from "bignumber.js";

export const getUnlockedWalletEtherAmountAfterFee = (
  etherLockedBalanceBN: BigNumber,
  unlockDateEther: number | string,
  currentUTCStamp: number | string,
): BigNumber =>
  new BigNumber(currentUTCStamp.toString()).comparedTo(unlockDateEther.toString()) < 0
    ? etherLockedBalanceBN.minus(etherLockedBalanceBN.mul(PLATFORM_UNLOCK_FEE.toString()))
    : etherLockedBalanceBN;
