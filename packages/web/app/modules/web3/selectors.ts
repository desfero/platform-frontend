import { EWalletSubType, EWalletType } from "@neufund/shared-modules";
import { EthereumAddressWithChecksum } from "@neufund/shared-utils";
import { RouterState } from "connected-react-router";
import { isString } from "lodash";
import * as queryString from "query-string";
import { createSelector } from "reselect";

import { TAppGlobalState } from "../../store";
import { selectRouter } from "../routing/selectors";
import { IConnectedWeb3State, IWalletPrivateData, IWeb3State } from "./reducer";
import { TWalletMetadata } from "./types";

export const selectConnectedWeb3State = (state: IWeb3State): IConnectedWeb3State => {
  if (!state.connected) {
    throw Error("Wallet not connected");
  }
  return state;
};

export const selectEthereumAddress = (state: TAppGlobalState): EthereumAddressWithChecksum =>
  state.web3.connected ? state.web3.wallet.address : state.web3.previousConnectedWallet!.address;

export const selectWalletPrivateData = (state: IWeb3State): IWalletPrivateData | undefined =>
  (state.connected &&
    state.walletPrivateData && {
      seed: state.walletPrivateData.seed.split(" "),
      privateKey: state.walletPrivateData.privateKey,
    }) ||
  undefined;

export const isLightWalletReadyToLogin = (state: IWeb3State): boolean =>
  !!(
    !state.connected &&
    state.previousConnectedWallet &&
    state.previousConnectedWallet.walletType === EWalletType.LIGHT &&
    state.previousConnectedWallet.email &&
    state.previousConnectedWallet.salt
  );

/**
 * Works both when wallet is connected or not.
 */
export const selectIsLightWallet = (state: TAppGlobalState): boolean =>
  (state.web3.connected && state.web3.wallet.walletType === EWalletType.LIGHT) ||
  isLightWalletReadyToLogin(state.web3);

export const selectIsExternalWallet = (state: TAppGlobalState): boolean => {
  const walletType = selectWalletType(state);

  return walletType === EWalletType.LEDGER || walletType === EWalletType.BROWSER;
};

export const selectWalletSubType = (state: IWeb3State): EWalletSubType | undefined =>
  state.connected
    ? state.wallet.walletSubType
    : state.previousConnectedWallet && state.previousConnectedWallet.walletSubType;

export const selectWalletType = (state: TAppGlobalState): EWalletType | undefined =>
  state.web3.connected
    ? state.web3.wallet.walletType
    : state.web3.previousConnectedWallet && state.web3.previousConnectedWallet.walletType;

export const selectCurrentLightWalletSalt = (state: TAppGlobalState): string | undefined =>
  (state.web3.connected &&
    state.web3.wallet &&
    state.web3.wallet.walletType === EWalletType.LIGHT &&
    state.web3.wallet.salt) ||
  undefined;

export const selectPreviousLightWalletEmail = (state: IWeb3State): string | undefined =>
  (!state.connected &&
    state.previousConnectedWallet &&
    state.previousConnectedWallet.walletType === EWalletType.LIGHT &&
    state.previousConnectedWallet.email) ||
  undefined;

export const selectCurrentLightWalletEmail = (state: IWeb3State): string | undefined =>
  (state.connected && state.wallet?.email) || undefined;

export const selectPreviousLightWalletSalt = (state: TAppGlobalState): string | undefined =>
  (!state.web3.connected &&
    state.web3.previousConnectedWallet &&
    state.web3.previousConnectedWallet.walletType === EWalletType.LIGHT &&
    state.web3.previousConnectedWallet.salt) ||
  undefined;

export const selectLightWalletSalt = createSelector(
  selectCurrentLightWalletSalt,
  selectPreviousLightWalletSalt,
  (currentLightWalletSalt, previousLightWalletSalt) =>
    currentLightWalletSalt || previousLightWalletSalt,
);

export const selectPreviousConnectedWallet = (state: IWeb3State): TWalletMetadata | undefined =>
  (!state.connected && state.previousConnectedWallet) || undefined;

const getEmailFromQueryString = (query: string) => {
  const { email } = queryString.parse(query);

  return isString(email) ? email : undefined;
};

const getSaltFromQueryString = (query: string) => {
  const { salt } = queryString.parse(query);

  return isString(salt) ? salt : undefined;
};

const getCodeFromQueryString = (query: string) => {
  const { code } = queryString.parse(query);

  return isString(code) ? code : undefined;
};

export const selectLightWalletFromQueryString = createSelector(
  selectRouter,
  (state: RouterState) => {
    if (!state.location) {
      return undefined;
    }

    const { redirect } = queryString.parse(state.location.search);

    const email =
      getEmailFromQueryString(state.location.search) ||
      (isString(redirect) ? getEmailFromQueryString(redirect) : undefined);
    const salt =
      getSaltFromQueryString(state.location.search) ||
      (isString(redirect) ? getSaltFromQueryString(redirect) : undefined);

    if (!email || !salt) {
      return undefined;
    }

    return {
      email,
      salt,
    };
  },
);

export const selectActivationCodeFromQueryString = createSelector(selectRouter, state => {
  if (!state.location) {
    return undefined;
  }

  const { redirect } = queryString.parse(state.location.search);
  const verificationCode =
    getCodeFromQueryString(state.location.search) ||
    (isString(redirect) ? getCodeFromQueryString(redirect) : undefined);

  if (!verificationCode) {
    return undefined;
  }

  return {
    verificationCode,
  };
});

export const selectLightWalletEmailFromQueryString = createSelector(
  selectLightWalletFromQueryString,
  lightWallet => lightWallet && lightWallet.email,
);

export const selectEmailFromQueryString = createSelector(selectRouter, (state: RouterState) => {
  if (!state.location) {
    return undefined;
  }

  return getEmailFromQueryString(state.location.search);
});

export const selectIsWeb3Available = (state: TAppGlobalState) => state.web3.web3Available;
