import { InjectedConnector } from "@web3-react/injected-connector";
import { WalletConnectConnector } from "@web3-react/walletconnect-connector";
import { WalletLinkConnector } from "@web3-react/walletlink-connector";


export const METAMASKBSC = new InjectedConnector({
  supportedChainIds: [97,5,80001],
});

export const COINBASEBSC = new WalletLinkConnector({
  url: `https://data-seed-prebsc-1-s1.binance.org:8545/`,
  supportedChainIds: [97,5,80001],
  appName: "nft-launchpad",
});

export const WALLETCONNECTBSC = new WalletConnectConnector({
  supportedChainIds: [56],
  rpc: {
    56 : "https://bsc-dataseed1.binance.org",
  },
  bridge: "https://bridge.walletconnect.org",
  qrcode: true,
});
// export const WALLETCONNECTBSC = new WalletConnectConnector({
//   // @ts-ignore
//   rpcUrl: `https://bsc-dataseed1.binance.org/`,
//   bridge: "https://bridge.walletconnect.org",
//   qrcode: true,
// });


// export const bscDetails = {
//   supportedChainIds: [97],
//   rpc: "https://mainnet.infura.io/v3/62d7de656d544930adb16c024a8694bf",  
// }
export const bscDetails = {
  supportedChainIds: [97],
  rpc: "https://bsc-dataseed1.binance.org/",  
}



//___________________________________ETH_______________________________

export const METAMASKETH = new InjectedConnector({
  supportedChainIds: [5,97,80001],
});

export const COINBASEETH = new WalletLinkConnector({
  url: `https://goerli.infura.io/v3/321980760a974de3b28757ea69901863/`,
  supportedChainIds: [5,97,80001],
  appName: "nft-launchpad",
});

export const WALLETCONNECTETH = new WalletConnectConnector({
  supportedChainIds: [1],
  rpc: {
    1 : "https://mainnet.infura.io/v3/62d7de656d544930adb16c024a8694bf",
  },
  bridge: "https://bridge.walletconnect.org",
  qrcode: true,
});
// export const WALLETCONNECTETH = new WalletConnectConnector({
//   // @ts-ignore
//   rpcUrl: "https://mainnet.infura.io/v3/62d7de656d544930adb16c024a8694bf",
//   bridge: "https://bridge.walletconnect.org",
//   qrcode: true,
// });

export const ethDetails = {
  supportedChainIds: [5],
  rpc: "https://goerli.infura.io/v3/321980760a974de3b28757ea69901863/",  
}

//___________________________________MATIC_______________________________

export const maticDetails = {
  supportedChainIds: [80001,5,97],
  rpc: "https://matic-mumbai.chainstacklabs.com/",  
}
export const METAMASKMATIC = new InjectedConnector({
  supportedChainIds: [80001,5,97],
});

export const COINBASEMATIC = new WalletLinkConnector({
  url: `https://matic-mumbai.chainstacklabs.com/`,
  supportedChainIds: [80001],
  appName: "nft-launchpad",
});

export const WALLETCONNECTMATIC = new WalletConnectConnector({
  supportedChainIds: [137],
  rpc: {
    137 : "https://polygon-mainnet.infura.io",
  },
  bridge: "https://bridge.walletconnect.org",
  qrcode: true,
});
// export const WALLETCONNECTMATIC = new WalletConnectConnector({
//   // @ts-ignore
//   rpcUrl: `https://polygon-mainnet.infura.io`,
//   bridge: "https://bridge.walletconnect.org",
//   qrcode: true,
// });

const walletconnect = new WalletConnectConnector({
  supportedChainIds: [137],
  rpc: {
    137 : "https://polygon-mainnet.infura.io",
  },
  bridge: "https://bridge.walletconnect.org",
  qrcode: true,
});





