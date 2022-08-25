import type { NextPage } from "next";
import Layout from "@/components/Layout";
import Header from "@/components/Header";
import {
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useWeb3React } from "@web3-react/core";
import { toast } from "react-toastify";
import { IFRAME_BASE_URL, NFTPORT_API_KEY } from "@/libs/constants";
import Web3 from "web3";
import { delay } from "@/libs/utils";

const Home: NextPage = () => {
  const { active, account } = useWeb3React();
  const [chain, setChain] = useState<string>("rinkeby");
  const [name, setName] = useState<string>("");
  const [symbol, setSymbol] = useState<string>("");
  const [ownerAddress, setOwnerAddress] = useState<string>("");
  const [metadataUpdatable, setMetadataUpdatable] = useState<boolean>(true);
  const [type, setType] = useState<string>("");
  const [baseUri, setBaseUri] = useState<string>("");
  const [royaltiesShare, setRoyaltiesShare] = useState<number>(0);
  const [royaltiesAddress, setRoyaltiesAddress] = useState<string>("");
  const [txLink, setTxLink] = useState<string>("");
  const [contractAddress, setContractAddress] = useState<string>("");
  const [iframContent, setIframeContent] = useState<string>("");
  const [isWorking, setIsWorking] = useState<boolean>(false);

  const copyClipboard = (e: any = null) => {
    if (e) {
      e.preventDefault();
    }

    if (window && navigator) {
      navigator.clipboard.writeText(iframContent);
      toast.success("Copied to clipboard!");
    }
  };

  const deploy = async (e: any = null) => {
    if (e) {
      e.preventDefault();
    }

    if (chain != "rinkeby") {
      toast.info("Only support Rinkeby for now.");
      return;
    }

    if (name == "" || symbol == "" || ownerAddress == "" || baseUri == "") {
      toast.warn("Please enter values correctly.");
      return;
    }

    if (royaltiesShare < 0 || royaltiesShare > 100) {
      toast.warn("Royalties Share should be between 0 ~ 100.");
      return;
    }

    if (name.length > 35) {
      toast.warn("Name should be less than 35 length.");
      return;
    }

    if (symbol.length > 8) {
      toast.warn("Name should be less than 8 length.");
      return;
    }

    if (
      !Web3.utils.isAddress(ownerAddress) ||
      !Web3.utils.isAddress(royaltiesAddress)
    ) {
      toast.warn("Please enter valid address.");
      return;
    }

    let deployBody: any = {
      chain,
      name,
      symbol,
      owner_address: ownerAddress,
      type,
      metadata_updatable: metadataUpdatable,
      base_uri: baseUri,
    };

    if (royaltiesShare > 0) {
      deployBody.royalties_share = royaltiesShare * 100;

      if (royaltiesAddress) {
        deployBody.royalties_address = royaltiesAddress;
      }
    }

    setIsWorking(true);
    setContractAddress("");
    setIframeContent("");

    try {
      const response = await fetch("https://api.nftport.xyz/v0/contracts", {
        method: "POST",
        headers: {
          Authorization: NFTPORT_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(deployBody),
      });

      if (response.ok) {
        const data = await response.json();
        setTxLink(data.transaction_external_url);

        // Wait till transaction is recorded on chain. MUST WAIT HERE!!!
        await delay(30 * 1000);

        const detailResponse = await fetch(
          `https://api.nftport.xyz/v0/contracts/${data.transaction_hash}?chain=${chain}`,
          {
            method: "GET",
            headers: {
              Authorization: NFTPORT_API_KEY,
              "Content-Type": "application/json",
            },
          }
        );

        if (detailResponse.ok) {
          const detailData = await detailResponse.json();
          setContractAddress(detailData.contract_address);
          setIframeContent(
            `<iframe width="100%" height="550px" allowfullscreen="true" style="border:none;" loading="lazy" title="ZeroCodes" src="${IFRAME_BASE_URL}/iframe/${detailData.contract_address}"></iframe>`
          );

          toast.success(
            <div>
              <p>You successfully deployed smart contract.</p>
              <br />
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
            toast.error("Error occured on getting contract info.");
          }
        }
      } else {
        if (response.status == 400) {
          const data = await response.json();
          const error = data?.error;
          toast.error(error);
        } else {
          toast.error("Error occured on deploying smart contract.");
        }
      }
    } catch (e) {
      console.log(e);
    }

    setIsWorking(false);
  };

  useEffect(() => {
    if (active) {
      setOwnerAddress(account!);
      setRoyaltiesAddress(account!);
    } else {
      setOwnerAddress("");
      setRoyaltiesAddress("");
    }
  }, [active]);

  return (
    <Layout>
      <Header />
      <div className="w-full flex flex-col justify-center items-center">
        <div className="w-full md:w-1/2 flex flex-col p-5 my-10 space-y-5 justify-center items-center">
          <FormControl fullWidth>
            <InputLabel id="select-chain-label">Chain</InputLabel>
            <Select
              labelId="select-chain-label"
              id="select-chain"
              value={chain}
              label="Chain"
              onChange={(e) => {
                setChain(e.target.value);
              }}
            >
              <MenuItem value="rinkeby">Rinkeby</MenuItem>
              <MenuItem value="polygon">Polygon</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <TextField
              required
              id="input-name"
              label="Name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
              }}
            />
          </FormControl>
          <FormControl fullWidth>
            <TextField
              required
              id="input-symbol"
              label="Symbol"
              value={symbol}
              onChange={(e) => {
                setSymbol(e.target.value);
              }}
            />
          </FormControl>
          <FormControl fullWidth>
            <TextField
              required
              id="input-owner-address"
              label="Owner Address"
              value={ownerAddress}
              onChange={(e) => {
                setOwnerAddress(e.target.value);
              }}
            />
          </FormControl>
          <FormControl fullWidth>
            <InputLabel id="select-type-label">Type</InputLabel>
            <Select
              labelId="select-type-label"
              id="select-type"
              value={type}
              label="Type"
              onChange={(e) => {
                setType(e.target.value);
              }}
            >
              <MenuItem value="erc721">ERC721</MenuItem>
              <MenuItem value="erc1155">ERC1155</MenuItem>
            </Select>
          </FormControl>
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  defaultChecked
                  onChange={(e) => {
                    setMetadataUpdatable(e.target.checked);
                  }}
                />
              }
              label="Metadata Updatable"
            />
          </FormGroup>
          <FormControl fullWidth>
            <TextField
              required
              id="input-baseuri"
              label="Base Uri"
              value={baseUri}
              onChange={(e) => {
                setBaseUri(e.target.value);
              }}
            />
          </FormControl>
          <FormControl fullWidth>
            <TextField
              id="input-royalties-share"
              label="Royalties Share (%)"
              type="number"
              InputProps={{ inputProps: { min: 0, max: 100, step: 1 } }}
              value={royaltiesShare}
              onChange={(e) => {
                setRoyaltiesShare(Number(e.target.value));
              }}
            />
          </FormControl>
          <FormControl fullWidth>
            <TextField
              id="input-royalties-share-address"
              label="Royalties Share Address"
              value={royaltiesAddress}
              onChange={(e) => {
                setRoyaltiesAddress(e.target.value);
              }}
            />
          </FormControl>
          <button
            className="w-full p-3 bg-blue-500 hover:bg-blue-700 text-white font-bold rounded"
            onClick={deploy}
            disabled={isWorking}
          >
            DEPLOY
          </button>
          {contractAddress && (
            <>
              <h1 className="text-center text-xl text-blue-500 my-10">
                Contract Address: <b>{contractAddress}</b>
              </h1>
              <div
                className="w-full h-20 cursor-pointer select-none p-5 border border-gray-500 rounded-md hover:bg-gray-100"
                onClick={copyClipboard}
              >
                {iframContent}
              </div>
            </>
          )}
        </div>
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
