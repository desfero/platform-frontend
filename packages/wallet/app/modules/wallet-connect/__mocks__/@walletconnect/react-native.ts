import { createMock } from "../../../../utils/testUtils.specUtils";

const WalletConnect = jest.requireActual("@walletconnect/react-native");

const WC = jest.fn(() => createMock(WalletConnect, {}));

// eslint-disable-next-line import/no-default-export
export default WC;
