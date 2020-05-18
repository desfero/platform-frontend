import { EWalletType } from "@neufund/shared-modules";

import { EKycRequestStatus } from "../../../lib/api/kyc/KycApi.interfaces";
import { lightWalletOnboardingSteps, onboardingSteps } from "./onboardingData";
import { EOnboardingStepState, TOnboardingStepData, TStepComponentProps } from "./types";

export type TOnboardingStateData = {
  emailVerified: boolean;
  backupCodesVerified: boolean;
  kycRequestStatus: EKycRequestStatus | undefined;
};

export type TOnboardingInitData = {
  emailVerified: boolean;
  backupCodesVerified: boolean;
  kycRequestStatus: EKycRequestStatus;
  walletType: EWalletType;
};

const determineStepState = (isActive: boolean, completed: boolean): EOnboardingStepState => {
  if (isActive) {
    return EOnboardingStepState.ACTIVE;
  } else if (completed) {
    return EOnboardingStepState.DONE;
  } else {
    return EOnboardingStepState.NOT_DONE;
  }
};

export const initOnboardingStepData = ({
  emailVerified,
  backupCodesVerified,
  kycRequestStatus,
  walletType,
}: TOnboardingInitData) =>
  walletType === EWalletType.LIGHT
    ? lightWalletOnboardingSteps(
        emailVerified,
        backupCodesVerified,
        kycRequestStatus === EKycRequestStatus.ACCEPTED,
      )
    : onboardingSteps(emailVerified, kycRequestStatus === EKycRequestStatus.ACCEPTED);

export const prepareOnboardingSteps = (data: TOnboardingStepData[]): TStepComponentProps[] => {
  const newData = data.reduce(
    (
      acc: { activeElement: string | undefined; data: TStepComponentProps[] },
      stepData: TOnboardingStepData,
      index: number,
    ) => {
      const isActive = !stepData.conditionCompleted && acc.activeElement === undefined;

      const stepComponentProps = {
        stepState: determineStepState(isActive, stepData.conditionCompleted),
        number: index + 1,
        key: stepData.key,
        title: stepData.title,
        component: stepData.component,
        isLast: index + 1 === data.length,
      };
      acc.data.push(stepComponentProps);
      acc.activeElement = isActive ? stepData.key : acc.activeElement;
      return acc;
    },
    { activeElement: undefined, data: [] },
  );

  return newData.data;
};

export const shouldShowOnboardingWidget = ({
  emailVerified,
  backupCodesVerified,
  kycRequestStatus,
}: TOnboardingStateData) =>
  !emailVerified || !backupCodesVerified || !(kycRequestStatus === EKycRequestStatus.ACCEPTED);
