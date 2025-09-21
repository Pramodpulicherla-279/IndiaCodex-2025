import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.VERTEX_API_KEY;
  const projectId = process.env.VERTEX_PROJECT_ID;

  if (!apiKey || !projectId) {
    res.status(500).json({ error: "Missing Vertex AI credentials" });
    return;
  }

  if (!req.body.prompt) {
    res.status(400).json({ error: "Missing prompt" });
    return;
  }

  try {
    const vertexRes = await fetch(
      `https://us-central1-aiplatform.googleapis.com/v1/projects/${projectId}/locations/us-central1/publishers/google/models/imagen-4.0-fast-generate-001:predict?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          instances: [
            {
              prompt: req.body.prompt,
              // Add other parameters if needed
            },
          ],
        }),
      }
    );

    const data = await vertexRes.json();
    console.log("Vertex AI response:", data);
    res.status(vertexRes.status).json(data);
  } catch (error) {
    res.status(500).json({ error: "Vertex AI API error" });
  }
}
