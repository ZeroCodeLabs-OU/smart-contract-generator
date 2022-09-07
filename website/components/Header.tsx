import { useEffect, useState } from "react";
import Modal from "@mui/material/Modal";
import { toast } from "react-toastify";
import { NETWORK_TYPES, TAG_PROVIDER, WALLETS } from "@/libs/constants";
import { truncateAddress } from "@/libs/utils";
import useWalletConnection from "@/hooks/useWalletConnection";

const Header = ({}) => {
  const { active, account, chainId, connectWallet, disconnectWallet } =
    useWalletConnection();
  const [isOpenConnectModal, setIsOpenConnectModal] = useState<boolean>(false);
  const [wallet, setWallet] = useState<any>(null);

  const connect = (wallet: any) => {
    connectWallet(wallet, () => {
      setWallet(wallet);
      setIsOpenConnectModal(false);
    });
  };

  const disconnect = () => {
    disconnectWallet(null);
  };

  const copyAddress = () => {
    if (!account || !navigator) return;
    navigator.clipboard.writeText(account);
    toast.success("Copied to clipboard.");
  };

  useEffect(() => {
    try {
      const provider = window.localStorage.getItem(TAG_PROVIDER);
      if (provider) {
        for (let wallet of WALLETS) {
          if (provider == wallet.title) {
            connect(wallet);
            break;
          }
        }
      }
    } catch (e) {
      console.log(e);
    }
  }, []);

  return (
    <div className="w-full flex flex-row justify-end space-x-5 px-5 py-2 bg-orange-400 z-50">
      {active ? (
        <>
          <div className="hidden flex-row space-x-2 justify-center items-center md:flex">
            <img className="w-5 h-5 object-fill" src={wallet?.icon} />
            <p
              className="text-base text-left text-white font-semibold font-raleway cursor-pointer"
              onClick={copyAddress}
            >
              {truncateAddress(account)}
            </p>
            <p className="text-xs text-left text-white font-semibold font-raleway">
              (&nbsp;
              {chainId
                ? NETWORK_TYPES[chainId]
                  ? NETWORK_TYPES[chainId]
                  : "Unkown Network"
                : "Unkown Network"}
              &nbsp;)
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
                onClick={() => connect(wallet)}
              >
                <img className="w-8 h-8 object-fill" src={wallet.icon} />
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
