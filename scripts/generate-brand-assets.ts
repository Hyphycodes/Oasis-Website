/**
 * Generates the two locally-produced brand assets:
 *  - public/media/brand/paper-grain.png — a 240px tiling warm grain, used at 3%
 *    opacity over sand surfaces so large flat fields do not read as a CSS swatch
 *  - public/media/home/hero-poster.jpg — the hero poster, extracted as a solid
 *    brand-derived field when no video frame is available
 *
 * Deterministic: a fixed seed, so re-running does not churn the repository.
 */

import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.resolve(import.meta.dirname, '..');
const MEDIA = path.join(ROOT, 'public', 'media');

/** 160px tiles at 3% opacity are indistinguishable from 240px ones and encode
 *  to roughly a third of the bytes. The whole point is that it is nearly free. */
const SIZE = 160;

/** Deterministic PRNG — mulberry32. */
function rng(seed: number) {
  return function next() {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

async function grain() {
  const next = rng(0x0a515);
  // Greyscale + alpha: the warmth comes from `mix-blend-mode: multiply` over the
  // sand surface, so storing colour per pixel would be paying for nothing.
  const channels = 2;
  const data = Buffer.alloc(SIZE * SIZE * channels);

  for (let i = 0; i < SIZE * SIZE; i += 1) {
    const n = next();
    const offset = i * channels;
    // Quantised to 16 levels — invisible at 3% opacity, far cheaper to encode.
    data[offset] = Math.round((120 + n * 110) / 16) * 16;
    data[offset + 1] = Math.round((60 + n * 140) / 16) * 16;
  }

  const png = await sharp(data, { raw: { width: SIZE, height: SIZE, channels } })
    .png({ compressionLevel: 9, palette: true, colors: 16, effort: 10 })
    .toBuffer();

  const target = path.join(MEDIA, 'brand', 'paper-grain.png');
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, png);
  console.log(`paper-grain.png  ${SIZE}×${SIZE}  ${(png.length / 1024).toFixed(1)} KB`);
}

/**
 * The hero poster is NOT generated here — it is a real frame extracted from the
 * restaurant's own reel. See docs/ASSET-HANDOFF.md "Regenerating media" for the
 * exact ffmpeg command. A flat colour field would have been a worse poster and a
 * worse reduced-motion fallback than an actual photograph of the food.
 */
async function main() {
  await grain();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
