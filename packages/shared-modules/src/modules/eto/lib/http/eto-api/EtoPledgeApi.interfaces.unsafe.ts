import * as Yup from "yup";

import { ECurrency } from "../../../components/shared/formatters/utils";
import {
  getMessageTranslation,
  ValidationMessage,
} from "../../../components/translatedMessages/messages";
import { createMessage } from "../../../components/translatedMessages/utils";
import {
  isPledgeAboveMinimum,
  isPledgeNotAboveMaximum,
} from "../../../modules/bookbuilding-flow/utils";

export interface IPledge {
  amountEur: number;
  currency: ECurrency.EUR_TOKEN;
  consentToRevealEmail: boolean;
  etoId?: string;
}

export interface IPledges {
  [etoId: string]: IPledge;
}

export interface IBookBuildingStats {
  investorsCount: number;
  pledgedAmount: number;
}

export const generateCampaigningValidation = (minPledge: number, maxPledge?: number) =>
  Yup.object({
    amount: Yup.string()
      .required()
      .matches(
        /^[0-9]*$/,
        getMessageTranslation(createMessage(ValidationMessage.VALIDATION_INTEGER)) as any,
      )
      .test(isPledgeAboveMinimum(minPledge))
      .test(isPledgeNotAboveMaximum(maxPledge)),
  });
