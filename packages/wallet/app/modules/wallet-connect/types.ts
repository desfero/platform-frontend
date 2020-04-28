import { TPeerMeta } from "./lib/schemas";

export type TWalletConnectPeer = {
  id: string;
  meta: TPeerMeta;
};

export type TWalletConnectPeerWithConnectTimestamp = TWalletConnectPeer & {
  connectedAt: number;
};
