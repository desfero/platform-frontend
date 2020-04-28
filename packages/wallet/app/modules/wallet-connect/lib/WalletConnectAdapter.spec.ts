import { noopLogger } from "@neufund/shared-modules";
import { toEthereumAddress } from "@neufund/shared-utils";
import WalletConnectMock from "@walletconnect/react-native";
import { EventEmitter2 } from "eventemitter2";
import { EventEmitter } from "events";

import {
  InvalidJSONRPCPayloadError,
  InvalidRPCMethodError,
  WalletConnectAdapter,
} from "./WalletConnectAdapter";
import { EWalletConnectManagerEvents, TWalletConnectManagerEmit } from "./types";
import { toWalletConnectUri } from "./utils";

const promisifyEvent = <T extends EWalletConnectManagerEvents>(emitter: EventEmitter2, type: T) => {
  return new Promise<Extract<TWalletConnectManagerEmit, { type: T }>>(resolve => {
    emitter.once(type, (error, payload, meta) => {
      // given that we don't have a proper typings for connected keys
      // for tests purpose we can just force cast
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      resolve({
        type,
        payload,
        meta,
        error,
      } as Extract<TWalletConnectManagerEmit, { type: T }>);
    });
  });
};

const mockWalletConnect = <T extends EventEmitter>(walletConnectInstance: T): T => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (WalletConnectMock as any).mockReturnValue(walletConnectInstance);

  return walletConnectInstance;
};

const chainId = 1;

const address = toEthereumAddress("0x8a194c13308326173423119F8dCb785CE14C732B");

const peerData = {
  peerId: "peer id",
  peerMeta: {
    name: "peer name",
    url: "peer url",
  },
};

const sessionRequestJsonRpcCall = {
  id: 1,
  jsonrpc: "2.0",
  method: "session_request",
  params: [peerData],
};

class CreateSessionMock extends EventEmitter {
  createSession = jest.fn();
}

class ApproveSessionMock extends CreateSessionMock {
  approveSession = jest.fn();
}

class RejectSessionMock extends CreateSessionMock {
  rejectSession = jest.fn();
}

const approveSession = async <T extends ApproveSessionMock>(sessionMock: T) => {
  const mockInstance = mockWalletConnect(sessionMock);

  const walletConnectManager = new WalletConnectAdapter(
    { uri: toWalletConnectUri("mock uri") },
    noopLogger,
  );

  setTimeout(() => {
    mockInstance.emit("session_request", undefined, sessionRequestJsonRpcCall);
  }, 1);

  const session = await walletConnectManager.connect();

  session.approveSession(chainId, address);

  return { mockInstance, walletConnectManager, session };
};

describe("WalletConnectAdapter", () => {
  describe("session creation flow", () => {
    it("should validate session json rpc payload", async () => {
      const mockInstance = mockWalletConnect(new CreateSessionMock());

      const walletConnectManager = new WalletConnectAdapter(
        { uri: toWalletConnectUri("mock uri") },
        noopLogger,
      );

      setTimeout(() => {
        mockInstance.emit("session_request", undefined, {
          id: 1,
          jsonrpc: "2.0",
          method: "session_request",
          params: [
            {
              foo: "bar",
            },
          ],
        });
      }, 1);

      expect.assertions(1);

      try {
        await walletConnectManager.connect();
      } catch (e) {
        expect(e).toBeInstanceOf(InvalidJSONRPCPayloadError);
      }
    });

    it("should reject when there is an error", async () => {
      const mockInstance = mockWalletConnect(new CreateSessionMock());

      const walletConnectManager = new WalletConnectAdapter(
        { uri: toWalletConnectUri("mock uri") },
        noopLogger,
      );

      const error = new Error();

      setTimeout(() => {
        mockInstance.emit("session_request", error);
      }, 1);

      expect.assertions(1);

      try {
        await walletConnectManager.connect();
      } catch (e) {
        expect(e).toBe(error);
      }
    });

    it("should properly start new session", async () => {
      const { mockInstance, session } = await approveSession(new ApproveSessionMock());

      expect(session.peer).toEqual({
        id: peerData.peerId,
        meta: peerData.peerMeta,
      });
      expect(mockInstance.approveSession).toHaveBeenCalledWith({ chainId, accounts: [address] });
    });

    it("should reject on UI request", async () => {
      const mockInstance = mockWalletConnect(new RejectSessionMock());

      const walletConnectManager = new WalletConnectAdapter(
        { uri: toWalletConnectUri("mock uri") },
        noopLogger,
      );

      setTimeout(() => {
        mockInstance.emit("session_request", undefined, sessionRequestJsonRpcCall);
      }, 1);

      const session = await walletConnectManager.connect();

      session.rejectSession();

      expect(session.peer).toEqual({
        id: peerData.peerId,
        meta: peerData.peerMeta,
      });
      expect(mockInstance.rejectSession).toHaveBeenCalled();
    });
  });

  describe("message handling flow", () => {
    class ApproveRequestMock extends ApproveSessionMock {
      approveRequest = jest.fn();
    }

    class RejectRequestMock extends ApproveSessionMock {
      rejectRequest = jest.fn();
    }

    it("should reject unsupported methods", async () => {
      const { mockInstance } = await approveSession(new RejectRequestMock());

      const personalSignJsonRpc = {
        id: 1,
        jsonrpc: "2.0",
        method: "personal_sign",
        params: [{ foo: "bar" }],
      };

      mockInstance.emit("call_request", undefined, personalSignJsonRpc);

      expect(mockInstance.rejectRequest).toHaveBeenCalledWith({
        id: personalSignJsonRpc.id,
        error: expect.any(InvalidRPCMethodError),
      });
    });

    it("should validate eth_sign method rpc call", async () => {
      const { mockInstance } = await approveSession(new RejectRequestMock());

      const invalidEthSignJsonRpc = {
        id: 1,
        jsonrpc: "2.0",
        method: "eth_sign",
        params: [{ foo: "bar" }],
      };

      mockInstance.emit("call_request", undefined, invalidEthSignJsonRpc);

      expect(mockInstance.rejectRequest).toHaveBeenCalledWith({
        id: invalidEthSignJsonRpc.id,
        error: expect.any(InvalidJSONRPCPayloadError),
      });
    });

    it("should approve eth_sign method", async done => {
      const { mockInstance, walletConnectManager } = await approveSession(new ApproveRequestMock());

      const signingMessage = "message to sign";
      const signedMessage = "signed message";

      const validEthSignJsonRpc = {
        id: 1,
        jsonrpc: "2.0",
        method: "eth_sign",
        params: [address, signingMessage],
      };

      setTimeout(() => {
        mockInstance.emit("call_request", undefined, validEthSignJsonRpc);
      }, 1);

      const { payload, meta } = await promisifyEvent(
        walletConnectManager,
        EWalletConnectManagerEvents.SIGN_MESSAGE,
      );

      meta.approveRequest(signedMessage);

      setTimeout(() => {
        expect(payload).toEqual({ digest: signingMessage });
        expect(mockInstance.approveRequest).toHaveBeenCalledWith({
          id: validEthSignJsonRpc.id,
          result: signedMessage,
        });

        done();
      }, 1);
    });

    it("should reject eth_sign method", async done => {
      const { mockInstance, walletConnectManager } = await approveSession(new RejectRequestMock());

      const signingMessage = "message to sign";

      const validEthSignJsonRpc = {
        id: 1,
        jsonrpc: "2.0",
        method: "eth_sign",
        params: [address, signingMessage],
      };

      setTimeout(() => {
        mockInstance.emit("call_request", undefined, validEthSignJsonRpc);
      }, 1);

      const { payload, meta } = await promisifyEvent(
        walletConnectManager,
        EWalletConnectManagerEvents.SIGN_MESSAGE,
      );

      meta.rejectRequest();

      setTimeout(() => {
        expect(payload).toEqual({ digest: signingMessage });
        expect(mockInstance.rejectRequest).toHaveBeenCalledWith({
          id: validEthSignJsonRpc.id,
          error: expect.any(Error),
        });

        done();
      }, 1);
    });

    it("should validate eth_sendTransaction method rpc call", async () => {
      const { mockInstance } = await approveSession(new RejectRequestMock());

      const invalidEthSignJsonRpc = {
        id: 1,
        jsonrpc: "2.0",
        method: "eth_sendTransaction",
        params: [{ foo: "bar" }],
      };

      mockInstance.emit("call_request", undefined, invalidEthSignJsonRpc);

      expect(mockInstance.rejectRequest).toHaveBeenCalledWith({
        id: invalidEthSignJsonRpc.id,
        error: expect.any(InvalidJSONRPCPayloadError),
      });
    });

    it("should strip unknown properties and approve eth_sendTransaction method", async done => {
      const { mockInstance, walletConnectManager } = await approveSession(new ApproveRequestMock());

      const transactionHash = "tx hash";

      const transaction = {
        to: "0x7824e49353BD72E20B61717cf82a06a4EEE209e8",
        gasLimit: "0x21000",
        gasPrice: "0x20000000000",
        value: "0x1000000000000000000",
        data: "0x",
      };

      const transactionFromRpc = {
        ...transaction,
        foo: "bar",
        quiz: "baz",
      };

      const validEthSignJsonRpc = {
        id: 1,
        jsonrpc: "2.0",
        method: "eth_sendTransaction",
        params: [transactionFromRpc],
      };

      setTimeout(() => {
        mockInstance.emit("call_request", undefined, validEthSignJsonRpc);
      }, 1);

      const { payload, meta } = await promisifyEvent(
        walletConnectManager,
        EWalletConnectManagerEvents.SEND_TRANSACTION,
      );

      meta.approveRequest(transactionHash);

      setTimeout(() => {
        expect(payload).toEqual({ transaction });
        expect(mockInstance.approveRequest).toHaveBeenCalledWith({
          id: validEthSignJsonRpc.id,
          result: transactionHash,
        });

        done();
      }, 1);
    });

    it("should reject eth_sendTransaction method", async done => {
      const { mockInstance, walletConnectManager } = await approveSession(new RejectRequestMock());

      const transaction = {
        to: "0x7824e49353BD72E20B61717cf82a06a4EEE209e8",
        gasLimit: "0x21000",
        gasPrice: "0x20000000000",
        value: "0x1000000000000000000",
        data: "0x",
      };

      const validEthSignJsonRpc = {
        id: 1,
        jsonrpc: "2.0",
        method: "eth_sendTransaction",
        params: [transaction],
      };
      setTimeout(() => {
        mockInstance.emit("call_request", undefined, validEthSignJsonRpc);
      }, 1);

      const { payload, meta } = await promisifyEvent(
        walletConnectManager,
        EWalletConnectManagerEvents.SEND_TRANSACTION,
      );

      meta.rejectRequest();

      setTimeout(() => {
        expect(payload).toEqual({ transaction });
        expect(mockInstance.rejectRequest).toHaveBeenCalledWith({
          id: validEthSignJsonRpc.id,
          error: expect.any(Error),
        });

        done();
      }, 1);
    });
  });

  describe("disconnect flow", () => {
    it("should emit disconnected even on client request", async () => {
      const { mockInstance, walletConnectManager } = await approveSession(new ApproveSessionMock());

      setTimeout(() => {
        mockInstance.emit("disconnect");
      }, 1);

      const result = await promisifyEvent(
        walletConnectManager,
        EWalletConnectManagerEvents.DISCONNECTED,
      );

      expect(result).toEqual({
        error: undefined,
        meta: undefined,
        payload: undefined,
        type: "disconnected",
      });
    });

    it("should disconnect on ui request", async () => {
      class KillSessionMock extends ApproveSessionMock {
        killSession = jest.fn();
      }

      const { mockInstance, walletConnectManager } = await approveSession(new KillSessionMock());

      await walletConnectManager.disconnectSession();

      expect(mockInstance.killSession).toHaveBeenCalled();
    });
  });
});
