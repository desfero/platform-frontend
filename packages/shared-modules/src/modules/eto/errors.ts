import { EEtoState } from "../../lib/api/eto/EtoApi.interfaces.unsafe";

export class InvalidETOStateError extends Error {
  constructor(actual: EEtoState, expected: EEtoState) {
    super(`Invalid ETO state. ${expected} was expected instead of ${actual}`);
  }
}
