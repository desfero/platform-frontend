import { EWalletSubType } from "@neufund/shared-modules";
import { minutesToMs } from "@neufund/shared-utils";
import { IClientMeta } from "@walletconnect/types";

import { ESignerType } from "../../../../../shared-modules/dist/modules/core/lib/eth/types";
import {
  WC_DEFAULT_SESSION_REQUEST_TIMEOUT,
  WC_DEFAULT_SIGN_TIMEOUT,
} from "../../../config/constants";
import { ESignTransactionMethod } from "../types";

export type TWcMeta = {
  walletSubType: EWalletSubType;
  sendTransactionMethod: ESignTransactionMethod;
  signerType: ESignerType;
  sessionRequestTimeout: number;
  signingTimeout: number;
  expectsEthSignDigest: boolean;
  supportsExplicitTimeouts: boolean;
  supportSessionPings: boolean;
  supportsRemoteKyc: boolean;
  supportsWalletMigration: boolean;
};

export const generateWalletMetaFormPeerMeta = (clientMeta: IClientMeta | null): TWcMeta => {
  const walletMeta = {
    walletSubType: EWalletSubType.UNKNOWN,
    sendTransactionMethod: ESignTransactionMethod.ETH_SEND_TRANSACTION,
    signerType: ESignerType.ETH_SIGN,
    signingTimeout: WC_DEFAULT_SIGN_TIMEOUT,
    sessionRequestTimeout: WC_DEFAULT_SESSION_REQUEST_TIMEOUT,
    expectsEthSignDigest: true,
    supportsExplicitTimeouts: false,
    supportSessionPings: false,
    supportsRemoteKyc: false,
    supportsWalletMigration: false,
  };

  const setMetamask = () => {
    walletMeta.walletSubType = EWalletSubType.METAMASK;
    walletMeta.signerType = ESignerType.ETH_SIGN_TYPED_DATA_V3;
  };

  if (clientMeta === null) {
    // old metamasks does not send peer info
    setMetamask();
  } else {
    const name = clientMeta.name.toLowerCase();

    if (name.includes("trust")) {
      walletMeta.signerType = ESignerType.ETH_SIGN;
    } else if (name.includes("neufund")) {
      walletMeta.walletSubType = EWalletSubType.NEUFUND;
      walletMeta.signerType = ESignerType.ETH_SIGN;
      walletMeta.sendTransactionMethod = ESignTransactionMethod.ETH_SEND_TYPED_TRANSACTION;
      walletMeta.signingTimeout = minutesToMs(2);
      walletMeta.expectsEthSignDigest = false;
      walletMeta.supportsExplicitTimeouts = true;
      walletMeta.supportSessionPings = true;
      walletMeta.supportsRemoteKyc = true;
      walletMeta.supportsWalletMigration = true;
    } else if (name.includes("gnosis")) {
      walletMeta.walletSubType = EWalletSubType.GNOSIS;
      walletMeta.signerType = ESignerType.ETH_SIGN_GNOSIS_SAFE;
    } else if (name.includes("argent")) {
      walletMeta.signerType = ESignerType.ETH_SIGN_ARGENT;
      walletMeta.expectsEthSignDigest = false;
    } else if (name.includes("metamask")) {
      setMetamask();
    }
  }

  return walletMeta;
};
