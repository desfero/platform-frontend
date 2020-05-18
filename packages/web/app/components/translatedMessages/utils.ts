import { DeepReadonly } from "@neufund/shared-utils";

import { TTranslatedString } from "../../types";
import { getMessageTranslation, TranslatedMessageType } from "./messages";

export type TMessage = DeepReadonly<{
  messageType: TranslatedMessageType;
  messageData?: string | number | object;
}>;

export const createMessage = (messageType: TranslatedMessageType, messageData?: any): TMessage => ({
  messageType,
  messageData,
});

/**
 * Used to create message part of the payload for notification module actions
 */
export const createNotificationMessage = (
  messageType: TranslatedMessageType,
  messageData?: any,
): TTranslatedString =>
  getMessageTranslation({
    messageType,
    messageData,
  });

export const formatMatchingFieldNames = (messageData: string[]) => {
  if (messageData.length < 2) {
    throw new Error("At least two field names are required");
  } else {
    return messageData.reduce((acc: string, name: string, index: number) => {
      if (acc === "") {
        return `"${name}"`;
      } else {
        return (acc += `${index === messageData.length - 1 ? " and " : ", "}"${name}"`);
      }
    }, "");
  }
};
