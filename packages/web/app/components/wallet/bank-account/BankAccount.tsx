import * as cn from "classnames";
import * as React from "react";

import { KycBankVerifiedBankAccount } from "../../../lib/api/kyc/KycApi.interfaces";

import bankIcon from "../../../assets/img/bank-transfer/bank-icon.svg";
import * as styles from "./BankAccount.module.scss";

interface IExternalProps {
  details: KycBankVerifiedBankAccount;
  withBorder?: boolean;
}

interface IBankNumber {
  last4: string;
  bank: string;
}

const BankNumber: React.FunctionComponent<IBankNumber> = ({ last4, bank }) => (
  <>
    {bank} ({"*".repeat(16)}
    {last4})
  </>
);

export const BankAccountDetails:React.FunctionComponent<IExternalProps> = ({details}) =>
  <>
    <img className={styles.icon} src={bankIcon} alt="" />
    <div>
      <p className={cn(styles.kycData, "m-0")} data-test-id="wallet.bank-account.name">
        {details.name}
      </p>
      <p className={cn(styles.bankNumber, "m-0")} data-test-id="wallet.bank-account.details">
        <BankNumber last4={details.bankAccountNumberLast4} bank={details.bankName} />
      </p>
    </div>
  </>

const BankAccount: React.FunctionComponent<IExternalProps> = ({ details, withBorder }) => (
  <section className={cn(styles.bankDetails, { [styles.framed]: withBorder })}>
    <BankAccountDetails details={details}/>
  </section>
);

export { BankAccount, BankNumber };
