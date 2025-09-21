import { uploadToIPFS } from "./nftStorage";
/**
 * Uploads an image to IPFS, then registers it with Preserve NFT.Storage.
 * @param blob The image Blob to upload.
 * @param collectionId The Preserve collection ID.
 * @param tokenId A unique token ID for this NFT.
 * @returns The ipfs://CID string.
 */
export async function uploadToPreserve(
  blob: Blob,
  collectionId: string,
  tokenId: string
): Promise<string> {
  // 1. Upload to IPFS
  const ipfsUrl = await uploadToIPFS(blob);
  const cid = ipfsUrl.replace("ipfs://", "");

  // 2. Create CSV content
  const csvContent = `tokenID,cid\n${tokenId},${cid}\n`;
  const csvBlob = new Blob([csvContent], { type: "text/csv" });

  // 3. Prepare form data for Preserve
  const formData = new FormData();
  formData.append("collectionID", collectionId);
  formData.append("file", csvBlob, "tokens.csv");

  // 4. Upload CSV to Preserve
  const response = await fetch(
    "https://preserve.nft.storage/api/v1/collection/add_tokens",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_NFT_STORAGE_KEY}`,
      },
      body: formData,
    }
  );

  const data = await response.json();
  if (!response.ok)
    throw new Error(data.error?.message || "Preserve upload failed");

  // 5. Return the ipfs://CID for NFT metadata
  return ipfsUrl;
}
