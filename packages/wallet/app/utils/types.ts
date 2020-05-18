import * as React from "react";

export type TComponentRefType<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends React.ComponentType<any>
> = T extends React.ComponentType<{
  ref?: React.Ref<infer P>;
}>
  ? P
  : never;
