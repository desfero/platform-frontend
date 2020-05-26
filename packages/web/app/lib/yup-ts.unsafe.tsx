import { BooleanYTS, YTS, YupTS } from "@neufund/shared-modules";
import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";
import * as Yup from "yup";

import { TTranslatedString } from "../types";

export { TypeOfYTS as TypeOf } from "@neufund/shared-modules";
export { SchemaYTS as Schema } from "@neufund/shared-modules";

export const { object, string, url, array, number, boolean } = YupTS;

export const wysiwygString = () => new WysiwygStringYTS();
export const onlyTrue = (message?: TTranslatedString) =>
  new BooleanYTS().enhance(v =>
    v.test(
      "isTrue",
      message || <FormattedMessage id="form.field.error.set-to-true" />,
      value => value === undefined || value === true,
    ),
  );

class WysiwygStringYTS extends YTS<string> {
  constructor() {
    super(Yup.string().meta({ isWysiwyg: true }));
  }

  max(limit: number): YTS<string> {
    return this.enhance(v =>
      v.max(limit, <FormattedMessage id="form.field.error.wysiwyg-string.max" />),
    );
  }
}
