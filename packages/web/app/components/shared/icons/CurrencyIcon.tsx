import { TokenIcon } from "@neufund/design-system";
import { assertNever, ECurrency, selectUnits } from "@neufund/shared";
import * as React from "react";

import { CommonHtmlProps } from "../../../types";

import ethIcon from "../../../assets/img/eth_icon.svg";
import eurIcon from "../../../assets/img/euro_icon.svg";
import neuIcon from "../../../assets/img/neu_icon.svg";
import nEurIcon from "../../../assets/img/nEUR_icon.svg";

const getIconForCurrency = (currency: ECurrency) => {
  switch (currency) {
    case ECurrency.EUR_TOKEN:
      return nEurIcon;
    case ECurrency.EUR:
      return eurIcon;
    case ECurrency.ETH:
      return ethIcon;
    case ECurrency.NEU:
      return neuIcon;
    default:
      assertNever(currency);
  }
};

type TExternalProps = { currency: ECurrency };

const CurrencyIcon: React.FunctionComponent<TExternalProps & CommonHtmlProps> = ({
  currency,
  className,
}) => (
  <TokenIcon
    srcSet={{ "1x": getIconForCurrency(currency) }}
    alt={`${selectUnits(currency)} token`}
    className={className}
  />
);

export { CurrencyIcon, getIconForCurrency };
