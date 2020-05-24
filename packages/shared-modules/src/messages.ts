import { DeepReadonly } from "@neufund/shared-utils";

import { ETxHistoryMessage } from "./modules/tx-history/module";

export type SharedTranslatedMessageType = ETxHistoryMessage;

export const createMessage = (
  messageType: SharedTranslatedMessageType,
  messageData?: any,
): TMessage => ({
  messageType,
  messageData,
});

export type TMessage = DeepReadonly<{
  messageType: SharedTranslatedMessageType;
  messageData?: any;
}>;
