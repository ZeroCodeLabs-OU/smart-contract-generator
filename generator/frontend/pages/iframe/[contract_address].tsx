import { useContext, useMemo } from "react"
import type { NextPage } from "next";
import Layout from "@/components/Layout";
import Header from "@/components/Header";
import { useEffect, useState, useRef } from "react";
import { useWeb3React } from "@web3-react/core";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import { TextField } from "@material-ui/core";
import { ERC721ABI, ERC1155ABI, blockExplorer, baseURL, rpcURL } from "@/libs/constants";
import axios from 'axios';
import { CurrencyContext } from "../CurrencyProvider"
import Web3 from 'web3';


const Home: NextPage = () => {
  const router = useRouter();
  const { handleCurrencyChange } = useContext(CurrencyContext);
  const { contract_address, type, curr } = router.query
  const { active, account, library } = useWeb3React();
  const [amount, setAmount] = useState<number>(1);
  const [txLink, setTxLink] = useState<any>(null);
  const [isWorking, setIsWorking] = useState<boolean>(false);
  const [tokenId, setTokenId] = useState<number>(1);
  const copyClipboard = (e: any = null) => {
    if (e) {
      e.preventDefault();
    }
    if (window && navigator) {
      navigator.clipboard.writeText(txLink);
      toast.success("Copied to clipboard!");
    }
  };

  const switchNetwork = async (chain: any) => {
    try {
      const chainHex = Web3.utils.toHex(chain)
      await library.provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: chainHex }],
      });
    } catch (switchError) {
      toast.warn("Please make sure you have wallet connected")
    }
  };

  const web3: any = new Web3(Web3.givenProvider || rpcURL(curr));

  const sendCallBack:any = async(err:any,res:any)=>{
    if (err) {
      setIsWorking(false);
    }
    if (res) {
      setIsWorking(true);
      toast.success("Your transaction is sent. Wait for confirmation.");
    }
  }

  const onReceipt:any = async(receipt:any)=>{
    if (receipt.status == true) {
      setTxLink(await blockExplorer(curr) + "/tx/"+ receipt.transactionHash)
      setAmount(1);
      toast.success("You successfully minted NFT.");
    } else {
      toast.error("Error while mint.");
    }
    setIsWorking(false);
  }

  const mint = async () => {
    try {
      const address: any = contract_address;
      if (!active) {
        toast.warn("Please connect wallet.");
        return;
      }     
      if (web3.utils.isAddress(address) == true && address.length != 42) {
        toast.warn("Contract doesn't exist in our backend.");
        return;
      }
      setIsWorking(true);
      setTxLink(null)
      
      const nftContract: any = type === 'erc721' ? new web3.eth.Contract(ERC721ABI, address) : new web3.eth.Contract(ERC1155ABI, address);
      
      const tokens_per_mint: any = Number(await nftContract.methods.tokensPerMint().call());

      if (amount < 1 || amount > tokens_per_mint) {
        toast.warn(
          `You can mint ${tokens_per_mint} NFTs per transaction.`
        );
        return;
      }

     

      const holdCount:any = type === 'erc721' ? Number(await nftContract.methods.balanceOf(account).call()) : Number(await nftContract.methods.balanceOf(account, tokenId).call());
      if(type == 'erc1155'){
        const tokenIdSupply:any = await nftContract.methods.totalSupply(tokenId).call();
        const tokenQuantity : any = await nftContract.methods.tokenQuantity().call();
        if(tokenIdSupply  > tokenQuantity){
          toast.warn("Token Id limit exceeds")
          return;
        }
      }
      const maxSupply:any = await nftContract.methods.maxSupply().call();
      const reserve:any  = await nftContract.methods.reserveRemaining().call();
      
      if(type == 'erc721'){
        let totalSupply:any = await nftContract.methods.totalSupply().call();
        if(totalSupply + amount > maxSupply - reserve){
          toast.error(
            `Exceeds Max Supply`
          );
          setIsWorking(false);
          return;
        }
      }else{
        let mintedTokens = await nftContract.methods.viewMintedTokenLength().call();
        console.log(mintedTokens,maxSupply,reserve, mintedTokens <= maxSupply - reserve,"gh")
        if(mintedTokens >= maxSupply - reserve){
          toast.error(
            `Exceeds Max Supply`
          );
          setIsWorking(false);
          return;
        }
      }
      
      const tokens_per_person = Number(await nftContract.methods.tokensPerPerson().call());
      if (holdCount + amount > tokens_per_person) {
        toast.warn(
          `You can not mint more than ${tokens_per_person} NFTs.`
        );
        setIsWorking(false);
        return;
      }

      const isPresale = await nftContract.methods.presaleActive().call();
      const isPublic = await nftContract.methods.mintingActive().call();
      const mintPrice = await nftContract.methods.publicMintPrice().call();
      const preSalePrice = await nftContract.methods.presaleMintPrice().call();
      const presaleMerkleRoot = await nftContract.methods.presaleMerkleRoot().call();
      const balance = await web3.eth.getBalance(account);
      

      if (isPublic) {
        if (balance > mintPrice * amount) {
          if (type == 'erc721') {
            nftContract.methods.mint(amount).send({ from: account, value: mintPrice * amount }, sendCallBack).on('error', function (error: any) {
              setIsWorking(false);
              toast.error("Error while mint the NFT. Try Again!.");
            }).on("receipt",onReceipt)
          } else {
            
            nftContract.methods.mint(amount, tokenId, "0x00").send({ from: account, value: mintPrice * amount }, sendCallBack).on('error', function (error: any) {
              setIsWorking(false);
              toast.error("Error while mint the NFT. Try Again!.");
            }).on('receipt', onReceipt)
          }
        } else {
          toast.error("Insufficient funds");
        }
      }
      else if (isPresale) {
        if (presaleMerkleRoot != '0000000000000000000000000000000000000000000000000000000000000000') {
          let config: any = {
            method: 'get',
            url: baseURL + `getMerkleProof?merkle=${presaleMerkleRoot}&address=${account}`,
            headers: {}
          };
          axios(config).then(function (response: any) {
              console.log(response, "res")
              if (response.status == 200) {
                const proof: any = response.data.data;
                if (proof.length == 0) {
                  toast.error("You are not in whitelist.");
                  setIsWorking(false);
                  return;
                }
                if (balance > preSalePrice * amount) {
                  if (type === 'erc721') {
                    nftContract.methods.presaleMint(amount, proof).send({ from: account, value: preSalePrice * amount }, sendCallBack).on('error', function () {
                      setIsWorking(false);
                      toast.error("Error while mint the NFT. Try Again!.");
                    }).on('receipt', onReceipt)
                  } else {
                    
                    nftContract.methods.presaleMint(amount, tokenId, proof).send({ from: account, value: preSalePrice * amount }, sendCallBack).on('error', function (error: any) {
                      setIsWorking(false);
                      toast.error("Error while mint the NFT. Try Again!.");
                    }).on('receipt', onReceipt)
                  }
                } else {
                  toast.error("Insufficient Funds");
                }
              } else {
                toast.error("You are not in whitelist.");
              }

            })
            .catch(function (error: any) {
              console.log(error);
            });

        } else {
          toast.warn("You are not whitelisted")
        }

      }
      else {
        toast.warn("Minting is not started yet.");
        setIsWorking(false);
        return;
      }

    } catch (e) {
      console.log(e);
    } finally {
      setIsWorking(false);
    }
  };
  const isValid = async (address:string) =>{
    try {
      const ERC1155InterfaceId: string = "0xd9b67a26";
      const ERC721InterfaceId: string = "0x80ac58cd";
      const web3: any = new Web3(await rpcURL(curr));
      console.log(rpcURL(curr));
      if(type == 'erc721') {
        const nft721Contract: any = new web3.eth.Contract(ERC721ABI, address) 
        const is721 = await nft721Contract.methods.supportsInterface(ERC721InterfaceId).call()
        console.log(is721);
        return is721 ? "Valid 721" : false
      }
      if(type == 'erc1155') {
        const nft1155Contract: any = new web3.eth.Contract(ERC1155ABI, address) 
        const is1155 = await nft1155Contract.methods.supportsInterface(ERC1155InterfaceId).call()
        return is1155 ? "Valid 1155" : false
      }
      return false
    } catch(e:any) {
      console.log(e);
      return false
    }
    
  }
  useEffect(() => {
    if (curr !== undefined) {
      const web3: any = new Web3(Web3.givenProvider || rpcURL(curr));
      const address: any = contract_address;
      
      isValid(address).then((res)=>{
        if(!res) {
          toast.error("Contract is not valid");
          setIsWorking(true);
        } else {
          console.log(res); 
          setIsWorking(false);
          handleCurrencyChange(curr, switchNetwork)
        }
      })
      
    }
  }, [curr]);
  
  return (
    <Layout>
      <Header />
      <div className="w-full h-full flex flex-col justify-center items-center space-y-5 py-10">
        
        <TextField
          required
          id="input-amount"
          label="Amount"
          className="w-20"
          value={amount}
          disabled={isWorking}
          type="number"
          onChange={(e) => {
            setAmount(Number(e.target.value));
          }}
        />

        {type === 'erc1155' ?
          <TextField
            required
            id="input-amount"
            label="TokenId"
            className="w-20"
            value={tokenId}
            disabled={isWorking}
            type="number"
            onChange={(e) => {
              setTokenId(Number(e.target.value));
            }}
          /> : ''
        }
        <button
          className="w-20 p-3 bg-pink-500 hover:bg-pink-700 text-white font-bold mb-10"
          onClick={mint}
          disabled={isWorking}
        >
          MINT
        </button>
      </div>
      {
        txLink != null ?

          <div className="block w-full cursor-pointer select-none p-5 border border-gray-500 rounded-md hover:bg-gray-100 whitespace-pre-wrap overflow-hidden" style={{ padding: "20px 95px", maxWidth: "1000px", margin: "auto" }} onClick={copyClipboard}>
            {txLink}
          </div> : ""
      }

      {(isWorking) && (
        <div className="fixed left-0 top-0 w-screen h-screen bg-orange-400 bg-opacity-30 flex flex-row justify-center items-center z-50">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-pink-500"></div>
        </div>
      )}
    </Layout>
  );
};

export default Home;
