import type { NextApiRequest, NextApiResponse } from "next";
import { NFTPORT_API_KEY } from "@/libs/constants";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method != "POST") {
    return res.status(400).json({ error: "It should be POST method." });
  }

  try {
    const { contract_address, account } = req.body;

    const response = await fetch(
      "https://api.nftport.xyz/v0/me/contracts/collections?chain=goerli&include=merkle_proofs",
      {
        method: "GET",
        headers: {
          Authorization: NFTPORT_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );
    if (response.ok) {
      const contractAddress = <string>contract_address;
      const data = await response.json();
      const contracts = data.contracts;
      const contractInfo = contracts.find(
        (contract: any) => contract.address == contractAddress.toLowerCase()
      );
      if (contractInfo) {
        const proof = contractInfo.merkle_proofs[account];
        return res.json({ proof });
      } else {
        res.status(400).json({ proof: null });
      }
    } else {
      res.status(400).json({ proof: null });
    }
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
}
