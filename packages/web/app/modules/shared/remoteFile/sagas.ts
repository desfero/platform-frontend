import { fork, put } from "@neufund/sagas";
import { IHttpResponse } from "@neufund/shared-modules";

import { RemoteFileMessage } from "../../../components/translatedMessages/messages";
import { createNotificationMessage } from "../../../components/translatedMessages/utils";
import { TGlobalDependencies } from "../../../di/setupBindings";
import { TFileDescription } from "../../../lib/api/file-storage/FileStorage.interfaces";
import { TAction } from "../../actions";
import { webNotificationUIModuleApi } from "../../notification-ui/module";
import { neuTakeEvery } from "../../sagasUtils";

function* getRemoteFile({ fileStorageApi, logger }: TGlobalDependencies, action: TAction): any {
  if (action.type !== "REMOTE_FILE_GET") return;
  const { fileUrl, onDone } = action.payload;

  try {
    const fileData: IHttpResponse<TFileDescription> = yield fileStorageApi.getFile(fileUrl);

    onDone(undefined, fileData.body);
  } catch (e) {
    logger.error("get remote file error", e);
    yield put(
      webNotificationUIModuleApi.actions.showError(
        createNotificationMessage(RemoteFileMessage.GET_FILES_DETAILS_ERROR),
      ),
    );
    onDone(e, undefined);
  }
}

export function* remoteFileSagas(): any {
  yield fork(neuTakeEvery, "REMOTE_FILE_GET", getRemoteFile);
}
