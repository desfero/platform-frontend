import * as React from "react";

import { ETxType } from "../../../../modules/tx/types";
import { InvestmentSuccess } from "../investment-flow/Success";
import { InvestorAcceptPayoutSuccess } from "../investor-payout/AcceptSuccess";
import { InvestorRedistributePayoutSuccess } from "../investor-payout/RedistributeSuccess";
import { SignNomineeAgreementSuccess } from "../nominee/sign-agreement/SignAgreementSuccess";
import { BankTransferRedeemSuccess } from "../redeem/BankTransferRedeemSuccess";
import { TxSuccess } from "../shared/TxSuccess";
import { UserClaimSuccess } from "../user-claim/Success";
import { TransferSuccess } from "../withdraw-flow/Success/Success";

type TExternalProps = {
  type: ETxType;
  txHash: string;
  txTimestamp: number;
};

const SuccessComponent: React.FunctionComponent<TExternalProps> = props => {
  switch (props.type) {
    case ETxType.INVEST:
      return <InvestmentSuccess {...props} />;
    case ETxType.USER_CLAIM:
      return <UserClaimSuccess {...props} />;
    case ETxType.INVESTOR_ACCEPT_PAYOUT:
      return <InvestorAcceptPayoutSuccess {...props} />;
    case ETxType.INVESTOR_REDISTRIBUTE_PAYOUT:
      return <InvestorRedistributePayoutSuccess {...props} />;
    case ETxType.NEUR_REDEEM:
      return <BankTransferRedeemSuccess {...props} />;
    case ETxType.WITHDRAW:
    case ETxType.TRANSFER_TOKENS:
      return <TransferSuccess {...props} />;
    case ETxType.NOMINEE_THA_SIGN:
    case ETxType.NOMINEE_RAAA_SIGN:
      return <SignNomineeAgreementSuccess />;
    default:
      return <TxSuccess {...props} />;
  }
};

export { SuccessComponent };
