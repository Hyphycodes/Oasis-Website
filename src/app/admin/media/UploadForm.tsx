'use client';

import { ActionForm, SubmitButton } from '@/components/admin/ActionForm';
import { Card, Checkbox, Label, TextInput } from '@/components/admin/ui';
import { uploadMedia } from '@/server/actions/media';
import { MEDIA_TAGS } from '@/content/labels';

/**
 * Upload.
 *
 * The description is asked for at upload time rather than "later", because later
 * never comes and a photograph without one cannot be published. Ticking
 * "decorative" is an explicit decision, not a way around the question.
 */
export function UploadForm() {
  return (
    <Card title="Add a photo">
      <ActionForm action={uploadMedia} className="grid gap-4">
        <div>
          <Label htmlFor="file" hint="JPEG, PNG, WebP or AVIF, up to 8MB.">
            Choose a file
          </Label>
          <input
            id="file"
            name="file"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            required
            className="mt-1.5 block w-full text-[0.9375rem] text-brown file:mr-3 file:min-h-11 file:rounded-(--radius-sm) file:border file:border-brown/25 file:bg-ivory file:px-4 file:text-[0.9375rem] file:font-semibold file:text-brown"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="upload-title" hint="How you will find it later.">
              Name it
            </Label>
            <TextInput id="upload-title" name="title" maxLength={80} placeholder="Bar on a Friday" />
          </div>
          <div>
            <Label htmlFor="upload-tags" hint={`Any of: ${MEDIA_TAGS.join(', ')}`}>
              Tags
            </Label>
            <TextInput id="upload-tags" name="tags" maxLength={200} placeholder="Drinks, Room" />
          </div>
        </div>

        <div>
          <Label
            htmlFor="upload-alt"
            hint="What is in the picture, in a few words. Someone who cannot see it hears this."
          >
            Description
          </Label>
          <TextInput
            id="upload-alt"
            name="alt"
            maxLength={200}
            placeholder="A margarita being poured behind the bar"
          />
        </div>

        <Checkbox id="upload-decorative" name="decorative">
          This is decoration and carries no information
        </Checkbox>

        <div>
          <SubmitButton>Upload</SubmitButton>
        </div>
      </ActionForm>
    </Card>
  );
}
