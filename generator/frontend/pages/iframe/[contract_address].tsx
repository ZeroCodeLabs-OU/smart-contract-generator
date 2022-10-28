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
import { ERC721ABI, blockExplorer,baseURL } from "@/libs/constants";
import axios from 'axios';



const Home: NextPage = () => {
  const router = useRouter();
  const { contract_address } = router.query;
  const { loading } = useCatchTxError();
  const { active, account } = useWeb3React();
  const [amount, setAmount] = useState<number>(1);
  const [txLink, setTxLink] = useState<any>(null);
  const [isWorking, setIsWorking] = useState<boolean>(false);

  const copyClipboard = (e: any = null) => {
    if (e) {
      e.preventDefault();
    }

    if (window && navigator) {
      navigator.clipboard.writeText(txLink);
      toast.success("Copied to clipboard!");
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


      const nftContract = new web3.eth.Contract(ERC721ABI, address);
      const tokens_per_mint = Number(await nftContract.methods.tokensPerMint().call());
      console.log(tokens_per_mint);

      if (amount < 1 || amount > tokens_per_mint) {
        toast.warn(
          `You can mint ${tokens_per_mint} NFTs per transaction.`
        );
        return;
      }

      const holdCount = Number(await nftContract.methods.balanceOf(account).call());
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
            setTxLink(await blockExplorer() + receipt.transactionHash)
            setAmount(1);
            toast.success("You successfully minted NFT.");
          } else {
            toast.error("Error while mint.");
          }
          setIsWorking(false);
        })
      }
      else if (isPresale) {
        console.log("inside");
        var config: any = {
          method: 'get',
          url: baseURL+`getMerkleProof?merkle=${presaleMerkleRoot}&address=${account}`,
          headers: {}
        };
        axios(config)
          .then(function (response) {           
              const proof = response.data.data;
              if (proof.length == 0) {
                toast.error("You are not in whitelist.");
                setIsWorking(false);
                return;
              }
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
                  setTxLink(await blockExplorer() + receipt.transactionHash)
                  setAmount(1);
                  toast.success("You successfully minted NFT.");
                } else {
                  toast.error("Error while mint.");
                }
                setIsWorking(false);
              })
            
          })
          .catch(function (error) {
            console.log(error);
          });

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
    })();
  }, []);

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
