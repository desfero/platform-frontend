import { CSSProperties, ReactElement } from "react";
import { FormattedMessage } from "react-intl-phraseapp";

// we dont use AllHtmlAttributes because they include many more fields which can collide easily with components props (like data)
export type CommonHtmlProps = {
  className?: string;
  style?: CSSProperties;
};

export type TTranslatedString = string | ReactElement<FormattedMessage.Props>;
