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
import { DateTimePicker } from "@material-ui/pickers";
import { useEffect, useState } from "react";
import { useWeb3React } from "@web3-react/core";
import { toast } from "react-toastify";
// import {CONTRACT_ABI, IFRAME_BASE_URL, NFTPORT_API_KEY } from "@/libs/constants";
import Web3 from "web3";
// import { delay } from "@/libs/utils";
import { useCSVReader } from "react-papaparse";
import moment from "moment";
import { MerkleTree } from "merkletreejs";
import keccak256 from "keccak256";
import { IpfsUploader } from "@/components/IpfsUploader";
import axios from 'axios';
// import {erc721, erc721Bytecode} from "@/libs/constants"


const Home: NextPage = () => {
  const { active, account } = useWeb3React();
  const { CSVReader } = useCSVReader();
  const [chain, setChain] = useState<string>("goerli");
  const [type, setType] = useState<string>("erc721");
  const [name, setName] = useState<string>("");
  const [symbol, setSymbol] = useState<string>("");
  const [maxSupply, setMaxSupply] = useState<number>(1);
  const [teamReserve, setTeamReserve] = useState<number>(0);
  const [mintPrice, setMintPrice] = useState<number>(0);
  const [presaleMintPrice, setPresaleMintPrice] = useState<number>(0);
  const [maxNftsPerTx, setMaxNftsPerTx] = useState<number>(1);
  const [maxNftsPerWallet, setMaxNftsPerWallet] = useState<number>(1);
  const [ownerAddress, setOwnerAddress] = useState<string>("");
  const [treasuryAddress, setTreasuryAddress] = useState<string>("");
  const [publicMintStartDate, setPublicMintStartDate] = useState<any>(
    new Date()
  );
  const [metadataUpdatable, setMetadataUpdatable] = useState<boolean>(true);
  const [baseUri, setBaseUri] = useState<string>("");
  const [prerevealed, setPrerevealed] = useState<boolean>(false);
  const [prerevealBaseUri, setPrerevealBaseUri] = useState<string>("");
  const [presaleMintStartDate, setPresaleMintSartDate] = useState<any>(
    new Date()
  );
  const [presaleWhitelist, setPresaleWhitelist] = useState<Array<string>>([]);
  const [royaltiesShare, setRoyaltiesShare] = useState<number>(0);
  const [royaltiesAddress, setRoyaltiesAddress] = useState<string>("");
  const [contractAddress, setContractAddress] = useState<string>("");
  // const [iframContent, setIframeContent] = useState<string>("");
  const [merkleRoot, setMerkleRoot] = useState("0000000000000000000000000000000000000000000000000000000000000000");
  const [isWorking, setIsWorking] = useState<boolean>(false);

  const web3 = new Web3(Web3.givenProvider|| "https://goerli.infura.io/v3/321980760a974de3b28757ea69901863");

  // const web3 = new Web3(window.ethereum)

  const copyUrlToClipboard = (url: string) => {
    if (window && navigator) {
      navigator.clipboard.writeText(url);
      toast.success("Copied base image URL to clipboard!");
    }
  };

  const deploy = async (e: any = null) => {
    if (e) {
      e.preventDefault();
    }

    if (chain != "goerli") {
      toast.info("Only support Goerli for now.");
      return;
    }

    if (type != "erc721") {
      toast.info("Only support ERC721 for now.");
      return;
    }

    if (name == "" || symbol == "") {
      toast.warn("Please enter name and symbol correctly.");
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

    if (maxSupply < 1 || maxSupply > 10000) {
      toast.warn("Please enter valid max supply ( 10,000 > n >= 1).");
      return;
    }

    if (teamReserve > maxSupply / 2 || teamReserve < 0) {
      toast.warn(
        "Please enter valid team reseved NFT count (n <= half of max supply)."
      );
      return;
    }

    if (mintPrice < 0) {
      toast.warn("Please enter valid mint price (>= 0).");
      return;
    }

    if (presaleMintPrice < 0) {
      toast.warn("Please enter valid presale mint price (>= 0).");
      return;
    }

    if (maxNftsPerTx < 1 || maxNftsPerTx > 50) {
      toast.warn("Please enter valid max NFTs per transaction ( 50 > n >= 1).");
      return;
    }

    if (
      maxNftsPerWallet < 1 ||
      maxNftsPerWallet > 50 ||
      maxNftsPerWallet < maxNftsPerTx
    ) {
      toast.warn(
        "Please enter valid max NFTs per transaction ( 50 > n >= 1, n >= max NFTs per transaction)."
      );
      return;
    }

    if (baseUri != "" && prerevealBaseUri != "") {
      toast.warn("Please enter only one of base uri or pre reveal base uri.");
      return;
    }

    if (royaltiesShare < 0 || royaltiesShare > 100) {
      toast.warn("Royalties Share should be between 0 ~ 100.");
      return;
    }

    if (
      !Web3.utils.isAddress(ownerAddress) ||
      !Web3.utils.isAddress(treasuryAddress) ||
      !Web3.utils.isAddress(royaltiesAddress)
    ) {
      toast.warn("Please enter valid address.");
      return;
    }

    for (let address of presaleWhitelist) {
      if (!Web3.utils.isAddress(address)) {
        toast.warn("Please import valid whitelist.");
        return;
      }
      if(merkleRoot == '0000000000000000000000000000000000000000000000000000000000000000'){
        toast.warn("Please import whitelist users list.");
        return;
      }
    }

    if (royaltiesShare < 0 || royaltiesShare > 100) {
      toast.warn("Please enter royalties share percentage.");
      return;
    }

    // let deployBody: any = {
    //   chain,
    //   name,
    //   symbol,
    //   max_supply: maxSupply,
    //   team_reserve: teamReserve,
    //   mint_price: mintPrice,
    //   presale_mint_price: presaleMintPrice,
    //   tokens_per_mint: maxNftsPerTx,
    //   owner_address: ownerAddress,
    //   treasury_address: treasuryAddress,
    //   public_mint_start_date: new Date(publicMintStartDate*1000).getTime(),
    //   metadata_updatable: metadataUpdatable,
    //   base_uri: baseUri,
    //   prereveal_token_uri: prerevealBaseUri,
    //   presale_mint_start_date: new Date(presaleMintStartDate*1000).getTime(),
    //   presale_whitelisted_addresses: presaleWhitelist,
    //   royalties_share: royaltiesShare * 100,
    //   royalties_address: royaltiesAddress,
    // };
    setContractAddress("");
    try {
      let config:any = {
        method: 'get',
        url: 'http://localhost:4000/erc721ByteCode',
        headers: { }
      };
      
      axios(config)
      .then(async function (response) {
        console.log(response,"response");       
        let code = '0x' + response.data.bytecode;
        const incrementer = new web3.eth.Contract(response.data.abi);
        let publicSaleStart = moment(publicMintStartDate).format(
          "YYYY-MM-DDTHH:mm:00+00:00"
        )
        let preSaleStart = moment(presaleMintStartDate).format(
          "YYYY-MM-DDTHH:mm:00+00:00"
        )
        console.log(new Date(preSaleStart).getTime()/1000)
        incrementer.deploy({
          data: code,
          arguments: [[name, symbol, ownerAddress, maxSupply, teamReserve, maxNftsPerTx, treasuryAddress],[baseUri, metadataUpdatable, web3.utils.toWei(mintPrice.toString(), 'ether'),"false",web3.utils.toWei(presaleMintPrice.toString(), 'ether') ,"false", new Date(publicSaleStart).getTime()/1000, new Date(preSaleStart).getTime()/1000  ,prerevealBaseUri, "0x"+merkleRoot, royaltiesShare * 100, royaltiesAddress] ],
        }).send({from:ownerAddress}, function(err, res){
          if(err){
            toast.error("Error while deploy the contract");
          }
          if(res){
            setIsWorking(true);
            toast.success("Your Transaction is sent. Wait For confirmation");
          }
        }).on('receipt', function(receipt){
          console.log(receipt)
          toast.success("Contract deployed successfully.");
          setIsWorking(false)
          setContractAddress(receipt.contractAddress)
          setName("")
          setSymbol("")
          setBaseUri("")
          setMaxSupply(1);
          setTeamReserve(0);
          setMintPrice(0);
        });    
      })
    } catch (e) {
      console.log(e);
      toast.error("Error occured on deploying smart contract.");
    }
    setIsWorking(false);
  };

  useEffect(() => {
    if (active) {
      setOwnerAddress(account!);
      setTreasuryAddress(account!);
      setRoyaltiesAddress(account!);
    } else {
      setOwnerAddress("");
      setTreasuryAddress("");
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
              <MenuItem value="goerli">Goerli</MenuItem>
              <MenuItem value="polygon">Polygon</MenuItem>
            </Select>
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
              id="input-max-supply"
              label="Max Supply"
              value={maxSupply}
              type="number"
              onChange={(e) => {
                setMaxSupply(Number(e.target.value));
              }}
            />
          </FormControl>
          <FormControl fullWidth>
            <TextField
              required
              id="input-team-reserve"
              label="Team Reseved NFT Count"
              value={teamReserve}
              type="number"
              onChange={(e) => {
                setTeamReserve(Number(e.target.value));
              }}
            />
          </FormControl>
          <FormControl fullWidth>
            <TextField
              required
              id="input-mint-price"
              label="Mint Price (ETH)"
              value={mintPrice}
              type="number"
              onChange={(e) => {
                setMintPrice(Number(e.target.value));
              }}
            />
          </FormControl>
          <FormControl fullWidth>
            <TextField
              required
              id="input-presale-mint-price"
              label="Presale Mint Price (ETH)"
              value={presaleMintPrice}
              type="number"
              onChange={(e) => {
                setPresaleMintPrice(Number(e.target.value));
              }}
            />
          </FormControl>
          <FormControl fullWidth>
            <TextField
              required
              id="input-max-nfts-per-tx"
              label="Max NFTs Per Transaction"
              value={maxNftsPerTx}
              type="number"
              onChange={(e) => {
                setMaxNftsPerTx(Number(e.target.value));
              }}
            />
          </FormControl>
          <FormControl fullWidth>
            <TextField
              required
              id="input-max-nfts-per-wallet"
              label="Max NFTs Per Person"
              value={maxNftsPerWallet}
              type="number"
              onChange={(e) => {
                setMaxNftsPerWallet(Number(e.target.value));
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
            <TextField
              required
              id="input-treasury-address"
              label="Treasury Address"
              value={treasuryAddress}
              onChange={(e) => {
                setTreasuryAddress(e.target.value);
              }}
            />
          </FormControl>
          <FormControl fullWidth>
            <DateTimePicker
              required
              label="Public Mint Start Date"
              inputVariant="outlined"
              value={publicMintStartDate}
              // format=" DD.MM.YYYY hh:mm"
              onChange={setPublicMintStartDate}
            />
            {/* <TextField
              required
              label="Public Mint Start Date"
              inputVariant="outlined"
              value={publicMintStartDate}
              onChange={setPublicMintStartDate}
            /> */}
          </FormControl>
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  defaultChecked
                  onChange={(e) => {
                    setMetadataUpdatable(e.target.checked);
                  }}
                  style={{
                    color: "rgb(236 72 153)",
                  }}
                />
              }
              label="Metadata Updatable"
            />
          </FormGroup>
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  onChange={(e) => {
                    setPrerevealed(e.target.checked);
                  }}
                  style={{
                    color: "rgb(236 72 153)",
                  }}
                />
              }
              label="Pre Reveal"
            />
          </FormGroup>
          {prerevealed ? (
            <>
              <div className="w-full flex flex-row justify-center items-start space-x-2">
                <IpfsUploader
                  label="Image"
                  acceptType="image/*"
                  setUrl={copyUrlToClipboard}
                />
                <IpfsUploader
                  label="Json"
                  acceptType=".json"
                  setUrl={setPrerevealBaseUri}
                />
              </div>
              <FormControl fullWidth>
                <TextField
                  required
                  id="input-prereveal-baseuri"
                  label="Pre Reveal Base Uri (Upload artworks or enter directly)"
                  value={prerevealBaseUri}
                  onChange={(e) => {
                    setPrerevealBaseUri(e.target.value);
                  }}
                />
              </FormControl>
            </>
          ) : (
            <>
              <div className="w-full flex flex-row justify-center items-start space-x-2">
                <IpfsUploader
                  label="Image"
                  acceptType="image/*"
                  setUrl={copyUrlToClipboard}
                />
                <IpfsUploader
                  label="Json"
                  acceptType=".json"
                  setUrl={setBaseUri}
                />
              </div>
              <FormControl fullWidth>
                <TextField
                  required
                  id="input-baseuri"
                  label="Base Uri  (Upload artworks or enter directly)"
                  value={baseUri}
                  onChange={(e) => {
                    setBaseUri(e.target.value);
                  }}
                />
              </FormControl>
            </>
          )}

          <FormControl fullWidth>
            <DateTimePicker
              required
              label="Presale Mint Start Date"
              inputVariant="outlined"
              value={presaleMintStartDate}
              onChange={setPresaleMintSartDate}
            />
          </FormControl>
          <CSVReader
            onUploadAccepted={(results: any) => {
              if (results && results.data && results.data.length > 0) {
                let whitelist = [];
                for (let item of results.data) {
                  if (item[0] && item[0].length == 42) {
                    whitelist.push(item[0]);
                  }
                }
                setPresaleWhitelist(whitelist);
                const tree = new MerkleTree(whitelist, keccak256)
                const root = tree.getRoot().toString('hex')
                console.log(root)
                setMerkleRoot(root);
              }
            }}
          >
            {({
              getRootProps,
              acceptedFile,
              ProgressBar,
              getRemoveFileProps,
            }: any) => (
              <>
                <div className="flex flex-row mb-3 space-x-2 w-full">
                  <button
                    type="button"
                    {...getRootProps()}
                    className="py-0 px-5 border border-gray-400 rounded-md"
                  >
                    Presale Whitelist CSV
                  </button>
                  <div className="border border-[#ccc] h-11 leading-loose px-3 flex-grow rounded-md">
                    {acceptedFile && acceptedFile.name}
                  </div>
                  <button
                    {...getRemoveFileProps()}
                    className="py-0 px-5 border border-gray-400 rounded-md"
                  >
                    Remove
                  </button>
                </div>
                <ProgressBar className="bg-red-500" />
              </>
            )}
          </CSVReader>
          <FormControl fullWidth>
            <TextField
              required
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
              required
              id="input-royalties-share-address"
              label="Royalties Share Address"
              value={royaltiesAddress}
              onChange={(e) => {
                setRoyaltiesAddress(e.target.value);
              }}
            />
          </FormControl>
          <button
            className="w-full p-3 bg-pink-500 hover:bg-pink-700 text-white font-bold"
            onClick={deploy}
            disabled={isWorking}
          >
            DEPLOY
          </button>
          {contractAddress && (
            <>
              <h1 className="text-center text-lg text-blue-500 my-10">
                Contract Address: <b>{contractAddress}</b>
              </h1>
              {/* <div
                className="w-full cursor-pointer select-none p-5 border border-gray-500 rounded-md hover:bg-gray-100 whitespace-pre-wrap overflow-hidden"
                onClick={copyClipboard}
              > */}
                {/* {iframContent} */}
              {/* </div> */}
            </>
          )}
        </div>
      </div>

      {isWorking && (
        <div className="fixed left-0 top-0 w-screen h-screen bg-orange-400 bg-opacity-30 flex flex-row justify-center items-center z-50">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-pink-500"></div>
        </div>
      )}
    </Layout>
  );
};

export default Home;
