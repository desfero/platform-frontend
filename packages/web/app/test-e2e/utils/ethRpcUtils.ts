import BigNumber from "bignumber.js";
import { AbiCoder } from "web3-eth-abi";
import Web3Accounts from "web3-eth-accounts";

import { NODE_ADDRESS } from "../config";
import { cyPromise } from "./cyPromise";
import { accountFixturePrivateKey } from "./index";

export enum ETransactionStatus {
  SUCCESS = "0x1",
  REVERTED = "0X0",
}

const requestFromWeb3Node = (methodName: string, params: string[] | object[]) =>
  cy.request({
    url: NODE_ADDRESS,
    method: "POST",
    body: {
      jsonrpc: "2.0",
      method: methodName,
      params,
      id: 1,
    },
  });

// TODO: Move all helper methods to use Fetch instead of cy.request
export const requestFromWeb3NodeFetch = (methodName: string, params: string[] | object[]) =>
  fetch(NODE_ADDRESS, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: methodName,
      params,
      id: 1,
    }),
  });

// TODO: Wrap all node functions into a Web3 instance for testing purposes
export const getTransactionByHashRpc = (txHash: string) =>
  requestFromWeb3Node("eth_getTransactionByHash", [txHash]);

const abiCoder = new AbiCoder();

export const getTokenBalance = (
  tokenAddress: string,
  walletAddress: string,
  // decodeParameter is not typed correctly
): Cypress.Chainable<any> =>
  requestFromWeb3Node("eth_call", [
    {
      from: walletAddress,
      to: tokenAddress,
      data: abiCoder.encodeFunctionCall(
        {
          constant: true,
          inputs: [{ name: "_owner", type: "address" }],
          name: "balanceOf",
          outputs: [{ name: "balance", type: "uint256" }],
          type: "function",
        },
        [walletAddress],
      ),
    },
  ]).then(response => abiCoder.decodeParameter("uint256", response.body.result));

export const getIsUserVerifiedOnBlockchain = (
  identityRegistryAddress: string,
  walletAddress: string,
): Cypress.Chainable<boolean> =>
  requestFromWeb3Node("eth_call", [
    {
      from: walletAddress,
      to: identityRegistryAddress,
      data: abiCoder.encodeFunctionCall(
        {
          constant: true,
          inputs: [{ name: "identity", type: "address" }],
          name: "getClaims",
          outputs: [{ name: "claims", type: "bytes32" }],
          type: "function",
        },
        [walletAddress],
      ),
    },
  ])
    .then(
      response => (abiCoder.decodeParameter("bytes32", response.body.result) as unknown) as string,
    )
    .then(claims => {
      const claimsN = new BigNumber(claims, 16);

      // taken from `deserializeClaims` app method
      return claimsN.mod("2").eq("1");
    });

export const getBalanceRpc = (address: string) =>
  requestFromWeb3Node("eth_getBalance", [address, "latest"]).then(
    v => new BigNumber(v.body.result),
  );

export const sendRawTransactionRpc = (data: string) =>
  requestFromWeb3Node("eth_sendRawTransaction", [data]);

export const getTransactionReceipt = (hash: string) =>
  requestFromWeb3Node("eth_getTransactionReceipt", [hash]);

export const assertWaitForTransactionSuccess = (hash: string, timeout: number = 60000) => {
  expect(timeout, `Transaction wasn't mined in ${timeout} ms`).to.be.gt(0);

  cy.wait(3000);

  getTransactionReceipt(hash).then(receiptResponse => {
    switch (receiptResponse.body.result.status) {
      case ETransactionStatus.SUCCESS:
        cy.log(`Transaction mined successfully (tx hash: ${hash})`);
        return;
      case ETransactionStatus.REVERTED:
        throw new Error(`Transaction was reverted (tx hash: ${hash})`);
      default:
        assertWaitForTransactionSuccess(hash, timeout - 3000);
    }
  });
};

export const sendEth = (fixture: string, to: string, amount: BigNumber | "all") => {
  const privateKey = accountFixturePrivateKey(fixture);
  const account = new Web3Accounts(NODE_ADDRESS).privateKeyToAccount(privateKey);

  getBalanceRpc(account.address).then(balanceResponse => {
    const availableAmount = balanceResponse.minus("21000");

    if (availableAmount.greaterThan("0")) {
      cy.log("Sending ethereum");

      const amountToSend = new BigNumber(amount === "all" ? availableAmount : amount);

      cyPromise(() =>
        account.signTransaction({
          to,
          value: amountToSend.toFixed(),
          gas: 21000,
          gasPrice: 1,
        }),
      ).then((signed: any) => {
        sendRawTransactionRpc(signed.rawTransaction).should(hashResponse => {
          assertWaitForTransactionSuccess(hashResponse.body.result);
          cy.log(`${amountToSend} ethereum withdrawn`);
        });
      });
    } else {
      cy.log("Nothing to withdraw");
    }
  });
};
