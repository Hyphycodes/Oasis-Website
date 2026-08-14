import type { ElementType, ReactNode } from 'react';

export function Eyebrow({
  children,
  tone = 'default',
  className = '',
}: {
  children: ReactNode;
  tone?: 'default' | 'orange' | 'night';
  className?: string;
}) {
  const color =
    tone === 'orange' ? 'text-clay' : tone === 'night' ? 'text-night-soft' : 'text-brown-soft';
  return <p className={`eyebrow ${color} ${className}`}>{children}</p>;
}

interface DisplayProps {
  children: ReactNode;
  as?: ElementType;
  size?: 'xl' | 'lg' | 'md';
  className?: string;
  id?: string;
}

/**
 * Display type carries the variable width axis — this is where the typography
 * does actual work rather than being body copy scaled up.
 * See docs/DESIGN-DIRECTION.md §2.3.
 */
export function Display({
  children,
  as: Tag = 'h2',
  size = 'lg',
  className = '',
  id,
}: DisplayProps) {
  const sizing = {
    xl: 'text-[length:var(--text-display-xl)] leading-[0.92] tracking-[-0.035em] [font-variation-settings:"wdth"_108]',
    lg: 'text-[length:var(--text-display-lg)] leading-[0.95] tracking-[-0.03em] [font-variation-settings:"wdth"_106]',
    md: 'text-[length:var(--text-display-md)] leading-none tracking-[-0.025em] [font-variation-settings:"wdth"_104]',
  }[size];

  return (
    <Tag id={id} className={`font-semibold ${sizing} ${className}`}>
      {children}
    </Tag>
  );
}

export function Lead({
  children,
  tone = 'default',
  className = '',
}: {
  children: ReactNode;
  tone?: 'default' | 'night';
  className?: string;
}) {
  return (
    <p
      className={`measure-lead text-[length:var(--text-body-lg)] leading-relaxed ${
        tone === 'night' ? 'text-night-soft' : 'text-brown-soft'
      } ${className}`}
    >
      {children}
    </p>
  );
}
