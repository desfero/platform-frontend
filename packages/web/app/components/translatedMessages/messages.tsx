import { ETxHistoryMessage, EWalletSubType } from "@neufund/shared-modules";
import { assertNever } from "@neufund/shared-utils";
import * as React from "react";
import { FormattedHTMLMessage, FormattedMessage } from "react-intl-phraseapp";

import { externalRoutes } from "../../config/externalRoutes";
import { TTranslatedString } from "../../types";
import { Money } from "../shared/formatters/Money";
import { ECurrency, ENumberInputFormat, ENumberOutputFormat } from "../shared/formatters/utils";
import { formatMatchingFieldNames, TMessage } from "./utils";

interface ITranslationValues {
  [SignInUserErrorMessages: string]: string;
}

export type TranslatedMessageType =
  | EtoFlowMessage
  | BankTransferFlowMessage
  | GenericErrorMessage
  | GenericModalMessage
  | SignInUserErrorMessage
  | BrowserWalletErrorMessage
  | InvestorPortfolioMessage
  | LedgerErrorMessage
  | LightWalletErrorMessage
  | SignerErrorMessage
  | MismatchedWalletAddressErrorMessage
  | BackupRecoveryMessage
  | ToSMessage
  | BookbuildingFlowMessage
  | EtoDocumentsMessage
  | KycFlowMessage
  | AuthMessage
  | IpfsMessage
  | IcbmWalletMessage
  | ProfileMessage
  | EtoMessage
  | FileUploadMessage
  | RemoteFileMessage
  | Web3Message
  | ValidationMessage
  | TestMessage
  | ETxHistoryMessage
  | MarketingEmailsMessage
  | EMaskedFormError
  | EKycRequestStatusTranslation
  | ENomineeRequestStatusTranslation
  | ENomineeRequestErrorNotifications
  | EEtoNomineeRequestNotifications
  | EEtoNomineeRequestMessages
  | ETxValidationMessages
  | EEtoNomineeActiveEtoNotifications
  | ENotificationText
  | ELightWalletRestoreMessage
  | WalletConnectErrorMessage;

export enum GenericErrorMessage {
  GENERIC_ERROR = "genericError",
  USER_ALREADY_EXISTS = "userAlreadyExists",
}

export enum WalletConnectErrorMessage {
  WC_GENERIC_ERROR = "wcGenericError",
  WC_SESSION_REJECTED_ERROR = "wcSessionRejectedError",
  WC_SESSION_INVALID_CHAIN_ID = "wcSessionInvalidChainId",
}

export enum GenericModalMessage {
  ERROR_TITLE = "errorTitle",
}

export enum ELightWalletRestoreMessage {
  LIGHT_WALLET_RESTORE_SUCCESS_TITLE = "LightWalletRestoreSuccessTitle",
  LIGHT_WALLET_RESTORE_SUCCESS_TEXT = "LightWalletRestoreSuccessText",
}

export enum SignInUserErrorMessage {
  MESSAGE_SIGNING_REJECTED = "messageSigningRejected",
  MESSAGE_SIGNING_TIMEOUT = "messageSigningTimeout",
  MESSAGE_SIGNING_SERVER_CONNECTION_FAILURE = "serverConnectionFailure",
}

export enum BrowserWalletErrorMessage {
  WALLET_IS_LOCKED = "walletIsLocked",
  WALLET_CONNECTED_TO_WRONG_NETWORK = "browserWalletConnectedToWrongNetwork",
  WALLET_NOT_ENABLED = "browserWalletNotEnabled",
  ACCOUNT_APPROVAL_REJECTED = "browserWalletAccountApprovalRejected",
  ACCOUNT_APPROVAL_PENDING = "browserWalletAccountApprovalPending",
  GENERIC_ERROR = "browserWalletGenericError",
}

export enum LedgerErrorMessage {
  LEDGER_LOCKED = "ledgerLocked",
  GENERIC_ERROR = "ledgerGenericError",
  NOT_SUPPORTED = "ledgerNotSupported",
  CONTRACT_DISABLED = "ledgerContractDataDisabled",
  USER_CANCELLED = "ledgerConnectionCancelledByUser",
}

export enum LightWalletErrorMessage {
  WRONG_PASSWORD_SALT = "lightWalletWrongPasswordSalt",
  SIGN_MESSAGE = "lightWalletSignMessage",
  CREATION_ERROR = "lightWalletCreationError",
  DESERIALIZE = "lightWalletDeserialize",
  ENCRYPTION_ERROR = "lightWalletEncryptionError",
  WRONG_PASSWORD = "lightWalletWrongPassword",
  WRONG_MNEMONIC = "lightWalletWrongMnemonic",
  GENERIC_ERROR = "lightWalletGenericError",
}

export enum SignerErrorMessage {
  CONFIRMATION_REJECTED = "signerRejectedConfirmation",
  TIMEOUT = "signerTimeout",
  GENERIC_ERROR = "signerGenericError",
}

export enum MismatchedWalletAddressErrorMessage {
  MISMATCHED_WALLET_ADDRESS = "mismatchedWalletAddress",
}

export enum BackupRecoveryMessage {
  BACKUP_SUCCESS_TITLE = "backupSuccessTitle",
  BACKUP_SUCCESS_DESCRIPTION = "backupSuccessDescription",
}

export enum ToSMessage {
  TOS_ACCEPT_PERMISSION_TITLE = "tosAcceptPermissionTitle",
  TOS_ACCEPT_PERMISSION_TEXT = "tosAcceptPermissionText",
}

export enum BankTransferFlowMessage {
  BANK_TRANSFER_FLOW_ERROR = "bankTransferFlowError",
}

export enum BookbuildingFlowMessage {
  PLEDGE_FLOW_CONFIRM_PLEDGE = "pledgeFlowConfirmPledge",
  PLEDGE_FLOW_PLEDGE_DESCRIPTION = "pledgeFlowPledgeDescription",
  PLEDGE_FLOW_FAILED_TO_SAVE_PLEDGE = "pledgeFlowFailedToSavePledge",
  PLEDGE_FLOW_CONFIRM_PLEDGE_REMOVAL = "pledgeFlowConfirmPledgeRemoval",
  PLEDGE_FLOW_CONFIRM_PLEDGE_REMOVAL_DESCRIPTION = "pledgeFlowConfirmPledgeRemovalDescription",
  PLEDGE_FLOW_PLEDGE_REMOVAL_FAILED = "pledgeFlowPledgeRemovalFailed",
  PLEDGE_FLOW_FAILED_TO_GET_BOOKBUILDING_STATS = "pledgeFlowFailedToGetBookbuildingStats",
  PLEDGE_FLOW_FAILED_TO_LOAD_PLEDGE = "pledgeFlowFailedToLoadPledge",
}

export enum InvestorPortfolioMessage {
  INVESTOR_PORTFOLIO_FAILED_TO_LOAD_CLAIMABLES = "investorPortfolioFailedToLoadClaimables",
  INVESTOR_PORTFOLIO_FAILED_TO_LOAD_INCOMING_PAYOUTS = "investorPortfolioFailedToLoadIncomingPayouts",
}

export enum EtoFlowMessage {
  ETO_LOAD_FAILED = "etoLoadFailed",
  ETO_PRODUCTS_LOAD_FAILED = "etoProductsLoadFailed",
  ETO_TERMS_PRODUCT_CHANGE_FAILED = "etoTermsProductChangeFailed",
  ETO_TERMS_PRODUCT_CHANGE_SUCCESSFUL = "etoTermsProductChangeSuccessful",
}

export enum EtoDocumentsMessage {
  ETO_DOCUMENTS_CONFIRM_UPLOAD_DOCUMENT_TITLE = "etoDocumentsConfirmUploadDocumentTitle",
  ETO_DOCUMENTS_CONFIRM_REMOVE_DOCUMENT_TITLE = "etoDocumentsConfirmRemoveDocumentTitle",
  ETO_DOCUMENTS_CONFIRM_UPLOAD_DOCUMENT_DESCRIPTION = "etoDocumentsConfirmUploadDocumentDescription",
  ETO_DOCUMENTS_CONFIRM_REMOVE_DOCUMENT_DESCRIPTION = "etoDocumentsConfirmRemoveDocumentDescription",
  ETO_DOCUMENTS_FILE_UPLOADED = "etoDocumentsFileUploaded",
  ETO_DOCUMENTS_FILE_REMOVED = "etoDocumentsFileRemoved",
  ETO_DOCUMENTS_FILE_REMOVE_FAILED = "etoDocumentsFileRemoveFailed",
  ETO_DOCUMENTS_FILE_EXISTS = "etoDocumentsFileExists",
  ETO_DOCUMENTS_FILE_UPLOAD_FAILED = "etoDocumentsFileUploadFailed",
  ETO_DOCUMENTS_FAILED_TO_DOWNLOAD_FILE = "etoDocumentsFailedToDownloadFile",
  ETO_DOCUMENTS_FAILED_TO_ACCESS_ETO_FILES_DATA = "etoDocumentsFailedToAccessEtoFilesData",
  ETO_DOCUMENTS_CONFIRM_START_BOOKBUILDING = "etoDocumentsConfirmStartBookbuilding",
  ETO_DOCUMENTS_CONFIRM_STOP_BOOKBUILDING = "etoDocumentsConfirmStopBookbuilding",
  ETO_DOCUMENTS_FAILED_TO_SEND_ETO_DATA = "etoDocumentsFailedToSendEtoData",
  ETO_DOCUMENTS_FAILED_TO_GET_BOOKBUILDING_STATS = "pledgeFlowFailedToGetBookbuildingStats",
  ETO_DOCUMENTS_SUBMIT_ETO_TITLE = "etoDocumentsSubmitEtoTitle",
  ETO_DOCUMENTS_SUBMIT_ETO_DESCRIPTION = "etoDocumentsSubmitEtoDescription",
  ETO_SUBMIT_SUCCESS = "etoSubmitSuccess",
}

export enum EtoMessage {
  COULD_NOT_LOAD_ETO_PREVIEW = "couldNotLoadEtoPreview",
  COULD_NOT_LOAD_ETO = "couldNotLoadEto",
  COULD_NOT_LOAD_ETOS = "couldNotLoadEtos",
}

export enum IpfsMessage {
  IPFS_FAILED_TO_DOWNLOAD_IPFS_FILE = "ipfsFailedToDownloadIpfsFile",
}

export enum FileUploadMessage {
  FILE_UPLOAD_ERROR = "fileUploadError",
}

export enum ETxValidationMessages {
  TX_VALIDATION_UNKNOWN_ERROR = "txValidationUnknownError",
}

export enum RemoteFileMessage {
  GET_FILES_DETAILS_ERROR = "getFilesDetailsError",
}

export enum KycFlowMessage {
  KYC_PROBLEM_SAVING_DATA = "kycProblemSavingData",
  KYC_PROBLEM_SENDING_DATA = "kycProblemSendingData",
  KYC_UPLOAD_SUCCESSFUL = "kycUploadSuccessful",
  KYC_UPLOAD_FAILED = "kycUploadFailed",
  KYC_SUBMIT_FAILED = "kycSubmitFailed",
  KYC_SUBMIT_TITLE = "kycSubmitTitle",
  KYC_SUBMIT_DESCRIPTION = "kycSubmitDescription",
  KYC_SETTINGS_BUTTON = "kycSettingsButton",
  KYC_ERROR = "kycError",
  KYC_BENEFICIAL_OWNERS = "kycBeneficialOwners",
  KYC_PROBLEM_LOADING_BANK_DETAILS = "kycProblemLoadingBankDetails",
}

export enum AuthMessage {
  AUTH_EMAIL_ALREADY_VERIFIED = "authEmailAlreadyVeryfied",
  AUTH_EMAIL_VERIFIED = "authEmailVerified",
  AUTH_EMAIL_ALREADY_EXISTS = "authEmailAlreadyExists",
  AUTH_EMAIL_VERIFICATION_FAILED = "authEmailVerificationFailed",
  AUTH_EMAIL_VERIFICATION_CODE_MISMATCH = "authEmailVerificationCodeMismatch",
  AUTH_TOC_ACCEPT_ERROR = "authTocAcceptError",
  AUTH_TOC_FILENAME = "authTocFilename",
}

export enum IcbmWalletMessage {
  ICBM_RESERVATION_AGREEMENT = "icbmReservationAgreement",
  ICBM_FAILED_TO_DOWNLOAD_AGREEMENT = "icbmFailedToDownloadAgreement",
  ICBM_COULD_NOT_FIND_ADDRESS = "icbmCouldNotFindAdress",
  ICBM_WALLET_AND_ICBM_ADDRESSES_ARE_THE_SAME = "icbmWalletAndIcbmAdressesAreTheSame",
  ICBM_COULD_NOT_LOAD_WALLET_DATA = "icbmCouldNotLoadWalletData",
  ICBM_ERROR_RUNNING_MIGRATION_TOOL = "icmbErrorRunningMigrationTool",
}

export enum ProfileMessage {
  PROFILE_UPDATE_EMAIL_TITLE = "profileUpdateEmailTitle",
  PROFILE_ADD_EMAIL_TITLE = "profileAddEmailTitle",
  PROFILE_ADD_EMAIL_INPUT_LABEL = "profileAddEmailInputLabel",
  PROFILE_NEW_EMAIL_ADDED = "profileNewEmailAdded",
  PROFILE_ABORT_UPDATE_EMAIL_SUCCESS = "profileAbortUpdateEmailSuccess",
  PROFILE_EMAIL_ALREADY_EXISTS = "profileEmailAlreadyExists",
  PROFILE_ADD_EMAIL_ERROR = "profileAddEmailError",
  PROFILE_RESEND_EMAIL_LINK_CONFIRMATION_TITLE = "profileResendEmailLinkConfirmationTitle",
  PROFILE_RESEND_EMAIL_LINK_CONFIRMATION_LABEL = "profileResendEmailLinkConfirmationLabel",
  PROFILE_RESEND_EMAIL_LINK_CONFIRMATION_DESCRIPTION = "profileResendEmailLinkConfirmationTitle",
  PROFILE_EMAIL_VERIFICATION_SENT = "profileEmailVerificationSent",
  PROFILE_EMAIL_VERIFICATION_SENDING_FAILED = "profileEmailVerificationSendingFailed",
  PROFILE_ACCESS_RECOVERY_PHRASE_TITLE = "profileAccessRecoveryPhraseTitle",
  PROFILE_ACCESS_RECOVERY_PHRASE_DESCRIPTION = "profileAccessRecoveryPhraseDescription",
  PROFILE_CHANGE_EMAIL_VERIFIED_EXISTS = "profileChangeEmailVerifiedAlreadyExists",
  PROFILE_CHANGE_EMAIL_UNVERIFIED_EXISTS = "profileChangeEmailUnverifiedAlreadyExists",
}

export enum Web3Message {
  WEB3_ERROR_BROWSER = "web3ErrorBrowser",
  WEB3_ERROR_LEDGER = "web3ErrorLedger",
}

export enum ValidationMessage {
  VALIDATION_INTEGER = "validationInteger",
  VALIDATION_MIN_PLEDGE = "validationMinPledge",
  VALIDATION_MAX_PLEDGE = "validationMaxPledge",
  VALIDATION_MAX_NEW_SHARES_LESS_THAN_MINIMUM = "validationMaxNewSharesLessThanMinimum",
  VALIDATION_TICKET_LESS_THAN_ACCEPTED = "validationTicketLessThanAccepted",
  VALIDATION_TICKET_LESS_THAN_MINIMUM = "validationTicketLessThanMinimum",
  VALIDATION_INVALID_DATE = "validationInvalidDate",
  VALIDATION_MIN_AGE = "validationMinAge",
  VALIDATION_MAX_AGE = "validationMaxAge",
  VALIDATION_DATE_IN_THE_FUTURE = "validationDateInTheFuture",
  VALIDATION_US_CITIZEN = "validationUsCitizen",
  VALIDATION_RESTRICTED_COUNTRY = "validationRestrictedCountry",
  VALIDATION_PECENTAGE_MAX = "validationPecentageMax",
  VALIDATION_PERCENTAGE_MIN = "validationPercentageMin",
  VALIDATION_CURRENCY_CODE = "validationCurrencyCode",
  VALIDATION_FIELDS_SHOULD_MATCH = "validationFieldsShouldMatch",
}

export enum MarketingEmailsMessage {
  UNSUBSCRIBE_ERROR = "unsubscribeError",
}

export enum EMaskedFormError {
  GENERIC_ERROR = "ethAddressValidationGenericError",
  ILLEGAL_CHARACTER = "illegalCharacter",
  INVALID_PREFIX = "ivalidPrefix",
  MAX_LENGTH_EXCEEDED = "maxLengthExceeded",
}

export enum EKycRequestStatusTranslation {
  DRAFT = "KycRequestStatusTranslationDraft",
  PENDING = "KycRequestStatusTranslationPending",
  OUTSOURCED = "KycRequestStatusTranslationOutsourced",
  REJECTED = "KycRequestStatusTranslationRejected",
  ACCEPTED = "KycRequestStatusTranslationAccepted",
  IGNORED = "KycRequestStatusTranslationIgnored",
}

export enum ENomineeRequestStatusTranslation {
  PENDING = "nomineeRequestPending",
  APPROVED = "nomineeRequestApproved",
  REJECTED = "nomineeRequestRejected",
}

export enum ENomineeRequestErrorNotifications {
  ISSUER_ID_ERROR = "nomineeRequestIssuerIdError",
  SUBMITTING_ERROR = "nomineeRequestGenericError",
  REQUEST_EXISTS = "requestExists",
  FETCH_NOMINEE_DATA_ERROR = "fetchNomineeDataError",
}

export enum EEtoNomineeRequestNotifications {
  REJECT_NOMINEE_ERROR = "deleteNomineeRequestError",
  ACCEPT_NOMINEE_ERROR = "acceptNomineeRequestError",
  DELETE_NOMINEE_REQUEST_SUCCESS = "deleteNomineeRequestSuccess",
  UPDATE_NOMINEE_REQUEST_ERROR = "updateNomineeRequestError",
  GENERIC_NETWORK_ERROR = "etoNomineeRequestGenericError",
  COULD_NOT_DELETE_REQUEST = "couldNotDeleteRequest",
}

export enum EEtoNomineeRequestMessages {
  ISSUER_ACCEPT_NOMINEE_REQUEST = "issuerAcceptNomineeRequest",
  ISSUER_ACCEPT_NOMINEE_REQUEST_TEXT = "issuerAcceptNomineeRequestText",
  ISSUER_DELETE_NOMINEE_REQUEST = "issuerDeleteNomineeRequest",
  ISSUER_DELETE_NOMINEE_REQUEST_TEXT = "issuerDeleteNomineeRequestText",
  ISSUER_UPDATE_NOMINEE_REQUEST = "issuerUpdateNomineeRequest",
  ISSUER_UPDATE_NOMINEE_REQUEST_TEXT = "issuerUpdateNomineeRequestText",
}

export enum EEtoNomineeActiveEtoNotifications {
  ACTIVE_ETO_SET_SUCCESS = "activeEtoSetSuccess",
  ACTIVE_ETO_SET_ERROR = "activeEtoSetError",
}

export enum ENotificationText {
  COMPLETE_REQUEST_NOTIFICATION = "completeRequestNotification",
  COMPLETE_UPDATE_ACCOUNT = "completeUpdateAccount",
}

export enum TestMessage {
  TEST_MESSAGE = "testMessage",
}

const getMessageTranslation = ({ messageType, messageData }: TMessage): TTranslatedString => {
  switch (messageType) {
    case BackupRecoveryMessage.BACKUP_SUCCESS_TITLE:
      return <FormattedMessage id="modules.wallet-selector.light-wizard.sagas.backup-recovery" />;
    case BackupRecoveryMessage.BACKUP_SUCCESS_DESCRIPTION:
      return (
        <FormattedMessage id="modules.wallet-selector.light-wizard.sagas.successfully.backed-up" />
      );

    case GenericErrorMessage.GENERIC_ERROR:
      return <FormattedMessage id="error-message.generic-error" />;
    case GenericErrorMessage.USER_ALREADY_EXISTS:
      return <FormattedMessage id="modules.auth.sagas.sign-in-user.email-already-exists" />;
    case SignInUserErrorMessage.MESSAGE_SIGNING_REJECTED:
      return <FormattedMessage id="modules.auth.sagas.sign-in-user.message-signing-was-rejected" />;
    case SignInUserErrorMessage.MESSAGE_SIGNING_TIMEOUT:
      return <FormattedMessage id="modules.auth.sagas.sign-in-user.message-signing-timeout" />;
    case SignInUserErrorMessage.MESSAGE_SIGNING_SERVER_CONNECTION_FAILURE:
      return (
        <FormattedHTMLMessage
          tagName="span"
          id="modules.auth.sagas.sign-in-user.error-our-servers-are-having-problems"
          values={{ url: externalRoutes.neufundSupportHome }}
        />
      );

    case GenericModalMessage.ERROR_TITLE:
      return <FormattedMessage id="modal.generic.title.error" />;

    case BankTransferFlowMessage.BANK_TRANSFER_FLOW_ERROR:
      return <FormattedMessage id="bank-transfer-flow.failed-to-start" />;

    case BrowserWalletErrorMessage.WALLET_IS_LOCKED:
      return <FormattedMessage id="error-message.browser-wallet.wallet-locked" />;
    case BrowserWalletErrorMessage.WALLET_CONNECTED_TO_WRONG_NETWORK:
      return (
        <FormattedMessage id="error-message.browser-wallet.wallet-connected-to-wrong-network" />
      );
    case BrowserWalletErrorMessage.WALLET_NOT_ENABLED:
      switch (messageData as EWalletSubType) {
        case EWalletSubType.GNOSIS:
          return <FormattedMessage id="error-message.gnosis-wallet.wallet-not-enabled" />;
        default:
          return <FormattedMessage id="error-message.browser-wallet.wallet-not-enabled" />;
      }
    case BrowserWalletErrorMessage.ACCOUNT_APPROVAL_REJECTED:
      return <FormattedMessage id="error-message.browser-wallet.account-approval-rejected" />;
    case BrowserWalletErrorMessage.ACCOUNT_APPROVAL_PENDING:
      return <FormattedMessage id="error-message.browser-wallet.account-approval-pending" />;
    case BrowserWalletErrorMessage.GENERIC_ERROR:
      return <FormattedMessage id="error-message.browser-wallet.generic-error" />;

    case LedgerErrorMessage.LEDGER_LOCKED:
      return <FormattedMessage id="error-message.ledger.ledger-locked" />;
    case LedgerErrorMessage.NOT_SUPPORTED:
      return <FormattedMessage id="error-message.ledger.ledger-not-supported" />;
    case LedgerErrorMessage.CONTRACT_DISABLED:
      return <FormattedMessage id="error-message.ledger.contract-disabled" />;
    case LedgerErrorMessage.GENERIC_ERROR:
      return <FormattedMessage id="error-message.ledger.generic-error" />;
    case LedgerErrorMessage.USER_CANCELLED:
      return <FormattedMessage id="error-message.ledger.user-cancelled" />;

    case LightWalletErrorMessage.WRONG_PASSWORD_SALT:
      return <FormattedMessage id="error-message.light-wallet.wrong-password-salt" />;
    case LightWalletErrorMessage.SIGN_MESSAGE:
      return <FormattedMessage id="error-message.light-wallet.sign-message" />;
    case LightWalletErrorMessage.CREATION_ERROR:
      return <FormattedMessage id="error-message.light-wallet.creation-error" />;
    case LightWalletErrorMessage.DESERIALIZE:
      return <FormattedMessage id="error-message.light-wallet.deserialize" />;
    case LightWalletErrorMessage.ENCRYPTION_ERROR:
      return <FormattedMessage id="error-message.light-wallet.encryption-error" />;
    case LightWalletErrorMessage.WRONG_PASSWORD:
      return <FormattedMessage id="error-message.light-wallet.wrong-password" />;
    case LightWalletErrorMessage.WRONG_MNEMONIC:
      return <FormattedMessage id="error-message.light-wallet.wrong-mnemonic" />;
    case LightWalletErrorMessage.GENERIC_ERROR:
      return <FormattedMessage id="error-message.light-wallet.generic-error" />;

    case SignerErrorMessage.CONFIRMATION_REJECTED:
      return <FormattedMessage id="error-message.signer.signer-rejected-confirmation" />;
    case SignerErrorMessage.TIMEOUT:
      return <FormattedMessage id="error-message.signer.timeout" />;
    case SignerErrorMessage.GENERIC_ERROR:
      return <FormattedMessage id="error-message.signer.generic-error" />;

    case MismatchedWalletAddressErrorMessage.MISMATCHED_WALLET_ADDRESS:
      return (
        <FormattedMessage
          id="error-message.mismatched-wallet-address"
          values={messageData as ITranslationValues}
        />
      );

    case InvestorPortfolioMessage.INVESTOR_PORTFOLIO_FAILED_TO_LOAD_CLAIMABLES:
      return (
        <FormattedMessage id="portfolio.asset.payouts-from-neu.notification.failed-to-load-payouts" />
      );
    case InvestorPortfolioMessage.INVESTOR_PORTFOLIO_FAILED_TO_LOAD_INCOMING_PAYOUTS:
      return (
        <FormattedMessage id="portfolio.asset.payouts-from-neu.notification.failed-to-load-incoming-payouts" />
      );

    case ToSMessage.TOS_ACCEPT_PERMISSION_TITLE:
      return <FormattedMessage id="settings.modal.accept-tos.permission.title" />;
    case ToSMessage.TOS_ACCEPT_PERMISSION_TEXT:
      return <FormattedMessage id="settings.modal.accept-tos.permission.text" />;

    case BookbuildingFlowMessage.PLEDGE_FLOW_CONFIRM_PLEDGE:
      return <FormattedMessage id="eto.overview.permission-modal.confirm-pledge" />;
    case BookbuildingFlowMessage.PLEDGE_FLOW_PLEDGE_DESCRIPTION:
      return <FormattedMessage id="eto.overview.permission-modal.confirm-pledge-description" />;
    case BookbuildingFlowMessage.PLEDGE_FLOW_FAILED_TO_SAVE_PLEDGE:
      return <FormattedMessage id="eto.overview.error-notification.failed-to-save-pledge" />;
    case BookbuildingFlowMessage.PLEDGE_FLOW_CONFIRM_PLEDGE_REMOVAL:
      return <FormattedMessage id="eto.overview.permission-modal.confirm-pledge-removal" />;
    case BookbuildingFlowMessage.PLEDGE_FLOW_CONFIRM_PLEDGE_REMOVAL_DESCRIPTION:
      return (
        <FormattedMessage id="eto.overview.permission-modal.confirm-pledge-description-removal" />
      );
    case BookbuildingFlowMessage.PLEDGE_FLOW_PLEDGE_REMOVAL_FAILED:
      return <FormattedMessage id="eto.overview.error-notification.failed-to-delete-pledge" />;
    case BookbuildingFlowMessage.PLEDGE_FLOW_FAILED_TO_GET_BOOKBUILDING_STATS:
      return <FormattedMessage id="eto.overview.error-notification.failed-to-bookbuilding-stats" />;
    case BookbuildingFlowMessage.PLEDGE_FLOW_FAILED_TO_LOAD_PLEDGE:
      return <FormattedMessage id="eto.overview.error-notification.failed-to-load-pledge" />;

    case EtoDocumentsMessage.ETO_DOCUMENTS_CONFIRM_UPLOAD_DOCUMENT_TITLE:
      return <FormattedMessage id="eto.modal.confirm-upload-document-title" />;
    case EtoDocumentsMessage.ETO_DOCUMENTS_CONFIRM_REMOVE_DOCUMENT_TITLE:
      return <FormattedMessage id="eto.modal.confirm-remove-document-title" />;
    case EtoDocumentsMessage.ETO_DOCUMENTS_CONFIRM_UPLOAD_DOCUMENT_DESCRIPTION:
      return <FormattedMessage id="eto.modal.confirm-upload-document-description" />;
    case EtoDocumentsMessage.ETO_DOCUMENTS_CONFIRM_REMOVE_DOCUMENT_DESCRIPTION:
      return <FormattedMessage id="eto.modal.confirm-remove-document-description" />;
    case EtoDocumentsMessage.ETO_DOCUMENTS_FILE_UPLOADED:
      return <FormattedMessage id="eto.modal.file-uploaded" />;
    case EtoDocumentsMessage.ETO_DOCUMENTS_FILE_REMOVED:
      return <FormattedMessage id="eto.modal.file-removed" />;
    case EtoDocumentsMessage.ETO_DOCUMENTS_FILE_REMOVE_FAILED:
      return <FormattedMessage id="eto.modal.file-remove-failed" />;
    case EtoDocumentsMessage.ETO_DOCUMENTS_FILE_EXISTS:
      return <FormattedMessage id="eto.modal.file-already-exists" />;
    case EtoDocumentsMessage.ETO_DOCUMENTS_FILE_UPLOAD_FAILED:
      return <FormattedMessage id="eto.modal.file-upload-failed" />;
    case EtoDocumentsMessage.ETO_DOCUMENTS_FAILED_TO_DOWNLOAD_FILE:
      return <FormattedMessage id="eto.modal.file-download-failed" />;
    case EtoDocumentsMessage.ETO_DOCUMENTS_FAILED_TO_ACCESS_ETO_FILES_DATA:
      return <FormattedMessage id="eto.modal.could-not-access-eto-files" />;
    case EtoDocumentsMessage.ETO_DOCUMENTS_CONFIRM_START_BOOKBUILDING:
      return <FormattedMessage id="eto.modal.confirm-start-bookbuilding-title" />;
    case EtoDocumentsMessage.ETO_DOCUMENTS_CONFIRM_STOP_BOOKBUILDING:
      return <FormattedMessage id="eto.modal.confirm-stop-bookbuilding-title" />;
    case EtoDocumentsMessage.ETO_DOCUMENTS_FAILED_TO_SEND_ETO_DATA:
      return <FormattedMessage id="eto.modal.failed-to-send-eto-data" />;
    case EtoDocumentsMessage.ETO_DOCUMENTS_FAILED_TO_GET_BOOKBUILDING_STATS:
      return <FormattedMessage id="eto.overview.error-notification.failed-to-bookbuilding-stats" />;
    case EtoDocumentsMessage.ETO_DOCUMENTS_SUBMIT_ETO_TITLE:
      return <FormattedMessage id="eto.modal.submit-title" />;
    case EtoDocumentsMessage.ETO_DOCUMENTS_SUBMIT_ETO_DESCRIPTION:
      return <FormattedMessage id="eto.modal.submit-description" />;
    case EtoDocumentsMessage.ETO_SUBMIT_SUCCESS:
      return <FormattedMessage id="eto.submit-success" />;

    case EtoMessage.COULD_NOT_LOAD_ETO_PREVIEW:
      return <FormattedMessage id="eto.public-view.could-not-load-eto-preview" />;
    case EtoMessage.COULD_NOT_LOAD_ETO:
      return <FormattedMessage id="eto.public-view.could-not-load-eto" />;
    case EtoMessage.COULD_NOT_LOAD_ETOS:
      return <FormattedMessage id="dashboard.could-not-load-etos" />;

    case ETxValidationMessages.TX_VALIDATION_UNKNOWN_ERROR:
      return <FormattedMessage id="tx.validation-unknown-error" />;

    case IpfsMessage.IPFS_FAILED_TO_DOWNLOAD_IPFS_FILE:
      return <FormattedMessage id="ipfs-failed-to-download-file" />;

    case FileUploadMessage.FILE_UPLOAD_ERROR:
      return <FormattedMessage id="form.single-file-upload-error" />;

    case RemoteFileMessage.GET_FILES_DETAILS_ERROR:
      return <FormattedMessage id="remote.file.details-error" />;

    case ETxHistoryMessage.TX_HISTORY_FAILED_TO_LOAD:
      return <FormattedMessage id="module.tx-history.tx.failed-to-load" />;
    case ETxHistoryMessage.TX_HISTORY_FAILED_TO_LOAD_NEXT:
      return <FormattedMessage id="module.tx-history.tx.failed-to-load-next" />;

    case KycFlowMessage.KYC_PROBLEM_SAVING_DATA:
      return <FormattedMessage id="module.kyc.sagas.problem-saving-data" />;
    case KycFlowMessage.KYC_PROBLEM_SENDING_DATA:
      return <FormattedMessage id="module.kyc.sagas.problem-sending-data" />;
    case KycFlowMessage.KYC_UPLOAD_SUCCESSFUL:
      return <FormattedMessage id="module.kyc.sagas.successfully-uploaded" />;
    case KycFlowMessage.KYC_UPLOAD_FAILED:
      return <FormattedMessage id="module.kyc.sagas.problem-uploading" />;
    case KycFlowMessage.KYC_SUBMIT_FAILED:
      return <FormattedMessage id="module.kyc.sagas.problem.submitting" />;
    case KycFlowMessage.KYC_SUBMIT_TITLE:
      return <FormattedMessage id="kyc.modal.submit-title" />;
    case KycFlowMessage.KYC_SUBMIT_DESCRIPTION:
      return <FormattedMessage id="kyc.modal.submit-description" />;
    case KycFlowMessage.KYC_SETTINGS_BUTTON:
      return <FormattedMessage id="kyc.modal.verification.settings-button" />;
    case KycFlowMessage.KYC_ERROR:
      return <FormattedMessage id="module.kyc.sagas.error" />;
    case KycFlowMessage.KYC_BENEFICIAL_OWNERS:
      return <FormattedMessage id="module.kyc.sagas.beneficial-owners" />;
    case KycFlowMessage.KYC_PROBLEM_LOADING_BANK_DETAILS:
      return <FormattedMessage id="module.kyc.sagas.problem-loading-bank-details" />;

    case AuthMessage.AUTH_EMAIL_ALREADY_VERIFIED:
      return (
        <FormattedMessage id="modules.auth.sagas.verify-user-email-promise.email-already-verified" />
      );
    case AuthMessage.AUTH_EMAIL_VERIFIED:
      return <FormattedMessage id="modules.auth.sagas.verify-user-email-promise.email-verified" />;
    case AuthMessage.AUTH_EMAIL_ALREADY_EXISTS:
      return <FormattedMessage id="modules.auth.sagas.sign-in-user.email-already-exists" />;
    case AuthMessage.AUTH_EMAIL_VERIFICATION_FAILED:
      return (
        <FormattedMessage id="modules.auth.sagas.verify-user-email-promise.failed-email-verify" />
      );
    case AuthMessage.AUTH_EMAIL_VERIFICATION_CODE_MISMATCH:
      return (
        <FormattedMessage id="modules.auth.sagas.verify-user-email-promise.failed-email-verify-code-mismatch" />
      );
    case AuthMessage.AUTH_TOC_ACCEPT_ERROR:
      return <FormattedMessage id="settings.modal.accept-tos.failure" />;
    case AuthMessage.AUTH_TOC_FILENAME:
      return "neufund_terms_of_use";

    case IcbmWalletMessage.ICBM_RESERVATION_AGREEMENT:
      //TODO We need a plain string here, but FormattedMessage doesn't work outside of components now.
      // Need to figure out how to do this.
      return "Amended ICBM Reservation Agreement"; //<FormattedMessage id="wallet.icbm.reservation-agreement" />;
    case IcbmWalletMessage.ICBM_FAILED_TO_DOWNLOAD_AGREEMENT:
      return <FormattedMessage id="wallet.icbm.failed-to-download-reservation-agreement" />;
    case IcbmWalletMessage.ICBM_COULD_NOT_FIND_ADDRESS:
      return <FormattedMessage id="wallet.icbm.wallet-not-found" />;
    case IcbmWalletMessage.ICBM_WALLET_AND_ICBM_ADDRESSES_ARE_THE_SAME:
      return <FormattedMessage id="wallet.icbm.wallet-and-icbm-addresses-are-the-same" />;
    case IcbmWalletMessage.ICBM_COULD_NOT_LOAD_WALLET_DATA:
      return <FormattedMessage id="wallet.icbm.error-loading-icbm-wallet-data" />;
    case IcbmWalletMessage.ICBM_ERROR_RUNNING_MIGRATION_TOOL:
      return <FormattedMessage id="wallet.icbm.error-running-migration-tool" />;

    case ProfileMessage.PROFILE_UPDATE_EMAIL_TITLE:
      return <FormattedMessage id="modules.settings.sagas.add-new-email.update-title" />;
    case ProfileMessage.PROFILE_ADD_EMAIL_TITLE:
      return <FormattedMessage id="modules.settings.sagas.add-new-email.add-title" />;
    case ProfileMessage.PROFILE_ADD_EMAIL_INPUT_LABEL:
      return <FormattedMessage id="modules.settings.sagas.add-new-email.input-label" />;
    case ProfileMessage.PROFILE_ABORT_UPDATE_EMAIL_SUCCESS:
      return <FormattedMessage id="modules.settings.sagas.add-new-email.abort-update-success" />;
    case ProfileMessage.PROFILE_NEW_EMAIL_ADDED:
      return <FormattedMessage id="modules.settings.sagas.add-new-email.new-email-added" />;
    case ProfileMessage.PROFILE_EMAIL_ALREADY_EXISTS:
      return <FormattedMessage id="modules.auth.sagas.sign-in-user.email-already-exists" />;
    case ProfileMessage.PROFILE_ADD_EMAIL_ERROR:
      return <FormattedMessage id="modules.settings.sagas.add-new-email.error" />;
    case ProfileMessage.PROFILE_RESEND_EMAIL_LINK_CONFIRMATION_TITLE:
      return <FormattedMessage id="modules.settings.sagas.resend-email.confirmation" />;
    case ProfileMessage.PROFILE_RESEND_EMAIL_LINK_CONFIRMATION_LABEL:
      return <FormattedMessage id="modules.settings.sagas.resend-email.label" />;
    case ProfileMessage.PROFILE_RESEND_EMAIL_LINK_CONFIRMATION_DESCRIPTION:
      return <FormattedMessage id="modules.settings.sagas.resend-email.confirmation-description" />;
    case ProfileMessage.PROFILE_EMAIL_VERIFICATION_SENT:
      return <FormattedMessage id="modules.settings.sagas.resend-email.sent" />;
    case ProfileMessage.PROFILE_EMAIL_VERIFICATION_SENDING_FAILED:
      return <FormattedMessage id="modules.settings.sagas.resend-email.failed" />;
    case ProfileMessage.PROFILE_ACCESS_RECOVERY_PHRASE_TITLE:
      return (
        <FormattedMessage id="modules.settings.sagas.load-seed-return-settings.access-recovery-phrase-title" />
      );
    case ProfileMessage.PROFILE_ACCESS_RECOVERY_PHRASE_DESCRIPTION:
      return (
        <FormattedMessage id="modules.settings.sagas.load-seed-return-settings.access-recovery-phrase-description" />
      );
    case ProfileMessage.PROFILE_CHANGE_EMAIL_VERIFIED_EXISTS:
      return <FormattedMessage id="modules.settings.sagas.change-email.verified-exists" />;
    case ProfileMessage.PROFILE_CHANGE_EMAIL_UNVERIFIED_EXISTS:
      return <FormattedMessage id="modules.settings.sagas.change-email.unverified-exists" />;

    case Web3Message.WEB3_ERROR_BROWSER:
      return <FormattedMessage id="modules.web3.flows.web3-error.browser" />;
    case Web3Message.WEB3_ERROR_LEDGER:
      return <FormattedMessage id="modules.web3.flows.web3-error.ledger" />;
    case EtoFlowMessage.ETO_TERMS_PRODUCT_CHANGE_FAILED:
      return <FormattedMessage id="modules.eto-flow.change-product.failed" />;
    case EtoFlowMessage.ETO_TERMS_PRODUCT_CHANGE_SUCCESSFUL:
      return <FormattedMessage id="modules.eto-flow.change-product.successful" />;
    case EtoFlowMessage.ETO_PRODUCTS_LOAD_FAILED:
      return <FormattedMessage id="modules.eto-flow.load-products.failed" />;
    case EtoFlowMessage.ETO_LOAD_FAILED:
      return <FormattedMessage id="modules.eto-flow.load.failed" />;

    case ValidationMessage.VALIDATION_INTEGER:
      return <FormattedMessage id="form.field.error.number.integer" />;
    case ValidationMessage.VALIDATION_MIN_PLEDGE:
      return (
        <FormattedMessage
          id="shared-component.eto-overview.error.min-pledge"
          values={{
            minPledge: (
              <Money
                value={messageData as string}
                // TODO: Investigate why is the value up force casted
                inputFormat={ENumberInputFormat.FLOAT}
                valueType={ECurrency.EUR}
                outputFormat={ENumberOutputFormat.ONLY_NONZERO_DECIMALS_ROUND_UP}
              />
            ),
          }}
        />
      );
    case ValidationMessage.VALIDATION_MAX_PLEDGE:
      return (
        <FormattedMessage
          id="shared-component.eto-overview.error.max-pledge"
          values={{
            maxPledge: (
              <Money
                value={messageData as string}
                // TODO: Investigate why we are force casting this
                inputFormat={ENumberInputFormat.FLOAT}
                valueType={ECurrency.EUR}
                outputFormat={ENumberOutputFormat.ONLY_NONZERO_DECIMALS}
              />
            ),
          }}
        />
      );
    case ValidationMessage.VALIDATION_MAX_NEW_SHARES_LESS_THAN_MINIMUM:
      return (
        <FormattedMessage id="eto.form.section.investment-terms.error.maximum-new-shares-to-issue-less-than-minimum" />
      );
    case ValidationMessage.VALIDATION_TICKET_LESS_THAN_ACCEPTED:
      return (
        <FormattedMessage
          id="eto.form.section.eto-terms.minimum-ticket-size.error.less-than-accepted"
          values={{ value: messageData as number }}
        />
      );
    case ValidationMessage.VALIDATION_TICKET_LESS_THAN_MINIMUM:
      return (
        <FormattedMessage id="eto.form.section.eto-terms.maximum-ticket-size.error.less-than-minimum" />
      );
    case ValidationMessage.VALIDATION_INVALID_DATE:
      return <FormattedMessage id="form.field.error.invalid-date" />;
    case ValidationMessage.VALIDATION_MIN_AGE:
      return <FormattedMessage id="form.field.error.older-than-18" />;
    case ValidationMessage.VALIDATION_MAX_AGE:
      return <FormattedMessage id="form.field.error.younger-than" values={{ age: 125 }} />;
    case ValidationMessage.VALIDATION_DATE_IN_THE_FUTURE:
      return <FormattedMessage id="form.field.error.founding-date-in-future" />;
    case ValidationMessage.VALIDATION_US_CITIZEN:
      return <FormattedMessage id="form.field.error.us-citizen" />;
    case ValidationMessage.VALIDATION_RESTRICTED_COUNTRY:
      return <FormattedMessage id="form.field.error.restricted-country" />;
    case ValidationMessage.VALIDATION_PECENTAGE_MAX:
      return (
        <FormattedMessage
          id="form.field.error.percentage.max"
          values={{ ...(messageData as { max: string }) }}
        />
      );
    case ValidationMessage.VALIDATION_PERCENTAGE_MIN:
      return (
        <FormattedMessage
          id="form.field.error.percentage.min"
          values={{ ...(messageData as { min: string }) }}
        />
      );
    case ValidationMessage.VALIDATION_CURRENCY_CODE:
      return <FormattedMessage id="form.field.error.currency-code" />;
    case ValidationMessage.VALIDATION_FIELDS_SHOULD_MATCH:
      return (
        <FormattedMessage
          id={"form.field.error.fileds-should-match"}
          values={{ fieldNames: formatMatchingFieldNames(messageData as string[]) }}
        />
      );

    case MarketingEmailsMessage.UNSUBSCRIBE_ERROR:
      return <FormattedMessage id="settings.unsubscription.error" />;

    case EMaskedFormError.GENERIC_ERROR:
      return <FormattedMessage id="error-message.eth-address-validation.not-a-valid-eth-address" />;
    case EMaskedFormError.ILLEGAL_CHARACTER:
      return <FormattedMessage id="error-message.eth-address-validation.illegal-character" />;
    case EMaskedFormError.INVALID_PREFIX:
      return <FormattedMessage id="error-message.eth-address-validation.invalid-prefix" />;
    case EMaskedFormError.MAX_LENGTH_EXCEEDED:
      return <FormattedMessage id="error-message.eth-address-validation.max-length-exceeded" />;

    case EKycRequestStatusTranslation.ACCEPTED:
      return <FormattedMessage id="kyc-request.status.accepted" />;
    case EKycRequestStatusTranslation.DRAFT:
      return <FormattedMessage id="kyc-request.status.draft" />;
    case EKycRequestStatusTranslation.IGNORED:
      return <FormattedMessage id="kyc-request.status.ignored" />;
    case EKycRequestStatusTranslation.OUTSOURCED:
      return <FormattedMessage id="kyc-request.status.outsourced" />;
    case EKycRequestStatusTranslation.PENDING:
      return <FormattedMessage id="kyc-request.status.pending" />;
    case EKycRequestStatusTranslation.REJECTED:
      return <FormattedMessage id="kyc-request.status.rejected" />;

    case ENomineeRequestStatusTranslation.APPROVED:
      return <FormattedMessage id="nominee-link-request.status.approved" />;
    case ENomineeRequestStatusTranslation.PENDING:
      return <FormattedMessage id="nominee-link-request.status.pending" />;
    case ENomineeRequestStatusTranslation.REJECTED:
      return <FormattedMessage id="nominee-link-request.status.rejected" />;

    case ENomineeRequestErrorNotifications.SUBMITTING_ERROR:
      return <FormattedMessage id="nominee-flow.link-with-issuer.submitting-error-notification" />;
    case ENomineeRequestErrorNotifications.FETCH_NOMINEE_DATA_ERROR:
      return (
        <FormattedMessage id="nominee-flow.link-with-issuer.fetch-nominee-data-error-notification" />
      );
    case ENomineeRequestErrorNotifications.ISSUER_ID_ERROR:
      return <FormattedMessage id="nominee-flow.link-with-issuer.issuer-id-error-notification" />;
    case ENomineeRequestErrorNotifications.REQUEST_EXISTS:
      return (
        <FormattedMessage id="nominee-flow.link-with-issuer.request-exists-error-notification" />
      );

    case EEtoNomineeRequestNotifications.DELETE_NOMINEE_REQUEST_SUCCESS:
      return <FormattedMessage id="eto.form.eto-nominee.delete-nominee-request-success" />;
    case EEtoNomineeRequestNotifications.GENERIC_NETWORK_ERROR:
      return <FormattedMessage id="eto.form.eto-nominee.generic-network-error" />;
    case EEtoNomineeRequestNotifications.COULD_NOT_DELETE_REQUEST:
      return <FormattedMessage id="eto.form.eto-nominee.delete-request-error" />;
    case EEtoNomineeRequestNotifications.REJECT_NOMINEE_ERROR:
      return <FormattedMessage id="eto.form.eto-nominee.reject-nominee-request-error" />;
    case EEtoNomineeRequestNotifications.ACCEPT_NOMINEE_ERROR:
      return <FormattedMessage id="eto.form.eto-nominee.accept-nominee-request-error" />;
    case EEtoNomineeRequestNotifications.UPDATE_NOMINEE_REQUEST_ERROR:
      return <FormattedMessage id="eto.form.eto-nominee.accept-nominee-request-error" />;

    case EEtoNomineeRequestMessages.ISSUER_ACCEPT_NOMINEE_REQUEST:
      return <FormattedMessage id="eto-nominee.permissions.accept-nominee-request-title" />;
    case EEtoNomineeRequestMessages.ISSUER_ACCEPT_NOMINEE_REQUEST_TEXT:
      return <FormattedMessage id="eto-nominee.permissions.accept-nominee-request-text" />;
    case EEtoNomineeRequestMessages.ISSUER_DELETE_NOMINEE_REQUEST:
      return <FormattedMessage id="eto-nominee.permissions.delete-nominee-request-title" />;
    case EEtoNomineeRequestMessages.ISSUER_DELETE_NOMINEE_REQUEST_TEXT:
      return <FormattedMessage id="eto-nominee.permissions.delete-nominee-request-text" />;
    case EEtoNomineeRequestMessages.ISSUER_UPDATE_NOMINEE_REQUEST:
      return <FormattedMessage id="eto-nominee.permissions.update-nominee-request-text" />;
    case EEtoNomineeRequestMessages.ISSUER_UPDATE_NOMINEE_REQUEST_TEXT:
      return <FormattedMessage id="eto-nominee.permissions.update-nominee-request-text" />;

    case EEtoNomineeActiveEtoNotifications.ACTIVE_ETO_SET_SUCCESS:
      return <FormattedMessage id="eto-nominee.active-eto.set-success" />;
    case EEtoNomineeActiveEtoNotifications.ACTIVE_ETO_SET_ERROR:
      return <FormattedMessage id="eto-nominee.active-eto.set-error" />;

    case ENotificationText.COMPLETE_REQUEST_NOTIFICATION:
      return <FormattedMessage id="notifications.complete-request" />;
    case ENotificationText.COMPLETE_UPDATE_ACCOUNT:
      return <FormattedMessage id="notifications.update-account" />;

    case ELightWalletRestoreMessage.LIGHT_WALLET_RESTORE_SUCCESS_TITLE:
      return <FormattedMessage id="account-recovery.success.title" />;
    case ELightWalletRestoreMessage.LIGHT_WALLET_RESTORE_SUCCESS_TEXT:
      return <FormattedMessage id="account-recovery.success.text" />;
    case WalletConnectErrorMessage.WC_GENERIC_ERROR:
      return (
        <FormattedMessage
          id="wallet-connect.generic-error"
          values={{ error: messageData ? messageData.toString() : "" }}
        />
      );
    case WalletConnectErrorMessage.WC_SESSION_REJECTED_ERROR:
      return <FormattedMessage id="wallet-connect.session-rejected-error" />;

    case WalletConnectErrorMessage.WC_SESSION_INVALID_CHAIN_ID:
      return <FormattedMessage id="wallet-connect.session-invalid-chain-id" />;

    // NEVER DO THIS! This is only for tests, so that we don't bloat locales.json with test strings!
    case TestMessage.TEST_MESSAGE:
      return (messageData as { message: TTranslatedString }).message;

    default:
      return assertNever(messageType, `Message not provided for ${messageType}`);
  }
};

export { getMessageTranslation };
