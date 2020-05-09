import * as React from "react";

import { Tx } from "../../../lib/api/users/interfaces";
import { ETxType, ITxData } from "../../../lib/web3/types";
import { TAdditionalDataByType } from "../../../modules/tx/types";
import { CommonHtmlProps } from "../../../types";

export type TransactionDetailsComponent<T extends ETxType> = React.ComponentType<
  {
    // txData either contains data from tx sender or tx monitor
    // it depends on transaction status
    txData?: Readonly<ITxData> | Readonly<Tx>;
    // timestamp only available after sending
    txTimestamp?: number;
    additionalData: TAdditionalDataByType<T>;
  } & CommonHtmlProps
>;

export enum ETxStatus {
  PENDING = "pending",
  SUCCESS = "success",
  ERROR = "error",
}
