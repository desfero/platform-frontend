import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";

import { EETOStateOnChain, IEtoTokenGeneralDiscounts } from "../../../../modules/eto/types";
import { IPersonalDiscount } from "../../../../modules/investor-portfolio/types";
import { isLessThanOrEqualToZero, isZero } from "../../../../utils/NumberUtils";
import { Money } from "../../../shared/formatters/Money";
import {
  ECurrency,
  ENumberInputFormat,
  ENumberOutputFormat,
  EPriceFormat,
} from "../../../shared/formatters/utils";
import { Percentage } from "../../../shared/Percentage";

interface IExternalProps {
  onChainState: EETOStateOnChain;
  etoTokenGeneralDiscounts: IEtoTokenGeneralDiscounts;
  etoTokenPersonalDiscount: IPersonalDiscount;
  etoTokenStandardPrice: number;
}

const InvestmentPriceInfo: React.FunctionComponent<IExternalProps> = ({
  onChainState,
  etoTokenPersonalDiscount,
  etoTokenGeneralDiscounts,
  etoTokenStandardPrice,
}) => {
  switch (onChainState) {
    case EETOStateOnChain.Whitelist: {
      if (!isLessThanOrEqualToZero(etoTokenPersonalDiscount.whitelistDiscountAmountLeft)) {
        return (
          <FormattedMessage
            id="investment-flow.token-price-info.personal-discount"
            values={{
              whitelistDiscountAmountLeft: (
                <Money
                  value={etoTokenPersonalDiscount.whitelistDiscountAmountLeft}
                  inputFormat={ENumberInputFormat.ULPS}
                  valueType={ECurrency.EUR}
                  outputFormat={ENumberOutputFormat.ONLY_NONZERO_DECIMALS}
                />
              ),
              whitelistDiscount: (
                <Money
                  value={etoTokenPersonalDiscount.whitelistDiscountUlps}
                  inputFormat={ENumberInputFormat.ULPS}
                  valueType={EPriceFormat.EQUITY_TOKEN_PRICE_EURO}
                  outputFormat={ENumberOutputFormat.FULL}
                />
              ),
              whitelistDiscountPercentage: (
                <Percentage>{etoTokenPersonalDiscount.whitelistDiscountFrac}</Percentage>
              ),
            }}
          />
        );
      }

      if (!isZero(etoTokenGeneralDiscounts.whitelistDiscountFrac)) {
        return (
          <FormattedMessage
            id="investment-flow.token-price-info.general-discount"
            values={{
              discountTokenPrice: (
                <Money
                  value={etoTokenGeneralDiscounts.whitelistDiscountUlps}
                  inputFormat={ENumberInputFormat.ULPS}
                  valueType={EPriceFormat.EQUITY_TOKEN_PRICE_EURO}
                  outputFormat={ENumberOutputFormat.ONLY_NONZERO_DECIMALS}
                />
              ),
              discountTokenPricePercentage: (
                <Percentage>{etoTokenPersonalDiscount.whitelistDiscountFrac}</Percentage>
              ),
            }}
          />
        );
      }

      return (
        <FormattedMessage
          id="investment-flow.token-price-info.no-discount"
          values={{
            tokenPriceEur: (
              <Money
                value={etoTokenStandardPrice}
                inputFormat={ENumberInputFormat.FLOAT}
                valueType={EPriceFormat.EQUITY_TOKEN_PRICE_EURO}
                outputFormat={ENumberOutputFormat.FULL}
              />
            ),
          }}
        />
      );
    }
    case EETOStateOnChain.Public:
      if (etoTokenGeneralDiscounts && !isZero(etoTokenGeneralDiscounts.publicDiscountFrac)) {
        return (
          <FormattedMessage
            id="investment-flow.token-price-info.general-discount"
            values={{
              discountTokenPrice: (
                <Money
                  value={etoTokenGeneralDiscounts.publicDiscountUlps}
                  inputFormat={ENumberInputFormat.ULPS}
                  valueType={EPriceFormat.EQUITY_TOKEN_PRICE_EURO}
                  outputFormat={ENumberOutputFormat.ONLY_NONZERO_DECIMALS}
                />
              ),
              discountTokenPricePercentage: (
                <Percentage>{etoTokenPersonalDiscount.whitelistDiscountFrac}</Percentage>
              ),
            }}
          />
        );
      }

      return (
        <FormattedMessage
          id="investment-flow.token-price-info.no-discount"
          values={{
            tokenPriceEur: (
              <Money
                value={etoTokenStandardPrice}
                inputFormat={ENumberInputFormat.FLOAT}
                valueType={EPriceFormat.EQUITY_TOKEN_PRICE_EURO}
                outputFormat={ENumberOutputFormat.FULL}
              />
            ),
          }}
        />
      );
    default:
      throw new Error(
        `Eto on chain state should be either ${EETOStateOnChain.Whitelist} or ${
          EETOStateOnChain.Public
        }, received ${onChainState}`,
      );
  }
};

export { InvestmentPriceInfo };
