import { assertNever } from "@neufund/shared-utils";
import * as React from "react";
import { compose } from "recompose";

import {
  ESignerUIState,
  setupSignerUIModule,
  signerUIModuleApi,
} from "../../../modules/signer-ui/module";
import { ESignerType, TSignerSignPayload } from "../../modules/signer-ui/types";
import { appConnect } from "../../../store/utils";
import { BottomSheetModal } from "../../shared/modals/BottomSheetModal";
import { SendTransactionSigner } from "./SendTransactionSigner";
import { SignMessageSigner } from "./SignMessageSigner";
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
  request: TSignerSignPayload;
};

const Signer: React.FunctionComponent<TExternalProps> = ({ request, ...rest }) => {
  switch (request.type) {
    case ESignerType.SEND_TRANSACTION:
      return <SendTransactionSigner data={request.data} {...rest} />;
    case ESignerType.SIGN_MESSAGE:
      return <SignMessageSigner data={request.data} {...rest} />;
    case ESignerType.WC_SESSION_REQUEST:
      return <WCSessionRequestSigner data={request.data} {...rest} />;
    default:
      assertNever(request);
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
      {data && <Signer request={data} approve={approve} reject={reject} />}
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
