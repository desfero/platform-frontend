import { TokenIcon } from "@neufund/design-system";
import {
  ENumberInputFormat,
  ENumberOutputFormat,
  THumanReadableFormat,
  TValueFormat,
} from "@neufund/shared";
import * as cn from "classnames";
import * as React from "react";

import { TDataTestId, TTranslatedString } from "../../../types";
import { Money } from "../formatters/Money";
import {
  ESize as ETransactionDataSize,
  ETheme as ETransactionTheme,
  TransactionData,
} from "../transaction/TransactionData";

import * as styles from "./MoneySuiteWidget.module.scss";

enum ETheme {
  /*
   * @deprecated FRAMED should be moved to a separate component
   */
  FRAMED = styles.framed,
  BLACK = styles.black,
}

export enum ETextPosition {
  LEFT = styles.positionLeft,
  RIGHT = styles.positionRight,
}

enum ESize {
  HUGE = styles.huge,
  LARGE = styles.large,
  MEDIUM = styles.medium,
  NORMAL = styles.normal,
}

interface IMoneySuiteWidgetProps {
  icon?: string;
  currency: TValueFormat;
  currencyTotal: TValueFormat;
  largeNumber: string;
  value: string;
  theme?: ETheme;
  size?: ESize;
  /*
   * @deprecated should be moved to a separate component
   */
  walletName?: TTranslatedString;
  textPosition?: ETextPosition;
  outputFormat?: THumanReadableFormat;
  inputFormat?: ENumberInputFormat;
  useTildeSign?: boolean;
  transactionTheme?: ETransactionTheme;
}

interface IMoneySingleSuiteWidgetProps {
  icon: string;
  currency: TValueFormat;
  value?: string;
  theme?: ETheme;
  size?: ESize;
  textPosition?: ETextPosition;
  outputFormat?: THumanReadableFormat;
  inputFormat?: ENumberInputFormat;
  decimals?: number;
}

const getSize = (size: ESize | undefined) => {
  switch (size) {
    case ESize.HUGE:
      return ETransactionDataSize.HUGE;
    case ESize.LARGE:
      return ETransactionDataSize.LARGE;
    case ESize.MEDIUM:
      return ETransactionDataSize.MEDIUM;
    default:
      return undefined;
  }
};

const Icon: React.FunctionComponent<{ icon: string }> = ({ icon }) => (
  <TokenIcon srcSet={{ "1x": icon }} className={styles.icon} alt="" />
);

const IconWithWallet: React.FunctionComponent<{ icon: string; walletName: TTranslatedString }> = ({
  icon,
  walletName,
}) => (
  <div>
    <Icon icon={icon} />
    {walletName}
  </div>
);

const MoneySingleSuiteWidget: React.FunctionComponent<IMoneySingleSuiteWidgetProps &
  TDataTestId> = ({
  icon,
  currency,
  value,
  "data-test-id": dataTestId,
  theme,
  decimals,
  size,
  textPosition = ETextPosition.LEFT,
  outputFormat = ENumberOutputFormat.ONLY_NONZERO_DECIMALS,
  inputFormat = ENumberInputFormat.ULPS,
}) => (
  <div className={cn(styles.moneySuiteWidget, theme, size, textPosition)}>
    {textPosition === ETextPosition.LEFT && <Icon icon={icon} />}
    <Money
      data-test-id={dataTestId}
      value={value}
      inputFormat={inputFormat}
      outputFormat={outputFormat}
      valueType={currency}
      decimals={decimals}
    />
    {textPosition === ETextPosition.RIGHT && <Icon icon={icon} />}
  </div>
);

interface IStaticMoneyWidgetProps {
  icon: string;
  theme?: ETheme;
  size?: ESize;
  textPosition?: ETextPosition;
  upperText: string;
  lowerText: string;
}

const StaticMoneyWidget: React.FunctionComponent<IStaticMoneyWidgetProps & TDataTestId> = ({
  icon,
  upperText,
  lowerText,
  theme,
  size,
  "data-test-id": dataTestId,
  textPosition = ETextPosition.LEFT,
}) => (
  <div className={cn(styles.moneySuiteWidget, theme, size, textPosition)}>
    {textPosition === ETextPosition.LEFT && <Icon icon={icon} />}
    <TransactionData
      size={getSize(size)}
      data-test-id={dataTestId}
      top={upperText}
      bottom={<>= {lowerText}</>}
    />
    {textPosition === ETextPosition.RIGHT && <Icon icon={icon} />}
  </div>
);

const MoneySuiteWidget: React.FunctionComponent<IMoneySuiteWidgetProps & TDataTestId> = ({
  icon,
  currency,
  currencyTotal,
  largeNumber,
  value: smallNumber,
  theme,
  size,
  walletName,
  "data-test-id": dataTestId,
  textPosition = ETextPosition.LEFT,
  outputFormat = ENumberOutputFormat.ONLY_NONZERO_DECIMALS,
  inputFormat = ENumberInputFormat.ULPS,
  useTildeSign = false,
  transactionTheme,
}) => {
  const walletIcon = icon ? (
    walletName ? (
      <IconWithWallet icon={icon} walletName={walletName} />
    ) : (
      <Icon icon={icon} />
    )
  ) : (
    undefined
  );

  return (
    <div className={cn(styles.moneySuiteWidget, theme, size, textPosition)}>
      {textPosition === ETextPosition.LEFT && walletIcon}
      <TransactionData
        theme={transactionTheme}
        size={getSize(size)}
        data-test-id={dataTestId}
        top={
          <Money
            value={largeNumber}
            inputFormat={inputFormat}
            outputFormat={outputFormat}
            valueType={currency}
          />
        }
        bottom={
          <>
            {useTildeSign ? <>~</> : <>=</>}{" "}
            <Money
              value={smallNumber}
              inputFormat={inputFormat}
              outputFormat={outputFormat}
              valueType={currencyTotal}
            />
          </>
        }
      />
      {textPosition === ETextPosition.RIGHT && walletIcon}
    </div>
  );
};

export {
  ETheme,
  ESize,
  IMoneySuiteWidgetProps,
  MoneySuiteWidget,
  MoneySingleSuiteWidget,
  StaticMoneyWidget,
};
