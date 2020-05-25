import { render } from "@testing-library/react-native";
import * as React from "react";
import { Text } from "react-native";
import { create } from "react-test-renderer";

import { setupTimeTravel, timeTravel } from "../../../utils/testUtils.specUtils";
import { BaseAnimation } from "./BaseAnimation";

describe("BaseAnimation", () => {
  beforeEach(setupTimeTravel);

  it("should not render content when it's not active", () => {
    const { queryByTestId } = render(
      <BaseAnimation
        isActive={false}
        render={() => <Text testID="content">Animation content</Text>}
      />,
    );

    expect(queryByTestId("content")).toBeNull();
  });

  it("should render content when it's active", () => {
    const { queryByTestId } = render(
      <BaseAnimation
        isActive={true}
        render={() => <Text testID="content">Animation content</Text>}
      />,
    );

    expect(queryByTestId("content")).toBeDefined();
  });

  it("should hide content after animation is done", () => {
    const renderProp = () => <Text testID="content">Animation content</Text>;
    const { queryByTestId, rerender } = render(
      <BaseAnimation isActive={true} render={renderProp} />,
    );

    rerender(<BaseAnimation isActive={false} render={renderProp} />);

    expect(queryByTestId("content")).toBeDefined();

    timeTravel(200);

    expect(queryByTestId("content")).toBeNull();
  });

  it("should show content after hide animation is done and props changed to be visible again", () => {
    const renderProp = () => <Text testID="content">Animation content</Text>;

    const { queryByTestId, rerender } = render(
      <BaseAnimation isActive={true} render={renderProp} />,
    );

    rerender(<BaseAnimation isActive={false} render={renderProp} />);

    timeTravel(100);

    expect(queryByTestId("content")).toBeDefined();

    rerender(
      <BaseAnimation
        isActive={true}
        render={() => <Text testID="new-content">Animation content</Text>}
      />,
    );

    expect(queryByTestId("new-content")).toBeDefined();
  });

  it("should remove memoized children from state", () => {
    const renderProp = ({ memoizedChildren }: { memoizedChildren: React.ReactNode }) =>
      memoizedChildren;

    const testRenderer = create(
      <BaseAnimation isActive={true} render={renderProp} key={"same"}>
        <Text testID="children">Animation content</Text>
      </BaseAnimation>,
    );

    testRenderer.update(
      <BaseAnimation isActive={false} render={renderProp} key={"same"}>
        <Text testID="children">Animation content</Text>
      </BaseAnimation>,
    );

    timeTravel(200);

    const instance = testRenderer.getInstance();

    // this may look like testing component internals
    // but for the case when we memoize children
    // we need to make sure that it's properly cleared from memory
    // to avoid dangerous memory leaks
    expect(((instance as unknown) as BaseAnimation<{}>).state.memoizedChildren).toBeUndefined();
  });

  it("should memoize the latest active state children", () => {
    const renderProp = ({ memoizedChildren }: { memoizedChildren: React.ReactNode }) =>
      memoizedChildren;

    const { queryByTestId, rerender } = render(
      <BaseAnimation isActive={true} render={renderProp}>
        <Text testID="children">Animation content</Text>
      </BaseAnimation>,
    );

    rerender(
      <BaseAnimation isActive={false} render={renderProp}>
        <Text testID="new-children">Animation content</Text>
      </BaseAnimation>,
    );

    timeTravel(100);

    expect(queryByTestId("children")).toBeDefined();
    expect(queryByTestId("new-children")).toBeNull();
  });
});
