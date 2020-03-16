import { formatThousands } from "@neufund/shared";
import * as React from "react";

import { TBigNumberVariants } from "../../lib/web3/types";

interface IProps {
  value: TBigNumberVariants;
}

/*
 * @deprecated
 * use  /Users/lexey/projects/platform-frontend/app/components/shared/formatters/FormatNumber.tsx
 * */
const NumberFormat: React.FunctionComponent<IProps> = ({ value }) => (
  <>{formatThousands(`${value}`)}</>
);

export { NumberFormat };
