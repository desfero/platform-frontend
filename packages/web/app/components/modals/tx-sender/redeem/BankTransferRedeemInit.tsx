import { ButtonArrowRight, ButtonInline } from "@neufund/design-system";
import BigNumber from "bignumber.js";
import * as cn from "classnames";
import * as React from "react";
import { FormattedHTMLMessage, FormattedMessage } from "react-intl-phraseapp";
import { compose } from "recompose";

import { ITxData } from "../../../../lib/web3/types";
import * as YupTS from "../../../../lib/yup-ts.unsafe";
import { actions } from "../../../../modules/actions";
import { EBankTransferType } from "../../../../modules/bank-transfer-flow/reducer";
import {
  selectBankRedeemMinAmount,
  selectInitialAmount,
  selectRedeemFeeUlps,
} from "../../../../modules/bank-transfer-flow/selectors";
import { selectLiquidEuroTokenBalance } from "../../../../modules/wallet/selectors";
import { doesUserHaveEnoughNEuro, doesUserWithdrawMinimal } from "../../../../modules/web3/utils";
import { appConnect } from "../../../../store";
import { onEnterAction } from "../../../../utils/react-connected-components/OnEnterAction";
import { FormatNumber } from "../../../shared/formatters/FormatNumber";
import {
  ECurrency,
  ENumberInputFormat,
  ENumberOutputFormat,
  ERoundingMode,
  formatNumber,
  selectDecimalPlaces,
} from "../../../shared/formatters/utils";
import { Form, FormLabel, FormMaskedNumberInput } from "../../../shared/forms/index";
import { EHeadingSize, Heading } from "../../../shared/Heading";
import { ETheme, MoneySuiteWidget } from "../../../shared/MoneySuiteWidget/MoneySuiteWidget";
import { Tooltip } from "../../../shared/tooltips/Tooltip";
import { formatEuroValueToString } from "../../../shared/utils";
import { VerifiedBankAccount } from "../../../wallet/bank-account/VerifiedBankAccount";
import { CalculatedFee } from "./CalculatedFee";
import { TotalRedeemed } from "./TotalRedeemed";

import neuroIcon from "../../../../assets/img/nEUR_icon.svg";
import * as styles from "./BankTransferRedeemInit.module.scss";

interface IStateProps {
  minAmount: string;
  neuroAmount: string;
  neuroEuroAmount: string;
  bankFee: string;
  initialAmount: string | undefined;
}

interface IDispatchProps {
  confirm: (tx: Partial<ITxData>) => void;
  verifyBankAccount: () => void;
}

type TComponentProps = IStateProps & IDispatchProps;

export interface IReedemData {
  amount: string | undefined;
}

const getValidators = (minAmount: string, neuroAmount: string) =>
  YupTS.object({
    amount: YupTS.number().enhance(v =>
      v
        .typeError(
          ((<FormattedMessage id="investment-flow.validation-error" />) as unknown) as string,
        )
        .moreThan(0)
        .test(
          "isEnoughNEuro",
          <FormattedMessage id="bank-transfer.redeem.init.errors.value-higher-than-balance" />,
          (value: string) => doesUserHaveEnoughNEuro(value, neuroAmount),
        )
        .test(
          "isMinimal",
          ((
            <FormattedMessage
              id="bank-transfer.redeem.init.errors.value-lower-than-minimal"
              values={{
                minAmount: formatNumber({
                  value: minAmount,
                  roundingMode: ERoundingMode.UP,
                  inputFormat: ENumberInputFormat.ULPS,
                  decimalPlaces: selectDecimalPlaces(
                    ECurrency.EUR_TOKEN,
                    ENumberOutputFormat.ONLY_NONZERO_DECIMALS,
                  ),
                }),
              }}
            />
          ) as unknown) as string,
          (value: string) => doesUserWithdrawMinimal(value, minAmount),
        ),
    ),
  }).toYup();

const getInitialValues = (amount: string | undefined) => ({
  amount: amount ? formatEuroValueToString(amount) : "",
});

const BankTransferRedeemLayout: React.FunctionComponent<TComponentProps> = ({
  neuroAmount,
  neuroEuroAmount,
  verifyBankAccount,
  bankFee,
  confirm,
  initialAmount,
  minAmount,
}) => (
  <>
    <Heading size={EHeadingSize.SMALL} level={4} className="mb-4">
      <FormattedMessage id="bank-transfer.redeem.init.title" />
    </Heading>

    <p className="mb-3">
      <FormattedHTMLMessage id="bank-transfer.redeem.init.description" tagName="span" />
    </p>

    <section className={styles.section}>
      <Heading level={3} decorator={false} size={EHeadingSize.SMALL}>
        <FormattedMessage id="bank-transfer.redeem.init.neur-balance" />
      </Heading>
    </section>

    <section className={styles.section}>
      <MoneySuiteWidget
        icon={neuroIcon}
        currency={ECurrency.EUR_TOKEN}
        currencyTotal={ECurrency.EUR}
        largeNumber={neuroAmount}
        value={neuroEuroAmount}
        theme={ETheme.FRAMED}
        walletName={<FormattedMessage id="bank-transfer.redeem.init.wallet-name" />}
      />
    </section>

    <Form<IReedemData>
      initialValues={getInitialValues(initialAmount)}
      onSubmit={values => confirm({ value: values.amount })}
      validationSchema={getValidators(minAmount, neuroAmount)}
    >
      {({ values, setFieldValue, isValid, setFieldTouched }) => (
        <>
          <section className={styles.section}>
            <FormLabel for="amount" className={styles.label}>
              <FormattedMessage id="bank-transfer.redeem.init.redeem-amount" />
            </FormLabel>
            <small>
              <ButtonInline
                data-test-id="bank-transfer.reedem-init.redeem-whole-balance"
                className={styles.linkButton}
                onClick={() => {
                  // do not run validation twice here, just only when changing the value
                  // also it's important to do touch field before changing the value
                  // as otherwise validation gonna be called with previous value
                  setFieldTouched("amount", true, false);
                  setFieldValue("amount", formatEuroValueToString(neuroAmount), true);
                }}
              >
                <FormattedMessage id="bank-transfer.redeem.init.entire-wallet" />
              </ButtonInline>
            </small>
          </section>

          <FormMaskedNumberInput
            storageFormat={ENumberInputFormat.FLOAT}
            valueType={ECurrency.EUR}
            outputFormat={ENumberOutputFormat.FULL}
            name="amount"
            data-test-id="bank-transfer.reedem-init.redeem-form-label"
            returnInvalidValues={true}
            showUnits={true}
          />

          <section className={cn(styles.section, "mt-4")}>
            <Tooltip
              content={
                <FormattedMessage
                  id="bank-transfer.redeem.init.redeem-fee.tooltip"
                  values={{
                    // value is stored as decimal fraction Ulps formatted number
                    // to get percentage value we have to multiply by 100
                    // ex value, convertToBigNumber(0.005) * 100 = 0.5%
                    fee: (
                      <FormatNumber
                        value={new BigNumber(bankFee).mul("100")}
                        inputFormat={ENumberInputFormat.ULPS}
                        outputFormat={ENumberOutputFormat.ONLY_NONZERO_DECIMALS}
                        roundingMode={ERoundingMode.DOWN}
                        decimalPlaces={1}
                      />
                    ),
                  }}
                />
              }
            >
              <Heading level={3} decorator={false} size={EHeadingSize.SMALL}>
                <FormattedMessage id="bank-transfer.redeem.init.redeem-fee" />
              </Heading>
            </Tooltip>
            <span className="text-warning">
              {"-"}{" "}
              {values.amount && isValid && (
                <CalculatedFee bankFee={bankFee} amount={values.amount} />
              )}
            </span>
          </section>

          <section className={styles.section}>
            <Heading level={3} decorator={false} size={EHeadingSize.SMALL}>
              <FormattedMessage id="bank-transfer.redeem.init.total-redeemed" />
            </Heading>
            <span className="text-success">
              {values.amount && isValid ? (
                <TotalRedeemed bankFee={bankFee} amount={values.amount} />
              ) : (
                "-"
              )}
            </span>
          </section>

          <VerifiedBankAccount withBorder={true} onVerify={verifyBankAccount} />

          <p className="text-warning mx-4 text-center">
            <FormattedMessage id="bank-transfer.redeem.init.note" />
          </p>

          <section className="text-center">
            <ButtonArrowRight
              data-test-id="bank-transfer.reedem-init.continue"
              disabled={!isValid}
              type="submit"
            >
              <FormattedMessage id="bank-transfer.redeem.init.continue" />
            </ButtonArrowRight>
          </section>
        </>
      )}
    </Form>
  </>
);

const BankTransferRedeemInit = compose<TComponentProps, {}>(
  onEnterAction({
    actionCreator: d => {
      d(actions.bankTransferFlow.getRedeemData());
    },
  }),
  appConnect<IStateProps, IDispatchProps>({
    stateToProps: state => ({
      neuroAmount: selectLiquidEuroTokenBalance(state),
      neuroEuroAmount: selectLiquidEuroTokenBalance(state),
      bankFee: selectRedeemFeeUlps(state),
      minAmount: selectBankRedeemMinAmount(state),
      initialAmount: selectInitialAmount(state),
    }),
    dispatchToProps: dispatch => ({
      verifyBankAccount: () =>
        dispatch(actions.bankTransferFlow.startBankTransfer(EBankTransferType.VERIFY)),
      confirm: (tx: Partial<ITxData>) => dispatch(actions.txSender.txSenderAcceptDraft(tx)),
    }),
  }),
)(BankTransferRedeemLayout);

export { BankTransferRedeemLayout, BankTransferRedeemInit };
