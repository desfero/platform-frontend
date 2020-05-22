import { storiesOf } from "@storybook/react-native";
import * as React from "react";
import { Text, Button } from "react-native";

import { BottomSheetModal } from "./BottomSheetModal";

const ModalWithButton = () => {
  const [isVisible, setIsVisible] = React.useState(true);

  return (
    <>
      <Button onPress={() => setIsVisible(true)} title="Show" />

      <BottomSheetModal isVisible={isVisible}>
        <Text>Modal content</Text>

        <Button onPress={() => setIsVisible(false)} title="Hide" />
      </BottomSheetModal>
    </>
  );
};

storiesOf("Atoms|BottomSheetModal", module).add("default", () => <ModalWithButton />);
