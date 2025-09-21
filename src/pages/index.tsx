import {
  CardanoWallet,
  useWallet,
  useLovelace,
  useAddress,
} from "@meshsdk/react";
import { useState } from "react";
import type { Mint, AssetMetadata } from "@meshsdk/core";
import { Transaction, KoiosProvider, ForgeScript } from "@meshsdk/core";
import Head from "next/head";
import { uploadImage } from "../lib/firebase"; // adjust path as needed

export default function Home() {
  const { wallet, connected } = useWallet();
  const address = useAddress();
  const lovelace = useLovelace();

  // NEW: State for AI prompt and image
  const [prompt, setPrompt] = useState("");
  const [aiImage, setAiImage] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  const [status, setStatus] = useState<string>("");
  const [txHash, setTxHash] = useState<string | null>(null);

  // NEW: Generate AI Art (placeholder for now)

  function base64ToBlob(base64: string, contentType = "image/png"): Blob {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: contentType });
  }

  async function generateArt() {
    setGenerating(true);
    setAiImage(null);
    setStatus("");

    try {
      // 1. Generate image from Vertex AI
      const response = await fetch("/api/vertex-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: prompt,
        }),
      });

      const data = await response.json();
      const base64 = data.predictions?.[0]?.bytesBase64Encoded;
      if (!base64) throw new Error("No image returned from Vertex AI");

      // 2. Convert base64 to Blob and upload directly to Firebase Storage
      const blob = base64ToBlob(base64);
      const path = `nft-images/${Date.now()}.png`;
      const url = await uploadImage(blob, path);

      setAiImage(url); // Use this URL for NFT metadata and preview
    } catch (err) {
      setStatus("AI generation or upload failed. Try again.");
      setAiImage(null);
    }
    setGenerating(false);
  }
  async function startMinting() {
    if (!address || !aiImage) {
      setStatus("Please connect a wallet and generate art first.");
      return;
    }

    setStatus("Preparing transaction...");
    setTxHash(null);

    try {
      const koios = new KoiosProvider("preprod");

      // Use AI image and prompt in metadata
      const assetMetadata: AssetMetadata = {
        name: "AI Art NFT",
        image: aiImage,
        mediaType: "image/png",
        description: prompt,
      };

      const asset: Mint = {
        assetName: "AIArtNFT",
        assetQuantity: "1",
        metadata: assetMetadata,
        label: "721",
        recipient: address,
      };
      const forgingScript = ForgeScript.withOneSignature(address);

      const tx = new Transaction({ initiator: wallet }).mintAsset(
        forgingScript,
        asset
      );

      setStatus("Building transaction...");
      const unsignedTx = await tx.build();

      setStatus("Awaiting signature...");
      const signedTx = await wallet.signTx(unsignedTx);

      setStatus("Submitting transaction...");
      const txHash = await wallet.submitTx(signedTx);

      setTxHash(txHash);
      setStatus(`Minting successful!`);

      koios.onTxConfirmed(txHash, () => {
        setStatus(`Transaction confirmed: ${txHash}`);
      });
    } catch (error) {
      console.error(error);
      setStatus("Minting failed. Check the console for details.");
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white font-mono">
      <Head>
        <title>AI NFT Minter</title>
        <meta name="description" content="AI NFT Minter on Cardano" />
      </Head>

      <main className="flex flex-col items-center justify-center w-full flex-1 px-4 text-center">
        <h1 className="text-5xl font-bold mb-4">AI NFT Minter</h1>
        <p className="text-xl mb-8">
          Describe your NFT art, generate with AI, and mint on Cardano!
        </p>

        <div className="mb-8">
          <CardanoWallet />
        </div>

        {/* Prompt input and generate button */}
        <div className="w-full max-w-md bg-gray-800 p-6 rounded-lg shadow-lg mb-6">
          <input
            type="text"
            className="w-full p-2 mb-4 rounded text-black"
            placeholder="Describe your NFT art (e.g., A futuristic Cardano city at sunset)"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={generating}
          />
          <button
            onClick={generateArt}
            disabled={generating || !prompt}
            className="w-full bg-sky-600 hover:bg-sky-700 disabled:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
          >
            {generating ? "Generating..." : "Generate Art"}
          </button>
        </div>

        {/* AI image preview */}
        {aiImage && (
          <div className="mb-6">
            <img
              src={aiImage}
              alt="AI Art Preview"
              className="rounded-lg shadow-lg mx-auto"
              style={{ maxWidth: 320, maxHeight: 320 }}
            />
          </div>
        )}

        {/* Mint button */}
        {connected && aiImage && (
          <div className="w-full max-w-md bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">Your Wallet</h2>
            <p className="mb-2">
              <span className="font-bold">Address:</span>{" "}
              <span className="text-sm break-all">{address}</span>
            </p>
            <p className="mb-6">
              <span className="font-bold">Balance:</span> {lovelace} Lovelace
            </p>

            <button
              onClick={startMinting}
              disabled={status.includes("...")}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition duration-300"
            >
              {status.includes("...") ? status : "Mint as NFT"}
            </button>

            <div className="mt-4 text-center">
              {status && <p className="text-gray-400">{status}</p>}
              {txHash && (
                <a
                  href={`https://preprod.cardanoscan.io/transaction/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-400 hover:underline mt-2 block"
                >
                  View Transaction on Cardanoscan
                </a>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
