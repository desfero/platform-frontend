import { ButtonArrowRight, Eur } from "@neufund/design-system";
import { ENumberOutputFormat, ERoundingMode } from "@neufund/shared";
import * as React from "react";
import { FormattedHTMLMessage, FormattedMessage } from "react-intl-phraseapp";
import { Container } from "reactstrap";
import { compose } from "recompose";

import { KycBankQuintessenceBankAccount } from "../../../../lib/api/kyc/KycApi.interfaces";
import { actions } from "../../../../modules/actions";
import {
  selectBankTransferFlowReference,
  selectBankTransferMinAmount,
} from "../../../../modules/bank-transfer-flow/selectors";
import { selectQuintessenceBankAccount } from "../../../../modules/kyc/selectors";
import { appConnect } from "../../../../store";
import { EHeadingSize, Heading } from "../../../shared/Heading";
import { InfoList } from "../../tx-sender/shared/InfoList";
import { InfoRow } from "../../tx-sender/shared/InfoRow";

interface IStateProps {
  referenceCode: string;
  minAmount: string;
  quintessenceBankAccount: KycBankQuintessenceBankAccount;
}

interface IDispatchProps {
  continueToSuccess: () => void;
}

type IProps = IStateProps & IDispatchProps;

const BankTransferPurchaseLayout: React.FunctionComponent<IProps> = ({
  continueToSuccess,
  referenceCode,
  minAmount,
  quintessenceBankAccount,
}) => (
  <Container>
    <Heading size={EHeadingSize.SMALL} level={4} className="mb-4">
      <FormattedMessage id="bank-transfer.purchase.summary.title" />
    </Heading>

    <p className="mb-3">
      <FormattedHTMLMessage id="bank-transfer.purchase.summary.description" tagName="span" />
    </p>

    <InfoList className="mb-4">
      <InfoRow
        data-test-id="bank-transfer.purchase.summary.min-amount"
        caption={<FormattedMessage id="bank-transfer.purchase.summary.min-amount" />}
        value={
          <Eur
            value={minAmount}
            outputFormat={ENumberOutputFormat.ONLY_NONZERO_DECIMALS_ROUND_UP}
            roundingMode={ERoundingMode.UP}
          />
        }
      />
      <InfoRow
        caption={<FormattedMessage id="bank-transfer.summary.purchase-price.caption" />}
        value={<FormattedMessage id="bank-transfer.summary.purchase-price.value" />}
      />
      <InfoRow
        data-test-id="bank-transfer.purchase.summary.recipient"
        caption={<FormattedMessage id="bank-transfer.summary.recipient" />}
        allowClipboardCopy={true}
        value={quintessenceBankAccount.name}
      />
      <InfoRow
        data-test-id="bank-transfer.purchase.summary.iban"
        caption={<FormattedMessage id="bank-transfer.summary.iban" />}
        allowClipboardCopy={true}
        value={quintessenceBankAccount.bankAccountNumber}
      />
      <InfoRow
        data-test-id="bank-transfer.purchase.summary.bic"
        caption={<FormattedMessage id="bank-transfer.summary.bic" />}
        allowClipboardCopy={true}
        value={quintessenceBankAccount.swiftCode}
      />
      <InfoRow
        caption={<FormattedMessage id="bank-transfer.summary.reference-number" />}
        data-test-id="bank-transfer.purchase.summary.reference-number"
        allowClipboardCopy={true}
        value={<strong>{referenceCode}</strong>}
        clipboardCopyValue={referenceCode}
      />
    </InfoList>

    <p className="text-warning mx-4 text-center">
      <FormattedMessage id="bank-transfer.purchase.summary.note" />
    </p>

    <section className="text-center">
      <ButtonArrowRight
        onClick={continueToSuccess}
        data-test-id="bank-transfer.purchase.summary.transfer-completed"
      >
        <FormattedMessage id="bank-transfer.summary.transfer-completed" />
      </ButtonArrowRight>
    </section>
  </Container>
);

const BankTransferPurchaseSummary = compose<IProps, {}>(
  appConnect<IStateProps, IDispatchProps>({
    stateToProps: state => {
      const quintessenceBankAccount = selectQuintessenceBankAccount(state);

      if (!quintessenceBankAccount) {
        throw new Error("Quintessence bank account can't be undefined");
      }

      return {
        quintessenceBankAccount,
        referenceCode: selectBankTransferFlowReference(state),
        minAmount: selectBankTransferMinAmount(state),
      };
    },
    dispatchToProps: dispatch => ({
      continueToSuccess: () => dispatch(actions.bankTransferFlow.continueToSuccess()),
    }),
  }),
)(BankTransferPurchaseLayout);

export { BankTransferPurchaseLayout, BankTransferPurchaseSummary };
