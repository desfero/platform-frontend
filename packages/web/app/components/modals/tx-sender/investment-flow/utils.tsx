import {
  assertNever,
  Dictionary,
  divideBigNumbers,
  ECurrency,
  ENumberInputFormat,
  ENumberOutputFormat,
  EPriceFormat,
  ERoundingMode,
  formatNumber,
  selectDecimalPlaces,
  toFixedPrecision,
} from "@neufund/shared";
import BigNumber from "bignumber.js";
import { includes } from "lodash/fp";
import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";

import { TBigNumberVariants } from "../../../../lib/web3/types";
import {
  EInvestmentErrorState,
  EInvestmentType,
} from "../../../../modules/investment-flow/reducer";
import { selectInvestmentActiveTypes } from "../../../../modules/investment-flow/selectors";
import { EValidationState } from "../../../../modules/tx/validator/reducer";
import {
  selectICBMLockedEtherBalance,
  selectICBMLockedEtherBalanceEuroAmount,
  selectICBMLockedEuroTokenBalance,
  selectLiquidEtherBalance,
  selectLiquidEtherBalanceEuroAmount,
  selectLiquidEuroTokenBalance,
  selectLockedEtherBalance,
  selectLockedEtherBalanceEuroAmount,
  selectLockedEuroTokenBalance,
} from "../../../../modules/wallet/selectors";
import { TAppGlobalState } from "../../../../store";
import { TTranslatedString } from "../../../../types";
import { Money } from "../../../shared/formatters/Money";
import { WalletSelectionData } from "./InvestmentTypeSelector";

export enum EInvestmentCurrency {
  ETH = ECurrency.ETH,
  EUR_TOKEN = ECurrency.EUR_TOKEN,
}

export const getInvestmentCurrency = (investmentType: EInvestmentType) => {
  switch (investmentType) {
    case EInvestmentType.Eth:
    case EInvestmentType.ICBMEth:
      return EInvestmentCurrency.ETH;
    case EInvestmentType.NEur:
    case EInvestmentType.ICBMnEuro:
      return EInvestmentCurrency.EUR_TOKEN;
    default:
      return assertNever(investmentType);
  }
};

function isICBMWallet(type: EInvestmentType): boolean {
  return includes(type, [EInvestmentType.ICBMnEuro, EInvestmentType.ICBMEth]);
}

export function createWallets(state: TAppGlobalState): WalletSelectionData[] {
  const icbmNeuro = selectLockedEuroTokenBalance(state);
  const balanceNEur = selectLiquidEuroTokenBalance(state);
  const lockedBalanceNEur = selectICBMLockedEuroTokenBalance(state);
  const liquidEthBalance = selectLiquidEtherBalance(state);
  const balanceEth = selectLockedEtherBalance(state);
  const icbmBalanceEth = selectICBMLockedEtherBalance(state);

  const wallets: Dictionary<WalletSelectionData> = {
    [EInvestmentType.Eth]: {
      balanceEth: liquidEthBalance,
      balanceEur: selectLiquidEtherBalanceEuroAmount(state),
      type: EInvestmentType.Eth,
      name: "ETH Balance",
      enabled: false,
      hasFunds: liquidEthBalance !== "0",
    },
    [EInvestmentType.NEur]: {
      balanceNEuro: balanceNEur,
      balanceEur: balanceNEur,
      type: EInvestmentType.NEur,
      name: "nEUR Balance",
      enabled: false,
      hasFunds: balanceNEur !== "0",
    },
    [EInvestmentType.ICBMnEuro]: {
      type: EInvestmentType.ICBMnEuro,
      name: "ICBM Balance",
      balanceNEuro: icbmNeuro,
      balanceEur: icbmNeuro,
      icbmBalanceNEuro: lockedBalanceNEur,
      icbmBalanceEur: lockedBalanceNEur,
      hasFunds: lockedBalanceNEur !== "0" || icbmNeuro !== "0",
      enabled: false,
    },
    [EInvestmentType.ICBMEth]: {
      type: EInvestmentType.ICBMEth,
      name: "ICBM Balance",
      balanceEth: balanceEth,
      balanceEur: selectLockedEtherBalanceEuroAmount(state),
      icbmBalanceEth: icbmBalanceEth,
      icbmBalanceEur: selectICBMLockedEtherBalanceEuroAmount(state),
      hasFunds: icbmBalanceEth !== "0" || balanceEth !== "0",
      enabled: false,
    },
  };

  const walletsList = Object.keys(wallets);
  const enabledWallets = selectInvestmentActiveTypes(state);

  return (
    walletsList
      .map(w => ({ ...wallets[w], enabled: enabledWallets.some(v => v === w) }))
      .filter(w => w.hasFunds)
      // filter not enabled wallets that are not ICBM in current investment flow
      .filter(w => isICBMWallet(w.type) || w.enabled)
  );
}

export function getInputErrorMessage(
  investmentTxErrorState: EInvestmentErrorState | undefined,
  txValidationState: EValidationState | undefined,
  tokenName: string,
  maxTicketEur: string,
  minTicketEur: string,
  minTicketEth: string,
  investmentCurrency: EInvestmentCurrency,
): TTranslatedString | undefined {
  switch (investmentTxErrorState) {
    case EInvestmentErrorState.ExceedsTokenAmount:
      return (
        <FormattedMessage
          id="investment-flow.error-message.exceeds-token-amount"
          values={{ tokenName }}
        />
      );
    case EInvestmentErrorState.AboveMaximumTicketSize:
      return (
        <FormattedMessage
          id="investment-flow.error-message.above-maximum-ticket-size"
          values={{
            maxEurAmount: (
              <Money
                value={maxTicketEur || "0"}
                inputFormat={ENumberInputFormat.FLOAT}
                valueType={ECurrency.EUR}
                outputFormat={ENumberOutputFormat.ONLY_NONZERO_DECIMALS}
              />
            ),
          }}
        />
      );
    case EInvestmentErrorState.BelowMinimumTicketSize:
      return (
        <FormattedMessage
          id="investment-flow.error-message.below-minimum-ticket-size"
          values={{
            investmentCurrency,
            minEurAmount: (
              <Money
                value={minTicketEur || "0"}
                inputFormat={ENumberInputFormat.FLOAT}
                valueType={ECurrency.EUR}
                outputFormat={ENumberOutputFormat.ONLY_NONZERO_DECIMALS}
              />
            ),
            minEthAmount: (
              <Money
                value={minTicketEth || "0"}
                inputFormat={ENumberInputFormat.FLOAT}
                valueType={ECurrency.ETH}
                outputFormat={ENumberOutputFormat.ONLY_NONZERO_DECIMALS_ROUND_UP}
              />
            ),
          }}
        />
      );

    case EInvestmentErrorState.ExceedsWalletBalance:
      return <FormattedMessage id="investment-flow.error-message.exceeds-wallet-balance" />;
  }

  switch (txValidationState) {
    case EValidationState.NOT_ENOUGH_ETHER_FOR_GAS:
      return <FormattedMessage id="modal.txsender.error-message.not-enough-ether-for-gas" />;
  }

  return undefined;
}

export const formatMinMaxTickets = (value: TBigNumberVariants, roundingMode: ERoundingMode) =>
  toFixedPrecision({
    value,
    inputFormat: ENumberInputFormat.ULPS,
    outputFormat: ENumberOutputFormat.FULL,
    decimalPlaces: selectDecimalPlaces(ECurrency.EUR, ENumberOutputFormat.FULL),
    roundingMode: roundingMode,
  });

export function getActualTokenPriceEur(
  investmentEurUlps: string,
  equityTokenCount: string | number,
): string {
  return formatNumber({
    value: divideBigNumbers(investmentEurUlps, equityTokenCount.toString()).toString(),
    decimalPlaces: selectDecimalPlaces(EPriceFormat.EQUITY_TOKEN_PRICE_EUR_TOKEN),
  });
}

export const getTokenPriceDiscount = (fullTokenPrice: string, actualTokenPrice: string) => {
  // round up effective discount
  const discount = new BigNumber("1")
    .sub(new BigNumber(actualTokenPrice).div(new BigNumber(fullTokenPrice)))
    .mul("100")
    .round(0, BigNumber.ROUND_HALF_UP);

  return discount.gte("1") ? discount.toString() : null;
};
