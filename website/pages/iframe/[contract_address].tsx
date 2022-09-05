import type { NextPage } from "next";
import Layout from "@/components/Layout";
import Header from "@/components/Header";
import { useEffect, useState } from "react";
import { useWeb3React } from "@web3-react/core";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import { FormControl, TextField } from "@material-ui/core";
import { Contract } from "@ethersproject/contracts";
import { CONTRACT_ABI } from "@/libs/constants";
import useCatchTxError from "@/hooks/useCatchTxError";
import { ethers } from "ethers";

const Home: NextPage = () => {
  const router = useRouter();
  const { contract_address } = router.query;
  const { fetchWithCatchTxError, loading } = useCatchTxError();
  const { active, account, library } = useWeb3React();
  const [contractInfo, setContractInfo] = useState<any>(null);
  const [amount, setAmount] = useState<number>(1);
  const [txLink, setTxLink] = useState<string>("");
  const [isWorking, setIsWorking] = useState<boolean>(false);

  const mint = async () => {
    try {
      if (!active) {
        toast.warn("Please connect wallet.");
        return;
      }

      if (!contract_address) {
        toast.warn("Contract doesn't exist in our backend.");
        return;
      }

      if (amount < 1 || amount > contractInfo.tokens_per_mint) {
        toast.warn(
          `You can mint less than ${contractInfo.tokens_per_mint} NFTs per transaction.`
        );
        return;
      }

      setIsWorking(true);

      const nftContract = new Contract(
        contractInfo.contract_address,
        CONTRACT_ABI,
        library.getSigner()
      );

      const holdCount = Number(await nftContract.balanceOf(account));
      if (holdCount + amount > contractInfo.tokens_per_person) {
        toast.warn(
          `You can not mint more than ${contractInfo.tokens_per_person} NFTs.`
        );
        setIsWorking(false);
        return;
      }

      const isPresale = await nftContract.presaleActive();
      const isPublic = await nftContract.mintingActive();

      let tx = null;

      if (isPublic) {
        tx = await fetchWithCatchTxError(() => {
          return nftContract.mint(amount, {
            value: ethers.utils.parseEther(
              `${Number(contractInfo.mint_price) * amount}`
            ),
          });
        });
      } else if (isPresale) {
        const proof = await getMerkleProof();
        if (!proof) {
          toast.error("You are not in whitelist.");
          setIsWorking(false);
          return;
        }
        tx = await fetchWithCatchTxError(() => {
          return nftContract.presaleMint(amount, proof, {
            value: ethers.utils.parseEther(
              `${Number(contractInfo.presale_mint_price) * amount}`
            ),
          });
        });
      } else {
        toast.warn("Minting is not started yet.");
        setIsWorking(false);
        return;
      }

      if (tx) {
        toast.success("You successfully minted NFT.");
      }
    } catch (e) {
      console.log(e);
    } finally {
      setIsWorking(false);
    }
  };

  const getContractInfo = async () => {
    const response = await fetch(`/api/fetchcollection`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ contract_address }),
    });
    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      const data = await response.json();
      toast.error(data?.error?.message);
    }
    return null;
  };

  const getMerkleProof = async () => {
    const response = await fetch(`/api/merkletreeproof`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ contract_address, account }),
    });
    if (response.ok) {
      const data = await response.json();
      return data.proof;
    } else {
      const data = await response.json();
      toast.error(data?.error?.message);
    }
    return null;
  };

  useEffect(() => {
    (async () => {
      if (!contract_address) return;

      setIsWorking(true);

      const data = await getContractInfo();
      if (data) {
        setContractInfo(data);
      } else {
        setContractInfo(null);
        toast.error("Contract doesn't exist in our backend.");
      }

      setIsWorking(false);
    })();
  }, [contract_address]);

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
          className="w-20 p-3 bg-blue-500 hover:bg-blue-700 text-white font-bold rounded mb-10"
          onClick={mint}
          disabled={isWorking || loading}
        >
          MINT
        </button>
      </div>

      {(isWorking || loading) && (
        <div className="fixed left-0 top-0 w-screen h-screen bg-black bg-opacity-30 flex flex-row justify-center items-center z-50">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-blue-500"></div>
        </div>
      )}
    </Layout>
  );
};

export default Home;
