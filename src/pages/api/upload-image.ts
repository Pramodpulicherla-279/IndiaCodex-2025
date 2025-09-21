import type { NextApiRequest, NextApiResponse } from "next";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";
import { v4 as uuidv4 } from "uuid";

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY!);

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });
}

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
    const bucket = getStorage().bucket();
    const filename = `nft-images/${uuidv4()}.png`;
    const file = bucket.file(filename);

    await file.save(buffer, {
      metadata: { contentType: "image/png" },
      public: true,
    });

    const downloadURL = `https://storage.googleapis.com/${bucket.name}/${filename}`;
    res.status(200).json({ url: downloadURL });
  } catch (error) {
    res.status(500).json({ error: "Upload failed" });
  }
}
