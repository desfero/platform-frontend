import { select } from "@neufund/sagas";
import { EWalletType } from "@neufund/shared-modules";

import { TGlobalDependencies } from "../../../../di/setupBindings";
import { LightWalletWrongPassword } from "../../../../lib/web3/light-wallet/LightWallet";
import { TAppGlobalState } from "../../../../store";
import { neuCall } from "../../../sagasUtils";
import {
  selectLightWalletFromQueryString,
  selectPreviousConnectedWallet,
} from "../../../web3/selectors";
import { ILightWalletMetadata, ILightWalletRetrieveMetadata } from "../../../web3/types";
import { getVaultKey } from "../utils";

export async function retrieveMetadataFromVaultAPI(
  { vaultApi }: TGlobalDependencies,
  password: string,
  salt: string,
  email: string,
): Promise<ILightWalletRetrieveMetadata> {
  const vaultKey = await getVaultKey(salt, password);
  try {
    const vault = await vaultApi.retrieve(vaultKey);

    return {
      walletType: EWalletType.LIGHT,
      salt,
      vault,
      email,
    };
  } catch {
    throw new LightWalletWrongPassword();
  }
}

export function* getWalletMetadataByURL(
  password: string,
): Generator<unknown, ILightWalletMetadata | ILightWalletRetrieveMetadata | undefined> {
  const queryStringWalletInfo = yield* select(selectLightWalletFromQueryString);

  if (queryStringWalletInfo) {
    return yield* neuCall(
      retrieveMetadataFromVaultAPI,
      password,
      queryStringWalletInfo.salt,
      queryStringWalletInfo.email,
    );
  }
  const savedMetadata = yield* select((s: TAppGlobalState) =>
    selectPreviousConnectedWallet(s.web3),
  );
  if (savedMetadata && savedMetadata.walletType === EWalletType.LIGHT) {
    return savedMetadata;
  }

  return undefined;
}
