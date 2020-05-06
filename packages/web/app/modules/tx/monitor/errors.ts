import { ETxType } from "../types";

export class TxMonitorError extends Error {}

export class SchemaMismatchError extends TxMonitorError {
  constructor(type: ETxType) {
    super(`Invalid schema received from pending transactions for ${type}`);
  }
}
