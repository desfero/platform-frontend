import { inject, injectable } from "inversify";

import { coreModuleApi, ILogger } from "../../../core/module";
import { IAuthHttpClient } from "../http/AuthHttpClient";
import { symbols } from "../symbols";
import {
  EmailStatusSchema,
  EWalletSubType,
  EWalletType,
  IEmailStatus,
  IUser,
  IUserInput,
  IVerifyEmailUser,
  UserSchema,
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
    @inject(symbols.authJsonHttpClient) private httpClient: IAuthHttpClient,
    @inject(coreModuleApi.symbols.logger) private logger: ILogger,
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
      responseSchema: UserSchema,
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
        responseSchema: UserSchema,
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
      responseSchema: UserSchema,
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
      responseSchema: EmailStatusSchema,
    });
    return response.body;
  };

  public verifyUserEmail = async (userCode: IVerifyEmailUser): Promise<IUser> => {
    const response = await this.httpClient.put<IUser>({
      baseUrl: USER_API_ROOT,
      url: "/user/me/email-verification",
      responseSchema: UserSchema,
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
      responseSchema: UserSchema,
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
      responseSchema: UserSchema,
      allowedStatusCodes: [404, 409],
      body: { latest_accepted_tos_ipfs: agreementHash },
    });
    return ensureWalletTypesInUser(response.body);
  };
}
