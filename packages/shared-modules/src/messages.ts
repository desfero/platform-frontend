import { DeepReadonly } from "@neufund/shared-utils";

import { EtoMessage } from "./modules/eto/module";
import { ETxHistoryMessage } from "./modules/tx-history/module";

export enum YupMessage {
  DEFAULT_ONLY_TRUE_MESSAGE = "defaultOnlyTrueMessage",
  WYSIWYG_MAX_EXCEEDED_MESSAGE = "wysiwygMaxExceededMessage",
}

export enum ValidationMessage {
  VALIDATION_INTEGER = "validationInteger",
  VALIDATION_MIN_PLEDGE = "validationMinPledge",
  VALIDATION_MAX_PLEDGE = "validationMaxPledge",
  VALIDATION_MAX_NEW_SHARES_LESS_THAN_MINIMUM = "validationMaxNewSharesLessThanMinimum",
  VALIDATION_TICKET_LESS_THAN_ACCEPTED = "validationTicketLessThanAccepted",
  VALIDATION_TICKET_LESS_THAN_MINIMUM = "validationTicketLessThanMinimum",
  VALIDATION_INVALID_DATE = "validationInvalidDate",
  VALIDATION_MIN_AGE = "validationMinAge",
  VALIDATION_MAX_AGE = "validationMaxAge",
  VALIDATION_DATE_IN_THE_FUTURE = "validationDateInTheFuture",
  VALIDATION_US_CITIZEN = "validationUsCitizen",
  VALIDATION_RESTRICTED_COUNTRY = "validationRestrictedCountry",
  VALIDATION_PECENTAGE_MAX = "validationPecentageMax",
  VALIDATION_PERCENTAGE_MIN = "validationPercentageMin",
  VALIDATION_CURRENCY_CODE = "validationCurrencyCode",
  VALIDATION_FIELDS_SHOULD_MATCH = "validationFieldsShouldMatch",
}

export type SharedTranslatedMessageType =
  | ETxHistoryMessage
  | YupMessage
  | ValidationMessage
  | EtoMessage;

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

/**
 * Point for supplying message translations from either the web or wallet apps, not a very nice solution
 * but will work for now. Will be easy to change later as it's abstracted to here.
 */

type ISharedModulesMessagesTranlationSource = (message: TMessage) => string;

let sharedMessageTranslationSource: ISharedModulesMessagesTranlationSource;

export const getMessageTranslation = (message: TMessage): string => {
  if (!sharedMessageTranslationSource) {
    throw Error("No translation source set for shared modules");
  }
  return sharedMessageTranslationSource(message);
};

export const setSharedModulesMessageTranslationSource = (
  source: ISharedModulesMessagesTranlationSource,
): void => {
  sharedMessageTranslationSource = source;
};
