import { call, SagaGenerator } from "@neufund/sagas";
import {
  authModuleAPI,
  coreModuleApi,
  EUserType,
  EWalletSubType,
  EWalletType,
  neuGetBindings,
} from "@neufund/shared-modules";

function* loadOrCreateUser(): SagaGenerator<void> {
  const { logger } = yield* neuGetBindings({
    logger: coreModuleApi.symbols.logger,
  });

  logger.info("Loading or creating new mobile app user");

  const walletMetadata = {
    walletType: EWalletType.MOBILE,
    walletSubType: EWalletSubType.NEUFUND,
  };

  yield* call(authModuleAPI.sagas.loadOrCreateUser, {
    walletMetadata,
    userType: EUserType.INVESTOR,
  });
}

export { loadOrCreateUser };
