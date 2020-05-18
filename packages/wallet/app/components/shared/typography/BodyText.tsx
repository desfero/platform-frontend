import * as React from "react";
import { Animated } from "react-native";

import { typographyStyles } from "../../../styles/typography";

type TExternalProps = { sizeFactor?: Animated.Animated } & React.ComponentProps<
  typeof Animated.Text
>;

const BodyText: React.FunctionComponent<TExternalProps> = ({
  children,
  style,
  sizeFactor = 1,
  ...props
}) => {
  const { fontSize, lineHeight, ...rest } = typographyStyles.body;

  return (
    <Animated.Text
      style={[
        {
          fontSize: Animated.multiply(fontSize, sizeFactor),
          lineHeight: Animated.multiply(lineHeight, sizeFactor),
        },
        rest,
        style,
      ]}
      {...props}
    >
      {children}
    </Animated.Text>
  );
};

const BodyBoldText: React.FunctionComponent<TExternalProps> = ({
  children,
  style,
  sizeFactor = 1,
  ...props
}) => {
  const { fontSize, lineHeight, ...rest } = typographyStyles.bodyBold;

  return (
    <Animated.Text
      style={[
        {
          fontSize: Animated.multiply(fontSize, sizeFactor),
          lineHeight: Animated.multiply(lineHeight, sizeFactor),
        },
        rest,
        style,
      ]}
      {...props}
    >
      {children}
    </Animated.Text>
  );
};

export { BodyText, BodyBoldText };
