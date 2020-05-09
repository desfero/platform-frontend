import * as React from "react";

import { ETxType } from "../../../../lib/web3/types";
import { LoadingIndicator } from "../../../shared/loading-indicator";
import { InvestmentSelection } from "../investment-flow/Investment";
import { InvestorRedistributePayoutConfirm } from "../investor-payout/RedistributeConfirm";
import { BankTransferRedeemInit } from "../redeem/BankTransferRedeemInit";
import { TransferTokensInit } from "../withdraw-flow/Init/TokenTransferInit";
import { WithdrawInit } from "../withdraw-flow/Init/WithdrawInit";

type TExternalProps = { type: ETxType };

const InitComponent: React.FunctionComponent<TExternalProps> = ({ type }) => {
  switch (type) {
    case ETxType.INVEST:
      return <InvestmentSelection />;
    case ETxType.WITHDRAW:
      return <WithdrawInit />;
    case ETxType.TRANSFER_TOKENS:
      return <TransferTokensInit />;
    case ETxType.INVESTOR_REDISTRIBUTE_PAYOUT:
      return <InvestorRedistributePayoutConfirm />;
    case ETxType.NEUR_REDEEM:
      return <BankTransferRedeemInit />;
    default:
      return <LoadingIndicator />;
  }
};

export { InitComponent };
