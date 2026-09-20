import { StaffShell, staffText } from '../../components/StaffShell';
import type { StaffEmailProps } from '../../types';

/**
 * The internal nudge: somebody wrote in.
 *
 * One email, both kinds, straight to whoever reads these at Oasis, with the
 * facts in the body so a decision can be made from a phone and the button
 * only needed to reply. It is the one optional email of the three and has a
 * switch in the admin.
 */

export function subject({ headline }: StaffEmailProps): string {
  return `New at Oasis: ${headline}`;
}

export function text(props: StaffEmailProps): string {
  return staffText(props);
}

export default function SubmissionAlert(props: StaffEmailProps) {
  return <StaffShell eyebrow="Inbox" props={props} />;
}
