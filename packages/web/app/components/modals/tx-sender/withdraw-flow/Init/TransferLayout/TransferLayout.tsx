import { Button } from "@neufund/design-system";
import { ENumberInputFormat, ENumberOutputFormat, EquityToken } from "@neufund/shared";
import * as cn from "classnames";
import { FormikErrors, FormikProps } from "formik";
import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";

import { TSelectUserFlowDetails } from "../../../../../../modules/tx/user-flow/transfer/selectors";
import { TxUserFlowInputData } from "../../../../../../modules/tx/user-flow/transfer/types";
import {
  EAdditionalValidationDataNotifications,
  EValidationState,
} from "../../../../../../modules/tx/validator/reducer";
import { isValidFormNumber } from "../../../../../../modules/tx/validator/transfer/utils";
import { isAddressValid } from "../../../../../../modules/web3/utils";
import { DataRow } from "../../../../../shared/DataRow";
import { Money } from "../../../../../shared/formatters/Money";
import { Form } from "../../../../../shared/forms";
import { TransferHeader } from "../../shared/TransferHeader";
import { EtherAddressFormRow } from "../EtherAddressFormRow/EtherAddressFormRow";
import { ShowAdditionalNotifications } from "../ShowAdditionalNotifications/ShowAdditionalNotifications";
import { TokenValueFormRow } from "../TokenValurFormRow.tsx/TokenValueFormRow";
import { TransferAllButton } from "../TransferAllButton/TransferAllButton";
import { hasNotification } from "../utils";

import * as styles from "../../Transfer.module.scss";

export interface ITransferLayoutStateProps {
  userFlowDetails: TSelectUserFlowDetails;
  validationState?: EValidationState;
  notifications: ReadonlyArray<EAdditionalValidationDataNotifications>;
  tokenAmount: string;
  txUserFlowInputData: TxUserFlowInputData;
  tokenSymbol: EquityToken;
  tokenImage: string;
  tokenDecimals: number;
}

export interface ITransferData {
  value: string;
  to: string;
  withdrawAll: boolean;
  allowNewAddress: boolean;
  allowSmartContract: boolean;
}

interface IHandlersProps {
  onValidateHandler: (values: ITransferData) => void | FormikErrors<ITransferData>;
}

export interface ITransferLayoutDispatchProps {
  onValidate: (txDraft: TxUserFlowInputData) => void;
  onAccept: () => void;
}

export type TTransferLayoutProps = ITransferLayoutStateProps &
  Omit<ITransferLayoutDispatchProps, "onValidate"> &
  IHandlersProps;

export interface ITransferData {
  value: string;
  to: string;
  withdrawAll: boolean;
  allowNewAddress: boolean;
  allowSmartContract: boolean;
}

const AvailableTokenBalance: React.FunctionComponent<{
  value: string;
  tokenSymbol: EquityToken;
  tokenDecimals: number;
}> = ({ value, tokenSymbol, tokenDecimals }) => (
  <DataRow
    className={cn(styles.noSpacing, styles.withTopSpacing)}
    caption={<FormattedMessage id="modal.sent-eth.available-balance" values={{ tokenSymbol }} />}
    value={
      <Money
        data-test-id="modals.tx-sender.withdraw-flow.summary.balance"
        className={styles.money}
        value={value}
        inputFormat={ENumberInputFormat.ULPS}
        outputFormat={ENumberOutputFormat.ONLY_NONZERO_DECIMALS}
        valueType={tokenSymbol}
        decimals={tokenDecimals}
      />
    }
  />
);

const getInitialValues = (to: string, value: string) => ({
  to: isAddressValid(to) ? to : "",
  value: isValidFormNumber(value) ? value : "",
  withdrawAll: false,
  allowNewAddress: false,
  allowSmartContract: false,
});

const TransferLayout: React.FunctionComponent<TTransferLayoutProps> = ({
  notifications,
  onAccept,
  onValidateHandler,
  tokenAmount,
  validationState,
  txUserFlowInputData,
  userFlowDetails,
  tokenImage,
  tokenSymbol,
  tokenDecimals,
}) => (
  <TransferHeader tokenSymbol={tokenSymbol} data-test-id="modals.shared.tx-transfer.modal">
    <Form<ITransferData>
      validate={onValidateHandler}
      initialValues={getInitialValues(txUserFlowInputData.to, txUserFlowInputData.value)}
      onSubmit={onAccept}
    >
      {({
        isValid,
        isValidating,
        setFieldValue,
        values,
        errors,
        touched,
      }: FormikProps<ITransferData>) => (
        <>
          <EtherAddressFormRow errors={errors} values={values} />
          <ShowAdditionalNotifications errors={errors} notifications={notifications} />
          <AvailableTokenBalance
            value={tokenAmount}
            tokenSymbol={tokenSymbol}
            tokenDecimals={tokenDecimals}
          />
          <TransferAllButton
            onClick={amount => setFieldValue("value", amount, true)}
            amount={tokenAmount}
            disabled={validationState === EValidationState.IS_NOT_ACCEPTING_ETHER}
            decimals={tokenDecimals}
          />
          <TokenValueFormRow
            valueEuro={userFlowDetails.inputValueEuro}
            notifications={notifications}
            errors={errors}
            touched={touched}
            tokenImage={tokenImage}
            tokenSymbol={tokenSymbol}
            decimals={tokenDecimals}
          />

          {validationState === EValidationState.IS_NOT_ACCEPTING_ETHER && (
            <span
              className="text-warning"
              data-test-id="modals.tx-sender.withdraw-flow.withdraw-component.not-accepting-ether"
            >
              <FormattedMessage id="modal.sent-eth.not-accepting-ether" />
            </span>
          )}
          {validationState === EValidationState.NOT_ENOUGH_ETHER_FOR_GAS && (
            <span
              className="text-warning"
              data-test-id="modals.tx-sender.withdraw-flow.withdraw-component.errors.value-higher-than-balance"
            >
              <FormattedMessage id="modals.tx-sender.withdraw-flow.withdraw-component.errors.value-higher-than-balance" />
            </span>
          )}
          {validationState === EValidationState.NOT_ENOUGH_TOKENS && (
            <span
              className="text-warning"
              data-test-id="modals.tx-sender.withdraw-flow.withdraw-component.errors.not-enough-tokens"
            >
              <FormattedMessage id="modals.tx-sender.withdraw-flow.transfer-component.errors.not-enough-tokens" />
            </span>
          )}

          <section className="mt-4 text-center">
            <Button
              type="submit"
              disabled={
                !isValid ||
                isValidating ||
                validationState !== EValidationState.VALIDATION_OK ||
                // TODO: Refactor to better readable form
                (hasNotification(
                  EAdditionalValidationDataNotifications.WILL_EMPTY_WALLET,
                  notifications,
                ) &&
                  !values.withdrawAll) ||
                (hasNotification(
                  EAdditionalValidationDataNotifications.IS_SMART_CONTRACT,
                  notifications,
                ) &&
                  !values.allowSmartContract) ||
                (hasNotification(
                  EAdditionalValidationDataNotifications.IS_NEW_ADDRESS,
                  notifications,
                ) &&
                  !values.allowNewAddress) ||
                (hasNotification(
                  EAdditionalValidationDataNotifications.IS_NEW_ADDRESS_WITH_BALANCE,
                  notifications,
                ) &&
                  !values.allowNewAddress)
              }
              data-test-id="modals.tx-sender.withdraw-flow.withdraw-component.send-transaction-button"
            >
              {isValidating || validationState === EValidationState.VALIDATING ? (
                <FormattedMessage id="modal.sent-eth.button-loading" />
              ) : (
                <FormattedMessage id="modal.sent-eth.button" />
              )}
            </Button>
          </section>
        </>
      )}
    </Form>
  </TransferHeader>
);

export { TransferLayout };
