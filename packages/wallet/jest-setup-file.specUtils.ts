import "./app/polyfills";

// Mock react-native animation helpers to get rid of `useNativeDriver` unknown module warnings
// see https://stackoverflow.com/questions/59587799/how-to-resolve-animated-usenativedriver-is-not-supported-because-the-native
jest.mock("react-native/Libraries/Animated/src/NativeAnimatedHelper");

// Provide a custom request animation frame that's pushing callback with some small delay
// see https://www.benjaminjohnson.me/blog/testing-animations-in-react-native/
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(global as any).requestAnimationFrame = (cb: () => void) => {
  setTimeout(cb, 1);
};
