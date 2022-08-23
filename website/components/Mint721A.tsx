import { useState } from "react";
import Modal from "@mui/material/Modal";
import { useWeb3React } from "@web3-react/core";
import { Web3Provider } from "@ethersproject/providers";
import { Contract } from "@ethersproject/contracts";
import {
  CHAIN_ID,
  ERC721A_CONTRACT_ADDRESS,
  ERC721A_CONTRACT_ABI,
  ETHERSCAN_LINKS,
  NETWORK_TYPES,
} from "@/libs/constants";
import useCatchTxError from "@/hooks/useCatchTxError";
import ButtonClose from "./ButtonClose";
import { toast } from "react-toastify";

const Mint721A = () => {
  const { account, active, library, chainId } = useWeb3React<Web3Provider>();
  const { fetchWithCatchTxError, loading } = useCatchTxError();

  const [isOpenMintModal, setIsOpenMintModal] = useState<boolean>(false);
  const [isMintSucceed, setIsMintSucceed] = useState<boolean>(false);
  const [txLink, setTxLink] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);

  const closeMintModal = () => {
    setIsOpenMintModal(false);
    setIsMintSucceed(false);
    setTxLink("");
  };

  const mintNFT = async () => {
    try {
      if (!(active && account && library)) return;

      if (chainId != CHAIN_ID) {
        toast.info(`Please change network to ${NETWORK_TYPES[CHAIN_ID]}`);
        return;
      }

      const erc721A = new Contract(
        ERC721A_CONTRACT_ADDRESS,
        ERC721A_CONTRACT_ABI,
        library.getSigner()
      );

      const tx = await fetchWithCatchTxError(() => {
        return erc721A.mint(quantity);
      });

      if (tx) {
        setTxLink(tx.transactionHash);
        setIsMintSucceed(true);
      }
    } catch (e: any) {
      console.log(e);
    }
  };

  return (
    <div className="w-full flex flex-row p-5 justify-center items-center">
      <button
        className="px-4 py-2 text-center text-xl font-semibold font-raleway rounded-lg bg-cyan-500 hover:bg-cyan-700 hover:scale-110 hover:text-white transition duration-500"
        onClick={() => {
          setIsOpenMintModal(true);
        }}
      >
        MINT NOW (721A)
      </button>

      <Modal
        open={isOpenMintModal}
        onClose={(_, reason) => {
          if (reason !== "backdropClick") {
            setIsOpenMintModal(false);
          }
        }}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <div className="absolute top-1/2 left-1/2 w-max -translate-x-1/2 -translate-y-1/2 bg-[#1c1c1c] flex flex-col space-y-5 justify-center items-center p-10 rounded-lg z-50">
          {!loading && (
            <div className="absolute right-2 top-2">
              <ButtonClose onClick={closeMintModal} />
            </div>
          )}
          {isMintSucceed ? (
            <>
              <p className="text-white text-center font-semibold font-raleway text-xl px-5 py-2">
                Mint Successful
              </p>
              <a
                href={`${ETHERSCAN_LINKS[chainId ? chainId : 1]}/tx/${txLink}`}
                target="_blank"
                rel="noreferrer"
                className="text-cyan-500 text-center font-semibold font-raleway text-xl px-5 py-2"
              >
                View on Block Explorer
              </a>
            </>
          ) : loading ? (
            <p className="text-white text-center font-semibold font-raleway text-xl px-5 py-2">
              Processing Mint...
            </p>
          ) : (
            <>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                min={1}
                max={5}
                className="text-lg text-center text-white font-semibold font-raleway bg-transparent border border-white rounded-lg w-32 p-2"
              />
              <button
                className="px-4 py-2 text-center text-xl font-semibold font-raleway rounded-lg bg-cyan-500 hover:bg-cyan-700 hover:scale-110 hover:text-white transition duration-500"
                onClick={mintNFT}
              >
                Interact with wallet to continue
              </button>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default Mint721A;
