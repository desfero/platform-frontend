import * as React from "react";
import { StyleSheet } from "react-native";
import { ESignerType, TSignerRequestData } from "../../modules/signer-ui/types";
import { grayLighter2 } from "../../styles/colors";
import { spacingStyles } from "../../styles/spacings";
import { EIconType } from "../shared/Icon";
import { Text } from "../shared/typography/Text";
import { SignerContainer } from "./SignerContainer";

type TExternalProps = {
  data: TSignerRequestData[ESignerType.SIGN_MESSAGE];
  approve: () => void;
  reject: () => void;
};

const SignMessageSigner: React.FunctionComponent<TExternalProps> = ({ data, ...rest }) => (
  <SignerContainer icon={EIconType.BACKUP} headline="Sign message request" {...rest}>
    <Text style={styles.body}>Please confirm message request.</Text>
  </SignerContainer>
);

const styles = StyleSheet.create({
  body: {
    ...spacingStyles.ph3,

    textAlign: "center",
    color: grayLighter2,
  },
});

export { SignMessageSigner };
