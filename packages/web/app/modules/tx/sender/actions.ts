import { createActionFactory } from "@neufund/shared-utils";

import { ETxType, ITxData } from "../../../lib/web3/types";
import { createAction, createSimpleAction } from "../../actionsUtils";
import { TAdditionalDataByType, TSpecificTransactionState } from "../types";
import { ETransactionErrorType, ITxSenderState } from "./reducer";

export const txSenderActions = {
  // Modal related actions
  txSenderShowModal: createActionFactory(
    "TX_SENDER_SHOW_MODAL",
    (initialState: Partial<ITxSenderState> = {}) => ({ initialState }),
  ),
  txSenderHideModal: createActionFactory("TX_SENDER_HIDE_MODAL"),
  // User awaiting actions
  txSenderAcceptDraft: createActionFactory(
    "TX_SENDER_ACCEPT_DRAFT",
    (txDraftData?: Partial<ITxData>) => ({ txDraftData }),
  ),
  txSenderAccept: () => createSimpleAction("TX_SENDER_ACCEPT"),
  txSenderChange: () => createSimpleAction("TX_SENDER_CHANGE"),
  // Signer actions
  txSenderSigned: (txHash: string, type: ETxType, txTimestamp: number) =>
    createAction("TX_SENDER_SIGNED", { txHash, type, txTimestamp }),
  txSenderWalletSigning: () => createSimpleAction("TX_SENDER_WALLET_SIGNING"),
  txSenderLoading: () => createSimpleAction("TX_SENDER_LOADING"),
  // Block mining actions
  txSenderReportBlock: (blockId: number) => createAction("TX_SENDER_REPORT_BLOCK", blockId),
  txSenderTxMined: createActionFactory("TX_SENDER_TX_MINED"),
  // Pending transaction related actions
  txSenderWatchPendingTxs: (txHash: string) =>
    createAction("TX_SENDER_WATCH_PENDING_TXS", { txHash }),
  // Error Actions
  txSenderError: (error: ETransactionErrorType) => createAction("TX_SENDER_ERROR", { error }),
  // Flow Actions
  txSenderContinueToSummary: <T extends ETxType>(additionalData: TAdditionalDataByType<T>) =>
    createAction<
      "TX_SENDER_CONTINUE_TO_SUMMARY_WITH_DATA",
      Pick<TSpecificTransactionState, "additionalData">
    >("TX_SENDER_CONTINUE_TO_SUMMARY_WITH_DATA", { additionalData }),

  // reducer setters
  setTransactionData: (txData: ITxData) =>
    createAction("TX_SENDER_SET_TRANSACTION_DATA", { txData }),
  txSenderClearTransactionData: createActionFactory("TX_SENDER_CLEAR_TRANSACTION_DATA"),
  setTimestamp: createActionFactory("TX_SENDER_SET_TIMESTAMP", (txTimestamp: number) => ({
    txTimestamp,
  })),
};
