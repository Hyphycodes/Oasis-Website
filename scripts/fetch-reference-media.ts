/**
 * Retrieves the current-site media into public/media/ and optimizes it.
 *
 * These are TEMPORARY development references, recorded in docs/ASSET-MANIFEST.md
 * with their source URL and retrieval date. Production never hotlinks Wix — this
 * script exists precisely so it does not have to.
 *
 * Rules enforced here:
 *  - fetch the CDN ORIGINAL (transformation path stripped), never a thumbnail
 *  - never upscale to satisfy the dimension checker
 *  - one copy per asset; no duplicate renditions
 *
 * Run: npm run assets:fetch
 */

import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.resolve(import.meta.dirname, '..');
const MEDIA = path.join(ROOT, 'public', 'media');
/** Untouched masters, kept OUT of the served directory. */
const ORIGINALS = path.join(ROOT, 'media-originals');

interface Source {
  id: string;
  url: string;
  out: string;
  kind: 'image' | 'video';
  /** Longest edge after optimization. Never larger than the source. */
  maxEdge?: number;
  quality?: number;
}

const SOURCES: Source[] = [
  {
    id: 'brandLogo',
    url: 'https://static.wixstatic.com/media/75d74a_8a9adb90bedf4c779d3dc455bc1793cf~mv2.png',
    out: 'brand/oasis-logo.png',
    kind: 'image',
    maxEdge: 1200,
  },
  {
    id: 'storefrontSign',
    url: 'https://static.wixstatic.com/media/75d74a_0ceee05515384b0b9ec2501681efd0b2~mv2.jpeg',
    out: 'home/storefront-sign.jpg',
    kind: 'image',
    maxEdge: 1600,
    quality: 78,
  },
  {
    id: 'lunchDealReel',
    url: 'https://static.wixstatic.com/media/75d74a_b8e2fa52eb7746fc8a0a306ffc98978d~mv2.jpeg',
    out: 'home/lunch-deal-reel.jpg',
    kind: 'image',
    maxEdge: 1728,
    quality: 78,
  },
  {
    id: 'heroVideo',
    url: 'https://video.wixstatic.com/video/75d74a_90dc1ee0e44347af94832b32fbc6709e/720p/mp4/file.mp4',
    out: 'video/hero-loop.mp4',
    kind: 'video',
  },
];

async function fetchBuffer(url: string): Promise<Buffer | null> {
  try {
    const response = await fetch(url, {
      headers: { 'user-agent': 'oasis-website-asset-intake/1.0' },
    });
    if (!response.ok) {
      console.error(`  ✗ HTTP ${response.status}`);
      return null;
    }
    return Buffer.from(await response.arrayBuffer());
  } catch (error) {
    console.error(`  ✗ ${(error as Error).message}`);
    return null;
  }
}

async function main() {
  await mkdir(ORIGINALS, { recursive: true });

  for (const source of SOURCES) {
    console.log(`\n${source.id}`);
    console.log(`  ← ${source.url}`);

    const buffer = await fetchBuffer(source.url);
    if (!buffer) continue;

    const target = path.join(MEDIA, source.out);
    await mkdir(path.dirname(target), { recursive: true });

    // Keep the untouched master outside public/.
    await writeFile(path.join(ORIGINALS, path.basename(source.out)), buffer);

    if (source.kind === 'video') {
      await writeFile(target, buffer);
      console.log(`  → ${source.out} (${(buffer.length / 1e6).toFixed(2)} MB)`);
      continue;
    }

    const image = sharp(buffer);
    const meta = await image.metadata();
    const longest = Math.max(meta.width ?? 0, meta.height ?? 0);
    // Never upscale. A blurry large image is worse than a placeholder.
    const targetEdge = Math.min(source.maxEdge ?? longest, longest);

    const pipeline = image.resize({
      width: (meta.width ?? 0) >= (meta.height ?? 0) ? targetEdge : undefined,
      height: (meta.height ?? 0) > (meta.width ?? 0) ? targetEdge : undefined,
      withoutEnlargement: true,
    });

    const output = source.out.endsWith('.png')
      ? await pipeline.png({ compressionLevel: 9, palette: true }).toBuffer()
      : await pipeline.jpeg({ quality: source.quality ?? 78, mozjpeg: true }).toBuffer();

    await writeFile(target, output);
    const final = await sharp(output).metadata();
    console.log(
      `  → ${source.out} ${final.width}×${final.height} (${(output.length / 1024).toFixed(0)} KB)`,
    );
  }

  console.log('\nMasters kept in media-originals/ (git-ignored).');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
