/* eslint-disable @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports */

import { noopLogger } from "@neufund/shared-modules";
import { EventEmitter2 } from "eventemitter2";

import { createMock } from "../../../utils/testUtils.specUtils";
import { AppSingleKeyStorage } from "../../storage";
import { IStorageItem } from "../../storage/types/IStorageItem";
import { TWalletSession } from "./schemas";
import { EWalletConnectAdapterEvents } from "./types";
import { toWalletConnectUri } from "./utils";

describe("WalletConnectManager", () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it("should manage new session", async () => {
    const session = { foo: "bar" };

    class WalletConnectAdapterMock extends EventEmitter2 {
      connect = jest.fn();
      getSession = jest.fn(() => session);
    }

    const wcAdapter = new WalletConnectAdapterMock();
    const WalletConnectAdapter = jest.fn(() => wcAdapter);

    jest.doMock("./WalletConnectAdapter", () => ({
      WalletConnectAdapter,
    }));

    const { WalletConnectManager } = require("./WalletConnectManager");

    const sessionStorageMock = createMock<AppSingleKeyStorage<TWalletSession>>(
      AppSingleKeyStorage,
      { set: jest.fn(), clear: jest.fn() },
    );

    const manager = new WalletConnectManager(noopLogger, sessionStorageMock);

    const uri = toWalletConnectUri("foo");

    await manager.createSession(uri);

    expect(WalletConnectAdapter).toHaveBeenCalledWith({ uri }, noopLogger);
    expect(wcAdapter.connect).toHaveBeenCalled();

    wcAdapter.emit(EWalletConnectAdapterEvents.CONNECTED);

    expect(sessionStorageMock.set).toHaveBeenCalledWith(session);

    wcAdapter.emit(EWalletConnectAdapterEvents.DISCONNECTED);

    expect(sessionStorageMock.clear).toHaveBeenCalled();
  });

  it("should manage persisted session", async () => {
    const session = { foo: "bar" };
    const sessionCreatedAt = Date.now();

    class WalletConnectAdapterMock extends EventEmitter2 {
      getSession = jest.fn(() => session);
    }

    const wcAdapter = new WalletConnectAdapterMock();
    const WalletConnectAdapter = jest.fn(() => wcAdapter);

    jest.doMock("./WalletConnectAdapter", () => ({
      WalletConnectAdapter,
    }));

    const { WalletConnectManager } = require("./WalletConnectManager");

    const sessionStorageMock = createMock<AppSingleKeyStorage<TWalletSession>>(
      AppSingleKeyStorage,
      {
        set: jest.fn(),
        clear: jest.fn(),
        getStorageItem: jest.fn(() =>
          Promise.resolve(({
            data: session,
            metadata: {
              created: sessionCreatedAt,
            },
          } as unknown) as IStorageItem<TWalletSession>),
        ),
      },
    );

    const manager = new WalletConnectManager(noopLogger, sessionStorageMock);

    await manager.useExistingSession();

    expect(WalletConnectAdapter).toHaveBeenCalledWith(
      { session, connectedAt: sessionCreatedAt },
      noopLogger,
    );

    wcAdapter.emit(EWalletConnectAdapterEvents.CONNECTED);

    expect(sessionStorageMock.set).toHaveBeenCalledWith(session);

    wcAdapter.emit(EWalletConnectAdapterEvents.DISCONNECTED);

    expect(sessionStorageMock.clear).toHaveBeenCalled();
  });
});
