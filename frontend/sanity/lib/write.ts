import "server-only";
import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "./env";

const writeToken = process.env.SANITY_API_WRITE_TOKEN;

if (!writeToken) {
  throw new Error("Missing SANITY_API_WRITE_TOKEN");
}

export const writeClient = createClient({
  projectId,
  dataset,
  apiVersion,
  token: writeToken,
  useCdn: false,
  perspective: "published",
});
