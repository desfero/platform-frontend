import { DataUnavailableError, nonNullable, withContainer } from "@neufund/shared-utils";
import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";
import { branch, compose, renderComponent, withProps } from "recompose";

import { EKycRequestStatus } from "../../../lib/api/kyc/KycApi.interfaces";
import {
  selectBackupCodesVerified,
  selectIsUserEmailVerified,
} from "../../../modules/auth/selectors";
import { selectKycRequestStatus, selectKycRequestType } from "../../../modules/kyc/selectors";
import { selectWalletType } from "../../../modules/web3/selectors";
import { appConnect } from "../../../store";
import { EColumnSpan } from "../../layouts/Container";
import { PanelRounded } from "../../shared/Panel";
import { OnboardingKycPending } from "./OnboardingKycPending";
import { OnboardingStep } from "./OnboardingStep";
import { TStepComponentProps } from "./types";
import { initOnboardingStepData, prepareOnboardingSteps, TOnboardingInitData } from "./utils";

import * as styles from "./Onboarding.module.scss";

export type TAccountSetupSteps = {
  accountSetupStepsData: TStepComponentProps[];
};

export const OnboardingLayout: React.FunctionComponent = ({ children }) => (
  <PanelRounded className={styles.accountSetupContainer} columnSpan={EColumnSpan.THREE_COL}>
    <section className={styles.accountSetupContainerInner} data-test-id="onboarding">
      {children}
    </section>
    <div className={styles.onboardingImage} />
  </PanelRounded>
);

export const OnboardingMain: React.FunctionComponent<TAccountSetupSteps> = ({
  accountSetupStepsData,
}) => (
  <>
    <div className={styles.accountSetupText}>
      <FormattedMessage id="account-setup.please-complete-setup" />
    </div>
    {accountSetupStepsData.map((stepData: TStepComponentProps) => (
      <OnboardingStep {...stepData} />
    ))}
  </>
);

export const Onboarding = compose<TAccountSetupSteps, {}>(
  appConnect<TOnboardingInitData>({
    stateToProps: state => ({
      emailVerified: selectIsUserEmailVerified(state),
      backupCodesVerified: selectBackupCodesVerified(state),
      kycRequestStatus: nonNullable(selectKycRequestStatus(state)),
      walletType: nonNullable(selectWalletType(state)),
      kycRequestType: selectKycRequestType(state),
    }),
  }),
  branch<TOnboardingInitData>(
    props => props.kycRequestStatus === undefined || props.walletType === undefined,
    () => {
      throw new DataUnavailableError("kycRequestStatus is undefined");
    },
  ),
  withContainer(OnboardingLayout),
  branch<TOnboardingInitData>(
    // todo find out what to do in case of ignored/rejected states
    props =>
      props.emailVerified &&
      props.backupCodesVerified &&
      props.kycRequestStatus !== EKycRequestStatus.DRAFT,
    renderComponent(OnboardingKycPending),
  ),
  withProps<TAccountSetupSteps, TOnboardingInitData>((props: TOnboardingInitData) => {
    const stepData = initOnboardingStepData(props);
    return {
      accountSetupStepsData: prepareOnboardingSteps(stepData),
    };
  }),
)(OnboardingMain);
