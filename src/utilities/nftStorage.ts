import { NFTStorage, File } from "nft.storage";

const NFT_STORAGE_KEY = process.env.NEXT_PUBLIC_NFT_STORAGE_KEY!;

export async function uploadToIPFS(blob: Blob): Promise<string> {
  const client = new NFTStorage({ token: NFT_STORAGE_KEY });
  const cid = await client.storeBlob(blob);
  return `ipfs://${cid}`;
}
