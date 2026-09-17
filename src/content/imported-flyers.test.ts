import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import sharp from 'sharp';
import flyers from './imported-flyers.json';

describe('official flyer handoff', () => {
  it('ships every sourced flyer at its recorded size and a bounded weight', async () => {
    for (const [id, flyer] of Object.entries(flyers)) {
      expect(flyer.source).toContain(`/events/${id}/`);
      expect(Number.isFinite(Date.parse(flyer.startsAt))).toBe(true);
      const file=path.join(process.cwd(),'public',flyer.path);
      expect((await stat(file)).size).toBeLessThan(500000);
      const metadata=await sharp(await readFile(file)).metadata();
      expect(metadata.width).toBe(flyer.width);expect(metadata.height).toBe(flyer.height);
    }
  });
});
