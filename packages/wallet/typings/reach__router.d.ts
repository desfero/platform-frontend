import "@reach/router";

declare module "@reach/router" {
  // Given that we don't have in global `Window` object we should mock it to any
  // for storybook to work properly
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type Window = any;
}
