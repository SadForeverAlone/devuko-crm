#!/usr/bin/env node
/** Fail if apps/web/dist JS chunks exceed budget (KB). */
import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const DIST = new URL("../dist/assets/", import.meta.url);
const MAX_CHUNK_KB = Number(process.env.BUNDLE_MAX_CHUNK_KB || 450);
const MAX_TOTAL_KB = Number(process.env.BUNDLE_MAX_TOTAL_KB || 1800);

let assetsDir;
try {
  assetsDir = DIST.pathname;
  readdirSync(assetsDir);
} catch {
  console.error("Run `npm run build` before bundle-budget.");
  process.exit(1);
}

const jsFiles = readdirSync(assetsDir).filter((f) => f.endsWith(".js"));
let total = 0;
let worst = { name: "", kb: 0 };
for (const file of jsFiles) {
  const kb = Math.ceil(statSync(join(assetsDir, file)).size / 1024);
  total += kb;
  if (kb > worst.kb) worst = { name: file, kb };
  if (kb > MAX_CHUNK_KB) {
    console.error(`Chunk ${file} is ${kb}KB > ${MAX_CHUNK_KB}KB budget`);
    process.exit(1);
  }
}
if (total > MAX_TOTAL_KB) {
  console.error(`Total JS ${total}KB > ${MAX_TOTAL_KB}KB budget`);
  process.exit(1);
}
console.log(`bundle-budget ok: ${jsFiles.length} chunks, total ${total}KB (worst ${worst.name} ${worst.kb}KB)`);
