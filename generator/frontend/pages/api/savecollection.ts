import { db } from "@/libs/firebase";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  try {
    if (req.method != "POST") {
      return res
        .status(400)
        .json({ error: { message: "It should be POST method." } });
    }

    const { data } = req.body;
    await db.collection("collection").doc(data.contract_address).set(data);

    return res.json({ message: "You successfully deployed smart contract." });
  } catch (e) {
    console.log(e);
    return res.status(400).json({
      error: { message: "Error occured on deploying smart contract." },
    });
  }
}
