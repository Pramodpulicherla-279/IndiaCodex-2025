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
  const file = new File([blob], fileName, { type: blob.type });
  const client = await create();

  // --- AUTHENTICATION STEP ---
  // Only do this once per session/user!
  // Replace with your actual email
  const account = await client.login("your@email.com");
  await account.plan.wait();

  // Get all spaces
  let spaces = await client.spaces();
  let space = spaces[0];

  // If no space, create one and wait for provisioning
  if (!space) {
    space = await client.createSpace("cardano-nft-space", { account });
    await space.wait();
  }

  await client.setCurrentSpace(space.did());

  // Upload to IPFS via Storacha
  const cid = await client.uploadFile(file);

  return `ipfs://${cid}/${fileName}`;
}
