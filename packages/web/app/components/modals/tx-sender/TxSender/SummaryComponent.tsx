import { assertNever } from "@neufund/shared-utils";
import * as React from "react";

import { ETxType } from "../../../../lib/web3/types";
import { SetEtoDateSummary } from "../eto-flow/SetDateSummary";
import { SignInvestmentAgreementSummary } from "../eto-flow/SignInvestmentAgreementSummary";
import { InvestmentSummary } from "../investment-flow/Summary";
import { InvestorAcceptPayoutSummary } from "../investor-payout/AcceptSummary";
import { InvestorRedistributePayoutSummary } from "../investor-payout/RedistributeSummary";
import { RefundSummary } from "../investor-refund/RefundSummary";
import { SignNomineeAgreementSummary } from "../nominee/sign-agreement/SignAgreementSummary";
import { SignNomineeISHASummary } from "../nominee/sign-isha/SignISHASummary";
import { BankTransferRedeemSummary } from "../redeem/BankTransferRedeemSummary";
import { UnlockWalletSummary } from "../unlock-wallet-flow/Summary.unsafe";
import { UpgradeSummary } from "../upgrade-flow/Summary.unsafe";
import { UserClaimSummary } from "../user-claim/Summary";
import { TransferSummary } from "../withdraw-flow/Summary/TransferSummary/TransferSummary";

type TExternalProps = { type: ETxType };

const SummaryComponent: React.FunctionComponent<TExternalProps> = ({ type }) => {
  switch (type) {
    case ETxType.INVEST:
      return <InvestmentSummary />;
    case ETxType.ETO_SET_DATE:
      return <SetEtoDateSummary />;
    case ETxType.UPGRADE:
      return <UpgradeSummary />;
    case ETxType.USER_CLAIM:
      return <UserClaimSummary />;
    case ETxType.INVESTOR_ACCEPT_PAYOUT:
      return <InvestorAcceptPayoutSummary />;
    case ETxType.INVESTOR_REDISTRIBUTE_PAYOUT:
      return <InvestorRedistributePayoutSummary />;
    case ETxType.UNLOCK_FUNDS:
      return <UnlockWalletSummary />;
    case ETxType.NEUR_REDEEM:
      return <BankTransferRedeemSummary />;
    case ETxType.SIGN_INVESTMENT_AGREEMENT:
      return <SignInvestmentAgreementSummary />;
    case ETxType.INVESTOR_REFUND:
      return <RefundSummary />;
    case ETxType.NOMINEE_THA_SIGN:
    case ETxType.NOMINEE_RAAA_SIGN:
      return <SignNomineeAgreementSummary />;
    case ETxType.NOMINEE_ISHA_SIGN:
      return <SignNomineeISHASummary />;
    case ETxType.TRANSFER_TOKENS:
    case ETxType.WITHDRAW:
      return <TransferSummary />;
    default:
      return assertNever(type, "Unknown Transaction Type");
  }
};

export { SummaryComponent };
