import { SingleOrArray } from "@neufund/shared";
import flatMap from "lodash/flatMap";
import isObjectLike from "lodash/isObjectLike";
import { StyleProp } from "react-native";

type Style = StyleProp<unknown>;

/**
 * A helpful react-native style util to work with conditional styling
 *
 * @todo It should be possible to type it better in the future
 */
const st = (...styles: (Style | [unknown, SingleOrArray<Style>])[]): object[] =>
  flatMap(styles, style => {
    // remember to check also if first item is of primitive type
    if (Array.isArray(style) && !isObjectLike(style[0])) {
      return style[0] ? style[1] : [];
    }

    return style;
  });

export { st };
