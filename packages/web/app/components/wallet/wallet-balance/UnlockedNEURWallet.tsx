import { ECurrency, InvariantError, isZero, NEUR_ALLOWED_US_STATES } from "@neufund/shared";
import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";

import { externalRoutes } from "../../../config/externalRoutes";
import { selectIndividualAddress } from "../../../modules/kyc/selectors";
import { ENEURWalletStatus } from "../../../modules/wallet/types";
import { CommonHtmlProps } from "../../../types";
import { US_STATES } from "../../../utils/enums/usStatesEnum";
import { EColumnSpan } from "../../layouts/Container";
import { AccountBalance } from "../../shared/AccountBalance";
import { EDelimiter, FormattedList } from "../../shared/FormattedList";
import { ExternalLink } from "../../shared/links/ExternalLink";
import { VerifiedBankAccount } from "../VerifiedBankAccount";
import { WalletBalanceContainer } from "./WalletBalance";

import neuroIcon from "../../../assets/img/nEUR_icon.svg";
import * as styles from "./WalletBalance.module.scss";

interface IUnlockedNEURWallet {
  onPurchase: () => void;
  onRedeem: () => void;
  onVerify: () => void;
  neuroAmount: string;
  neuroEuroAmount: string;
  neurStatus: ENEURWalletStatus;
  individualAddress: ReturnType<typeof selectIndividualAddress>;
}

interface IExternalProps {
  columnSpan?: EColumnSpan;
}

const ALLOWED_US_STATES_NAMES = NEUR_ALLOWED_US_STATES.map(state => US_STATES[state]);

const getIndividualStateName = (address: ReturnType<typeof selectIndividualAddress>) => {
  if (address && address.usState) {
    return US_STATES[address.usState];
  }

  throw new InvariantError("Individual US state should be defined at this point");
};

export const UnlockedNEURWallet: React.FunctionComponent<IUnlockedNEURWallet &
  CommonHtmlProps &
  IExternalProps> = ({
  onPurchase,
  onRedeem,
  neuroAmount,
  neuroEuroAmount,
  className,
  neurStatus,
  onVerify,
  columnSpan,
  individualAddress,
}) => (
  <WalletBalanceContainer
    columnSpan={columnSpan}
    className={className}
    headerText={<FormattedMessage id="components.wallet.start.neur-wallet" />}
  >
    {neurStatus === ENEURWalletStatus.DISABLED_RESTRICTED_US_STATE ? (
      <p className={styles.message} data-test-id="wallet-balance.neur.restricted-us-state">
        <FormattedMessage
          id="shared-component.neur-wallet-balance.restricted-us-state"
          values={{
            allowedStates:
              ALLOWED_US_STATES_NAMES.length > 0 ? (
                <FormattedList items={ALLOWED_US_STATES_NAMES} lastDelimiter={EDelimiter.OR} />
              ) : (
                "none"
              ),
            userState: getIndividualStateName(individualAddress),
          }}
        />
      </p>
    ) : (
      <>
        <p className={styles.message}>
          <FormattedMessage
            id="shared-component.neur-wallet-balance.explanation"
            values={{
              quintessenceHref: (
                <ExternalLink href={externalRoutes.quintessenceLanding}>
                  <FormattedMessage id="wallet.tx-list.modal.neur-purchase.handled-by.value" />
                </ExternalLink>
              ),
            }}
          />
        </p>

        <VerifiedBankAccount onVerify={onVerify} />
      </>
    )}

    <section>
      <h4 className={styles.title}>
        <FormattedMessage id="shared-component.wallet-balance.title.account-balance" />
      </h4>

      <AccountBalance
        icon={neuroIcon}
        currency={ECurrency.EUR_TOKEN}
        currencyTotal={ECurrency.EUR}
        largeNumber={neuroAmount}
        value={neuroEuroAmount}
        data-test-id="wallet-balance.neur"
        actions={
          process.env.NF_NEURO_WITHDRAW_ENABLED === "1"
            ? [
                {
                  name: <FormattedMessage id="components.wallet.start.neur-wallet.purchase" />,
                  onClick: onPurchase,
                  disabled: neurStatus !== ENEURWalletStatus.ENABLED,
                  "data-test-id": "wallet-balance.neur.purchase-button",
                },
                {
                  name: <FormattedMessage id="components.wallet.start.neur-wallet.redeem" />,
                  onClick: onRedeem,
                  disabled: neurStatus !== ENEURWalletStatus.ENABLED || isZero(neuroAmount),
                  "data-test-id": "wallet-balance.neur.redeem-button",
                },
              ]
            : undefined
        }
      />
    </section>
  </WalletBalanceContainer>
);
