const walletConnectClientMeta = {
  // Required
  description: "Neufund App",
  url: "https://neufund.org",
  icons: ["https://walletconnect.org/walletconnect-logo.png"],
  name: "Neufund",
};

const WC_PROTOCOL = "wc";

const SESSION_REQUEST_EVENT = "session_request";
const SESSION_UPDATE_EVENT = "session_update";
const CALL_REQUEST_EVENT = "call_request";
const DISCONNECT_EVENT = "disconnect";

const ETH_SIGN_RPC_METHOD = "eth_sign";
const ETH_SEND_TRANSACTION_RPC_METHOD = "eth_sendTransaction";

const WALLET_CONNECT_SESSION_KEY = "wallet-connect-session";

export {
  walletConnectClientMeta,
  WC_PROTOCOL,
  SESSION_REQUEST_EVENT,
  SESSION_UPDATE_EVENT,
  CALL_REQUEST_EVENT,
  DISCONNECT_EVENT,
  ETH_SIGN_RPC_METHOD,
  ETH_SEND_TRANSACTION_RPC_METHOD,
  WALLET_CONNECT_SESSION_KEY,
};
