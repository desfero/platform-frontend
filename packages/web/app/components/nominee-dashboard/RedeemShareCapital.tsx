import { Button, EButtonLayout } from "@neufund/design-system";
import {
  DataUnavailableError,
  ECurrency,
  ENumberInputFormat,
  ENumberOutputFormat,
} from "@neufund/shared";
import * as React from "react";
import { FormattedRelative } from "react-intl";
import { FormattedMessage } from "react-intl-phraseapp";
import { branch, compose, renderComponent, withProps } from "recompose";

import { actions } from "../../modules/actions";
import { selectStartOfOnchainState } from "../../modules/eto/selectors";
import { EETOStateOnChain } from "../../modules/eto/types";
import {
  selectActiveNomineeEto,
  selectCapitalIncrease,
  selectRedeemShareCapitalTaskSubstate,
} from "../../modules/nominee-flow/selectors";
import { ERedeemShareCapitalTaskSubstate } from "../../modules/nominee-flow/types";
import { appConnect } from "../../store";
import { Money } from "../shared/formatters/Money";

import * as styles from "./NomineeDashboard.module.scss";

type TRedeemShareCapitalStateProps = {
  companyName: string;
  amount: string | undefined;
  startOfClaimState: Date | undefined;
};

type RedeemShareCapitalDispatchProps = {
  redeemFunds: (amount: string | undefined) => void;
};

type TComponentProps = {
  deadline: number;
  companyName: string;
  amount: string | undefined;
  redeemFunds: (amount: string | undefined) => void;
};

const RedeemShareCapitalLayout: React.FunctionComponent<TComponentProps> = ({
  companyName,
  amount,
  deadline,
  redeemFunds,
}) => (
  <section className={styles.nomineeStepWidget} data-test-id="nominee-flow-redeem-share-capital">
    <h4 className={styles.nomineeStepWidgetTitle}>
      <FormattedMessage id="nominee-flow.redeem-share-capital.title" />
    </h4>
    <div className={styles.nomineeStepWidgetContent}>
      <p>
        <FormattedMessage
          id="nominee-flow.redeem-share-capital.text"
          values={{
            companyName,
            amount: (
              <Money
                data-test-id="nominee-redeem-share-capital-amount"
                value={amount}
                inputFormat={ENumberInputFormat.ULPS}
                outputFormat={ENumberOutputFormat.FULL}
                valueType={ECurrency.EUR_TOKEN}
              />
            ),
          }}
        />
      </p>
      <p className={styles.textBold}>
        <FormattedMessage id="nominee-flow.redeem-share-capital.text-note" />
        <FormattedRelative value={deadline} initialNow={new Date()} style={"numeric"} />
      </p>
    </div>
    <Button
      className={styles.nomineeStepWidgetButton}
      layout={EButtonLayout.PRIMARY}
      data-test-id="nominee-redeem-share-capital-button"
      onClick={() => redeemFunds(amount)}
    >
      <FormattedMessage id="nominee-flow.redeem-share-capital.button-redeem-funds" />
    </Button>
  </section>
);

export const WaitForIshaSigning = () => (
  <section
    className={styles.nomineeStepWidget}
    data-test-id="nominee-flow-redeem-share-capital-waiting-for-isha-signing"
  >
    <h4 className={styles.nomineeStepWidgetTitle}>
      <FormattedMessage id="nominee-flow.redeem-share-capital.wait-for-isha-signing.title" />
    </h4>
    <p className={styles.nomineeStepWidgetContent}>
      <FormattedMessage id="nominee-flow.redeem-share-capital.wait-for-isha-signing.text" />
    </p>
  </section>
);

const RedeemShareCapital = compose<TComponentProps, {}>(
  appConnect<{ taskSubstate: ERedeemShareCapitalTaskSubstate }>({
    stateToProps: state => ({
      taskSubstate: selectRedeemShareCapitalTaskSubstate(state),
    }),
  }),
  branch<{ taskSubstate: ERedeemShareCapitalTaskSubstate }>(
    ({ taskSubstate }) =>
      taskSubstate === ERedeemShareCapitalTaskSubstate.WAITING_FOR_ISSUER_TO_SIGN_ISHA,
    renderComponent(WaitForIshaSigning),
  ),
  appConnect<TRedeemShareCapitalStateProps, RedeemShareCapitalDispatchProps>({
    stateToProps: state => {
      const nomineeEto = selectActiveNomineeEto(state);
      if (nomineeEto && nomineeEto.contract) {
        return {
          companyName: nomineeEto.company.name,
          amount: selectCapitalIncrease(state),
          startOfClaimState: selectStartOfOnchainState(
            state,
            nomineeEto.previewCode,
            EETOStateOnChain.Claim,
          ),
        };
      } else {
        throw new DataUnavailableError("nominee eto is undefined");
      }
    },
    dispatchToProps: dispatch => ({
      redeemFunds: amount => {
        dispatch(actions.txUserFlowRedeem.setInitialValue(amount));
        dispatch(actions.txTransactions.startWithdrawNEuro());
      },
    }),
  }),
  branch<TRedeemShareCapitalStateProps>(
    ({ startOfClaimState }) => startOfClaimState === undefined,
    () => {
      throw new DataUnavailableError("start of claim state is missing!");
    },
  ),
  withProps<{ deadline: number }, { startOfClaimState: Date }>(({ startOfClaimState }) => {
    const timeLeft = startOfClaimState.getTime() - Date.now();
    return {
      deadline: timeLeft > 0 ? startOfClaimState.getTime() : Date.now(),
    };
  }),
)(RedeemShareCapitalLayout);

export { RedeemShareCapitalLayout, RedeemShareCapital };
