import { pipeline } from "@xenova/transformers";
import { QdrantClient } from "@qdrant/js-client-rest";
import { QDRANT_URL } from "$env/static/private";

export const qdrant = new QdrantClient({
  url: QDRANT_URL
});

const generateEmbedding = await pipeline("feature-extraction", "Supabase/gte-small");

export async function getEmbedding(body: string) {
  const output = await generateEmbedding(body, {
    pooling: "mean",
    normalize: true
  });
  return Array.from(output.data);
}
