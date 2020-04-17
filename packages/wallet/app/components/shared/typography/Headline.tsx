import { assertNever } from "@neufund/shared-utils";
import * as React from "react";
import { Text } from "react-native";
import { typographyStyles } from "../../../styles/typography";

enum EHeadlineLevel {
  LEVEL1 = 1,
  LEVEL2 = 1,
  LEVEL3 = 1,
}

type TNativeTextProps = React.ComponentProps<typeof Text>;
type TExternalProps = { level: EHeadlineLevel } & TNativeTextProps;

const getStyleForHeadlineLevel = (level: EHeadlineLevel) => {
  switch (level) {
    case EHeadlineLevel.LEVEL1:
      return typographyStyles.headline1;
    case EHeadlineLevel.LEVEL2:
      return typographyStyles.headline2;
    case EHeadlineLevel.LEVEL3:
      return typographyStyles.headline3;

    default:
      assertNever(level, "Invalid headline level");
  }
};

const Headline: React.FunctionComponent<TExternalProps> = ({
  children,
  level,
  style,
  ...props
}) => (
  <Text style={[getStyleForHeadlineLevel(level), style]} {...props}>
    {children}
  </Text>
);

export { Headline, EHeadlineLevel };
