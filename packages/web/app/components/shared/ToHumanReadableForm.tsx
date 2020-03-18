import { getRange } from "@neufund/shared";
import { floor } from "lodash";
import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";

/*
 * @deprecated
 * use app/components/shared/formatters/utils.ts
 * */
export enum THumanReadableFormat {
  LONG = "long",
  SHORT = "short",
}

type TExternalProps = {
  number: number;
  format?: THumanReadableFormat;
  divider?: number;
  children?: (range: number) => React.ReactNode;
};

enum ERangeKey {
  THOUSAND = "thousand",
  MILLION = "million",
}

type TRangeDescriptor = {
  divider: number;
  key: ERangeKey;
};

const ranges: TRangeDescriptor[] = [
  { divider: 1e3, key: ERangeKey.THOUSAND },
  { divider: 1e6, key: ERangeKey.MILLION },
];

const translationKeys = {
  [ERangeKey.MILLION]: {
    [THumanReadableFormat.LONG]: (
      <FormattedMessage id="shared-component.to-human-readable-form.million.long" />
    ),
    [THumanReadableFormat.SHORT]: (
      <FormattedMessage id="shared-component.to-human-readable-form.million.short" />
    ),
  },
  [ERangeKey.THOUSAND]: {
    [THumanReadableFormat.LONG]: (
      <FormattedMessage id="shared-component.to-human-readable-form.thousand.long" />
    ),
    [THumanReadableFormat.SHORT]: (
      <FormattedMessage id="shared-component.to-human-readable-form.thousand.short" />
    ),
  },
};

const ToHumanReadableForm: React.FunctionComponent<TExternalProps> = ({
  number,
  format = THumanReadableFormat.LONG,
  children,
  divider,
}) => {
  const range = getRange(number, divider);

  if (range) {
    const value = floor(number / range.divider, 1);
    const translation = translationKeys[range.key][format];

    return (
      <>
        {value}
        {!children && (
          <>
            {format === THumanReadableFormat.LONG && " "}
            {translation}
          </>
        )}
        {children && (
          <>
            {" - "}
            {children(range.divider)}
          </>
        )}
      </>
    );
  }

  return (
    <>
      {number.toString()}
      {children && (
        <>
          {" - "}
          {children(1)}
        </>
      )}
    </>
  );
};

export { ToHumanReadableForm };
