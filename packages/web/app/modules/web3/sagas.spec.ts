import { expectSaga } from "@neufund/sagas/tests";
import { EventEmitter } from "events";

import { TGlobalDependencies } from "../../di/setupBindings";
import { EWeb3ManagerEvents, Web3Manager } from "../../lib/web3/Web3Manager/Web3Manager";
import { actions } from "../actions";
import { initWeb3ManagerEvents } from "./sagas";

describe("Web3 sagas", () => {
  describe("web3Manager events connection", () => {
    it("connects to event from web3Manager", () => {
      const web3ManagerMock = new EventEmitter();
      const eventPayload = {
        metaData: "foo",
        isUnlocked: true,
      };
      const promise = expectSaga(initWeb3ManagerEvents, {
        web3Manager: web3ManagerMock as Web3Manager,
      } as TGlobalDependencies)
        .put(
          actions.web3.newPersonalWalletPlugged(
            eventPayload.metaData as any,
            eventPayload.isUnlocked,
          ),
        )
        .run();

      web3ManagerMock.emit(EWeb3ManagerEvents.NEW_PERSONAL_WALLET_PLUGGED, eventPayload);
      return promise;
    });
  });
});
