import React, { createContext, useContext, useState } from "react";
import Web3 from "web3";
// import swal from "sweetalert"
// import { useEtherBalance, useEthers, Config } from "@usedapp/core";
// import { WalletConnectConnector } from '@web3-react/walletconnect-connector'
// import WalletConnect from "@walletconnect/client";
// import QRCodeModal from "@walletconnect/qrcode-modal";
import WalletConnectProvider  from '@walletconnect/web3-provider';


const WalletContext = createContext(null);

export const useWallet = () => useContext(WalletContext);

function WalletProvider({ children }) {
  const [walletAccount, setWalletAccount] = useState(null);
  const [wallet, setWallet] = useState({});

  const provider  = new WalletConnectProvider({
    rpc: {5: "https://goerli.infura.io/v3/321980760a974de3b28757ea69901863"},
    chainId: 5,
    bridge: "https://bridge.walletconnect.org", // Required
  });

//   const provider = new WalletConnectConnector({
//     rpc: { [56]: "https://bsc-dataseed1.binance.org/" },
//     bridge: 'https://bridge.walletconnect.org',
//     qrcode: true,
//     pollingInterval: 12000,
//   })

  const connectWalletConnect = async () => {
    // Send JSON RPC requests
    if(!provider.connected){
        await provider.enable();
    }
    subscribeToEvents();
  }

  const subscribeToEvents = () => {

    if (!provider.connected) {
      return;
    }

    // Subscribe to accounts change
      provider.on("accountsChanged", (accounts) => {
        // console.log(accounts);
      });

      // Subscribe to chainId change
      provider.on("chainChanged", (chainId) => {
        // console.log(chainId);
      });

      // Subscribe to session disconnection
      provider.on("disconnect", (code, reason) => {
        sessionStorage.removeItem("address")
        // console.log(code, reason);
        setWallet({});
      });

    if (provider.connected) {
      const { chainId, accounts } = provider;
      const address = accounts[0];
      sessionStorage.setItem("address", address)
      setWalletAccount(address)
      setWallet({
        connected: true,
        chainId,
        accounts,
        address,
      });
    }
  }

  const logout = async ()=>{
    await provider.disconnect();
    subscribeToEvents();
  }
  var web3 = new Web3(Web3.givenProvider || 'https://goerli.infura.io/v3/321980760a974de3b28757ea69901863');
  const metamaskconn = async () => {
    if (web3.givenProvider !== null) {

        web3.givenProvider.enable().then(async function (address) {
            if (parseInt(await web3.givenProvider.networkVersion) === Number(97)) {
                web3.eth.getAccounts().then(async (account) => {
                    sessionStorage.setItem("address", account[0]);
                    setWalletAccount(account[0])
                })
            } else {
                // swal(`Please select BNB testnet Wallet`, {
                //     button: false,
                //     icon: "warning"
                // })
            }
        })
        // .catch(function (err) {
        //     swal(err.message, {
        //         button: false,
        //         icon: "warning"
        //     })
        // });
    } else {
        // swal("Please install Metamask wallet", {
        //     button: false,
        //     icon: "warning"
        // });
    }
}

  return (
    <WalletContext.Provider
      value={{
        wallet,
        setWallet,
        account:  walletAccount || ( sessionStorage.address !== 'undefined' && sessionStorage.address ) ,
        connectWalletConnect,
        logout,
        metamaskconn
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export default WalletProvider;
