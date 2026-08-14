import type { ReactNode } from 'react';

type Surface = 'ivory' | 'ivory-deep' | 'cream' | 'linen' | 'sand' | 'teal' | 'plum' | 'espresso';

const SURFACE: Record<Surface, string> = {
  ivory: 'bg-ivory text-brown',
  'ivory-deep': 'bg-ivory-deep text-brown',
  cream: 'bg-cream text-brown',
  linen: 'bg-linen text-brown',
  sand: 'bg-sand text-brown grain on-sand',
  // Evening surfaces. teal = restaurant-and-bar atmosphere (Friday leans here),
  // plum = warmer and later (Latin Saturday leans here).
  teal: 'bg-teal text-night-text on-dark',
  plum: 'bg-plum text-night-text on-dark',
  espresso: 'bg-espresso text-night-text on-dark',
};

interface BandProps {
  children: ReactNode;
  surface?: Surface;
  /** Vertical rhythm. `flush` is for bands whose child supplies its own padding. */
  size?: 'default' | 'sm' | 'flush';
  /**
   * The single orange hairline that marks the entry into Oasis After Dark.
   * See docs/DESIGN-DIRECTION.md §1.4 — used on the dark band only.
   */
  topRule?: boolean;
  id?: string;
  as?: 'section' | 'div' | 'footer' | 'header';
  className?: string;
}

/**
 * A full-bleed color band. Sections are color fields, not rounded cards —
 * this is the structural rule that keeps the site from reading as a template.
 */
export function Band({
  children,
  surface = 'cream',
  size = 'default',
  topRule = false,
  id,
  as: Tag = 'section',
  className = '',
}: BandProps) {
  const padding =
    size === 'flush' ? '' : size === 'sm' ? 'py-(--spacing-band-sm)' : 'py-(--spacing-band)';

  return (
    <Tag
      id={id}
      className={`relative isolate ${SURFACE[surface]} ${padding} ${
        topRule ? 'border-t-2 border-t-orange' : ''
      } ${className}`}
    >
      {children}
    </Tag>
  );
}

/** Horizontal page frame. 1440 max, generous edge gutters at every width. */
export function Frame({
  children,
  wide = false,
  className = '',
}: {
  children: ReactNode;
  wide?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`relative mx-auto w-full px-5 sm:px-8 lg:px-12 ${
        wide ? 'max-w-[1440px]' : 'max-w-[1120px]'
      } ${className}`}
    >
      {children}
    </div>
  );
}
