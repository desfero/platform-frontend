import { createActionFactory } from "@neufund/shared-utils";

import { TSignerSignedPayload, TSignerSignPayload } from "./types";

export const signerUIActions = {
  sign: createActionFactory("SIGNER_UI_SIGN", (payload: TSignerSignPayload) => payload),
  signed: createActionFactory("SIGNER_UI_SIGNED", (payload: TSignerSignedPayload) => payload),
  approved: createActionFactory("SIGNER_UI_APPROVED"),
  denied: createActionFactory("SIGNER_UI_DENIED"),
};
