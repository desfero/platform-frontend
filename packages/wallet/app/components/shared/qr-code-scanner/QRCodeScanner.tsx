import React from "react";
import { StyleSheet, useWindowDimensions } from "react-native";
import RNQRCodeScanner from "react-native-qrcode-scanner";

type TExternalProps = {
  onRead: (uri: string) => void;
};

const QRCodeScanner: React.FunctionComponent<TExternalProps> = ({ onRead }) => {
  const { width, height } = useWindowDimensions();

  return (
    <RNQRCodeScanner
      topViewStyle={styles.topAndBottom}
      bottomViewStyle={styles.topAndBottom}
      cameraStyle={{ width, height }}
      onRead={e => onRead(e.data)}
    />
  );
};

const styles = StyleSheet.create({
  topAndBottom: {
    flex: 0,
  },
});

export { QRCodeScanner };
