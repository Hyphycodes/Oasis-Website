/**
 * One-off: bring owner-supplied flyers into the repo at web size.
 *
 * Kept in the tree because the next batch of flyers should be processed the
 * same way — same width, same quality, same place — rather than by hand.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const UPLOADS = '/root/.claude/uploads/078009f3-80f9-5ffa-82ff-a84bcf7b9ec9';
const OUT = path.resolve(import.meta.dirname, '..', 'public', 'events', 'flyers');

/** Source file → the event slug it is the official flyer for. */
const FLYERS: { file: string; slug: string }[] = [
  { file: '8caed12f-image.jpg', slug: 'scream-paint-sip' },
  { file: '44ae6ae8-image.jpg', slug: 'snoopy-paint-sip' },
  { file: '8416f552-image.jpg', slug: 'snoopy-white-sox-paint-sip' },
  { file: 'cc080372-image.jpg', slug: 'hello-kitty-fall-paint-lunch' },
];

await mkdir(OUT, { recursive: true });

for (const { file, slug } of FLYERS) {
  const input = path.join(UPLOADS, file);
  // `rotate()` first so an EXIF-rotated phone photo is written the way it reads.
  const out = await sharp(input).rotate().resize({ width: 1080, withoutEnlargement: true }).jpeg({ quality: 84, mozjpeg: true }).toBuffer();
  const meta = await sharp(out).metadata();
  await writeFile(path.join(OUT, `${slug}.jpg`), out);
  console.warn(`${slug.padEnd(30)} ${meta.width}x${meta.height}  ${Math.round(out.length / 1024)}KB`);
}
