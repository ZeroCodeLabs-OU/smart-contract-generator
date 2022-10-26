import { InjectedConnector } from "@web3-react/injected-connector";
import { WalletConnectConnector } from "@web3-react/walletconnect-connector";
import { WalletLinkConnector } from "@web3-react/walletlink-connector";

export const METAMASK = new InjectedConnector({
  supportedChainIds: [1, 3, 4, 5, 42, 97],
});

export const COINBASE = new WalletLinkConnector({
  url: `https://mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_KEY}`,
  appName: "nft-launchpad",
});

export const WALLETCONNECT = new WalletConnectConnector({
  // @ts-ignore
  rpcUrl: `https://mainnet.infura.io/v3/${process.env.INFURA_KEY}`,
  bridge: "https://bridge.walletconnect.org",
  qrcode: true,
});
