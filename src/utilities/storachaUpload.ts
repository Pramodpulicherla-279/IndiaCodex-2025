import { create } from "@storacha/client";

/**
 * Uploads an image Blob to Storacha (IPFS) and returns a short ipfs://CID URL.
 * @param blob The image Blob to upload.
 * @param fileName Suggested filename (e.g., "nft.png")
 * @returns ipfs://CID/fileName
 */
export async function uploadToStoracha(
  blob: Blob,
  fileName: string
): Promise<string> {
  // Use the browser's native File class
  const file = new File([blob], fileName, { type: blob.type });

  // Create the Storacha client (async)
  const client = await create();

  // Upload to IPFS via Storacha
  const cid = await client.uploadFile(file);

  // Return short Cardano metadata-safe URL
  return `ipfs://${cid}/${fileName}`;
}
