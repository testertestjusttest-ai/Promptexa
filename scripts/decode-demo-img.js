/**
 * Decodes base64-packed demo images (public/demo-img-src/batch-*.json)
 * into real binary files under public/demo-img/.
 * Runs automatically before `next build` (see package.json "prebuild").
 * The .json sources are plain text so they survive git; the .webp outputs
 * are generated at build time and must NOT be committed.
 */
const fs = require("fs");
const path = require("path");

const SRC = path.join(__dirname, "..", "public", "demo-img-src");
const DEST = path.join(__dirname, "..", "public", "demo-img");

function main() {
  if (!fs.existsSync(SRC)) {
    console.log("[demo-img] no src dir, skipping");
    return;
  }
  fs.mkdirSync(DEST, { recursive: true });
  const batches = fs.readdirSync(SRC).filter((f) => f.startsWith("batch-") && f.endsWith(".json"));
  const parts = {};
  let count = 0;
  for (const b of batches) {
    const data = JSON.parse(fs.readFileSync(path.join(SRC, b), "utf8"));
    for (const [rel, b64] of Object.entries(data.files || {})) {
      const m = rel.match(/^(.*)\.part(\d+)$/);
      if (m) {
        // chunked file — collect parts, reassemble after all batches are read
        if (!parts[m[1]]) parts[m[1]] = {};
        parts[m[1]][Number(m[2])] = b64;
        continue;
      }
      const out = path.join(__dirname, "..", "public", rel);
      fs.mkdirSync(path.dirname(out), { recursive: true });
      fs.writeFileSync(out, Buffer.from(b64, "base64"));
      count++;
    }
  }
  for (const [rel, chunks] of Object.entries(parts)) {
    const order = Object.keys(chunks).map(Number).sort((a, b2) => a - b2);
    const buf = Buffer.concat(order.map((k) => Buffer.from(chunks[k], "base64")));
    const out = path.join(__dirname, "..", "public", rel);
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, buf);
    count++;
  }
  console.log(`[demo-img] decoded ${count} images from ${batches.length} batches`);
}

main();
