import type { NextApiRequest, NextApiResponse } from "next";
import { utils } from "ethers";
import MerkleTree from "merkletreejs";
import keccak256 from "keccak256";
import { createReadStream } from "fs";
import { createInterface } from "readline";
import path from "path";
import { db } from "@/libs/firebase";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method != "POST") {
    return res.status(400).json({ error: "It should be POST method." });
  }

  try {
    const { contract_address, account } = req.body;

    const dataDoc = await db
      .collection("collection")
      .doc(contract_address)
      .get();

    if (!dataDoc.exists) {
      return res.json({ proof: null });
    }

    const addresses = dataDoc.data()?.presale_whitelisted_addresses;
    const allowed = addresses.findIndex(
      (item: any) => item.toLowerCase() == (<string>account).toLowerCase()
    );

    if (allowed < 0) {
      return res.json({ proof: null });
    }

    const elements = addresses.map((item: any) =>
      utils.solidityKeccak256(["address"], [item])
    );
    const merkleTree = new MerkleTree(elements, keccak256, { sort: true });
    const root = merkleTree.getHexRoot();
    const proof = merkleTree.getHexProof(elements[allowed]);

    console.log("Merkle Root", root);
    console.log("Merkle Proof", proof);

    res.json({ proof });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
}
