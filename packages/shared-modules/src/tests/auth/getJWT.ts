import LightWalletProvider from "eth-lightwallet";
import ethSig from "eth-sig-util";
import { addHexPrefix, hashPersonalMessage, toBuffer } from "ethereumjs-util";

import { wrappedFetch } from "../wrapperFetch";

/**
 * Get a jwt from the server
 * This could maybe be replaced by a called to the mockservices
 */
const CHALLENGE_PATH = "/api/signature/jwt/challenge";
const JWT_PATH = "/api/signature/jwt/create";

export const getJWT = async (
  address: string,
  lightWalletInstance: any,
  walletKey: any,
  permissions: string[] = [],
  baseUrlPath: string = "",
): Promise<string> => {
  // first get a challenge
  const headers = {
    "Content-Type": "application/json",
  };
  const challenge_body = {
    address,
    salt: "4abc08069f8c6d26becd80fe96fbeaf4d17b84cdbe7071a8197ab5370bb85876",
    signer_type: "eth_sign",
    permissions: ["sign-tos", ...permissions],
  };

  const ch_response = await wrappedFetch(baseUrlPath + CHALLENGE_PATH, {
    headers,
    method: "POST",
    body: JSON.stringify(challenge_body),
  });
  const ch_result = await ch_response.json();
  const challenge = ch_result.challenge;
  // now sign it...
  const msgHash = hashPersonalMessage(toBuffer(addHexPrefix(challenge)));
  const rawSignedMsg = await LightWalletProvider.signing.signMsgHash(
    lightWalletInstance,
    walletKey,
    msgHash.toString("hex"),
    address,
  );
  // ... and request the jwt
  const signedChallenge = ethSig.concatSig(rawSignedMsg.v, rawSignedMsg.r, rawSignedMsg.s);
  const signed_body = {
    challenge,
    response: signedChallenge,
    signer_type: "eth_sign",
  };
  const sig_response = await wrappedFetch(baseUrlPath + JWT_PATH, {
    headers,
    method: "POST",
    body: JSON.stringify(signed_body),
  });
  const sig_result = await sig_response.json();
  return sig_result.jwt;
};
