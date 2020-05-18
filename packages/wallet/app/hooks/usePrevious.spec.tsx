import { getNodeText, render } from "@testing-library/react-native";
import * as React from "react";
import { Text } from "react-native";

import { usePrevious } from "./usePrevious";

type TExternalProps = {
  value: string;
};

const TestComponent: React.FunctionComponent<TExternalProps> = ({ value }) => {
  const prevValue = usePrevious(value);

  return <Text testID="value">{String(prevValue)}</Text>;
};

describe("usePrevious", () => {
  it("should render previous prop value", async () => {
    const { getByTestId, rerender } = render(<TestComponent value="foo" />);

    expect(getNodeText(getByTestId("value"))).toEqual("undefined");

    // should still preserve previous value after update
    rerender(<TestComponent value="foo" />);

    expect(getNodeText(getByTestId("value"))).toEqual("foo");

    // should update previous value after new one was received
    rerender(<TestComponent value="bar" />);

    expect(getNodeText(getByTestId("value"))).toEqual("foo");
  });
});
