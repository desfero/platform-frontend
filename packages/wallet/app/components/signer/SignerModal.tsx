import * as React from "react";
import { compose } from "recompose";
import { Text } from "react-native";

import {
  ESignerUIState,
  setupSignerUIModule,
  signerUIModuleApi,
} from "../../modules/signer-ui/module";
import { ESignerType, TSignerSignPayload } from "../../modules/signer-ui/types";
import { appConnect } from "../../store/utils";
import { BottomSheetModal } from "../shared/modals/BottomSheetModal";
import { WCSessionRequestSigner } from "./WCSessionRequestSigner";

type TStateProps = {
  state: ReturnType<typeof signerUIModuleApi.selectors.selectSignerUIState>;
  data: ReturnType<typeof signerUIModuleApi.selectors.selectSignerUIData>;
};

type TDispatchProps = {
  approve: () => void;
  reject: () => void;
};

type TExternalProps = {
  approve: () => void;
  reject: () => void;
  data: TSignerSignPayload;
};

const Signer: React.FunctionComponent<TExternalProps> = ({ data, ...rest }) => {
  switch (data.type) {
    case ESignerType.SEND_TRANSACTION:
      break;
    case ESignerType.SIGN_MESSAGE:
      break;
    case ESignerType.WC_SESSION_REQUEST:
      return <WCSessionRequestSigner data={data.data} {...rest} />;
  }
};

const SignerModalLayout: React.FunctionComponent<TStateProps & TDispatchProps> = ({
  state,
  data,
  approve,
  reject,
}) => {
  return (
    <BottomSheetModal isVisible={state !== ESignerUIState.IDLE}>
      {data && <Signer data={data} approve={approve} reject={reject} />}
    </BottomSheetModal>
  );
};

const SignerModal = compose<TStateProps & TDispatchProps, {}>(
  appConnect<TStateProps, TDispatchProps, {}, typeof setupSignerUIModule>({
    stateToProps: state => ({
      state: signerUIModuleApi.selectors.selectSignerUIState(state),
      data: signerUIModuleApi.selectors.selectSignerUIData(state),
    }),
    dispatchToProps: dispatch => ({
      approve: () => dispatch(signerUIModuleApi.actions.approved()),
      reject: () => dispatch(signerUIModuleApi.actions.denied()),
    }),
  }),
)(SignerModalLayout);

export { SignerModal };
