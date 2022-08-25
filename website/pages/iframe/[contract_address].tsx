import type { NextPage } from "next";
import Layout from "@/components/Layout";
import Header from "@/components/Header";
import { useEffect, useState } from "react";
import { useWeb3React } from "@web3-react/core";
import { toast } from "react-toastify";
import { NFTPORT_API_KEY } from "@/libs/constants";
import { delay } from "@/libs/utils";
import { useRouter } from "next/router";

const Home: NextPage = () => {
  const router = useRouter();
  const { contract_address } = router.query;
  const { active, account } = useWeb3React();
  const [txLink, setTxLink] = useState<string>("");
  const [isWorking, setIsWorking] = useState<boolean>(false);

  const mint = async () => {
    if (!active) {
      toast.warn("Please connect wallet.");
      return;
    }

    if (!contract_address) {
      toast.warn("Contract doesn't exist.");
      return;
    }

    let mintBody: any = {
      chain: "rinkeby",
      contract_address,
      metadata_uri:
        "ipfs://bafybeifv2jje4fwjru7iqiphj2h5lpeoqq6zjsz4czpzojq7w7tvo4hi3m/",
      mint_to_address: account,
    };

    setIsWorking(true);

    try {
      const response = await fetch(
        "https://api.nftport.xyz/v0/mints/customizable",
        {
          method: "POST",
          headers: {
            Authorization: NFTPORT_API_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(mintBody),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setTxLink(data.transaction_external_url);

        // Wait till transaction is recorded on chain. MUST WAIT HERE!!!
        await delay(10 * 1000);

        toast.success(
          <div>
            <p>You successfully minted NFT.</p>
            <a
              href={data.transaction_external_url}
              target="_blank"
              rel="noreferrer"
            >
              View on Block Explorer
            </a>
          </div>
        );
      } else {
        if (response.status == 400) {
          const data = await response.json();
          const error = data?.error;
          toast.error(error);
        } else {
          toast.error("Error occured on minting smart contract.");
        }
      }
    } catch (e) {
      console.log(e);
    }

    setIsWorking(false);
  };

  useEffect(() => {
    (async () => {
      if (!contract_address) return;
    })();
  }, [contract_address]);

  return (
    <Layout>
      <Header />
      <div className="w-full h-full flex flex-col justify-center items-center">
        <button
          className="w-20 p-3 bg-blue-500 hover:bg-blue-700 text-white font-bold rounded my-10"
          onClick={mint}
          disabled={isWorking}
        >
          MINT
        </button>
      </div>

      {isWorking && (
        <div className="fixed left-0 top-0 w-screen h-screen bg-black bg-opacity-30 flex flex-row justify-center items-center z-50">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-blue-500"></div>
        </div>
      )}
    </Layout>
  );
};

export default Home;
