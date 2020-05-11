import WalletConnect from "@walletconnect/browser";
import WalletConnectQRCodeModal from "@walletconnect/qrcode-modal";
import { IConnector, IWCRpcConnectionOptions } from "@walletconnect/types";
import * as HookedWalletSubprovider from "web3-provider-engine/subproviders/hooked-wallet";

export class WalletConnectSubprovider extends HookedWalletSubprovider {
  private _connected = false;
  private _isConnecting = false;
  private _wc: WalletConnect;

  public bridge: string;
  public qrcode: boolean;
  public chainId: number;

  constructor(opts: IWCRpcConnectionOptions) {
    super({
      getAccounts: async (cb: any) => {
        try {
          const wc = await this.getConnectedConnector();
          const accounts = wc.accounts;
          if (accounts && accounts.length) {
            cb(null, accounts);
          } else {
            cb(new Error("Failed to get accounts"));
          }
        } catch (error) {
          cb(error);
        }
      },
      processMessage: async (msgParams: { from: string; data: string }, cb: any) => {
        try {
          const wc = await this.getConnectedConnector();
          const result = await wc.signMessage([msgParams.from, msgParams.data]);
          cb(null, result);
        } catch (error) {
          cb(error);
        }
      },
      processPersonalMessage: async (msgParams: { from: string; data: string }, cb: any) => {
        try {
          const wc = await this.getConnectedConnector();
          const result = await wc.signPersonalMessage([msgParams.data, msgParams.from]);
          cb(null, result);
        } catch (error) {
          cb(error);
        }
      },
      processSignTransaction: async (txParams: any, cb: any) => {
        try {
          const wc = await this.getConnectedConnector();
          const result = await wc.signTransaction(txParams);
          cb(null, result);
        } catch (error) {
          cb(error);
        }
      },
      processTransaction: async (txParams: any, cb: any) => {
        try {
          const wc = await this.getConnectedConnector();
          const result = await wc.sendTransaction(txParams);
          cb(null, result);
        } catch (error) {
          cb(error);
        }
      },
      processTypedMessage: async (msgParams: { from: string; data: string | object }, cb: any) => {
        try {
          const wc = await this.getConnectedConnector();
          const result = await wc.signTypedData([msgParams.from, msgParams.data]);
          cb(null, result);
        } catch (error) {
          cb(error);
        }
      },
    });

    this.bridge = opts.bridge!;
    this.chainId = typeof opts?.chainId !== "undefined" ? opts?.chainId : 1;
    // TODO: qrcode must go from here! there's `display_uri` event which should be used to show qr code dialog
    // whenever connect/reconnect is required
    this.qrcode = typeof opts?.qrcode === "undefined" || opts?.qrcode !== false;

    this._wc = new WalletConnect({ bridge: this.bridge });
  }

  get isWalletConnect(): boolean {
    return true;
  }

  get connected(): boolean {
    return this._connected;
  }

  get walletConnector(): IConnector {
    return this._wc;
  }

  getConnectedConnector(): Promise<IConnector> {
    return new Promise((resolve, reject) => {
      const wc = this._wc;

      if (this._isConnecting) {
        reject(new Error("already connecting"));
      } else if (!wc.connected) {
        // start new connection
        this._isConnecting = true;
        const sessionRequestOpions = this.chainId ? { chainId: this.chainId } : undefined;

        wc.createSession(sessionRequestOpions)
          .then(() => {
            WalletConnectQRCodeModal.open(wc.uri, () => {
              reject(new Error("User closed WalletConnect modal"));
            });
            wc.on("disconnect", () => {
              // active only if connecting
              if (this._isConnecting) {
                if (this.qrcode) {
                  WalletConnectQRCodeModal.close();
                }
                this._isConnecting = false;
                reject(new Error("client rejected"));
              }
            });
            wc.on("connect", (error: Error | null, _: any) => {
              if (this.qrcode) {
                WalletConnectQRCodeModal.close();
              }
              this._isConnecting = false;
              if (error) {
                return reject(error);
              }

              this._connected = true;
              resolve(wc);
            });
          })
          .catch((error: any) => {
            this._isConnecting = false;
            reject(error);
          });
      } else {
        // session restored from storage - treated as connected
        if (!this.connected) {
          this._connected = true;
        }
        resolve(wc);
      }
    });
  }
}
