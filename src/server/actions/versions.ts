'use server';

import { z } from 'zod';
import { restoreVersion } from '../content/editorial';
import { run, saved, type ActionState } from './shared';

/**
 * Restore an earlier version.
 *
 * It comes back as a DRAFT, never straight onto the website. Restoring is an edit
 * like any other and gets the same look before it goes live — and a restore made
 * by mistake then costs nothing to undo.
 */
const schema = z.object({
  table: z.string().min(1),
  id: z.string().min(1),
  versionId: z.string().min(1),
});

export async function restoreVersionAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return run('content.restore', async ({ db, staff }) => {
    const parsed = schema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) return { ok: false, message: 'Could not restore that version.' };

    const fields = await restoreVersion(
      db,
      parsed.data.table,
      parsed.data.id,
      parsed.data.versionId,
      staff,
    );

    if (fields.length === 0) {
      return saved('That version matches what is live — nothing to change.');
    }

    return saved(`Brought back as a draft (${fields.length} ${fields.length === 1 ? 'field' : 'fields'}). Look it over, then publish.`);
  });
}
