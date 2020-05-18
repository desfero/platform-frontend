import { eventChannel } from "@neufund/sagas";
import { EventEmitter2 } from "eventemitter2";

type TReduxifyAction = {
  type: string;
  payload?: object;
  error?: Error;
  meta?: object;
};

/**
 * Converts an events to a flux standard action format and expose them as redux-saga channel
 *
 * @param eventEmitter - A class that extends EventEmitter2
 */
const reduxify = <T extends TReduxifyAction>(eventEmitter: EventEmitter2) => {
  return eventChannel<T>(emitter => {
    const listener = (
      type: string,
      error: Error | undefined,
      payload: object | undefined,
      meta: object | undefined,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ) => emitter({ type, payload, error, meta } as any);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    eventEmitter.onAny(listener as any);

    return () => eventEmitter.offAny(listener);
  });
};

export { reduxify };
