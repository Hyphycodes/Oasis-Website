import type { CSSProperties, ReactNode } from 'react';

/**
 * A full-width table whose ONE cell carries the styling.
 *
 * React Email's `Section` puts padding on the `<table>`, and a table's
 * padding is ignored by Outlook and by any client that collapses borders.
 * Padding on a `<td>` is honoured everywhere, so every band of an Oasis
 * email is one of these: the gutter, a coloured band, a spacer.
 */
export function Block({
  className,
  style,
  align,
  children,
}: {
  className?: string;
  style?: CSSProperties;
  align?: 'left' | 'center' | 'right';
  children?: ReactNode;
}) {
  return (
    <table role="presentation" width="100%" cellPadding={0} cellSpacing={0} border={0} style={{ width: '100%' }}>
      <tbody>
        <tr>
          <td className={className} align={align} style={style}>
            {children}
          </td>
        </tr>
      </tbody>
    </table>
  );
}
