/**
 * Website key art for events.
 *
 * Every file under public/events/ is produced here, from code, deterministically.
 * Nothing is hotlinked, nothing is stock, and re-running this produces byte-for-
 * byte the same output — so the art is reviewable in a diff like any other
 * source.
 *
 * WHAT THIS IS AND IS NOT.
 * This is SECONDARY art: a wide, atmospheric background the website composes an
 * event's card and page around. It is never the event's flyer. The official
 * flyer is the restaurant's own artwork, it lives in its own slot, and the site
 * always shows it whole (see docs/events-system.md).
 *
 * The compositions are built the way a photograph of a lit room is built —
 * a ground, a light source, something for the light to fall through, haze, a
 * vignette and grain — rather than as flat gradients, because the brief is
 * cinematic and dimensional and a flat gradient is neither.
 *
 *   npx tsx scripts/generate-event-art.ts
 */

import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { PRESET_STYLE, type VisualPreset } from '../src/content/event-presentation';

const OUT = path.resolve(import.meta.dirname, '..', 'public', 'events');

const WIDE = { w: 1600, h: 900 };
const TALL = { w: 900, h: 1125 };
// A second, small rendering of the same frame. The events page puts key art in
// a 112px thumbnail; handing that slot a 1600px file is indefensible however
// few kilobytes it is, and a `srcset` needs something to choose between.
const WIDE_SM = { w: 640, h: 360 };
const TALL_SM = { w: 448, h: 560 };

/* ------------------------------------------------------------------- rng -- */

function rng(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

const f = (n: number) => Number(n.toFixed(2)).toString();

/** Blend two hex colours. */
function mix(a: string, b: string, t: number): string {
  const parse = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  const [ar, ag, ab] = parse(a) as [number, number, number];
  const [br, bg, bb] = parse(b) as [number, number, number];
  const ch = (x: number, y: number) =>
    Math.round(x + (y - x) * Math.max(0, Math.min(1, t)))
      .toString(16)
      .padStart(2, '0');
  return `#${ch(ar, br)}${ch(ag, bg)}${ch(ab, bb)}`;
}

/* --------------------------------------------------------------- motifs -- */

/**
 * The thing the light falls through. Each motif is a silhouette in front of the
 * light source, which is what gives the composition its depth: something near,
 * something far, and air in between.
 */
type Motif = 'easels' | 'papel' | 'arches' | 'lanterns' | 'palms' | 'curtain';

/** Painting easels in perspective — for Paint & Sip nights. */
function easels(rand: () => number, W: number, H: number, ink: string): string {
  const parts: string[] = [];
  const count = 5;
  for (let i = 0; i < count; i += 1) {
    const t = i / (count - 1);
    // Further away = smaller, higher, dimmer. One-point perspective by hand.
    const scale = 0.45 + t * 0.75;
    const x = W * (0.06 + t * 0.84) + (rand() - 0.5) * W * 0.03;
    const base = H * (0.98 - (1 - t) * 0.12);
    const cw = 150 * scale;
    const chh = 190 * scale;
    const top = base - chh * 1.55;
    const opacity = 0.5 + t * 0.42;

    parts.push(
      `<g opacity="${f(opacity)}">` +
        // legs
        `<path d="M${f(x - cw * 0.42)} ${f(base)} L${f(x)} ${f(top + chh * 0.2)} L${f(x + cw * 0.42)} ${f(base)}" fill="none" stroke="${ink}" stroke-width="${f(4 * scale)}" stroke-linecap="round"/>` +
        `<path d="M${f(x - cw * 0.3)} ${f(base - chh * 0.42)} L${f(x + cw * 0.3)} ${f(base - chh * 0.42)}" stroke="${ink}" stroke-width="${f(3.4 * scale)}" stroke-linecap="round"/>` +
        // canvas — the only bright thing, catching the light
        `<rect x="${f(x - cw / 2)} " y="${f(top)}" width="${f(cw)}" height="${f(chh)}" rx="${f(2 * scale)}" fill="url(#canvasFill)" stroke="${ink}" stroke-width="${f(2.6 * scale)}"/>` +
        `</g>`,
    );
  }
  return parts.join('');
}

/**
 * Papel picado hanging across the top.
 *
 * The cuts are a MASK, so the light behind the bunting comes through them.
 * Drawn as dark circles on top of the flag they were invisible, which defeats
 * the point of papel picado entirely.
 */
function papel(rand: () => number, W: number, H: number, ink: string): string {
  const flags: string[] = [];
  const holes: string[] = [];
  const pw = W / 11;
  for (let i = 0; i < 12; i += 1) {
    const x = i * pw - pw * 0.2;
    const sag = Math.sin((i / 11) * Math.PI) * H * 0.045;
    const ph = H * 0.17 + rand() * H * 0.02;
    const fw = pw * 0.82;

    // A scalloped bottom edge, the way the real thing is cut.
    const scallops: string[] = [];
    for (let c = 0; c < 4; c += 1) {
      const sx = x + fw * (c / 4);
      scallops.push(`Q ${f(sx + fw * 0.125)} ${f(sag + ph + ph * 0.09)} ${f(sx + fw * 0.25)} ${f(sag + ph)}`);
    }
    flags.push(`<path d="M${f(x)} ${f(sag)} H${f(x + fw)} V${f(sag + ph)} ${scallops.join(' ')} Z" fill="#fff"/>`);

    for (let r = 0; r < 3; r += 1) {
      for (let c = 0; c < 3; c += 1) {
        const hx = x + fw * (0.22 + c * 0.28);
        const hy = sag + ph * (0.24 + r * 0.22);
        holes.push(
          r === 1
            ? `<rect x="${f(hx - pw * 0.05)}" y="${f(hy - pw * 0.05)}" width="${f(pw * 0.1)}" height="${f(pw * 0.1)}" transform="rotate(45 ${f(hx)} ${f(hy)})" fill="#000"/>`
            : `<circle cx="${f(hx)}" cy="${f(hy)}" r="${f(pw * 0.05)}" fill="#000"/>`,
        );
      }
    }
  }

  const id = `papel${Math.round(rand() * 1e6)}`;
  const string = `<path d="M0 ${f(H * 0.012)} Q ${f(W / 2)} ${f(H * 0.075)} ${W} ${f(H * 0.01)}" fill="none" stroke="${ink}" stroke-width="2.5" opacity="0.75"/>`;
  return (
    `<defs><mask id="${id}">${flags.join('')}${holes.join('')}</mask></defs>` +
    `<rect width="${W}" height="${f(H * 0.3)}" fill="${ink}" mask="url(#${id})" opacity="0.85"/>` +
    string
  );
}

/**
 * A Moorish arcade: one dark wall with lit openings cut out of it.
 *
 * Drawn as a single even-odd path — the wall, then an arch subpath per bay —
 * so the openings are genuine holes and the light behind the wall comes
 * through them. Four concentric strokes sharing a centre read as a rainbow;
 * a pierced wall reads as a room.
 */
function arches(rand: () => number, W: number, H: number, ink: string): string {
  const bays = 5;
  const top = H * 0.1;
  const bay = W / bays;
  const pier = bay * 0.24;
  const openW = bay - pier;
  const r = openW / 2;
  const springs = top + H * 0.3;

  let d = `M0 ${f(top)} H${W} V${H} H0 Z`;
  for (let i = 0; i < bays; i += 1) {
    const x = i * bay + pier / 2;
    const jitter = (rand() - 0.5) * H * 0.012;
    const sill = H * 1.02;
    // Horseshoe: the arc carries slightly past the half-circle before the
    // jambs drop, which is the shape that says "Moorish" rather than "Roman".
    d +=
      ` M${f(x)} ${f(sill)}` +
      ` V${f(springs + jitter)}` +
      ` A ${f(r)} ${f(r * 1.18)} 0 0 1 ${f(x + openW)} ${f(springs + jitter)}` +
      ` V${f(sill)} Z`;
  }

  // A second, dimmer arcade further back, offset by half a bay so the two
  // planes never line up and the eye reads depth.
  const back: string[] = [];
  for (let i = 0; i <= bays; i += 1) {
    const x = i * bay - bay / 2 + pier / 2;
    back.push(
      `<path d="M${f(x)} ${H} V${f(springs + H * 0.1)} A ${f(r)} ${f(r * 1.1)} 0 0 1 ${f(x + openW)} ${f(springs + H * 0.1)} V${H}" fill="none" stroke="${ink}" stroke-width="${f(W * 0.006)}" opacity="0.4"/>`,
    );
  }

  return `<g opacity="0.34">${back.join('')}</g><path d="${d}" fill="${ink}" fill-rule="evenodd" opacity="0.9"/>`;
}

/** Hanging lanterns / bulbs — nightlife. */
function lanterns(rand: () => number, W: number, H: number, ink: string): string {
  const parts: string[] = [];
  for (let i = 0; i < 14; i += 1) {
    const x = (i + 0.5) * (W / 14) + (rand() - 0.5) * W * 0.02;
    const drop = H * (0.06 + rand() * 0.26);
    const r = 7 + rand() * 9;
    parts.push(
      `<g><path d="M${f(x)} 0 L${f(x)} ${f(drop)}" stroke="${ink}" stroke-width="1.6" opacity="0.5"/>` +
        `<circle cx="${f(x)}" cy="${f(drop + r)}" r="${f(r)}" fill="url(#bulb)"/></g>`,
    );
  }
  return parts.join('');
}

/**
 * Palm fronds from the edges — the Oasis house motif.
 *
 * Filled and serrated rather than drawn leaflet by leaflet. A palm in low
 * light is a dark MASS with a ragged edge; forty hairline strokes read as a
 * feather at full size and as fuzz at card size, which is where these actually
 * get looked at.
 */
function palms(rand: () => number, W: number, H: number, ink: string): string {
  const frond = (cx: number, cy: number, angle: number, len: number) => {
    // The spine falls away as it reaches out. A straight spine is the other
    // reason a drawn frond stops looking like a palm.
    const droop = len * 0.28;
    const spine = (t: number) => droop * t * t;
    // Widest a third of the way out, nothing at the tip.
    const half = (t: number) => len * 0.26 * Math.sin(Math.PI * Math.min(1, 0.08 + t * 0.92));

    const blade = (side: number) => {
      const n = 46;
      const outer: string[] = [];
      for (let i = 0; i <= n; i += 1) {
        const t = i / n;
        const x = t * len;
        const y = spine(t);
        const w = half(t);
        // Every other vertex pulls back to the spine: that alternation is the
        // gap between one leaflet and the next.
        // Shallow: a fringe, not a saw. At 0.52 the notches were half the
        // blade deep and the frond read as a row of triangles.
        const notch = i % 2 === 0 ? 1 : 0.84 + rand() * 0.06;
        // Leaflets trail backward toward the base as they go out.
        const lag = w * 0.34;
        outer.push(`${f(x - lag * notch)} ${f(y + side * w * notch + w * 0.16)}`);
      }
      // Back along the spine to close the shape.
      const back: string[] = [];
      for (let i = n; i >= 0; i -= 1) {
        const t = i / n;
        back.push(`${f(t * len)} ${f(spine(t))}`);
      }
      return `<path d="M${outer.join(' L')} L${back.join(' L')} Z" fill="${ink}"/>`;
    };

    const rachis = `<path d="M0 0 Q ${f(len * 0.55)} ${f(spine(0.55) * 0.7)} ${f(len)} ${f(spine(1))}" fill="none" stroke="${ink}" stroke-width="${f(len * 0.016)}" stroke-linecap="round"/>`;
    return `<g transform="translate(${f(cx)} ${f(cy)}) rotate(${f(angle)})" opacity="0.82">${blade(-1)}${blade(1)}${rachis}</g>`;
  };
  return (
    frond(-W * 0.06, -H * 0.02, 28 + rand() * 8, W * 0.46) +
    frond(-W * 0.04, H * 0.3, 8 + rand() * 6, W * 0.34) +
    frond(W * 1.06, H * 0.02, 152 + rand() * 8, W * 0.44) +
    frond(W * 1.04, H * 0.48, 174 + rand() * 6, W * 0.3)
  );
}

/** A heavy stage curtain, parted. */
function curtain(rand: () => number, W: number, H: number, ink: string): string {
  const fold = (x0: number, w: number, dir: number) => {
    const parts: string[] = [];
    const n = 7;
    for (let i = 0; i <= n; i += 1) {
      const x = x0 + dir * (i / n) * w;
      const sway = Math.sin(i * 1.3 + rand()) * w * 0.03;
      parts.push(
        `<path d="M${f(x)} 0 C ${f(x + sway)} ${f(H * 0.35)}, ${f(x - sway)} ${f(H * 0.7)}, ${f(x + sway * 0.5)} ${H}" fill="none" stroke="${ink}" stroke-width="${f(w * 0.055)}" opacity="${f(0.22 + (i / n) * 0.4)}"/>`,
      );
    }
    return parts.join('');
  };
  return fold(0, W * 0.26, 1) + fold(W, W * 0.26, -1);
}

const MOTIFS: Record<Motif, (rand: () => number, W: number, H: number, ink: string) => string> = {
  easels,
  papel,
  arches,
  lanterns,
  palms,
  curtain,
};

/* ---------------------------------------------------------- composition -- */

/**
 * One key-art frame.
 *
 * Order matters and is the whole trick: ground, glow, the light shaft, the
 * silhouette the light falls behind, haze in front of that, vignette, grain.
 * Anything rendered after the haze reads as nearer to the camera.
 */
function frame(
  preset: VisualPreset,
  motif: Motif,
  seed: number,
  size: { w: number; h: number },
): { base: string; light: string } {
  const rand = rng(seed);
  const style = PRESET_STYLE[preset];
  const { w: W, h: H } = size;

  const deep = mix(style.surface, '#000000', 0.35);
  // The lit end of the room carries a real wash of the event's colour. At 0.12
  // it was within a few levels of the surface, which is why everything drawn
  // against it disappeared.
  const lift = mix(style.surface, style.accent, 0.44);
  // Silhouettes are nearly black ON PURPOSE: a shape is only a silhouette if it
  // is darker than what is behind it.
  const ink = mix(style.surface, '#000000', 0.86);

  // The light source sits off-centre; everything else is composed around it.
  const lx = 0.26 + rand() * 0.5;
  const ly = 0.06 + rand() * 0.16;

  const hazeBands: string[] = [];
  for (let i = 0; i < 4; i += 1) {
    const y = H * (0.45 + i * 0.14 + rand() * 0.04);
    hazeBands.push(
      `<ellipse cx="${f(W * (0.3 + rand() * 0.45))}" cy="${f(y)}" rx="${f(W * (0.42 + rand() * 0.3))}" ry="${f(H * (0.05 + rand() * 0.05))}" fill="url(#haze)" opacity="${f(0.16 + rand() * 0.16)}"/>`,
    );
  }

  // Out-of-focus highlights. A dark room shot on a fast lens is mostly these;
  // without them the frame is a gradient with objects on it. `rand() * rand()`
  // biases the radius small, so a few large discs sit among many little ones
  // rather than the sizes being evenly spread.
  const bokeh: string[] = [];
  for (let i = 0; i < 54; i += 1) {
    const r = 5 + rand() * rand() * 48;
    const bx = rand() * W;
    const by = H * (0.03 + rand() * 0.8);
    bokeh.push(
      `<circle cx="${f(bx)}" cy="${f(by)}" r="${f(r)}" fill="url(#bokeh)" opacity="${f(0.07 + (1 - r / 53) * 0.24)}"/>`,
    );
  }

  // The light is rendered separately and blurred hard before compositing.
  // A polygon with a gradient reads as a shape; the same polygon softened until
  // its edges are gone reads as air with light in it. That is the whole
  // difference between this and a flat gradient background.
  const shafts: string[] = [];
  for (let i = 0; i < 3; i += 1) {
    const jitter = (rand() - 0.5) * W * 0.1;
    const spread = W * (0.2 + i * 0.12);
    shafts.push(
      `<path d="M${f(W * lx - W * 0.05 + jitter)} ${f(H * ly)} L${f(W * lx + W * 0.05 + jitter)} ${f(H * ly)} L${f(W * lx + spread + jitter)} ${H} L${f(W * lx - spread * 0.9 + jitter)} ${H} Z" fill="url(#shaft)" opacity="${f(0.5 - i * 0.13)}"/>`,
    );
  }

  const light = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="shaft" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${mix(style.accent, '#ffffff', 0.55)}" stop-opacity="0.5"/>
      <stop offset="0.6" stop-color="${style.accent}" stop-opacity="0.12"/>
      <stop offset="1" stop-color="${style.accent}" stop-opacity="0"/>
    </linearGradient>
    <radialGradient id="source" cx="${f(lx)}" cy="${f(ly)}" r="0.32">
      <stop offset="0" stop-color="${mix(style.accent, '#ffffff', 0.75)}" stop-opacity="0.7"/>
      <stop offset="1" stop-color="${style.accent}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="#000"/>
  ${shafts.join('')}
  <rect width="${W}" height="${H}" fill="url(#source)"/>
</svg>`;

  const base = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="ground" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${lift}"/>
      <stop offset="0.55" stop-color="${style.surface}"/>
      <stop offset="1" stop-color="${deep}"/>
    </linearGradient>
    <radialGradient id="key" cx="${f(lx)}" cy="${f(ly)}" r="0.75">
      <stop offset="0" stop-color="${style.accent}" stop-opacity="0.72"/>
      <stop offset="0.35" stop-color="${style.accent}" stop-opacity="0.3"/>
      <stop offset="1" stop-color="${style.accent}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="shaft" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${mix(style.accent, '#ffffff', 0.5)}" stop-opacity="0.34"/>
      <stop offset="1" stop-color="${style.accent}" stop-opacity="0"/>
    </linearGradient>
    <radialGradient id="haze">
      <stop offset="0" stop-color="${mix(style.accent, '#ffffff', 0.6)}" stop-opacity="0.5"/>
      <stop offset="1" stop-color="${style.accent}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="bulb">
      <stop offset="0" stop-color="${mix(style.accent, '#ffffff', 0.7)}" stop-opacity="0.95"/>
      <stop offset="0.5" stop-color="${style.accent}" stop-opacity="0.5"/>
      <stop offset="1" stop-color="${style.accent}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="canvasFill" x1="0" y1="0" x2="0.3" y2="1">
      <stop offset="0" stop-color="${mix(style.accent, '#ffffff', 0.72)}" stop-opacity="0.5"/>
      <stop offset="1" stop-color="${style.surface}" stop-opacity="0.85"/>
    </linearGradient>
    <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${mix(style.accent, '#ffffff', 0.2)}" stop-opacity="0.22"/>
      <stop offset="1" stop-color="${style.accent}" stop-opacity="0"/>
    </linearGradient>
    <!-- A real bokeh disc: brighter at the rim than in the middle. That rim is
         the whole reason these read as defocused lights rather than as blobs. -->
    <radialGradient id="bokeh">
      <stop offset="0" stop-color="${mix(style.accent, '#ffffff', 0.5)}" stop-opacity="0.5"/>
      <stop offset="0.72" stop-color="${mix(style.accent, '#ffffff', 0.28)}" stop-opacity="0.45"/>
      <stop offset="0.93" stop-color="${mix(style.accent, '#ffffff', 0.1)}" stop-opacity="0.62"/>
      <stop offset="1" stop-color="${style.accent}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="vig" cx="0.5" cy="0.44" r="0.82">
      <stop offset="0.54" stop-color="#000000" stop-opacity="0"/>
      <stop offset="1" stop-color="#000000" stop-opacity="0.58"/>
    </radialGradient>
    <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#000000" stop-opacity="0"/>
      <stop offset="1" stop-color="#000000" stop-opacity="0.42"/>
    </linearGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#ground)"/>
  <rect width="${W}" height="${H}" fill="url(#key)"/>

  <!-- The plane the silhouettes stand against, so the room has a far wall
       and a floor rather than being one continuous fog. -->
  <rect width="${W}" height="${f(H * 0.68)}" fill="url(#wall)"/>

  <!-- Silhouette, behind the haze so the air reads as being in front of it. -->
  <g>${MOTIFS[motif](rand, W, H, ink)}</g>

  <g>${hazeBands.join('')}</g>

  <!-- Nearest layer of all: lights the lens never focused on. -->
  <g>${bokeh.join('')}</g>

  <rect y="${f(H * 0.62)}" width="${W}" height="${f(H * 0.38)}" fill="url(#floor)"/>
  <rect width="${W}" height="${H}" fill="url(#vig)"/>
</svg>`;

  return { base, light };
}

/* -------------------------------------------------------------- render -- */

/**
 * Grain, applied to the raster rather than drawn in the SVG.
 *
 * A thousand SVG circles would be a megabyte of markup and would band under
 * WebP compression; a real noise layer composited at low opacity is what film
 * grain actually is, and it costs a few kilobytes.
 */
async function grainLayer(W: number, H: number, seed: number): Promise<Buffer> {
  const rand = rng(seed);
  const pixels = Buffer.alloc(W * H * 4);
  for (let i = 0; i < W * H; i += 1) {
    const v = 118 + Math.round((rand() - 0.5) * 90);
    pixels[i * 4] = v;
    pixels[i * 4 + 1] = v;
    pixels[i * 4 + 2] = v;
    pixels[i * 4 + 3] = 20;
  }
  return sharp(pixels, { raw: { width: W, height: H, channels: 4 } }).png().toBuffer();
}

async function render(
  svg: { base: string; light: string },
  size: { w: number; h: number },
  seed: number,
  file: string,
  quality: number,
): Promise<number> {
  const base = await sharp(Buffer.from(svg.base)).png().toBuffer();
  // Blurred by a twentieth of the frame's width: enough that no edge survives,
  // so what lands on the picture is a glow rather than a wedge.
  const light = await sharp(Buffer.from(svg.light))
    .blur(size.w / 20)
    .png()
    .toBuffer();
  const grain = await grainLayer(size.w, size.h, seed + 7777);
  const out = await sharp(base)
    .composite([
      { input: light, blend: 'screen' },
      { input: grain, blend: 'overlay' },
    ])
    // A whisper of blur before encoding: it removes the last of the gradient
    // banding that WebP would otherwise exaggerate, and costs no detail because
    // there is no fine detail in an atmospheric background.
    .blur(0.4)
    .webp({ quality, effort: 6 })
    .toBuffer();
  await writeFile(path.join(OUT, file), out);
  return out.length;
}

/* ---------------------------------------------------------------- main -- */

/**
 * Which look each event wears.
 *
 * Keyed by the event's slug so the file is found automatically, and matched to
 * the visual preset the seeded content gives that event, so the art and the
 * card's accent are the same colour by construction rather than by memory.
 */
const EVENTS: { slug: string; preset: VisualPreset; motif: Motif; seed: number }[] = [
  { slug: 'scream-paint-sip', preset: 'blood', motif: 'easels', seed: 1008 },
  { slug: 'snoopy-paint-sip-night', preset: 'candy', motif: 'easels', seed: 910 },
  { slug: 'junior-h-paint-sip', preset: 'gold', motif: 'easels', seed: 917 },
  { slug: 'oasis-fridays', preset: 'neon', motif: 'lanterns', seed: 5 },
  { slug: 'oasis-latin-saturdays', preset: 'marigold', motif: 'palms', seed: 6 },
  // Spare compositions the admin can point any future event at.
  { slug: 'generic-nightlife', preset: 'midnight', motif: 'curtain', seed: 21 },
  { slug: 'generic-celebration', preset: 'marigold', motif: 'papel', seed: 22 },
  { slug: 'generic-comedy', preset: 'bone', motif: 'arches', seed: 23 },
];

async function main() {
  await mkdir(OUT, { recursive: true });
  let total = 0;

  for (const event of EVENTS) {
    const wide = await render(
      frame(event.preset, event.motif, event.seed, WIDE),
      WIDE,
      event.seed,
      `${event.slug}.webp`,
      72,
    );
    const wideSm = await render(
      // The SAME seed, so the small variant is the same composition rather than
      // a different picture that happens to be smaller.
      frame(event.preset, event.motif, event.seed, WIDE_SM),
      WIDE_SM,
      event.seed,
      `${event.slug}-640.webp`,
      70,
    );
    const tall = await render(
      frame(event.preset, event.motif, event.seed + 1, TALL),
      TALL,
      event.seed,
      `${event.slug}-tall.webp`,
      70,
    );
    const tallSm = await render(
      frame(event.preset, event.motif, event.seed + 1, TALL_SM),
      TALL_SM,
      event.seed,
      `${event.slug}-tall-448.webp`,
      68,
    );
    total += wide + wideSm + tall + tallSm;
    console.log(
      `${event.slug.padEnd(24)} ${String(Math.round((wide + wideSm) / 1024)).padStart(3)}KB wide · ${String(Math.round((tall + tallSm) / 1024)).padStart(3)}KB tall · ${event.preset}/${event.motif}`,
    );
  }

  console.log(`\n${EVENTS.length * 4} files, ${Math.round(total / 1024)}KB total.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
