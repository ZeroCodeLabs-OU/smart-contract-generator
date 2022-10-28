import { useWeb3React } from "@web3-react/core";
import { TAG_PROVIDER } from "@/libs/constants";
import Web3 from "web3";

const useWalletConnection = () => {
  const { active, account, chainId, library, activate, deactivate } =
    useWeb3React();

  const connectWallet = (wallet: any, callBack: any) => {
    if (!window) return;
    

    try {
      window.localStorage.clear();
      window.localStorage.setItem(Web3.givenProvider, wallet.title);
    } catch (e) {
      console.log(e);
    }

    if (callBack) {
      callBack();
    }

    activate(wallet.connector);
    
  };

  const disconnectWallet = (callBack: any) => {
    try {
      window.localStorage.clear();
    } catch (e) {
      console.log(e);
    }

    if (callBack) {
      callBack();
    }

    deactivate();
  };

  return { active, account, chainId, library, connectWallet, disconnectWallet };
};

export default useWalletConnection;