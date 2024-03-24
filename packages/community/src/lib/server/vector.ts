import { pipeline } from "@xenova/transformers";
import { QdrantClient } from "@qdrant/js-client-rest";

export const qdrant = new QdrantClient({
  host: "localhost",
  port: 64325
});

const generateEmbedding = await pipeline("feature-extraction", "Supabase/gte-small");

export async function getEmbedding(body: string) {
  const output = await generateEmbedding(body, {
    pooling: "mean",
    normalize: true
  });
  return Array.from(output.data);
}
