import { all, call, fork, put, select } from "@neufund/sagas";
import { EJwtPermissions } from "@neufund/shared-modules";
import { nonNullable } from "@neufund/shared-utils";

import { EtoDocumentsMessage, IpfsMessage } from "../../components/translatedMessages/messages";
import {
  createMessage,
  createNotificationMessage,
} from "../../components/translatedMessages/utils";
import { TGlobalDependencies } from "../../di/setupBindings";
import { EEtoState } from "../../lib/api/eto/EtoApi.interfaces.unsafe";
import { FileAlreadyExists } from "../../lib/api/eto/EtoFileApi";
import {
  EEtoDocumentType,
  TEtoDocumentTemplates,
  TStateInfo,
} from "../../lib/api/eto/EtoFileApi.interfaces";
import { actions, TActionFromCreator } from "../actions";
import { ensurePermissionsArePresentAndRunEffect } from "../auth/jwt/sagas";
import { loadIssuerEto } from "../eto-flow/sagas";
import {
  selectIssuerEto,
  selectIssuerEtoDocuments,
  selectIssuerEtoId,
  selectIssuerEtoProduct,
} from "../eto-flow/selectors";
import { TEtoWithCompanyAndContractReadonly } from "../eto/types";
import { downloadLink } from "../immutable-file/utils";
import { webNotificationUIModuleApi } from "../notification-ui/module";
import { neuCall, neuTakeEvery } from "../sagasUtils";
import { selectEthereumAddress } from "../web3/selectors";
import { selectEtoState } from "./selectors";
import { getDocumentByType } from "./utils";

export function* generateDocumentFromTemplate(
  { apiImmutableStorage, logger, apiEtoFileService }: TGlobalDependencies,
  action: TActionFromCreator<typeof actions.etoDocuments.generateTemplate>,
): Generator<any, any, any> {
  try {
    const document = action.payload.document;
    const etoState: EEtoState = yield select(selectEtoState);

    let resolvedTemplate = null;
    yield put(actions.immutableStorage.downloadDocumentStarted(document.ipfsHash));

    // resolve all documents if not on-chain, otherwise resolve only ISHA summary
    if (
      etoState !== EEtoState.ON_CHAIN ||
      document.documentType === EEtoDocumentType.INVESTMENT_SUMMARY_TEMPLATE
    ) {
      resolvedTemplate = yield apiEtoFileService.getEtoTemplate(
        {
          documentType: document.documentType,
          name: document.name,
          form: "template",
          ipfsHash: document.ipfsHash,
          mimeType: document.mimeType,
        },
        // token_holder_ethereum_address is a required input for an on-chain resolver
        etoState === EEtoState.ON_CHAIN
          ? { token_holder_ethereum_address: "0x0000000000000000000000000000000000000000" }
          : {},
      );
    }

    const generatedDocument = yield apiImmutableStorage.getFile({
      ipfsHash: document.ipfsHash,
      mimeType: document.mimeType,
      placeholders: resolvedTemplate ? resolvedTemplate.placeholders : undefined,
      asPdf: false,
    });

    yield call(downloadLink, generatedDocument, document.name, ".doc");
  } catch (e) {
    logger.error("Failed to generate ETO template", e);
    yield put(
      webNotificationUIModuleApi.actions.showError(
        createNotificationMessage(IpfsMessage.IPFS_FAILED_TO_DOWNLOAD_IPFS_FILE),
      ),
    );
  } finally {
    yield put(actions.immutableStorage.downloadImmutableFileDone(action.payload.document.ipfsHash));
  }
}

export function* generateDocumentFromTemplateByEtoId(
  { apiImmutableStorage, logger, apiEtoFileService }: TGlobalDependencies,
  action: TActionFromCreator<typeof actions.etoDocuments.generateTemplateByEtoId>,
): Generator<any, any, any> {
  try {
    const userEthAddress = yield select(selectEthereumAddress);
    const document = action.payload.document;
    const etoId = action.payload.etoId;
    const extension = document.asPdf ? ".pdf" : ".doc";

    yield put(actions.immutableStorage.downloadDocumentStarted(document.ipfsHash));
    const templates = yield apiEtoFileService.getSpecificEtoTemplate(
      etoId,
      {
        documentType: document.documentType,
        name: document.name,
        form: "template",
        ipfsHash: document.ipfsHash,
        mimeType: document.mimeType,
      },
      // token holder is required in on-chain state, use non-existing address
      // to obtain issuer side template
      { token_holder_ethereum_address: userEthAddress },
    );
    const generatedDocument = yield apiImmutableStorage.getFile({
      ...{
        ipfsHash: templates.ipfs_hash,
        mimeType: templates.mime_type,
        placeholders: templates.placeholders,
      },
      asPdf: true,
    });
    yield call(downloadLink, generatedDocument, document.name, extension);
  } catch (e) {
    logger.error("Failed to generate ETO template", e);
    yield put(
      webNotificationUIModuleApi.actions.showError(
        createNotificationMessage(IpfsMessage.IPFS_FAILED_TO_DOWNLOAD_IPFS_FILE),
      ),
    );
  } finally {
    yield put(actions.immutableStorage.downloadImmutableFileDone(action.payload.document.ipfsHash));
  }
}

export function* downloadDocumentStart(
  { apiImmutableStorage, logger }: TGlobalDependencies,
  action: TActionFromCreator<typeof actions.etoDocuments.downloadDocumentStart>,
): Generator<any, any, any> {
  try {
    const matchingDocument = yield getDocumentOfType(action.payload.documentType);
    const downloadedDocument = yield apiImmutableStorage.getFile({
      ipfsHash: matchingDocument.ipfsHash,
      mimeType: matchingDocument.mimeType,
      asPdf: true,
    });
    yield call(downloadLink, downloadedDocument, matchingDocument.name, "");
  } catch (e) {
    logger.error("Download document by type failed", e);
    yield put(
      webNotificationUIModuleApi.actions.showError(
        createNotificationMessage(EtoDocumentsMessage.ETO_DOCUMENTS_FAILED_TO_DOWNLOAD_FILE),
      ),
    );
  } finally {
    yield put(actions.etoDocuments.downloadDocumentFinish(action.payload.documentType));
  }
}

export function* loadEtoFilesInfo({
  apiEtoFileService,
  apiEtoProductService,
  logger,
}: TGlobalDependencies): Generator<any, any, any> {
  try {
    const etoId = yield select(selectIssuerEtoId);
    if (!etoId) {
      // issuer eto must no be loaded so load it now
      yield neuCall(loadIssuerEto);
    }
    const product = yield select(selectIssuerEtoProduct);
    const {
      documentsStateInfo,
      productTemplates,
    }: { documentsStateInfo: TStateInfo; productTemplates: TEtoDocumentTemplates } = yield all({
      documentsStateInfo: apiEtoFileService.getEtoFileStateInfo(),
      productTemplates: apiEtoProductService.getProductTemplates(product.id),
    });

    yield put(
      actions.etoDocuments.loadEtoFilesInfo({
        productTemplates,
        documentsStateInfo,
      }),
    );
  } catch (e) {
    logger.error("Load ETO data failed", e);
    yield put(
      webNotificationUIModuleApi.actions.showError(
        createNotificationMessage(
          EtoDocumentsMessage.ETO_DOCUMENTS_FAILED_TO_ACCESS_ETO_FILES_DATA,
        ),
      ),
    );
    yield put(actions.routing.goToDashboard());
  }
}

function* getDocumentOfType(documentType: EEtoDocumentType): Generator<any, any, any> {
  const documents: TEtoDocumentTemplates = yield select(selectIssuerEtoDocuments);

  return getDocumentByType(documents, documentType);
}

function* uploadEtoFileEffect(
  { apiEtoFileService }: TGlobalDependencies,
  file: File,
  documentType: EEtoDocumentType,
): Generator<any, any, any> {
  const matchingDocument = yield getDocumentOfType(documentType);

  if (matchingDocument) {
    yield apiEtoFileService.deleteSpecificEtoDocument(matchingDocument.ipfsHash);
  }

  yield apiEtoFileService.uploadEtoDocument(file, documentType);

  yield put(
    webNotificationUIModuleApi.actions.showInfo(
      createNotificationMessage(EtoDocumentsMessage.ETO_DOCUMENTS_FILE_UPLOADED),
    ),
  );
}

function* removeEtoFileEffect(
  { apiEtoFileService, logger }: TGlobalDependencies,
  documentType: EEtoDocumentType,
): Generator<any, any, any> {
  const matchingDocument = yield getDocumentOfType(documentType);

  if (matchingDocument) {
    yield apiEtoFileService.deleteSpecificEtoDocument(matchingDocument.ipfsHash);
    yield put(
      webNotificationUIModuleApi.actions.showInfo(
        createNotificationMessage(EtoDocumentsMessage.ETO_DOCUMENTS_FILE_REMOVED),
      ),
    );
  } else {
    logger.error("Could not remove, missing ETO document", documentType);
    yield put(
      webNotificationUIModuleApi.actions.showError(
        createNotificationMessage(EtoDocumentsMessage.ETO_DOCUMENTS_FILE_REMOVE_FAILED),
      ),
    );
  }
}

function* uploadEtoFile(
  { logger }: TGlobalDependencies,
  action: TActionFromCreator<typeof actions.etoDocuments.etoUploadDocumentStart>,
): Generator<any, any, any> {
  const { file, documentType } = action.payload;
  try {
    yield put(actions.etoDocuments.hideIpfsModal());

    yield neuCall(
      ensurePermissionsArePresentAndRunEffect,
      neuCall(uploadEtoFileEffect, file, documentType),
      [EJwtPermissions.UPLOAD_IMMUTABLE_DOCUMENT],
      createMessage(EtoDocumentsMessage.ETO_DOCUMENTS_CONFIRM_UPLOAD_DOCUMENT_TITLE),
      createMessage(EtoDocumentsMessage.ETO_DOCUMENTS_CONFIRM_UPLOAD_DOCUMENT_DESCRIPTION),
    );
  } catch (e) {
    if (e instanceof FileAlreadyExists) {
      yield put(
        webNotificationUIModuleApi.actions.showError(
          createNotificationMessage(EtoDocumentsMessage.ETO_DOCUMENTS_FILE_EXISTS),
        ),
      );
    } else {
      logger.error("Failed to send ETO data", e);
      yield put(
        webNotificationUIModuleApi.actions.showError(
          createNotificationMessage(EtoDocumentsMessage.ETO_DOCUMENTS_FILE_UPLOAD_FAILED),
        ),
      );
    }
  } finally {
    yield neuCall(loadIssuerEto);
    if (documentType === EEtoDocumentType.INVESTMENT_AND_SHAREHOLDER_AGREEMENT) {
      const eto: TEtoWithCompanyAndContractReadonly = yield nonNullable(select(selectIssuerEto));

      const uploadResult = Object.values(eto.documents).find(d => d.documentType === documentType)!;

      // If user does not sign transaction uploadResult is undefined
      if (uploadResult) {
        yield put(actions.etoFlow.issuerSignInvestmentAgreement(eto, uploadResult.ipfsHash));
      }
    }
    yield put(actions.etoDocuments.etoUploadDocumentFinish(documentType));
  }
}

function* removeEtoFile(
  { logger }: TGlobalDependencies,
  action: TActionFromCreator<typeof actions.etoDocuments.etoUploadDocumentStart>,
): Generator<any, any, any> {
  const { documentType } = action.payload;
  try {
    yield put(actions.etoDocuments.hideIpfsModal());

    yield neuCall(
      ensurePermissionsArePresentAndRunEffect,
      neuCall(removeEtoFileEffect, documentType),
      [EJwtPermissions.UPLOAD_IMMUTABLE_DOCUMENT],
      createMessage(EtoDocumentsMessage.ETO_DOCUMENTS_CONFIRM_UPLOAD_DOCUMENT_TITLE),
      createMessage(EtoDocumentsMessage.ETO_DOCUMENTS_CONFIRM_UPLOAD_DOCUMENT_DESCRIPTION),
    );
  } catch (e) {
    if (e instanceof FileAlreadyExists) {
      yield put(
        webNotificationUIModuleApi.actions.showError(
          createNotificationMessage(EtoDocumentsMessage.ETO_DOCUMENTS_FILE_EXISTS),
        ),
      );
    } else {
      logger.error("Failed to remove ETO file data", e);
      yield put(
        webNotificationUIModuleApi.actions.showError(
          createNotificationMessage(EtoDocumentsMessage.ETO_DOCUMENTS_FILE_UPLOAD_FAILED),
        ),
      );
    }
  } finally {
    yield neuCall(loadIssuerEto);
  }
}

export function* etoDocumentsSagas(): Generator<any, any, any> {
  yield fork(
    neuTakeEvery,
    actions.etoDocuments.generateTemplateByEtoId,
    generateDocumentFromTemplateByEtoId,
  );
  yield fork(neuTakeEvery, actions.etoDocuments.generateTemplate, generateDocumentFromTemplate);
  yield fork(neuTakeEvery, actions.etoDocuments.loadFileDataStart, loadEtoFilesInfo);
  yield fork(neuTakeEvery, actions.etoDocuments.etoUploadDocumentStart, uploadEtoFile);
  yield fork(neuTakeEvery, actions.etoDocuments.downloadDocumentStart, downloadDocumentStart);
  yield fork(neuTakeEvery, actions.etoDocuments.etoRemoveDocumentStart, removeEtoFile);
}
