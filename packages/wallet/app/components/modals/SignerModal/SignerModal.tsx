import * as React from "react";
import { Modal, StyleSheet, Text, View } from "react-native";
import { compose } from "recompose";

import {
  ESignerUIState,
  setupSignerUIModule,
  signerUIModuleApi,
} from "../../../modules/signer-ui/module";
import { appConnect } from "../../../store/utils";
import { Button, EButtonLayout } from "../../shared/buttons/Button";

type TStateProps = {
  state: ReturnType<typeof signerUIModuleApi.selectors.selectSignerUIState>;
  data: ReturnType<typeof signerUIModuleApi.selectors.selectSignerUIData>;
};

type TDispatchProps = {
  approve: () => void;
  reject: () => void;
};

const SignerModalLayout: React.FunctionComponent<TStateProps & TDispatchProps> = ({
  state,
  data,
  approve,
  reject,
}) => (
  <Modal animationType="slide" transparent={false} visible={state !== ESignerUIState.IDLE}>
    <View style={styles.container}>
      <Text>
        Signing state: {state}
        {"\n"}
        Signing data: {JSON.stringify(data, undefined, 2)}
      </Text>

      <Button layout={EButtonLayout.PRIMARY} onPress={approve}>
        Accept
      </Button>
      <Button layout={EButtonLayout.TEXT} onPress={reject}>
        Reject
      </Button>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  container: { paddingVertical: 40, paddingHorizontal: 20, flex: 1, justifyContent: "center" },
});

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
