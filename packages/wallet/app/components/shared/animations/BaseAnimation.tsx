import { invariant } from "@neufund/shared-utils";
import * as React from "react";
import { Animated } from "react-native";

type TExternalProps<T> = {
  isActive: boolean;
  render: (
    options: {
      progress: Animated.Value;
      memoizedChildren: React.ReactNode;
    } & T,
  ) => React.ReactNode;
  children?: React.ReactNode;
} & T;

type TUIState = {
  animationProgress: Animated.Value;
  isRendered: boolean;
  children: React.ReactNode | undefined;
};

/**
 * An animation container
 *
 * Features:
 * 1. UI is not rendered on screen when it's not active
 * 2. children (under memoizedChildren key) is memoized during fade transaction so the content is there even when the app state is already cleared
 */
class BaseAnimation<T extends object> extends React.Component<TExternalProps<T>, TUIState> {
  state: TUIState = {
    animationProgress: new Animated.Value(0),
    isRendered: false,
    children: undefined,
  };

  static getDerivedStateFromProps(nextProps: TExternalProps<unknown>) {
    if (nextProps.isActive) {
      return {
        isRendered: true,
        // update children until element is not active anymore
        // in case element is not active render the latest active state
        // this will help with content jumping when redux state was already cleared
        // from the element content
        children: nextProps.children,
      };
    }

    return null;
  }

  componentDidUpdate(prevProps: TExternalProps<T>) {
    if (prevProps.isActive !== this.props.isActive) {
      if (this.props.isActive) {
        this.showAnimation();
      } else {
        this.hideAnimation();
      }
    }
  }

  showAnimation() {
    const { animationProgress } = this.state;

    Animated.timing(animationProgress, {
      duration: 300,
      useNativeDriver: true,
      toValue: 1,
    }).start();
  }

  hideAnimation() {
    const { animationProgress } = this.state;

    Animated.timing(animationProgress, {
      duration: 200,
      useNativeDriver: true,
      toValue: 0,
    }).start(({ finished }) => {
      if (!finished) {
        return;
      }

      // if it's visible again (there was a props change during close transition)
      if (this.props.isActive) {
        this.showAnimation();
      } else {
        this.setState({
          isRendered: false,
          children: undefined,
        });
      }
    });
  }

  render() {
    const { isRendered, animationProgress, children } = this.state;

    if (!isRendered) return null;

    invariant(children, "Animation children should be defined at this point");

    return this.props.render({
      progress: animationProgress,
      memoizedChildren: children,
      ...this.props,
    });
  }
}

export { BaseAnimation };
