'use client';

import { ActionForm, SubmitButton } from '@/components/admin/ActionForm';
import { Card, FieldNote, Label, TextArea, TextInput } from '@/components/admin/ui';
import { createOneTimeEvent } from '@/server/actions/events';

/**
 * A one-off night — New Year's Eve, a guest DJ, a private takeover.
 *
 * One screen, not a six-step wizard: a wizard is worth it when the steps depend
 * on each other, and these do not. It saves as a draft, so a half-filled event
 * can never reach the website, and it works in one column at 390px.
 */
export function NewOneTimeEvent() {
  return (
    <Card title="Add a one-off event">
      <ActionForm action={createOneTimeEvent} className="grid gap-4">
        <div>
          <Label htmlFor="one-title">What is it called?</Label>
          <TextInput id="one-title" name="title" required maxLength={120} placeholder="New Year’s Eve at Oasis" />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="one-date">Date</Label>
            <TextInput id="one-date" name="date" type="date" required />
          </div>
          <div>
            <Label htmlFor="one-start">Doors</Label>
            <TextInput id="one-start" name="startTime" type="time" defaultValue="21:00" required />
          </div>
          <div>
            <Label htmlFor="one-end">Finish</Label>
            <TextInput id="one-end" name="endTime" type="time" defaultValue="02:00" required />
            <FieldNote id="one-end-note">A finish before the start means it runs past midnight.</FieldNote>
          </div>
        </div>

        <div>
          <Label htmlFor="one-description">What should guests know?</Label>
          <TextArea id="one-description" name="description" rows={3} maxLength={1200} />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="one-age" hint="Leave blank for all ages.">
              Minimum age
            </Label>
            <TextInput id="one-age" name="ageMin" inputMode="numeric" maxLength={3} placeholder="21" />
          </div>
          <div>
            <Label htmlFor="one-music" hint="Separate with commas.">
              Music
            </Label>
            <TextInput id="one-music" name="music" placeholder="Latin, Top 100" />
          </div>
          <div>
            <Label htmlFor="one-price" hint="Leave blank for “at the door”.">
              Entry
            </Label>
            <TextInput id="one-price" name="price" inputMode="decimal" placeholder="25" />
          </div>
        </div>

        <div>
          <Label htmlFor="one-tickets" hint="Must start with https://. Leave blank if there are no tickets yet.">
            Ticket link
          </Label>
          <TextInput id="one-tickets" name="ticketUrl" inputMode="url" placeholder="https://" />
        </div>

        <div>
          <SubmitButton variant="secondary">Save as a draft</SubmitButton>
        </div>
        <p className="text-[0.8125rem] text-brown-soft">
          Drafts are never on the website. You publish it from the Drafts tab when the details are
          final.
        </p>
      </ActionForm>
    </Card>
  );
}
