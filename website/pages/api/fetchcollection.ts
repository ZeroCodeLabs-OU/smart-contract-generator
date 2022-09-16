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

    const { contract_address } = req.body;
    const dataDoc = await db
      .collection("collection")
      .doc(contract_address)
      .get();

    if (!dataDoc.exists) {
      return res.json(null);
    }

    return res.json(dataDoc.data());
  } catch (e) {
    console.log(e);
    return res.status(400).json({
      error: { message: "Error occurred on fetching collection info." },
    });
  }
}
