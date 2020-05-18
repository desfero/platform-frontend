import React from "react";
import { compose } from "recompose";

import { walletConnectActions } from "../modules/wallet-connect/actions";
import { appConnect } from "../store/utils";
import { QRCodeScanner } from "./shared/qr-code-scanner/QRCodeScanner";

type TDispatchProps = {
  processURI: (uri: string) => void;
};

const QRCodeLayout: React.FunctionComponent<TDispatchProps> = ({ processURI }) => (
  <QRCodeScanner onRead={processURI} />
);

const QRCode = compose<TDispatchProps, {}>(
  appConnect<{}, TDispatchProps>({
    dispatchToProps: dispatch => ({
      processURI: uri => dispatch(walletConnectActions.connectToPeer(uri)),
    }),
  }),
)(QRCodeLayout);

export { QRCode };
