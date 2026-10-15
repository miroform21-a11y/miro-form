// Loads project TypeScript (with the "@/…" alias) in plain Node for the CMS scripts and tests.
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const { createJiti } = createRequire(path.join(root, "package.json"))("jiti");
export const jiti = createJiti(import.meta.url, {
  alias: {
    "@": path.join(root, "src"),
    // Next resolves this marker itself; plain Node gets the empty module
    "server-only": path.join(root, "node_modules/next/dist/compiled/server-only/empty.js"),
  },
});
export const load = (rel) => jiti.import(path.join(root, rel));
