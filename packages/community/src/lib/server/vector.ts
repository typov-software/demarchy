import { pipeline } from "@xenova/transformers";

const generateEmbedding = await pipeline("feature-extraction", "Supabase/gte-small");

export async function getEmbedding(body: string) {
  const output = await generateEmbedding(body, {
    pooling: "mean",
    normalize: true
  });
  return Array.from(output.data);
}
