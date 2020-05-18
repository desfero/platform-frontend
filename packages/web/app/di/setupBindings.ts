import {
  authModuleAPI,
  coreModuleApi,
  SignatureAuthApi,
  TLibSymbolType,
} from "@neufund/shared-modules";
import { Container, ContainerModule } from "inversify";

import { IBackendRoot, IConfig } from "../config/getConfig";
import { AnalyticsApi } from "../lib/api/analytics-api/AnalyticsApi";
import { EtoApi } from "../lib/api/eto/EtoApi";
import { EtoFileApi } from "../lib/api/eto/EtoFileApi";
import { EtoNomineeApi } from "../lib/api/eto/EtoNomineeApi";
import { EtoPledgeApi } from "../lib/api/eto/EtoPledgeApi";
import { EtoProductApi } from "../lib/api/eto/EtoProductApi";
import { FileStorageApi } from "../lib/api/file-storage/FileStorageApi";
import {
  richTextEditorUploadAdapterFactory,
  TRichTextEditorUploadAdapterFactoryType,
} from "../lib/api/file-storage/RichTextEditorUploadAdapter";
import { GasApi } from "../lib/api/gas/GasApi";
import { ImmutableStorageApi } from "../lib/api/immutable-storage/ImmutableStorageApi";
import { KycApi } from "../lib/api/kyc/KycApi";
import { UsersTxApi } from "../lib/api/users-tx/UsersTxApi";
import { VaultApi } from "../lib/api/vault/VaultApi";
import {
  BroadcastChannel,
  createNewBroadcastChannel,
} from "../lib/dependencies/broadcast-channel/broadcastChannel";
import { UserActivityChannelMessage } from "../lib/dependencies/broadcast-channel/types";
import { detectBrowser, TDetectBrowser } from "../lib/dependencies/detectBrowser";
import { NotificationCenter } from "../lib/dependencies/NotificationCenter";
import { OnfidoSDK } from "../lib/dependencies/onfido/OnfidoSDK";
import { IntlWrapper } from "../lib/intl/IntlWrapper";
import { DocumentsConfidentialityAgreementsStorage } from "../lib/persistence/DocumentsConfidentialityAgreementsStorage";
import { STORAGE_JWT_KEY } from "../lib/persistence/JwtObjectStorage";
import { ObjectStorage } from "../lib/persistence/ObjectStorage";
import { Storage } from "../lib/persistence/Storage";
import { USER_JWT_KEY } from "../lib/persistence/UserStorage";
import { STORAGE_WALLET_CONNECT_KEY } from "../lib/persistence/WalletConnectStorage";
import { WalletStorage } from "../lib/persistence/WalletStorage";
import { BrowserWalletConnector } from "../lib/web3/browser-wallet/BrowserWalletConnector";
import { ContractsService } from "../lib/web3/ContractsService";
import { LedgerWalletConnector } from "../lib/web3/ledger-wallet/LedgerConnector";
import { LightWalletConnector } from "../lib/web3/light-wallet/LightWalletConnector";
import { IEthereumNetworkConfig } from "../lib/web3/types";
import { WalletConnectConnector } from "../lib/web3/wallet-connect/WalletConnectConnector";
import {
  web3BatchFactory,
  Web3BatchFactoryType,
  web3Factory,
  Web3FactoryType,
} from "../lib/web3/Web3Batch/Web3Batch";
import { Web3Manager } from "../lib/web3/Web3Manager/Web3Manager";
import {
  AsyncIntervalSchedulerFactory,
  AsyncIntervalSchedulerFactoryType,
} from "../utils/react-connected-components/AsyncIntervalScheduler";
import { symbols } from "./symbols";

export function setupBindings(config: IConfig): ContainerModule {
  return new ContainerModule(bind => {
    // functions

    bind<TDetectBrowser>(symbols.detectBrowser).toConstantValue(detectBrowser);

    // configs

    bind<IEthereumNetworkConfig>(symbols.ethereumNetworkConfig).toConstantValue(
      config.ethereumNetwork,
    );
    bind<IConfig>(symbols.config).toConstantValue(config);

    bind<IBackendRoot>(symbols.backendRootConfig).toConstantValue(config.backendRoot);

    // singletons

    bind<VaultApi>(symbols.vaultApi)
      .to(VaultApi)
      .inSingletonScope();

    bind<AnalyticsApi>(symbols.analyticsApi)
      .to(AnalyticsApi)
      .inSingletonScope();

    bind<UsersTxApi>(symbols.usersTxApi)
      .to(UsersTxApi)
      .inSingletonScope();

    bind<NotificationCenter>(symbols.notificationCenter)
      .to(NotificationCenter)
      .inSingletonScope();

    bind<OnfidoSDK>(symbols.onfidoSdk)
      .to(OnfidoSDK)
      .inSingletonScope();

    // web3 & blockchain

    bind(symbols.contractsService)
      .to(ContractsService)
      .inSingletonScope();

    bind<LedgerWalletConnector>(symbols.ledgerWalletConnector)
      .to(LedgerWalletConnector)
      .inSingletonScope();

    bind<LightWalletConnector>(symbols.lightWalletConnector)
      .to(LightWalletConnector)
      .inSingletonScope();

    bind<BrowserWalletConnector>(symbols.browserWalletConnector)
      .to(BrowserWalletConnector)
      .inSingletonScope();

    bind<WalletConnectConnector>(symbols.walletConnectConnector)
      .to(WalletConnectConnector)
      .inSingletonScope();

    bind<Web3Manager>(symbols.web3Manager)
      .to(Web3Manager)
      .inSingletonScope();

    bind<KycApi>(symbols.apiKycService)
      .to(KycApi)
      .inSingletonScope();

    bind<EtoApi>(symbols.apiEtoService)
      .to(EtoApi)
      .inSingletonScope();

    bind<EtoPledgeApi>(symbols.apiEtoPledgeService)
      .to(EtoPledgeApi)
      .inSingletonScope();

    bind<EtoProductApi>(symbols.apiEtoProductService)
      .to(EtoProductApi)
      .inSingletonScope();

    bind<EtoFileApi>(symbols.apiEtoFileService)
      .to(EtoFileApi)
      .inSingletonScope();

    bind<EtoNomineeApi>(symbols.apiEtoNomineeService)
      .to(EtoNomineeApi)
      .inSingletonScope();

    bind(symbols.fileStorageService)
      .to(FileStorageApi)
      .inSingletonScope();

    bind(symbols.apiImmutableStorage)
      .to(ImmutableStorageApi)
      .inSingletonScope();

    bind(symbols.gasApi)
      .to(GasApi)
      .inSingletonScope();

    // persistence storage
    bind<Storage>(symbols.storage).toConstantValue(new Storage(window.localStorage));

    bind<WalletStorage>(symbols.walletStorage)
      .to(WalletStorage)
      .inSingletonScope();

    bind<DocumentsConfidentialityAgreementsStorage>(
      symbols.documentsConfidentialityAgreementsStorage,
    )
      .to(DocumentsConfidentialityAgreementsStorage)
      .inSingletonScope();

    bind<ObjectStorage<string>>(symbols.jwtStorage)
      .toDynamicValue(
        ctx =>
          new ObjectStorage<string>(
            ctx.container.get(symbols.storage),
            ctx.container.get(symbols.logger),
            STORAGE_JWT_KEY,
          ),
      )
      .inSingletonScope();

    bind<ObjectStorage<string>>(symbols.userStorage)
      .toDynamicValue(
        ctx =>
          new ObjectStorage<string>(
            ctx.container.get(symbols.storage),
            ctx.container.get(symbols.logger),
            USER_JWT_KEY,
          ),
      )
      .inSingletonScope();

    bind<ObjectStorage<string>>(symbols.walletConnectStorage)
      .toDynamicValue(
        ctx =>
          new ObjectStorage<string>(
            ctx.container.get(symbols.storage),
            ctx.container.get(symbols.logger),
            STORAGE_WALLET_CONNECT_KEY,
          ),
      )
      .inSingletonScope();

    // factories

    bind<AsyncIntervalSchedulerFactoryType>(symbols.asyncIntervalSchedulerFactory).toFactory(
      AsyncIntervalSchedulerFactory,
    );

    bind<TRichTextEditorUploadAdapterFactoryType>(symbols.richTextEditorUploadAdapter).toFactory(
      richTextEditorUploadAdapterFactory,
    );

    bind<Web3FactoryType>(symbols.web3Factory).toFactory(web3Factory);

    bind<Web3BatchFactoryType>(symbols.web3BatchFactory).toFactory(web3BatchFactory);

    bind(symbols.intlWrapper).toConstantValue(new IntlWrapper());

    bind(symbols.userActivityChannel)
      .toDynamicValue(() =>
        createNewBroadcastChannel<UserActivityChannelMessage>(
          symbols.userActivityChannel.toString(),
        ),
      )
      .inSingletonScope();
  });
}

/**
 * We use plain object for injecting deps into sagas
 */
export const createGlobalDependencies = (container: Container) => ({
  // misc

  logger: container.get<TLibSymbolType<typeof coreModuleApi.symbols.logger>>(
    coreModuleApi.symbols.logger,
  ),

  detectBrowser: container.get<TDetectBrowser>(symbols.detectBrowser),
  onfidoSDK: container.get<OnfidoSDK>(symbols.onfidoSdk),

  // blockchain & wallets
  contractsService: container.get<ContractsService>(symbols.contractsService),
  web3Manager: container.get<Web3Manager>(symbols.web3Manager),
  lightWalletConnector: container.get<LightWalletConnector>(symbols.lightWalletConnector),
  browserWalletConnector: container.get<BrowserWalletConnector>(symbols.browserWalletConnector),
  ledgerWalletConnector: container.get<LedgerWalletConnector>(symbols.ledgerWalletConnector),
  walletConnectConnector: container.get<WalletConnectConnector>(symbols.walletConnectConnector),

  // storage
  jwtStorage: container.get<ObjectStorage<string>>(symbols.jwtStorage),
  walletStorage: container.get<WalletStorage>(symbols.walletStorage),
  walletConnectStorage: container.get<ObjectStorage<string>>(symbols.walletConnectStorage),
  documentsConfidentialityAgreementsStorage: container.get<
    DocumentsConfidentialityAgreementsStorage
  >(symbols.documentsConfidentialityAgreementsStorage),
  userStorage: container.get<ObjectStorage<string>>(symbols.userStorage),

  // apis
  apiKycService: container.get<KycApi>(symbols.apiKycService),
  apiEtoService: container.get<EtoApi>(symbols.apiEtoService),
  apiEtoPledgeService: container.get<EtoPledgeApi>(symbols.apiEtoPledgeService),
  apiEtoProductService: container.get<EtoProductApi>(symbols.apiEtoProductService),
  apiEtoFileService: container.get<EtoFileApi>(symbols.apiEtoFileService),
  apiEtoNomineeService: container.get<EtoNomineeApi>(symbols.apiEtoNomineeService),
  apiUserTxService: container.get<UsersTxApi>(symbols.usersTxApi),
  vaultApi: container.get<VaultApi>(symbols.vaultApi),
  analyticsApi: container.get<AnalyticsApi>(symbols.analyticsApi),
  fileStorageApi: container.get<FileStorageApi>(symbols.fileStorageService),
  gasApi: container.get<GasApi>(symbols.gasApi),
  apiImmutableStorage: container.get<ImmutableStorageApi>(symbols.apiImmutableStorage),

  intlWrapper: container.get<IntlWrapper>(symbols.intlWrapper),
  userActivityChannel: container.get<BroadcastChannel<UserActivityChannelMessage>>(
    symbols.userActivityChannel,
  ),

  // THIS IS TEMPORARY AS A QUICK SOLUTION
  signatureAuthApi: container.get<SignatureAuthApi>(authModuleAPI.symbols.signatureAuthApi),
});

export type TGlobalDependencies = ReturnType<typeof createGlobalDependencies>;
