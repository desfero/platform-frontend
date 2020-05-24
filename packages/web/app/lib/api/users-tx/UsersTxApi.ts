import { authModuleAPI, IAuthHttpClient, ILogger } from "@neufund/shared-modules";
import { toEthereumAddress } from "@neufund/shared-utils";
import BigNumber from "bignumber.js";
import { addHexPrefix } from "ethereumjs-util";
import { inject, injectable } from "inversify";

import { symbols } from "../../../di/symbols";
import { makeEthereumAddressChecksummed } from "../../../modules/web3/utils";
import { ITxData } from "../../web3/types";
import {
  GasStipendSchema,
  OOO_TRANSACTION_TYPE,
  TPendingTxs,
  TxPendingWithMetadata,
  TxWithMetadata,
} from "./interfaces";

const USER_API_ROOT = "/api/user";

@injectable()
export class UsersTxApi {
  constructor(
    @inject(authModuleAPI.symbols.authJsonHttpClient) private httpClient: IAuthHttpClient,
    @inject(symbols.logger) private logger: ILogger,
  ) {}

  public async pendingTxs(): Promise<TPendingTxs> {
    this.logger.info("Fetching pending transactions");

    const response = await this.httpClient.get<Array<TxPendingWithMetadata | TxWithMetadata>>({
      baseUrl: USER_API_ROOT,
      url: "/pending_transactions/me",
    });

    if (response.statusCode === 200) {
      return {
        // find transaction with payload
        pendingTransaction: response.body.find(
          tx => tx.transactionType !== OOO_TRANSACTION_TYPE,
        ) as TxPendingWithMetadata,
        // move other transactions to OOO transactions
        oooTransactions: response.body.filter(
          tx => tx.transactionType === OOO_TRANSACTION_TYPE,
        ) as TxWithMetadata[],
      };
    }

    throw new Error("Error while fetching pending transaction");
  }

  public async addPendingTx(tx: TxPendingWithMetadata): Promise<void> {
    this.logger.info("Adding new pending transaction");

    await this.httpClient.put<void>({
      baseUrl: USER_API_ROOT,
      url: "/pending_transactions/me",
      body: {
        transaction: tx.transaction,
        transaction_type: tx.transactionType,
        transaction_additional_data: tx.transactionAdditionalData,
        transaction_timestamp: tx.transactionTimestamp,
        transaction_status: tx.transactionStatus,
        transaction_error: tx.transactionError,
      },
      disableManglingRequestBody: true,
    });
  }

  public async deletePendingTx(txHash: string): Promise<void> {
    this.logger.info("Deleting pending transaction");

    await this.httpClient.delete<void>({
      baseUrl: USER_API_ROOT,
      url: `/pending_transactions/me/${txHash}`,
    });
  }

  public getGasStipend = async (txDetails: ITxData): Promise<string> => {
    this.logger.info("Getting gas stipend");

    const convertedTxDetails = {
      ...txDetails,
      to: makeEthereumAddressChecksummed(toEthereumAddress(txDetails.to)),
      from: makeEthereumAddressChecksummed(toEthereumAddress(txDetails.from)),
      gas: addHexPrefix(new BigNumber(txDetails.gas ? txDetails.gas.toString() : "0").toString(16)),
      gasPrice: addHexPrefix(
        new BigNumber(txDetails.gasPrice ? txDetails.gasPrice.toString() : "0").toString(16),
      ),
      value: addHexPrefix(
        new BigNumber(txDetails.value ? txDetails.value.toString() : "0").toString(16),
      ),
    };

    const response = await this.httpClient.post<string>({
      baseUrl: USER_API_ROOT,
      url: `/transaction/gas_stipend`,
      body: convertedTxDetails,
      responseSchema: GasStipendSchema,
      disableManglingRequestBody: true,
    });

    return response.body;
  };
}
