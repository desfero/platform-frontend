import * as Yup from "yup";

import { ECountries } from "../../../utils/enums/countriesEnum";
import { EUSState } from "../../../utils/enums/usStatesEnum";
import { makeAllRequired, makeAllRequiredExcept } from "../../../utils/yupUtils";
import * as YupTS from "../../yup-ts.unsafe";
import { countryCode, percentage, personBirthDate, restrictedCountry } from "../util/customSchemas";

export enum EKycRequestType {
  BUSINESS = "business",
  INDIVIDUAL = "individual",
  US_ACCREDITATION = "us_accreditation",
}

export interface IKycPerson {
  firstName?: string;
  lastName?: string;
  street?: string;
  city?: string;
  zipCode?: string;
  country?: string;
  usState?: EUSState;
  birthDate?: string;
  placeOfBirth?: string;
  nationality?: string;
  isPoliticallyExposed?: boolean;
}

const stateSchema = Yup.string().when("country", (country: string, schema: Yup.Schema<string>) =>
  country === ECountries.UNITED_STATES ? schema.required() : schema,
);

export const KycPersonSchema = Yup.object().shape({
  firstName: Yup.string(),
  lastName: Yup.string(),
  street: Yup.string(),
  city: Yup.string(),
  zipCode: Yup.string(),
  country: restrictedCountry,
  birthDate: personBirthDate,
  placeOfBirth: countryCode,
  nationality: countryCode,
  isPoliticallyExposed: Yup.bool(),
  usState: stateSchema,
});

export const KycAdditionalDataSchema = Yup.object().shape({
  // Allow only true value to be saved, do not display any additional message
  // it is all handled by external notification component
  isAccreditedUsCitizen: Yup.bool().when(
    ["country", "nationality"],
    (v1: ECountries, v2: ECountries, schema: Yup.Schema<boolean>) =>
      [v1, v2].includes(ECountries.UNITED_STATES) ? schema.required().oneOf([true], " ") : schema,
  ),
});

// individual data
export interface IKycIndividualData extends IKycPerson {
  isHighIncome?: boolean;
  isAccreditedUsCitizen?: string;
}

const KycIndividualDataShape =
  process.env.NF_DISABLE_HIGH_INCOME === "1"
    ? {}
    : {
        isHighIncome: Yup.bool(),
      };

export const KycIndividualDataSchema = KycPersonSchema.concat(
  Yup.object().shape(KycIndividualDataShape),
);

export const KycIndividualDataSchemaRequired = makeAllRequiredExcept(KycIndividualDataSchema, [
  "usState",
]);

export const KycIndividualDataSchemaRequiredWithAdditionalData = KycIndividualDataSchemaRequired.concat(
  KycAdditionalDataSchema,
);

// business data
export interface IKycBusinessData {
  name?: string;
  registrationNumber?: string;
  legalForm?: string;
  legalFormType?: EKycBusinessType;
  street?: string;
  city?: string;
  zipCode?: string;
  country?: string;
  jurisdiction?: string;
}

export const KycBusinessDataSchema = Yup.object<any>().shape({
  name: Yup.string().required(),
  registrationNumber: Yup.string(),
  legalForm: Yup.string().required(),
  legalFormType: Yup.string(),
  street: Yup.string().required(),
  city: Yup.string().required(),
  zipCode: Yup.string().required(),
  country: restrictedCountry.required(),
  jurisdiction: Yup.string().default("de"),
  usState: stateSchema,
});

// legal representative (same as base person)
export interface IKycLegalRepresentative extends IKycPerson {}
export const KycLegalRepresentativeSchema = KycPersonSchema;
export const KycLegalRepresentativeSchemaRequired = makeAllRequiredExcept(KycPersonSchema, [
  "usState",
]);

// beneficial owner
export interface IKycBeneficialOwner extends IKycPerson {
  ownership?: number;
  id?: string;
}

export const KycBeneficialOwnerSchema = KycPersonSchema.concat(
  Yup.object().shape({
    ownership: percentage,
    id: Yup.string(),
  }),
);
export const KycBeneficialOwnerSchemaRequired = makeAllRequired(KycBeneficialOwnerSchema);

// file
export interface IKycFileInfo {
  id: string;
  fileName: string;
  preview?: string;
}

export const KycFileInfoShape = Yup.object().shape({
  id: Yup.string(),
  fileName: Yup.string(),
});

// request state
export enum EKycRequestStatus {
  DRAFT = "draft",
  PENDING = "pending",
  OUTSOURCED = "outsourced",
  REJECTED = "rejected",
  ACCEPTED = "accepted",
  IGNORED = "ignored",
}

export enum ERequestOutsourcedStatus {
  STARTED = "started",
  SUCCESS = "success",
  SUCCESS_DATA_CHANGED = "success_data_changed",
  REVIEW_PENDING = "review_pending",
  ABORTED = "aborted",
  CANCELED = "canceled",
  OTHER = "other",
}

export interface IKycRequestState {
  status: EKycRequestStatus;
  outsourcedStatus?: ERequestOutsourcedStatus;
  redirectUrl?: string;
}

export const KycRequestStateSchema = Yup.object().shape({
  status: Yup.string().required("Request state is required"),
  outsourcedStatus: Yup.string(),
  redirectUrl: Yup.string(),
  type: Yup.string(),
});

export enum EKycBusinessType {
  CORPORATE = "corporate",
  SMALL = "small",
  PARTNERSHIP = "partnership",
}

export const KycBankVerifiedBankAccountSchema = YupTS.object({
  bankAccountNumberLast4: YupTS.string(),
  bankName: YupTS.string(),
  isSepa: YupTS.boolean(),
  name: YupTS.string(),
  swiftCode: YupTS.string(),
});

export const KycBankQuintessenceBankAccountSchema = YupTS.object({
  bankAccountNumber: YupTS.string(),
  bankName: YupTS.string(),
  isSepa: YupTS.boolean(),
  name: YupTS.string(),
  swiftCode: YupTS.string(),
});

export const KycBankAccountSchema = YupTS.object({
  ourAccount: KycBankQuintessenceBankAccountSchema,
  verifiedUserAccount: KycBankVerifiedBankAccountSchema.optional(),
});

export const KycBankTransferPurposeSchema = YupTS.object({
  purpose: YupTS.string(),
});

export type KycBankVerifiedBankAccount = YupTS.TypeOf<typeof KycBankVerifiedBankAccountSchema>;
export type KycBankQuintessenceBankAccount = YupTS.TypeOf<
  typeof KycBankQuintessenceBankAccountSchema
>;
export type TKycBankAccount = YupTS.TypeOf<typeof KycBankAccountSchema>;
export type TKycBankTransferPurpose = YupTS.TypeOf<typeof KycBankTransferPurposeSchema>;
