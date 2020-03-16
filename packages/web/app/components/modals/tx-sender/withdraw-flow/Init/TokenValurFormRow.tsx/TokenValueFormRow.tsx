import { ECurrency, ENumberInputFormat, ENumberOutputFormat, EquityToken } from "@neufund/shared";
import * as cn from "classnames";
import { FormikErrors, FormikTouched } from "formik";
import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";

import { EAdditionalValidationDataNotifications } from "../../../../../../modules/tx/validator/reducer";
import { isValidFormNumber } from "../../../../../../modules/tx/validator/transfer/utils";
import { Money } from "../../../../../shared/formatters/Money";
import {
  EInputTheme,
  FormFieldBoolean,
  FormMaskedNumberInput,
} from "../../../../../shared/forms/index";
import { hasNotification } from "../utils";

import * as styles from "../../Transfer.module.scss";

const TokenValueFormRow: React.FunctionComponent<{
  disabled?: boolean;
  valueEuro: string;
  notifications: ReadonlyArray<EAdditionalValidationDataNotifications>;
  errors: FormikErrors<{ value: string }>;
  touched: FormikTouched<{ value: boolean }>;
  tokenImage: string;
  tokenSymbol: EquityToken;
  decimals: number;
}> = ({
  notifications,
  valueEuro,
  errors,
  disabled,
  touched,
  tokenImage,
  tokenSymbol,
  decimals,
}) => (
  <>
    <FormMaskedNumberInput
      label={<FormattedMessage id="modal.transfer.sent.amount" />}
      labelClassName={styles.label}
      className="text-right"
      storageFormat={ENumberInputFormat.FLOAT}
      valueType={tokenSymbol}
      outputFormat={ENumberOutputFormat.ONLY_NONZERO_DECIMALS}
      data-test-id="modals.tx-sender.withdraw-flow.withdraw-component.value"
      name="value"
      reverseMetaInfo={true}
      returnInvalidValues={true}
      disabled={disabled}
      showUnits={true}
      theme={EInputTheme.BOX}
      icon={tokenImage}
      tokenDecimals={decimals}
    />

    {/* TODO: Replace error.values and touched.values by `useIsFieldInvalid` hook */}
    <section
      className={cn(styles.withSpacing, "text-right", {
        [styles.compensateSpacing]: errors.value && touched.value,
      })}
    >
      {tokenSymbol === ECurrency.ETH && (
        <small>
          {"= "}
          <Money
            value={
              isValidFormNumber(valueEuro)
                ? valueEuro
                : "0" /* Show 0 if form is invalid due of initially populated state */
            }
            inputFormat={ENumberInputFormat.ULPS}
            valueType={ECurrency.EUR}
            outputFormat={ENumberOutputFormat.ONLY_NONZERO_DECIMALS}
          />
        </small>
      )}
    </section>

    {hasNotification(EAdditionalValidationDataNotifications.WILL_EMPTY_WALLET, notifications) && (
      <FormFieldBoolean
        className={styles.withSpacing}
        data-test-id="modals.tx-sender.withdraw-flow.withdraw-component.will-empty-wallet"
        name="withdrawAll"
        label={
          <FormattedMessage id="modals.tx-sender.withdraw-flow.withdraw-component.errors.value-will-empty-wallet" />
        }
      />
    )}
  </>
);

export { TokenValueFormRow };
