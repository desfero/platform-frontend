import { NATIONALITIES } from "@neufund/shared-utils";
import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";

import { FormSelectField, NONE_KEY } from "./FormSelectField";

const VALUES = {
  [NONE_KEY]: <FormattedMessage id="form.select.please-select" />,
  ...NATIONALITIES,
};

type TExternalProps = Omit<React.ComponentProps<typeof FormSelectField>, "values">;

const FormSelectNationalityField: React.FunctionComponent<TExternalProps> = props => (
  <FormSelectField {...props} values={VALUES} />
);

export { FormSelectNationalityField };
