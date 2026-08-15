'use client';

import { ActionForm, SubmitButton } from '@/components/admin/ActionForm';
import { Card, Checkbox, FieldNote, Label, Select, TextInput } from '@/components/admin/ui';
import { archiveMedia, replaceMedia, saveMediaDetails, unarchiveMedia } from '@/server/actions/media';
import { MEDIA_TAGS } from '@/content/labels';
import type { AdminMedia } from '@/content/admin-types';

/**
 * Photo details.
 *
 * Two things here are deliberately awkward, because being easy would be worse:
 * archiving something that is still on a page is refused and names where it is
 * used, and swapping asks whether you mean here or everywhere. Both are moments
 * where guessing silently changes a page nobody was looking at.
 */
export function MediaDetails({
  entry,
  alternatives,
  canArchive,
}: {
  entry: AdminMedia;
  alternatives: { id: string; label: string }[];
  canArchive: boolean;
}) {
  return (
    <div className="grid gap-5">
      <Card title="Details">
        <ActionForm action={saveMediaDetails} className="grid gap-4">
          <input type="hidden" name="assetId" value={entry.assetId} />

          <div>
            <Label htmlFor="title" hint="Only your team sees this.">
              Name
            </Label>
            <TextInput id="title" name="title" defaultValue={entry.title} maxLength={80} />
          </div>

          <div>
            <Label
              htmlFor="alt"
              hint="What is in the picture. Someone using a screen reader hears this instead of seeing it."
            >
              Description
            </Label>
            <TextInput id="alt" name="alt" defaultValue={entry.alt ?? ''} maxLength={200} />
          </div>

          <Checkbox id="decorative" name="decorative" defaultChecked={entry.decorative}>
            This is decoration and carries no information
          </Checkbox>

          <div>
            <Label htmlFor="tags" hint={`Any of: ${MEDIA_TAGS.join(', ')}`}>
              Tags
            </Label>
            <TextInput id="tags" name="tags" defaultValue={entry.tags.join(', ')} maxLength={200} />
          </div>

          <div>
            <Label htmlFor="focal" hint="Which part to keep when the picture is cropped.">
              Focal point
            </Label>
            <TextInput
              id="focal"
              name="focal"
              defaultValue={entry.focal}
              placeholder="50% 50%"
              aria-describedby="focal-note"
            />
            <FieldNote id="focal-note">
              Across, then down. “50% 40%” keeps the middle, a little above centre — useful when
              there are faces.
            </FieldNote>
          </div>

          <div>
            <SubmitButton>Save</SubmitButton>
          </div>
        </ActionForm>
      </Card>

      {entry.usage.length > 0 && alternatives.length > 0 ? (
        <Card title="Swap this photo">
          <ActionForm action={replaceMedia} className="grid gap-4">
            <input type="hidden" name="assetId" value={entry.assetId} />

            <div>
              <Label htmlFor="replacementId">Use this instead</Label>
              <Select id="replacementId" name="replacementId" defaultValue="">
                <option value="" disabled>
                  Pick a photo
                </option>
                {alternatives.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>

            <fieldset className="grid gap-2">
              <legend className="text-[0.875rem] font-semibold text-brown">Where?</legend>
              {entry.usage.map((use) => (
                <label
                  key={`${use.href}-${use.label}`}
                  className="flex min-h-11 items-center gap-2.5 text-[0.9375rem] text-brown"
                >
                  <input
                    type="radio"
                    name="scope"
                    value="one"
                    className="size-4 shrink-0 accent-[var(--color-coral)]"
                  />
                  Only on {use.label}
                </label>
              ))}
              <label className="flex min-h-11 items-center gap-2.5 text-[0.9375rem] text-brown">
                <input
                  type="radio"
                  name="scope"
                  value="all"
                  defaultChecked
                  className="size-4 shrink-0 accent-[var(--color-coral)]"
                />
                Everywhere it appears ({entry.usage.length}{' '}
                {entry.usage.length === 1 ? 'place' : 'places'})
              </label>
            </fieldset>

            <div>
              <SubmitButton variant="secondary">Swap it</SubmitButton>
            </div>
          </ActionForm>
        </Card>
      ) : null}

      {canArchive ? (
        <Card title={entry.archivedAt ? 'Archived' : 'Archive'} tone="quiet">
          <p className="text-[0.9375rem] leading-relaxed text-brown-soft">
            {entry.archivedAt
              ? 'This is out of the library. The file is still there and it can come back.'
              : entry.usage.length > 0
                ? `This is on ${entry.usage.length} ${entry.usage.length === 1 ? 'page' : 'pages'} right now. Swap it out there first — archiving is refused while anything still points at it.`
                : 'Takes it out of the library without deleting the file.'}
          </p>
          <div className="mt-3">
            <ActionForm action={entry.archivedAt ? unarchiveMedia : archiveMedia}>
              <input type="hidden" name="assetId" value={entry.assetId} />
              <SubmitButton variant={entry.archivedAt ? 'secondary' : 'danger'}>
                {entry.archivedAt ? 'Put it back' : 'Archive it'}
              </SubmitButton>
            </ActionForm>
          </div>
        </Card>
      ) : null}
    </div>
  );
}
