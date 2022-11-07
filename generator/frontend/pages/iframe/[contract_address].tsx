import { useContext } from "react"
import type { NextPage } from "next";
import Layout from "@/components/Layout";
import Header from "@/components/Header";
import { useEffect, useState } from "react";
import { useWeb3React } from "@web3-react/core";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import { TextField } from "@material-ui/core";
import { web3 } from "@/libs/constants";
import useCatchTxError from "@/hooks/useCatchTxError";
import { ERC721ABI, ERC1155ABI, blockExplorer, baseURL } from "@/libs/constants";
import axios from 'axios';
import { CurrencyContext } from "../CurrencyProvider"
import Web3 from 'web3';


const Home: NextPage = () => {
  const router = useRouter();
  const { handleCurrencyChange, currency } = useContext(CurrencyContext);
  const { contract_address, type, curr } = router.query;
  const { loading } = useCatchTxError();
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

  const web3: any = curr === 'bsc' ? new Web3(Web3.givenProvider || "https://data-seed-prebsc-1-s1.binance.org:8545/") : curr === 'matic' ? new Web3(Web3.givenProvider || "https://matic-mumbai.chainstacklabs.com/")
    : new Web3(Web3.givenProvider || "https://goerli.infura.io/v3/321980760a974de3b28757ea69901863/");

  const switchNetwork = async (chain: any) => {
    try {
      console.log(chain,"chain")
      const chainHex = Web3.utils.toHex(chain)
      await library.provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: chainHex }],
      });
    } catch (switchError) {
      //  console.log(switchError)
      toast.warn("Please make sure you have wallet connected")
    }
  };


  const mint = async () => {
    try {
      if (!active) {
        toast.warn("Please connect wallet.");
        return;
      }

      const address: any = contract_address;

      if (web3.utils.isAddress(address) == true && address.length != 42) {
        toast.warn("Contract doesn't exist in our backend.");
        return;
      }

      setIsWorking(true);
      setTxLink(null)

      const nftContract: any = type === 'erc721' ? new web3.eth.Contract(ERC721ABI, address) : new web3.eth.Contract(ERC1155ABI, address);
      const tokens_per_mint: any = Number(await nftContract.methods.tokensPerMint().call());
      console.log(tokens_per_mint);

      if (amount < 1 || amount > tokens_per_mint) {
        toast.warn(
          `You can mint ${tokens_per_mint} NFTs per transaction.`
        );
        return;
      }

      const holdCount = type === 'erc721' ?Number(await nftContract.methods.balanceOf(account).call()) : Number(await nftContract.methods.balanceOf(account, tokenId).call());
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


      if (isPublic) {
        if (type == 'erc721') {
          nftContract.methods.mint(amount).send({ from: account, value: mintPrice * amount }, function (err: any, result: any) {
            if (err) {
              setIsWorking(false);
              toast.error("Transaction Error");

            }
            if (result) {
              setIsWorking(true);
              toast.success("Your transaction is sent. Wait for confirmation.");
            }
          }).on('receipt', async function (receipt: any) {
            console.log(receipt)
            if (receipt.status == true) {
              setTxLink(await blockExplorer(curr) + receipt.transactionHash)
              setAmount(1);
              toast.success("You successfully minted NFT.");
            } else {
              toast.error("Error while mint.");
            }
            setIsWorking(false);
          })
        } else {
          nftContract.methods.mint(amount, tokenId, "").send({ from: account, value: mintPrice * amount }, function (err: any, result: any) {
            if (err) {
              setIsWorking(false);
              toast.error("Transaction Error");

            }
            if (result) {
              setIsWorking(true);
              toast.success("Your transaction is sent. Wait for confirmation.");
            }
          }).on('receipt', async function (receipt: any) {
            console.log(receipt)
            if (receipt.status == true) {
              setTxLink(await blockExplorer(curr) + receipt.transactionHash)
              setAmount(1);
              toast.success("You successfully minted NFT.");
            } else {
              toast.error("Error while mint.");
            }
            setIsWorking(false);
          })
        }
      }
      else if (isPresale) {
        if (presaleMerkleRoot != '0000000000000000000000000000000000000000000000000000000000000000') {


          var config: any = {
            method: 'get',
            url: baseURL + `getMerkleProof?merkle=${presaleMerkleRoot}&address=${account}`,
            headers: {}
          };
          axios(config)
            .then(function (response: any) {
              console.log(response,"res")
              if (response.status == 200) {
                const proof: any = response.data.data;
                if (proof.length == 0) {
                  toast.error("You are not in whitelist.");
                  setIsWorking(false);
                  return;
                }
                if(type === 'erc721'){
                  nftContract.methods.presaleMint(amount, proof).send({ from: account, value: preSalePrice * amount }, function (err: any, result: any) {
                    if (err) {
                      setIsWorking(false);
                      toast.error("Transaction Error");
  
                    }
                    if (result) {
                      setIsWorking(true);
                      toast.success("Your transaction is sent. Wait for confirmation.");
                    }
                  }).on('receipt', async function (receipt: any) {
                    console.log(receipt)
                    if (receipt.status == true) {
                      setTxLink(await blockExplorer(curr) + receipt.transactionHash)
                      setAmount(1);
                      toast.success("You successfully minted NFT.");
                    } else {
                      toast.error("Error while mint.");
                    }
                    setIsWorking(false);
                  })
                }else{
                  nftContract.methods.presaleMint(amount, tokenId, proof).send({ from: account, value: preSalePrice * amount }, function (err: any, result: any) {
                    if (err) {
                      setIsWorking(false);
                      toast.error("Transaction Error");
  
                    }
                    if (result) {
                      setIsWorking(true);
                      toast.success("Your transaction is sent. Wait for confirmation.");
                    }
                  }).on('receipt', async function (receipt: any) {
                    console.log(receipt)
                    if (receipt.status == true) {
                      setTxLink(await blockExplorer(curr) + receipt.transactionHash)
                      setAmount(1);
                      toast.success("You successfully minted NFT.");
                    } else {
                      toast.error("Error while mint.");
                    }
                    setIsWorking(false);
                  })
                }
              }else{
                toast.error("You are not in whitelist.");
              }

            })
            .catch(function (error) {
              console.log(error);
            });

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

  useEffect(() => {
    (async () => {
      let address: any = contract_address;
      if (web3.utils.isAddress(address) == true && address.length != 42) {
        toast.error("Contract doesn't exist in our backend.");
        return
      }
      setIsWorking(false);
      handleCurrencyChange(curr, switchNetwork)
    })();
    
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
          disabled={isWorking || loading}
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
            disabled={isWorking || loading}
            type="number"
            onChange={(e) => {
              setTokenId(Number(e.target.value));
            }}
          /> : ''
        }
        <button
          className="w-20 p-3 bg-pink-500 hover:bg-pink-700 text-white font-bold mb-10"
          onClick={mint}
          disabled={isWorking || loading}
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

      {(isWorking || loading) && (
        <div className="fixed left-0 top-0 w-screen h-screen bg-orange-400 bg-opacity-30 flex flex-row justify-center items-center z-50">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-pink-500"></div>
        </div>
      )}
    </Layout>
  );
};

export default Home;
