import { authModuleAPI, IAuthHttpClient, ILogger } from "@neufund/shared-modules";
import { toEthereumAddress } from "@neufund/shared-utils";
import BigNumber from "bignumber.js";
import { addHexPrefix } from "ethereumjs-util";
import { inject, injectable } from "inversify";

import { symbols } from "../../../di/symbols";
import { EWalletSubType, EWalletType } from "../../../modules/web3/types";
import { makeEthereumAddressChecksummed } from "../../../modules/web3/utils";
import { ITxData } from "../../web3/types";
import {
  emailStatus,
  GasStipendValidator,
  IEmailStatus,
  IUser,
  IUserInput,
  IVerifyEmailUser,
  OOO_TRANSACTION_TYPE,
  TPendingTxs,
  TxPendingWithMetadata,
  TxWithMetadata,
  UserValidator,
} from "./interfaces";

const USER_API_ROOT = "/api/user";

export class UserApiError extends Error {}
export class UserNotExisting extends UserApiError {}
export class EmailAlreadyExists extends UserApiError {}
export class EmailActivationCodeMismatch extends UserApiError {}

const ensureWalletTypesInUser = (userApiResponse: IUser): IUser => ({
  ...userApiResponse,
  walletType: userApiResponse.walletType
    ? (userApiResponse.walletType.toUpperCase() as EWalletType)
    : EWalletType.UNKNOWN,
  walletSubtype: userApiResponse.walletType
    ? (userApiResponse.walletSubtype.toUpperCase() as EWalletSubType)
    : EWalletSubType.UNKNOWN,
});

@injectable()
export class UsersApi {
  constructor(
    @inject(authModuleAPI.symbols.authJsonHttpClient) private httpClient: IAuthHttpClient,
    @inject(symbols.logger) private logger: ILogger,
  ) {}

  public createAccount = async (newUser?: IUserInput): Promise<IUser> => {
    this.logger.info("Creating account");
    // Backend expects walletType and walletSubType values as lower case
    const modifiedNewUser = newUser
      ? {
          ...newUser,
          walletType: newUser.walletType.toLowerCase(),
          walletSubtype: newUser.walletSubtype.toLowerCase(),
        }
      : {};
    const response = await this.httpClient.post<IUser>({
      baseUrl: USER_API_ROOT,
      url: "/user/",
      responseSchema: UserValidator,
      body: modifiedNewUser,
      allowedStatusCodes: [409],
    });
    if (response.statusCode === 409) {
      throw new EmailAlreadyExists();
    }
    return ensureWalletTypesInUser(response.body);
  };

  /** An API call similar to me that uses JWT as a prop instead of the conventional JWT from local storage
   *
   *  @note This method should only be used only when you want to access the users/me endpoint before the
   *  user signs in
   **/

  public meWithJWT = async (jwt: string): Promise<IUser> => {
    const response = await this.httpClient.get<IUser>(
      {
        baseUrl: USER_API_ROOT,
        url: "/user/me",
        responseSchema: UserValidator,
        allowedStatusCodes: [404],
      },
      jwt,
    );

    if (response.statusCode === 404) {
      throw new UserNotExisting();
    }
    return ensureWalletTypesInUser(response.body);
  };

  /**
   * An API method that gets the user information
   *
   * @note When in doubt always use this method instead of `meWithJWT`
   **/
  public me = async (): Promise<IUser> => {
    const response = await this.httpClient.get<IUser>({
      baseUrl: USER_API_ROOT,
      url: "/user/me",
      responseSchema: UserValidator,
      allowedStatusCodes: [404],
    });

    if (response.statusCode === 404) {
      throw new UserNotExisting();
    }
    return ensureWalletTypesInUser(response.body);
  };

  public emailStatus = async (userEmail: string): Promise<any> => {
    const response = await this.httpClient.get<IEmailStatus>({
      baseUrl: USER_API_ROOT,
      url: `/email/status/${userEmail}`,
      responseSchema: emailStatus,
    });
    return response.body;
  };

  public verifyUserEmail = async (userCode: IVerifyEmailUser): Promise<IUser> => {
    const response = await this.httpClient.put<IUser>({
      baseUrl: USER_API_ROOT,
      url: "/user/me/email-verification",
      responseSchema: UserValidator,
      allowedStatusCodes: [404, 409, 403],
      body: userCode,
    });

    if (response.statusCode === 404) {
      throw new UserNotExisting();
    }
    if (response.statusCode === 409) {
      throw new EmailAlreadyExists();
    }
    if (response.statusCode === 403) {
      throw new EmailActivationCodeMismatch();
    }

    return ensureWalletTypesInUser(response.body);
  };

  public updateUser = async (updatedUser: IUserInput): Promise<IUser> => {
    const modifiedUpdatedUser = updatedUser
      ? {
          ...updatedUser,
          walletType: updatedUser.walletType.toLocaleLowerCase(),
          walletSubtype: updatedUser.walletSubtype.toLocaleLowerCase(),
        }
      : {};
    const response = await this.httpClient.put<IUser>({
      baseUrl: USER_API_ROOT,
      url: "/user/me",
      responseSchema: UserValidator,
      allowedStatusCodes: [404, 409],
      body: modifiedUpdatedUser,
    });

    if (response.statusCode === 404) {
      throw new UserNotExisting();
    }
    if (response.statusCode === 409) {
      throw new EmailAlreadyExists();
    }

    return ensureWalletTypesInUser(response.body);
  };

  public setLatestAcceptedTos = async (agreementHash: string): Promise<IUser> => {
    const response = await this.httpClient.put<IUser>({
      baseUrl: USER_API_ROOT,
      url: "/user/me/tos",
      responseSchema: UserValidator,
      allowedStatusCodes: [404, 409],
      body: { latest_accepted_tos_ipfs: agreementHash },
    });
    return ensureWalletTypesInUser(response.body);
  };

  public pendingTxs = async (): Promise<TPendingTxs> => {
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
  };

  public addPendingTx = async (tx: TxPendingWithMetadata): Promise<void> => {
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
  };

  public deletePendingTx = async (txHash: string): Promise<void> => {
    await this.httpClient.delete<void>({
      baseUrl: USER_API_ROOT,
      url: `/pending_transactions/me/${txHash}`,
    });
  };

  public getGasStipend = async (txDetails: ITxData): Promise<string> => {
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
      responseSchema: GasStipendValidator,
      disableManglingRequestBody: true,
    });

    return response.body;
  };
}
