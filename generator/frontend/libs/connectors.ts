import { InjectedConnector } from "@web3-react/injected-connector";
import { WalletConnectConnector } from "@web3-react/walletconnect-connector";
import { WalletLinkConnector } from "@web3-react/walletlink-connector";

export const METAMASK = new InjectedConnector({
  supportedChainIds: [97,56],
});

export const COINBASE = new WalletLinkConnector({
  url: `https://bsc-dataseed1.binance.org/`,
  appName: "nft-launchpad",
});

export const WALLETCONNECT = new WalletConnectConnector({
  // @ts-ignore
  rpcUrl: `https://bsc-dataseed1.binance.org/`,
  bridge: "https://bridge.walletconnect.org",
  qrcode: true,
});
