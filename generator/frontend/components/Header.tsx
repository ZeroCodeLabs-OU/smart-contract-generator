import { useEffect, useState, useContext } from "react";
import Modal from "@mui/material/Modal";
import { toast } from "react-toastify";
import {  WALLETS } from "@/libs/constants";
import { truncateAddress } from "@/libs/utils";
import { useWeb3React} from "@web3-react/core";
import * as CurrencyValues from "../libs/connectors"
import { CurrencyContext } from "../pages/CurrencyProvider"
import Image from "next/image";
import Web3 from "web3";


const Header = ({ }) => {

  const { activate, deactivate ,account} = useWeb3React();
  const { currency } = useContext(CurrencyContext);
  const [isOpenConnectModal, setIsOpenConnectModal] = useState<boolean>(false);
  const [wallet, setWallet] = useState<any>(null);

  const [currencyDetails, setCurrencyDetails] = useState<any>({
    node: 'goerli',
    rpcUrl: 'https://goerli.infura.io/v3/321980760a974de3b28757ea69901863/',
    networkType:"GOERLI",
    chainId : 5,
    blockexplorer: "https://goerli.etherscan.io",
    MetaMaskConnector: CurrencyValues.METAMASKETH,
    CoinBaseConnector: CurrencyValues.COINBASEETH,
    WalletConnector: CurrencyValues.WALLETCONNECTETH,
    walletConnectChainId:1,
    walletConnectRpc:"https://mainnet.infura.io/v3/62d7de656d544930adb16c024a8694bf",
    walletConnectExplorer:"https://etherscan.io/",
    chainName:"ETHER",
    name:"ETH",
    symbol:"ETH"

  });

  const switchNetwork = async (chain:any,provider:any) => {
    return new Promise(async(resolve, reject)=>{
      try {
        const chainHex = Web3.utils.toHex(chain)
        await provider.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: chainHex }],
        });
        resolve(true)
      } catch (switchError:any) {
        reject(false)
      }
    })
    
  };

  const ConnectWallet = () =>{
    activate(currencyDetails.WalletConnector,(error:Error)=>{
      console.error(error)
    });
  };

  const connectMetaMask = async() => {
    const { ethereum } = window;

    if (!ethereum?.providers) {
      toast.warn("Please install Metamask wallet");
      setIsOpenConnectModal(false);
      return undefined;
    }
    const provider = ethereum.providers.find(({ isMetaMask }:any) => isMetaMask);
    if (provider){
      setWallet(WALLETS[0].icon);
      ethereum.setSelectedProvider(provider);
      const web3 = new Web3(provider || currencyDetails.rpcUrl);
      let chainNo = currency === "eth" ? 5 : currency === "bsc" ? 97 : currency === "matic" ? 80001 : 5 ;
      const chainId = await web3.eth.getChainId();
      if(chainNo === currencyDetails.chainId && currencyDetails.chainId === Number(chainId)){
        activate(currencyDetails.MetaMaskConnector,(error:Error)=>{
          if(error){
            toast.warn("Please make sure you have wallet installed and connected to the same network")
          }
        });
        setIsOpenConnectModal(false);
      }else{
        const hasSetup = await switchNetwork(chainNo, provider);
        setIsOpenConnectModal(false);
        if(hasSetup){
          activate(currencyDetails.MetaMaskConnector,(error:Error)=>{
            if(error){
              toast.warn("Please make sure you have wallet installed and connected to the same network")
            }
          });
        }else{
          toast.warn(`Please select ${currencyDetails.networkType} Wallet`)
        }
        
        
      }
    }else{
      toast.warn("Please install Metamask wallet");
      setIsOpenConnectModal(false);
    }
  };

  const connectCoinBase = async() => {
    const { ethereum } = window;

    if (!ethereum?.providers) {
      toast.warn("Please install Coinbase wallet");
      setIsOpenConnectModal(false);
        return undefined;
    }
    const provider = ethereum.providers.find(({ isCoinbaseWallet }:any) => isCoinbaseWallet);
    if (provider){
      setWallet(WALLETS[1].icon)
      ethereum.setSelectedProvider(provider);
      const web3 = new Web3(provider || currencyDetails.rpcUrl);
      
      let chainNo = currency === "eth" ? 5 : currency === "bsc" ? 97 : currency === "matic" ? 80001 : 5 ;
      const chainId = await provider.getChainId();
      if(chainNo === currencyDetails.chainId && currencyDetails.chainId === Number(chainId)){
        
        activate(currencyDetails.CoinBaseConnector,(error:Error)=>{
          if(error){
            toast.warn("Please make sure you have wallet installed and connected to the same network")
          }
        });
        setIsOpenConnectModal(false);
      }else{
        const hasSetup = await switchNetwork(chainNo, provider);
        setIsOpenConnectModal(false);
        if(hasSetup){
          activate(currencyDetails.MetaMaskConnector,(error:Error)=>{
            if(error){
              toast.warn("Please make sure you have wallet installed and connected to the same network")
            }
          });
        }else{
          toast.warn(`Please select ${currencyDetails.networkType} Wallet`)
        }
      }
    }else{
      toast.warn("Please install Metamask wallet");
      setIsOpenConnectModal(false);
    }
  };

  const disconnect = async() => {
    deactivate()
  };

  const copyAddress = () => {
    if (!account || !navigator) return;
    navigator.clipboard.writeText(account);
    toast.success("Copied to clipboard.");
  };

  useEffect(()=>{
    async function setData(){
      switch (currency) {
        case "eth":
          setCurrencyDetails({
                node: 'goerli',
                rpcUrl: 'https://goerli.infura.io/v3/62d7de656d544930adb16c024a8694bf',
                networkType:"GOERLI",
                chainId : 5,
                blockexplorer: "https://goerli.etherscan.io",
                MetaMaskConnector: CurrencyValues.METAMASKETH,
                CoinBaseConnector: CurrencyValues.COINBASEETH,
                WalletConnector: CurrencyValues.WALLETCONNECTETH,
                walletConnectChainId:1,
                walletConnectRpc:"https://mainnet.infura.io/v3/62d7de656d544930adb16c024a8694bf",
                walletConnectExplorer:"https://etherscan.io/",
                chainName:"ETHER",
                name:"ETH",
                symbol:"ETH"
              });
          break;
        case "bsc":
          setCurrencyDetails({
                node: 'private',
                rpcUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545/',
                networkType:"BINANCE",
                chainId : 97,
                blockexplorer: "https://testnet.bscscan.com",
                MetaMaskConnector: CurrencyValues.METAMASKBSC,
                CoinBaseConnector: CurrencyValues.COINBASEBSC,
                WalletConnector: CurrencyValues.WALLETCONNECTBSC,
                walletConnectChainId:56,
                walletConnectRpc:"https://bsc-dataseed1.binance.org/",
                walletConnectExplorer:"https://bscscan.com/",
                chainName:"BINANCE",
                name:"BNB",
                symbol:"BNB"
              });
          break;
          case "matic":
            setCurrencyDetails({
                node: 'private',
                rpcUrl: 'https://matic-mumbai.chainstacklabs.com',
                networkType:"MATIC",
                chainId : 80001,
                blockexplorer: "https://mumbai.polygonscan.com",
                MetaMaskConnector: CurrencyValues.METAMASKMATIC,
                CoinBaseConnector: CurrencyValues.COINBASEMATIC,
                WalletConnector: CurrencyValues.WALLETCONNECTMATIC,
                walletConnectChainId:137,
                walletConnectRpc:"https://polygon-mainnet.infura.io",
                walletConnectExplorer:"https://polygonscan.com/",
                chainName:"POLYGON",
                name:"MATIC",
                symbol:"MATIC"
              });
          break;
        default:
          setCurrencyDetails({
                  node: 'goerli',
                  rpcUrl: 'https://goerli.infura.io/v3/321980760a974de3b28757ea69901863/',
                  networkType:"GOERLI",
                  chainId : 5,
                  blockexplorer: "https://goerli.etherscan.io",
                  MetaMaskConnector: CurrencyValues.METAMASKETH,
                  CoinBaseConnector: CurrencyValues.COINBASEETH,
                  WalletConnector: CurrencyValues.WALLETCONNECTETH,
                  walletConnectChainId:1,
                  walletConnectRpc:"https://mainnet.infura.io/v3/62d7de656d544930adb16c024a8694bf",
                  walletConnectExplorer:"https://etherscan.io/",
                  chainName:"ETHER",
                  name:"ETH",
                  symbol:"ETH"
                }); 
                // switchNetwork(5); 
      }
    }
    setData();
  },[currency])

  return (
    <div className="w-full flex flex-row justify-between items-center space-x-5 px-5 py-2 bg-orange-400 z-50">
      <div className="relative w-32 h-8 flex flex-row">
        <Image src="/images/icons/icon-zero-code.png" layout="fill" alt="Icon" />
      </div>
      <div className="flex flex-row justify-between align-center space-x-5">
        {account ? (
          <>
            <div className="hidden flex-row space-x-2 justify-center items-center md:flex">
              <img className="w-5 h-5 object-fill" src={wallet} alt="Icon"/>
              <p
                className="text-base text-left text-white font-semibold font-raleway cursor-pointer"
                onClick={copyAddress}
              >
                {truncateAddress(account)}
              </p>
              <p className="text-xs text-left text-white font-semibold font-raleway">
                (&nbsp;
                  {currencyDetails.networkType}
              </p>
            </div>
            <button
              onClick={disconnect}
              className="px-5 py-3 text-base text-white font-semibold font-raleway bg-pink-500 hover:bg-white hover:text-black transition duration-500"
            >
              Disconnect
            </button>
          </>
        ) : (
          <button
          onClick={() => setIsOpenConnectModal(true)}
          className="px-5 py-3 text-base text-white font-semibold font-raleway bg-pink-500 hover:bg-white hover:text-black transition duration-500"
        >
          Connect Wallet
        </button>
          
        )}
      </div>

      <Modal
        open={isOpenConnectModal}
        onClose={() => setIsOpenConnectModal(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <div className="absolute top-1/2 left-1/2 w-max -translate-x-1/2 -translate-y-1/2 bg-pink-500 flex flex-col space-y-5 justify-center items-start p-5 z-50">
          {WALLETS.map((wallet, index) => {
            return (
              <div
                className="flex flex-row w-full justify-start items-center p-2 space-x-5 cursor-pointer text-white rounded-md bg-pink-500 hover:bg-white hover:text-black transition duration-500"
                key={index}
                onClick={wallet.title === "Metamask" ? connectMetaMask : wallet.title === "Coinbase" ? connectCoinBase : ConnectWallet }
              >
                <img className="w-8 h-8 object-fill" src={wallet.icon}  alt="Icon"/>
                <p className="text-left text-xl font-semibold font-raleway">
                  {wallet.title}
                </p>
              </div>
            );
          })}
        </div>
      </Modal>
    </div>
  );
};

export default Header;
