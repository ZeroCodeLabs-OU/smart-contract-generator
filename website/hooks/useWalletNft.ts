import { useEffect, useState } from "react";
import { createAlchemyWeb3, Nft } from "@alch/alchemy-web3";
import { useWeb3React } from "@web3-react/core";
import { Web3Provider } from "@ethersproject/providers";
import {
  ALCHEMY_API_ETH_PROVIDER_URL,
  ALCHEMY_API_KEY,
  ERC1155_CONTRACT_ADDRESS,
  ERC721A_CONTRACT_ADDRESS,
} from "@/libs/constants";

export default function useWalletNft() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [nfts1155, setNfts1155] = useState<Array<Nft>>([]);
  const [nfts721A, setNfts721A] = useState<Array<Nft>>([]);
  const { active, account } = useWeb3React<Web3Provider>();

  useEffect(() => {
    (async () => {
      if (active && account) {
        setIsLoading(true);
        setNfts1155(await getNfts(account, ERC1155_CONTRACT_ADDRESS));
        setNfts721A(await getNfts(account, ERC721A_CONTRACT_ADDRESS));
        setIsLoading(false);
      }
    })();
  }, [active]);

  const getNfts = async (ownerAddress: string, contractAddress: string) => {
    try {
      const ethProvider = `${ALCHEMY_API_ETH_PROVIDER_URL}/${ALCHEMY_API_KEY}`;

      const web3 = createAlchemyWeb3(ethProvider);

      const nfts = await web3.alchemy.getNfts({
        owner: ownerAddress,
        contractAddresses: [contractAddress],
      });

      return nfts.ownedNfts;
    } catch (e) {
      console.log(e);
    }
    return [];
  };

  return { isLoading, getNfts, nfts1155, nfts721A };
}
