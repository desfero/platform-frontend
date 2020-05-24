import { call, fork, put, select, take } from "@neufund/sagas";
import { BigNumber } from "bignumber.js";
import { toChecksumAddress } from "ethereumjs-util";

import { hashFromIpfsLink } from "../../components/documents/utils";
import { IcbmWalletMessage } from "../../components/translatedMessages/messages";
import {
  createMessage,
  createNotificationMessage,
} from "../../components/translatedMessages/utils";
import { TGlobalDependencies } from "../../di/setupBindings";
import { actions, TActionFromCreator } from "../actions";
import { downloadLink } from "../immutable-file/utils";
import { webNotificationUIModuleApi } from "../notification-ui/module";
import { neuCall, neuTakeEvery, neuTakeUntil } from "../sagasUtils";
import { ETokenType } from "../tx/types";
import { ILockedWallet, IWalletStateData } from "../wallet/reducer";
import { loadWalletDataAsync } from "../wallet/sagas";
import { selectLockedWalletConnected } from "../wallet/selectors";
import { selectEthereumAddress } from "../web3/selectors";
import { IWalletMigrationData } from "./reducer";
import { selectIcbmModalIsFirstTransactionDone, selectIcbmWalletEthAddress } from "./selectors";

class IcbmWalletError extends Error {}
class NoIcbmWalletError extends IcbmWalletError {}
class SameUserError extends IcbmWalletError {}

function hasIcbmWallet(lockedWallet: ILockedWallet): boolean {
  return lockedWallet.unlockDate !== "0";
}

const didUserConductFirstTransaction = (
  investorMigrationWallet: [string[], BigNumber[]],
  currentEthAddress: string,
) =>
  // If a user added more than one address then we consider him to be a power user
  Boolean(
    investorMigrationWallet[0].length === 1 &&
      investorMigrationWallet[0][0] &&
      investorMigrationWallet[0][0].toLowerCase() === currentEthAddress.toLowerCase(),
  );

function* loadIcbmWalletMigrationTransactionSaga({
  logger,
  contractsService,
}: TGlobalDependencies): any {
  try {
    const currentEthAddress: string = yield select(selectEthereumAddress);
    const icbmEthAddress: string = yield select(selectIcbmWalletEthAddress);
    const isFirstTxDone: boolean = yield select(selectIcbmModalIsFirstTransactionDone);

    const investorMigrationWallet: [
      string[],
      BigNumber[],
    ] = yield contractsService.etherLock.getInvestorMigrationWallets(icbmEthAddress);

    const etherLockAddress = yield contractsService.etherLock.address;
    const icbmEtherLockAddress = yield contractsService.icbmEtherLock.address;

    const walletMigrationData: IWalletMigrationData[] = [
      {
        migrationInputData: contractsService.etherLock
          .setInvestorMigrationWalletTx(currentEthAddress)
          .getData(),
        smartContractAddress: toChecksumAddress(etherLockAddress),
        gasLimit: "400000",
        value: "0",
      },
      {
        migrationInputData: contractsService.icbmEtherLock.migrateTx().getData(),
        smartContractAddress: toChecksumAddress(icbmEtherLockAddress),
        gasLimit: "400000",
        value: "0",
      },
    ];

    if (
      didUserConductFirstTransaction(investorMigrationWallet, currentEthAddress) &&
      !isFirstTxDone
    ) {
      yield put(actions.icbmWalletBalanceModal.setFirstTxDone());
    }

    yield put(actions.icbmWalletBalanceModal.loadIcbmMigrationData(walletMigrationData));
  } catch (e) {
    logger.error("Error: ", e);
    yield put(
      webNotificationUIModuleApi.actions.showError(
        createNotificationMessage(IcbmWalletMessage.ICBM_ERROR_RUNNING_MIGRATION_TOOL),
      ),
    );
    return;
  }
}

function* loadIcbmWalletMigrationSaga({ logger }: TGlobalDependencies): any {
  const ethAddress = yield select(selectIcbmWalletEthAddress);

  try {
    const userAddress = yield select(selectEthereumAddress);
    if (userAddress === ethAddress) throw new SameUserError();

    const migrationWalletData: IWalletStateData = yield neuCall(loadWalletDataAsync, ethAddress);
    const isIcbmUser = hasIcbmWallet(migrationWalletData.etherTokenICBMLockedWallet);
    if (!isIcbmUser) throw new NoIcbmWalletError();

    yield put(
      actions.icbmWalletBalanceModal.loadIcbmWalletData(
        migrationWalletData.etherTokenICBMLockedWallet,
      ),
    );
    yield put(actions.icbmWalletBalanceModal.showIcbmWalletBalanceModal());
    yield neuCall(loadIcbmWalletMigrationTransactionSaga);
  } catch (e) {
    yield put(actions.icbmWalletBalanceModal.hideIcbmWalletBalanceModal());
    logger.error("Load ICBM migration wallet", e);
    // todo: all texts to text resources
    if (e instanceof NoIcbmWalletError) {
      yield put(
        webNotificationUIModuleApi.actions.showError(
          createNotificationMessage(IcbmWalletMessage.ICBM_COULD_NOT_FIND_ADDRESS),
        ),
      );
      return;
    }
    if (e instanceof SameUserError) {
      yield put(
        webNotificationUIModuleApi.actions.showError(
          createNotificationMessage(IcbmWalletMessage.ICBM_WALLET_AND_ICBM_ADDRESSES_ARE_THE_SAME),
        ),
      );
      return;
    }
    // Default Error
    yield put(
      webNotificationUIModuleApi.actions.showError(
        createNotificationMessage(IcbmWalletMessage.ICBM_COULD_NOT_LOAD_WALLET_DATA),
      ),
    );
    return;
  }
}

function* icbmWalletMigrationTransactionWatcher({ contractsService }: TGlobalDependencies): any {
  const currentEthAddress = yield select(selectEthereumAddress);
  const icbmEthAddress = yield select(selectIcbmWalletEthAddress);
  if (currentEthAddress === icbmEthAddress) return;
  let isFirstRun = true;

  while (true) {
    // Check for first migration transaction
    const investorMigrationWallet = yield contractsService.etherLock.getInvestorMigrationWallets(
      icbmEthAddress,
    );
    // Check for second migration transaction
    const isLockedWalletConnected = yield select(selectLockedWalletConnected);

    if (isFirstRun) {
      // Second Transaction already done no need for watching transactions
      if (isLockedWalletConnected) return;
      // First Transaction Done, Go Directly to Second Step
      if (didUserConductFirstTransaction(investorMigrationWallet, currentEthAddress)) {
        yield put(actions.icbmWalletBalanceModal.startMigrationFlow());
        yield put(actions.icbmWalletBalanceModal.setMigrationStepToNextStep());
      }
      isFirstRun = false;
    } else {
      if (didUserConductFirstTransaction(investorMigrationWallet, currentEthAddress)) {
        yield put(actions.icbmWalletBalanceModal.setFirstTxDone());
        yield put(actions.icbmWalletBalanceModal.getWalletData(icbmEthAddress));
      }
      if (isLockedWalletConnected) yield put(actions.icbmWalletBalanceModal.setSecondTxDone());

      yield take(actions.web3.newBlockArrived.getType());
    }
  }
}

function* downloadICBMWalletAgreement(
  { contractsService, apiImmutableStorage, logger }: TGlobalDependencies,
  action: TActionFromCreator<typeof actions.icbmWalletBalanceModal.downloadICBMWalletAgreement>,
): any {
  const lockInstance =
    action.payload.tokenType === ETokenType.ETHER
      ? contractsService.etherLock
      : contractsService.euroLock;

  const [, , agreementUrl] = yield lockInstance.currentAgreement();
  const fileUri = hashFromIpfsLink(agreementUrl);

  try {
    const generatedDocument = yield apiImmutableStorage.getFile({
      ipfsHash: fileUri,
      mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      asPdf: true,
    });

    yield call(
      downloadLink,
      generatedDocument,
      createMessage(IcbmWalletMessage.ICBM_RESERVATION_AGREEMENT),
      ".pdf",
    );
  } catch (e) {
    logger.error("Failed to download ICBM wallet agreement", e);
    yield put(
      webNotificationUIModuleApi.actions.showError(
        createNotificationMessage(IcbmWalletMessage.ICBM_FAILED_TO_DOWNLOAD_AGREEMENT),
      ),
    );
  }
}

export function* icbmWalletGetDataSagas(): any {
  yield fork(
    neuTakeEvery,
    actions.icbmWalletBalanceModal.getWalletData,
    loadIcbmWalletMigrationSaga,
  );
  yield fork(
    neuTakeUntil,
    actions.icbmWalletBalanceModal.showIcbmWalletBalanceModal,
    actions.icbmWalletBalanceModal.hideIcbmWalletBalanceModal,
    icbmWalletMigrationTransactionWatcher,
  );
  yield fork(
    neuTakeEvery,
    actions.icbmWalletBalanceModal.downloadICBMWalletAgreement,
    downloadICBMWalletAgreement,
  );
}
