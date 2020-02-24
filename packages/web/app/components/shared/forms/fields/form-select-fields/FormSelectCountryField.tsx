import { COUNTRIES, Dictionary } from "@neufund/shared";
import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";

import { TTranslatedString } from "../../../../../types";
import { FormSelectField, NONE_KEY } from "./FormSelectField";

const VALUES: Dictionary<TTranslatedString> = {
  [NONE_KEY]: <FormattedMessage id="form.select.please-select" />,
  ...COUNTRIES,
};

type TExternalProps = Omit<React.ComponentProps<typeof FormSelectField>, "values">;

const FormSelectCountryField: React.FunctionComponent<TExternalProps> = props => (
  <FormSelectField {...props} values={VALUES} />
);

export { FormSelectCountryField, VALUES };
