'use client';

import { ActionForm, IntentField, SubmitButton } from '@/components/admin/ActionForm';
import { Card, FieldNote, Label, Select, TextArea, TextInput } from '@/components/admin/ui';
import type { EventSeries } from '@/content/types';
import { saveSeries, setSeriesPaused } from '@/server/actions/events';

const TICKET_POLICY = {
  required: 'Tickets are sold in advance',
  door: 'Pay at the door',
  free: 'Free entry',
  later: 'Ticket details to come',
};

function hhmm(minutes: number): string {
  const total = minutes % 1440;
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

/**
 * The defaults every night of a series inherits.
 *
 * Changing something here changes every future date at once — which is the whole
 * reason a series exists — and never touches a night that has been given its own
 * value. That guarantee is asserted in events.test.ts.
 */
export function SeriesEditor({
  series,
  canPublish,
}: {
  series: EventSeries;
  canPublish: boolean;
}) {
  return (
    <div className="grid gap-5">
      <ActionForm action={saveSeries} className="grid gap-5">
        <input type="hidden" name="slug" value={series.slug} />
        <IntentField name="publish" initial="false" />

        <Card title="The night">
          <div className="grid gap-4">
            <div>
              <Label htmlFor="title">Name</Label>
              <TextInput id="title" name="title" defaultValue={series.title} required maxLength={120} />
            </div>
            <div>
              <Label htmlFor="summary" hint="One line, used in listings.">
                Short line
              </Label>
              <TextInput id="summary" name="summary" defaultValue={series.summary} maxLength={200} />
            </div>
            <div>
              <Label htmlFor="description" hint="Shown on the night’s own page.">
                Description
              </Label>
              <TextArea
                id="description"
                name="description"
                rows={4}
                defaultValue={series.description}
                maxLength={1200}
              />
            </div>
          </div>
        </Card>

        <Card title="When">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="startTime">Doors</Label>
              <TextInput
                id="startTime"
                name="startTime"
                type="time"
                defaultValue={hhmm(series.startMinutes)}
                required
              />
            </div>
            <div>
              <Label htmlFor="endTime">Finish</Label>
              <TextInput
                id="endTime"
                name="endTime"
                type="time"
                defaultValue={hhmm(series.endMinutes)}
                required
                aria-describedby="endTime-note"
              />
              <FieldNote id="endTime-note">
                A finish earlier than the doors means it runs past midnight — 22:00 to 02:00 is a
                four-hour night. Times are Chicago time.
              </FieldNote>
            </div>
          </div>
        </Card>

        <Card title="Getting in">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="price" hint="Leave blank for “at the door”.">
                Entry price
              </Label>
              <TextInput
                id="price"
                name="price"
                inputMode="decimal"
                defaultValue={series.priceCents != null ? String(series.priceCents / 100) : ''}
                placeholder="10"
              />
            </div>
            <div>
              <Label htmlFor="ticketPolicy">Tickets</Label>
              <Select id="ticketPolicy" name="ticketPolicy" defaultValue={series.ticketPolicy ?? 'required'}>
                {Object.entries(TICKET_POLICY).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="ageMin" hint="Leave blank for all ages.">
                Minimum age
              </Label>
              <TextInput
                id="ageMin"
                name="ageMin"
                inputMode="numeric"
                maxLength={3}
                defaultValue={series.ageMin != null ? String(series.ageMin) : ''}
              />
            </div>
            <div>
              <Label htmlFor="ageNote" hint="For example “Drinks 21+ with valid ID”.">
                Age note
              </Label>
              <TextInput id="ageNote" name="ageNote" defaultValue={series.ageNote ?? ''} maxLength={120} />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="music" hint="Separate with commas.">
                Music
              </Label>
              <TextInput id="music" name="music" defaultValue={series.musicFormats.join(', ')} />
            </div>
          </div>
        </Card>

        <div className="flex flex-wrap gap-2">
          {canPublish ? (
            <SubmitButton name="publish" value="true">
              Save and publish
            </SubmitButton>
          ) : null}
          <SubmitButton variant="secondary" name="publish" value="false">
            {canPublish ? 'Save as a draft' : 'Save'}
          </SubmitButton>
        </div>
      </ActionForm>

      {canPublish ? (
        <Card title={series.paused ? 'This night is paused' : 'Pause this night'} tone="quiet">
          <p className="text-[0.9375rem] leading-relaxed text-brown-soft">
            {series.paused
              ? 'No new dates are going on the website. Everything you have set up is kept.'
              : 'Stops putting new dates on the website without deleting anything. Use it if the night is off for a while.'}
          </p>
          <div className="mt-3">
            <ActionForm action={setSeriesPaused}>
              <input type="hidden" name="slug" value={series.slug} />
              <input type="hidden" name="paused" value={series.paused ? 'false' : 'true'} />
              <SubmitButton variant={series.paused ? 'primary' : 'secondary'}>
                {series.paused ? 'Start it up again' : 'Pause it'}
              </SubmitButton>
            </ActionForm>
          </div>
        </Card>
      ) : null}
    </div>
  );
}
