import { ImageResponse } from 'next/og';
import { site } from '@/content/site';

export const runtime = 'edge';
export const alt = `${site.name} — ${site.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/**
 * Social card, drawn from brand tokens rather than a photograph — the only
 * available photography is 720px-wide reel frames, which would look soft at
 * 1200×630. Type does the work, which is on-brand anyway.
 */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#DDB892',
          padding: '72px 80px',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 18, height: 18, borderRadius: 9, background: '#E65C2E' }} />
          <div
            style={{
              fontSize: 24,
              letterSpacing: 6,
              textTransform: 'uppercase',
              color: '#6A3F05',
              fontWeight: 600,
            }}
          >
            Oasis Mexican Kitchen &amp; Bar
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            fontSize: 92,
            lineHeight: 1.02,
            letterSpacing: -3,
            color: '#6A3F05',
            fontWeight: 700,
          }}
        >
          <span>Modern Mexican.</span>
          <span>Tropical Energy.</span>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 26,
            color: '#6A3F05',
            borderTop: '2px solid #E65C2E',
            paddingTop: 24,
          }}
        >
          <span>
            {site.street}, {site.locality}, {site.region}
          </span>
          <span>{site.phone.value}</span>
        </div>
      </div>
    ),
    size,
  );
}
