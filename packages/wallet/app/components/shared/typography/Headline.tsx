import { assertNever } from "@neufund/shared-utils";
import * as React from "react";
import { Animated } from "react-native";

import { typographyStyles } from "styles/typography";

enum EHeadlineLevel {
  LEVEL1 = 1,
  LEVEL2 = 2,
  LEVEL3 = 3,
  LEVEL4 = 4,
}

type TNativeTextProps = React.ComponentProps<typeof Animated.Text>;
type TExternalProps = { level: EHeadlineLevel; sizeFactor?: Animated.Animated } & TNativeTextProps;

const getStyleForHeadlineLevel = (level: EHeadlineLevel) => {
  switch (level) {
    case EHeadlineLevel.LEVEL1:
      return typographyStyles.headline1;
    case EHeadlineLevel.LEVEL2:
      return typographyStyles.headline2;
    case EHeadlineLevel.LEVEL3:
      return typographyStyles.headline3;
    case EHeadlineLevel.LEVEL4:
      return typographyStyles.headline4;

    default:
      assertNever(level, "Invalid headline level");
  }
};

const Headline: React.FunctionComponent<TExternalProps> = ({
  children,
  level,
  style,
  sizeFactor = 1,
  ...props
}) => {
  const { fontSize, lineHeight, ...rest } = getStyleForHeadlineLevel(level);

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

export { Headline, EHeadlineLevel };
