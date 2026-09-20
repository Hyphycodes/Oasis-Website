import { StaffShell, staffText } from '../../components/StaffShell';
import type { StaffEmailProps } from '../../types';

/**
 * "We have your application."
 *
 * It says one true thing and stops: somebody at Oasis will read it. No
 * timeline is promised, because nobody here has committed to one, and a
 * "within 48 hours" that slips is worse than nothing. The button goes to
 * what is on — the room they would be working in.
 */

export function subject({ brand, details }: StaffEmailProps): string {
  const position = details.find((row) => row.label === 'Applied for')?.value;
  return position ? `We got your application — ${position}` : `We got your application · ${brand.shortName}`;
}

export function text(props: StaffEmailProps): string {
  return staffText(props);
}

export default function ApplicationReceived(props: StaffEmailProps) {
  return <StaffShell eyebrow="Work with us" props={props} />;
}
