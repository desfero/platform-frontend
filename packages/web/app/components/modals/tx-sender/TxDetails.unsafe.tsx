import { assertNever } from "@neufund/shared-utils";
import * as React from "react";

import { ITxData } from "../../../lib/web3/types";
import { ETxType, TSpecificTransactionState } from "../../../modules/tx/types";
import { CommonHtmlProps } from "../../../types";
import { SetDateDetails } from "./eto-flow/SetDateDetails";
import { InvestmentTransactionDetails } from "./investment-flow/InvestmentTransactionDetails";
import { AcceptTransactionDetails } from "./investor-payout/AcceptTransactionDetails";
import { RedistributeTransactionDetails } from "./investor-payout/RedistributeTransactionDetails";
import { RefundTransactionDetails } from "./investor-refund/RefundDetails";
import { BankTransferRedeemDetails } from "./redeem/BankTransferRedeemDetails";
import { UnlockWalletTransactionDetails } from "./unlock-wallet-flow/UnlockWalletTransactionDetails";
import { UpgradeTransactionDetails } from "./upgrade-flow/UpgradeTransactionDetails.unsafe";
import { ClaimTransactionDetails } from "./user-claim/ClaimTransactionDetails";

type IProps = {
  txData?: Partial<ITxData>;
} & TSpecificTransactionState;

/**
 * Generate transaction details used inside general TxPending and TxError modals
 * @note If there are no details return `null` explicitly
 */
const TxDetails: React.FunctionComponent<IProps & CommonHtmlProps> = props => {
  // wait for transaction data
  if (!props.txData) {
    return null;
  }
  // TODO: investigate why typescript marks `txData` still as undefined after condition above
  const propsAsAny = props as any;

  const type = props.type;
  switch (type) {
    case ETxType.WITHDRAW:
    case ETxType.TRANSFER_TOKENS:
      return null;
    case ETxType.INVESTOR_ACCEPT_PAYOUT:
      return <AcceptTransactionDetails {...propsAsAny} />;
    case ETxType.USER_CLAIM:
      return <ClaimTransactionDetails {...propsAsAny} />;
    case ETxType.UPGRADE:
      return <UpgradeTransactionDetails {...propsAsAny} />;
    case ETxType.UNLOCK_FUNDS:
      return <UnlockWalletTransactionDetails {...propsAsAny} />;
    case ETxType.INVESTOR_REDISTRIBUTE_PAYOUT:
      return <RedistributeTransactionDetails {...propsAsAny} />;
    case ETxType.ETO_SET_DATE:
      return <SetDateDetails {...propsAsAny} />;
    case ETxType.INVEST:
      return <InvestmentTransactionDetails {...propsAsAny} />;
    case ETxType.NEUR_REDEEM:
      return <BankTransferRedeemDetails {...propsAsAny} />;
    case ETxType.SIGN_INVESTMENT_AGREEMENT:
      return null;
    case ETxType.INVESTOR_REFUND:
      return <RefundTransactionDetails {...propsAsAny} />;
    case ETxType.NOMINEE_THA_SIGN:
    case ETxType.NOMINEE_RAAA_SIGN:
    case ETxType.NOMINEE_ISHA_SIGN:
      return null;
    default:
      return assertNever(type);
  }
};

export { TxDetails };
