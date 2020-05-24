import { EWalletSubType } from "@neufund/shared-modules";
import { expect } from "chai";

import { ESignerType } from "../../../../../shared-modules/dist/modules/core/lib/eth/types";
import {
  WC_DEFAULT_SESSION_REQUEST_TIMEOUT,
  WC_DEFAULT_SIGN_TIMEOUT,
} from "../../../config/constants";
import { ESignTransactionMethod } from "../types";
import { generateWalletMetaFormPeerMeta } from "./utils";

describe("peerMeta to walletMeta", () => {
  it("metamask", () => {
    let peerMeta = null;

    const expectedWalletMeta = {
      walletSubType: EWalletSubType.METAMASK,
      sendTransactionMethod: ESignTransactionMethod.ETH_SEND_TRANSACTION,
      signerType: ESignerType.ETH_SIGN_TYPED_DATA_V3,
      signingTimeout: WC_DEFAULT_SIGN_TIMEOUT,
      sessionRequestTimeout: WC_DEFAULT_SESSION_REQUEST_TIMEOUT,
      expectsEthSignDigest: true,
      supportsExplicitTimeouts: false,
      supportSessionPings: false,
      supportsRemoteKyc: false,
      supportsWalletMigration: false,
    };
    expect(generateWalletMetaFormPeerMeta(peerMeta)).to.be.deep.eq(expectedWalletMeta);

    peerMeta = {
      description: "MetaMask 1.0",
      url: "https://metamask.org",
      icons: [],
      name: "MetaMask",
    };
    expect(generateWalletMetaFormPeerMeta(peerMeta)).to.be.deep.eq(expectedWalletMeta);
  });

  it("neufund", () => {
    const peerMeta = {
      description: "I'm Neufund",
      url: "https://neufund.org",
      icons: [],
      name: "Neufund",
    };

    const expectedWalletMeta = {
      walletSubType: EWalletSubType.NEUFUND,
      sendTransactionMethod: ESignTransactionMethod.ETH_SEND_TYPED_TRANSACTION,
      signerType: ESignerType.ETH_SIGN,
      signingTimeout: 120000,
      sessionRequestTimeout: WC_DEFAULT_SESSION_REQUEST_TIMEOUT,
      expectsEthSignDigest: false,
      supportsExplicitTimeouts: true,
      supportSessionPings: true,
      supportsRemoteKyc: true,
      supportsWalletMigration: true,
    };
    expect(generateWalletMetaFormPeerMeta(peerMeta)).to.be.deep.eq(expectedWalletMeta);
  });

  it("everything else", () => {
    const peerMeta = {
      description: "I don't know who I am",
      url: "https://666.org",
      icons: [],
      name: "Blabla",
    };

    const expectedWalletMeta = {
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
    expect(generateWalletMetaFormPeerMeta(peerMeta)).to.be.deep.eq(expectedWalletMeta);
  });
});
