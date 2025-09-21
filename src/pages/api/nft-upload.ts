import type { NextApiRequest, NextApiResponse } from "next";
import { NFTStorage } from "nft.storage";

const NFT_STORAGE_KEY = process.env.NEXT_PUBLIC_NFT_STORAGE_KEY!;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { imageBase64 } = req.body;
  if (!imageBase64) {
    res.status(400).json({ error: "Missing imageBase64" });
    return;
  }

  try {
    const buffer = Buffer.from(imageBase64, "base64");
    const blob = new Blob([buffer], { type: "image/png" });
    const client = new NFTStorage({ token: NFT_STORAGE_KEY });
    const cid = await client.storeBlob(blob);
    res.status(200).json({ url: `ipfs://${cid}` });
  } catch (error) {
    res.status(500).json({ error: "Upload failed" });
  }
}
