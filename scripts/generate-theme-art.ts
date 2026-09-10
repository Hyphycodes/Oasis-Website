/**
 * Default artwork for the Halloween / Día de los Muertos theme.
 *
 * Every file under public/themes/halloween-dotd/ is produced here, from code,
 * deterministically. Nothing is hotlinked and nothing is stock: the marigolds,
 * papel picado and ornaments are drawn as SVG and rasterised to WebP with alpha
 * by sharp, and the plaster texture is periodic noise, so it tiles.
 *
 * The restaurant can replace any of these through the admin without touching
 * this script. Re-run it only to change the shipped defaults:
 *
 *   npx tsx scripts/generate-theme-art.ts
 */

import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const OUT = path.resolve(import.meta.dirname, '..', 'public', 'themes', 'halloween-dotd');

/* ------------------------------------------------------------------ rng -- */

function rng(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

const fmt = (n: number) => Number(n.toFixed(2)).toString();

/** Linear blend of two hex colours, `t` from 0 (a) to 1 (b). */
function mix(a: string, b: string, t: number): string {
  const parse = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  const [ar, ag, ab] = parse(a) as [number, number, number];
  const [br, bg, bb] = parse(b) as [number, number, number];
  const channel = (x: number, y: number) =>
    Math.round(x + (y - x) * Math.max(0, Math.min(1, t)))
      .toString(16)
      .padStart(2, '0');
  return `#${channel(ar, br)}${channel(ag, bg)}${channel(ab, bb)}`;
}

/* ---------------------------------------------------------------- palette -- */

const P = {
  marigoldDeep: '#a83f12',
  marigold: '#d8731c',
  marigoldMid: '#f0961f',
  marigoldTip: '#f7c445',
  marigoldPale: '#fbd76b',
  leafDark: '#22381f',
  leaf: '#3a5a33',
  leafLight: '#5c7d4a',
  gold: '#cfa456',
  goldPale: '#e6c27a',
  bone: '#e8d7b6',
  burgundy: '#5a1d2f',
  plum: '#3b1735',
  amber: '#b7622a',
  ink: '#0c060a',
};

/* ------------------------------------------------------------- marigold -- */

/**
 * One blossom: five or six rings of ruffled petals, outer rings deep orange,
 * inner rings toward yellow, a dark eye with a few stamens. Everything is
 * rotated a little at random so no two blossoms share a silhouette.
 */
function marigold(cx: number, cy: number, R: number, seed: number, idPrefix: string): string {
  const rand = rng(seed);
  const rings = 6;
  const parts: string[] = [];
  const defs: string[] = [];

  for (let k = 0; k < rings; k += 1) {
    const t = k / (rings - 1); // 0 outer, 1 inner
    const r = R * (1 - 0.15 * k);
    const count = Math.max(7, Math.round(20 - 2.4 * k));
    const offset = rand() * 360;
    const w = r * (0.34 - 0.03 * k);
    const id = `${idPrefix}g${k}`;
    const from = mix(P.marigoldDeep, P.marigold, t * 0.6);
    const mid = mix(P.marigold, P.marigoldMid, 0.25 + t * 0.6);
    const tip = mix(P.marigoldMid, P.marigoldTip, 0.3 + t * 0.7);
    defs.push(
      `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${from}"/><stop offset=".55" stop-color="${mid}"/><stop offset="1" stop-color="${tip}"/></linearGradient>`,
    );

    const petals: string[] = [];
    for (let i = 0; i < count; i += 1) {
      const angle = offset + (360 / count) * i + (rand() - 0.5) * 8;
      const len = r * (0.92 + rand() * 0.16);
      const ww = w * (0.85 + rand() * 0.3);
      const d = petalPath(len, ww);
      petals.push(
        `<path d="${d}" fill="url(#${id})" stroke="${mix(P.marigoldDeep, P.ink, 0.25)}" stroke-opacity=".28" stroke-width="${fmt(R * 0.012)}" transform="rotate(${fmt(angle)})"/>`,
      );
    }
    parts.push(`<g>${petals.join('')}</g>`);
  }

  // The eye.
  const eyeId = `${idPrefix}eye`;
  defs.push(
    `<radialGradient id="${eyeId}"><stop offset="0" stop-color="#7a2b0c"/><stop offset=".7" stop-color="#5a1e0a"/><stop offset="1" stop-color="#8f3a10" stop-opacity="0"/></radialGradient>`,
  );
  parts.push(`<circle r="${fmt(R * 0.2)}" fill="url(#${eyeId})"/>`);
  const stamens: string[] = [];
  for (let i = 0; i < 9; i += 1) {
    const a = (i / 9) * Math.PI * 2 + rand() * 0.3;
    const d = R * (0.05 + rand() * 0.08);
    stamens.push(
      `<circle cx="${fmt(Math.cos(a) * d)}" cy="${fmt(Math.sin(a) * d)}" r="${fmt(R * 0.022)}" fill="${P.marigoldPale}" opacity=".85"/>`,
    );
  }
  parts.push(stamens.join(''));

  return `<defs>${defs.join('')}</defs><g transform="translate(${fmt(cx)} ${fmt(cy)})">${parts.join('')}</g>`;
}

/** A ruffled petal pointing along +y from the origin. */
function petalPath(len: number, w: number): string {
  const l = len;
  return [
    `M0 0`,
    `C ${fmt(w * 0.55)} ${fmt(l * 0.3)}, ${fmt(w * 1.05)} ${fmt(l * 0.72)}, ${fmt(w * 0.42)} ${fmt(l * 0.96)}`,
    `Q ${fmt(w * 0.2)} ${fmt(l * 0.9)}, 0 ${fmt(l)}`,
    `Q ${fmt(-w * 0.2)} ${fmt(l * 0.9)}, ${fmt(-w * 0.42)} ${fmt(l * 0.96)}`,
    `C ${fmt(-w * 1.05)} ${fmt(l * 0.72)}, ${fmt(-w * 0.55)} ${fmt(l * 0.3)}, 0 0 Z`,
  ].join(' ');
}

/** A closed bud: three overlapping petal shapes on a short green calyx. */
function bud(cx: number, cy: number, R: number, angle: number, seed: number): string {
  const rand = rng(seed);
  const petals = [-26, 0, 26]
    .map((a, i) => {
      const fill = i === 1 ? P.marigoldMid : P.marigold;
      return `<path d="${petalPath(R, R * 0.36)}" fill="${fill}" stroke="${P.marigoldDeep}" stroke-opacity=".35" stroke-width="${fmt(R * 0.03)}" transform="rotate(${a + (rand() - 0.5) * 6})"/>`;
    })
    .join('');
  const calyx = `<path d="M ${fmt(-R * 0.22)} 0 Q 0 ${fmt(-R * 0.4)} ${fmt(R * 0.22)} 0 L ${fmt(R * 0.12)} ${fmt(R * 0.18)} L ${fmt(-R * 0.12)} ${fmt(R * 0.18)} Z" fill="${P.leaf}"/>`;
  return `<g transform="translate(${fmt(cx)} ${fmt(cy)}) rotate(${fmt(angle)})">${petals}${calyx}</g>`;
}

/** A feathery marigold leaf sprig along a direction. */
function sprig(
  x: number,
  y: number,
  length: number,
  angle: number,
  seed: number,
  idPrefix: string,
): string {
  const rand = rng(seed);
  const leaflets: string[] = [];
  const n = Math.round(length / 22);
  for (let i = 1; i <= n; i += 1) {
    const t = i / n;
    const px = t * length;
    const size = 14 + 18 * Math.sin(Math.PI * Math.min(1, t * 1.1)) * (0.8 + rand() * 0.4);
    for (const side of [-1, 1]) {
      const a = side * (58 + rand() * 18);
      leaflets.push(
        `<path d="M0 0 C ${fmt(size * 0.35)} ${fmt(-size * 0.18)}, ${fmt(size * 0.9)} ${fmt(-size * 0.1)}, ${fmt(size)} 0 C ${fmt(size * 0.9)} ${fmt(size * 0.1)}, ${fmt(size * 0.35)} ${fmt(size * 0.18)}, 0 0 Z" fill="url(#${idPrefix}leaf)" transform="translate(${fmt(px)} 0) rotate(${fmt(a)})"/>`,
      );
    }
  }
  const stem = `<path d="M0 0 L ${fmt(length)} 0" stroke="${P.leafDark}" stroke-width="2.4" stroke-linecap="round"/>`;
  return `<g transform="translate(${fmt(x)} ${fmt(y)}) rotate(${fmt(angle)})">${stem}${leaflets.join('')}</g>`;
}

function leafDefs(idPrefix: string): string {
  return `<linearGradient id="${idPrefix}leaf" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${P.leafDark}"/><stop offset=".6" stop-color="${P.leaf}"/><stop offset="1" stop-color="${P.leafLight}"/></linearGradient>`;
}

function shadowFilter(id: string, blur: number, dy: number, opacity: number): string {
  return `<filter id="${id}" x="-20%" y="-20%" width="140%" height="150%"><feGaussianBlur in="SourceAlpha" stdDeviation="${blur}"/><feOffset dy="${dy}"/><feComponentTransfer><feFuncA type="linear" slope="${opacity}"/></feComponentTransfer><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter>`;
}

/**
 * A cluster of blossoms for the hero edge. Composed on a 900×1000 canvas so
 * the largest blossoms sit toward the OUTSIDE edge and the sprigs trail into
 * the frame — the CSS pulls the outside edge off-screen.
 */
function marigoldCluster(seed: number, mirror: boolean): string {
  const W = 900;
  const H = 1000;
  const rand = rng(seed);
  const id = mirror ? 'r' : 'l';
  const blossoms = [
    { x: 150, y: 250, r: 165 },
    { x: 380, y: 130, r: 112 },
    { x: 330, y: 470, r: 138 },
    { x: 130, y: 620, r: 120 },
    { x: 520, y: 330, r: 88 },
    { x: 420, y: 700, r: 96 },
    { x: 230, y: 850, r: 78 },
    { x: 600, y: 560, r: 62 },
  ];
  const sprigs = [
    sprig(280, 200, 330, 14, seed + 11, id),
    sprig(200, 560, 380, -22, seed + 12, id),
    sprig(470, 420, 300, 38, seed + 13, id),
    sprig(360, 760, 320, 8, seed + 14, id),
    sprig(150, 380, 260, 62, seed + 15, id),
    sprig(560, 640, 240, -48, seed + 16, id),
  ];
  const buds = [
    bud(640, 250, 44, 70, seed + 21),
    bud(700, 470, 38, 95, seed + 22),
    bud(560, 800, 40, 120, seed + 23),
    bud(80, 430, 36, -40, seed + 24),
  ];
  const flowers = blossoms
    .sort((a, b) => b.r - a.r)
    .map((b, i) => marigold(b.x, b.y, b.r * (0.96 + rand() * 0.08), seed + i * 7, `${id}${i}`))
    .join('');

  const inner = `<g filter="url(#${id}sh)">${sprigs.join('')}${buds.join('')}${flowers}</g>`;
  const transform = mirror ? `transform="translate(${W} 0) scale(-1 1)"` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs>${leafDefs(id)}${shadowFilter(`${id}sh`, 10, 14, 0.55)}</defs><g ${transform}>${inner}</g></svg>`;
}

/** Smaller cluster for the footer corners. */
function foregroundCluster(seed: number): string {
  const W = 700;
  const H = 620;
  const id = 'f';
  const rand = rng(seed);
  const blossoms = [
    { x: 150, y: 420, r: 150 },
    { x: 380, y: 300, r: 118 },
    { x: 330, y: 540, r: 96 },
    { x: 560, y: 470, r: 84 },
  ];
  const sprigs = [
    sprig(230, 300, 340, -30, seed + 1, id),
    sprig(430, 420, 260, 20, seed + 2, id),
    sprig(120, 560, 300, -8, seed + 3, id),
  ];
  const buds = [bud(560, 300, 40, 40, seed + 4), bud(620, 580, 36, 110, seed + 5)];
  const flowers = blossoms
    .sort((a, b) => b.r - a.r)
    .map((b, i) => marigold(b.x, b.y, b.r * (0.96 + rand() * 0.08), seed + i * 5, `${id}${i}`))
    .join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs>${leafDefs(id)}${shadowFilter(`${id}sh`, 9, 12, 0.5)}</defs><g filter="url(#${id}sh)">${sprigs.join('')}${buds.join('')}${flowers}</g></svg>`;
}

/* ---------------------------------------------------------- papel picado -- */

/**
 * A string of cut-paper pennants. Each is a filled rectangle with the pattern
 * subtracted (even-odd), so the plum canvas shows through the cuts. Patterns:
 * a marigold rosette, a lattice of diamonds, a calavera-free floral medallion,
 * and a scalloped lower edge on every one.
 */
function papelPicado(seed: number): string {
  const W = 2400;
  const H = 360;
  const rand = rng(seed);
  const colours = [P.burgundy, P.marigold, P.plum, P.bone, P.amber, P.burgundy, P.gold, P.plum, P.marigold, P.bone, P.amber];
  const pw = 176;
  const ph = 230;
  const gap = 42;
  const count = Math.floor((W + gap) / (pw + gap));
  const start = (W - count * (pw + gap) + gap) / 2;
  const pennants: string[] = [];

  // The string: a shallow catenary, slightly asymmetric.
  const stringPath = `M0 26 Q ${W * 0.5} 74 ${W} 22`;

  for (let i = 0; i < count; i += 1) {
    const x = start + i * (pw + gap);
    const t = (x + pw / 2) / W;
    const y = 26 + (74 - 26) * 4 * t * (1 - t) + (rand() - 0.5) * 6;
    const rot = (rand() - 0.5) * 4.2;
    const colour = colours[i % colours.length]!;
    const pattern = patternPath(i % 4, pw, ph, rand);
    const scallop = scallopEdge(pw, ph);
    const outer = `M0 0 H ${pw} V ${ph - 22} ${scallop} Z`;
    const paper = colour === P.bone ? 0.9 : 0.97;
    pennants.push(
      `<g transform="translate(${fmt(x)} ${fmt(y)}) rotate(${fmt(rot)} ${fmt(pw / 2)} 0)">` +
        `<path d="${outer} ${pattern}" fill="${colour}" fill-opacity="${paper}" fill-rule="evenodd"/>` +
        `<rect x="0" y="0" width="${pw}" height="10" fill="${P.ink}" fill-opacity=".18"/>` +
        `</g>`,
    );
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs>${shadowFilter('psh', 6, 10, 0.5)}</defs><g filter="url(#psh)"><path d="${stringPath}" fill="none" stroke="${P.ink}" stroke-width="3"/>${pennants.join('')}</g></svg>`;
}

function scallopEdge(pw: number, ph: number): string {
  const n = 6;
  const step = pw / n;
  let d = '';
  for (let i = n; i > 0; i -= 1) {
    const x1 = i * step;
    const x0 = (i - 1) * step;
    d += ` Q ${fmt((x1 + x0) / 2)} ${fmt(ph + 6)} ${fmt(x0)} ${fmt(ph - 22)}`;
  }
  return d;
}

function circle(cx: number, cy: number, r: number): string {
  return `M ${fmt(cx - r)} ${fmt(cy)} a ${fmt(r)} ${fmt(r)} 0 1 0 ${fmt(r * 2)} 0 a ${fmt(r)} ${fmt(r)} 0 1 0 ${fmt(-r * 2)} 0 Z`;
}

function diamond(cx: number, cy: number, w: number, h: number): string {
  return `M ${fmt(cx)} ${fmt(cy - h)} L ${fmt(cx + w)} ${fmt(cy)} L ${fmt(cx)} ${fmt(cy + h)} L ${fmt(cx - w)} ${fmt(cy)} Z`;
}

function petalCut(cx: number, cy: number, len: number, w: number, angle: number): string {
  const p = petalPath(len, w);
  // Rotate by hand: the path is emitted inside a single path element, so no
  // transform attribute is available. Cheap 2D rotation of the control points.
  const rad = (angle * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  return p.replace(/(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)/g, (_, xs, ys) => {
    const x = Number(xs);
    const y = Number(ys);
    return `${fmt(cx + x * cos - y * sin)} ${fmt(cy + x * sin + y * cos)}`;
  });
}

function patternPath(kind: number, pw: number, ph: number, rand: () => number): string {
  const cx = pw / 2;
  const cy = ph * 0.46;
  const parts: string[] = [];

  // A border of small ovals along both long edges, every pennant.
  for (let y = 26; y < ph - 40; y += 22) {
    parts.push(circle(14, y, 4.2), circle(pw - 14, y, 4.2));
  }

  if (kind === 0) {
    // Marigold rosette.
    for (let i = 0; i < 10; i += 1) parts.push(petalCut(cx, cy, 52, 15, (360 / 10) * i));
    for (let i = 0; i < 8; i += 1) parts.push(petalCut(cx, cy, 30, 10, (360 / 8) * i + 22));
    parts.push(circle(cx, cy, 7));
    for (let i = 0; i < 6; i += 1) {
      const a = (i / 6) * Math.PI * 2;
      parts.push(circle(cx + Math.cos(a) * 74, cy + Math.sin(a) * 74, 5));
    }
  } else if (kind === 1) {
    // Lattice of diamonds.
    for (let row = 0; row < 5; row += 1) {
      for (let col = 0; col < 4; col += 1) {
        const x = 34 + col * 36 + (row % 2) * 18;
        const y = 44 + row * 32;
        if (x > 24 && x < pw - 24) parts.push(diamond(x, y, 10, 15));
      }
    }
  } else if (kind === 2) {
    // Floral medallion: a ring of leaves around a small sun.
    parts.push(circle(cx, cy, 16));
    for (let i = 0; i < 12; i += 1) {
      const a = (i / 12) * Math.PI * 2;
      parts.push(circle(cx + Math.cos(a) * 30, cy + Math.sin(a) * 30, 5.5));
    }
    for (let i = 0; i < 8; i += 1) parts.push(petalCut(cx, cy + 0, 74, 11, (360 / 8) * i + 22.5).replace(/^M/, 'M'));
    parts.push(diamond(cx, ph - 62, 14, 20));
  } else {
    // Rising crescents and stars, the night-sky pennant.
    for (let i = 0; i < 3; i += 1) {
      const y = 50 + i * 52;
      parts.push(circle(cx - 34, y, 9), circle(cx + 34, y + 20, 7), diamond(cx, y + 10, 9, 14));
    }
    parts.push(circle(cx, ph - 56, 12 + rand() * 2));
  }

  return parts.join(' ');
}

/* --------------------------------------------------------------- divider -- */

function divider(seed: number): string {
  const W = 1600;
  const H = 200;
  const cx = W / 2;
  const cy = 104;
  const id = 'd';
  const parts: string[] = [];

  // Filigree: two mirrored scrolls in antique gold, fading out.
  const scroll = (dir: number) =>
    `<g transform="translate(${cx} ${cy}) scale(${dir} 1)">` +
    `<path d="M 120 0 C 220 -34, 300 34, 400 0 S 580 -30, 700 0" fill="none" stroke="url(#${id}fade)" stroke-width="2.4" stroke-linecap="round"/>` +
    `<path d="M 140 0 C 200 -60, 260 -52, 250 -12 C 244 12, 200 8, 208 -14" fill="none" stroke="${P.gold}" stroke-width="2" stroke-linecap="round" opacity=".85"/>` +
    `<path d="M 300 0 C 340 40, 390 34, 386 6 C 384 -10, 356 -8, 362 6" fill="none" stroke="${P.gold}" stroke-width="1.8" stroke-linecap="round" opacity=".7"/>` +
    `<circle cx="470" cy="0" r="4" fill="${P.gold}" opacity=".8"/><circle cx="560" cy="-8" r="2.6" fill="${P.goldPale}" opacity=".7"/><circle cx="640" cy="4" r="2" fill="${P.gold}" opacity=".5"/>` +
    `</g>`;

  parts.push(scroll(1), scroll(-1));
  parts.push(sprig(cx - 70, cy + 4, 120, 196, seed + 1, id));
  parts.push(sprig(cx + 70, cy + 4, 120, -16, seed + 2, id));
  parts.push(bud(cx - 118, cy - 8, 26, -70, seed + 3), bud(cx + 118, cy - 8, 26, 70, seed + 4));
  parts.push(marigold(cx - 62, cy + 8, 40, seed + 5, `${id}a`));
  parts.push(marigold(cx + 62, cy + 8, 40, seed + 6, `${id}b`));
  parts.push(marigold(cx, cy - 4, 58, seed + 7, `${id}c`));

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs>` +
    `<linearGradient id="${id}fade" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${P.gold}"/><stop offset=".7" stop-color="${P.gold}" stop-opacity=".6"/><stop offset="1" stop-color="${P.gold}" stop-opacity="0"/></linearGradient>` +
    `${leafDefs(id)}${shadowFilter(`${id}sh`, 6, 8, 0.5)}</defs><g filter="url(#${id}sh)">${parts.join('')}</g></svg>`
  );
}

/* ----------------------------------------------------------------- petal -- */

function petal(): string {
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="32" viewBox="-12 -2 24 32">` +
    `<defs><linearGradient id="p" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${P.marigoldDeep}"/><stop offset=".55" stop-color="${P.marigoldMid}"/><stop offset="1" stop-color="${P.marigoldTip}"/></linearGradient></defs>` +
    `<path d="${petalPath(28, 9)}" fill="url(#p)"/></svg>`
  );
}

/* --------------------------------------------------------------- texture -- */

/** Periodic value noise: tiles seamlessly at the canvas size. */
async function texture(size: number, seed: number): Promise<Buffer> {
  const rand = rng(seed);
  const octaves = [
    { cells: 6, amp: 0.5 },
    { cells: 12, amp: 0.28 },
    { cells: 24, amp: 0.14 },
    { cells: 48, amp: 0.08 },
  ];
  const lattices = octaves.map(({ cells }) => {
    const grid = new Float32Array(cells * cells);
    for (let i = 0; i < grid.length; i += 1) grid[i] = rand();
    return { cells, grid };
  });
  const smooth = (t: number) => t * t * (3 - 2 * t);

  const pixels = Buffer.alloc(size * size);
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      let value = 0;
      for (let o = 0; o < octaves.length; o += 1) {
        const { cells, grid } = lattices[o]!;
        const fx = (x / size) * cells;
        const fy = (y / size) * cells;
        const x0 = Math.floor(fx);
        const y0 = Math.floor(fy);
        const tx = smooth(fx - x0);
        const ty = smooth(fy - y0);
        const g = (gx: number, gy: number) => grid[((gy % cells) + cells) % cells * cells + (((gx % cells) + cells) % cells)]!;
        const a = g(x0, y0) + (g(x0 + 1, y0) - g(x0, y0)) * tx;
        const b = g(x0, y0 + 1) + (g(x0 + 1, y0 + 1) - g(x0, y0 + 1)) * tx;
        value += (a + (b - a) * ty - 0.5) * octaves[o]!.amp;
      }
      // Fine grain on top, so it reads as plaster rather than as blur.
      value += (rand() - 0.5) * 0.16;
      pixels[y * size + x] = Math.max(0, Math.min(255, Math.round(128 + value * 150)));
    }
  }

  return sharp(pixels, { raw: { width: size, height: size, channels: 1 } })
    .webp({ quality: 72 })
    .toBuffer();
}

/* ------------------------------------------------------------------ main -- */

async function rasterise(svg: string, file: string, width: number): Promise<void> {
  const out = await sharp(Buffer.from(svg), { density: 96 })
    .resize({ width })
    .webp({ quality: 84, alphaQuality: 92, effort: 5 })
    .toBuffer();
  await writeFile(path.join(OUT, file), out);
  console.log(`${file.padEnd(22)} ${(out.length / 1024).toFixed(0)}KB`);
}

async function main() {
  await mkdir(OUT, { recursive: true });

  await rasterise(marigoldCluster(31, false), 'marigold-left.webp', 900);
  await rasterise(marigoldCluster(31, true), 'marigold-right.webp', 900);
  await rasterise(foregroundCluster(77), 'foreground.webp', 700);
  await rasterise(papelPicado(1031), 'papel-picado.webp', 2400);
  await rasterise(divider(2026), 'divider.webp', 1600);

  const petalSvg = petal();
  await writeFile(path.join(OUT, 'petal.svg'), petalSvg);
  console.log(`petal.svg              ${(petalSvg.length / 1024).toFixed(1)}KB`);

  const tex = await texture(480, 1111);
  await writeFile(path.join(OUT, 'texture.webp'), tex);
  console.log(`texture.webp           ${(tex.length / 1024).toFixed(0)}KB`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
