'use client';

import { useActionState, useState } from 'react';
import { inputClass, labelClass, SaveBar } from '@/components/admin/SaveBar';
import type { Announcement } from '@/content/types';
import { saveAnnouncement, type ActionState } from '../actions';

function toLocalInput(iso: string | null): string {
  if (!iso) return '';
  const date = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function AnnouncementEditor({ announcement }: { announcement: Announcement | null }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(saveAnnouncement, null);
  const [message, setMessage] = useState(announcement?.message ?? '');
  const [enabled, setEnabled] = useState(announcement?.enabled ?? false);
  const [href, setHref] = useState(announcement?.href ?? '');
  const [tone, setTone] = useState(announcement?.tone ?? 'default');

  return (
    <form action={action}>
      <input type="hidden" name="id" value={announcement?.id ?? ''} />

      {/* Live preview, styled exactly like the real bar. */}
      <div className="mb-8">
        <p className="mb-2 text-[0.8125rem] font-medium text-brown-soft">
          This is how it will look at the very top of every page:
        </p>
        <div
          className={
            tone === 'night' ? 'bg-espresso text-night-text' : 'bg-orange text-on-orange'
          }
        >
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 px-5 py-2 text-center text-[0.8125rem] font-medium">
            <span>{message || 'Your message will appear here'}</span>
          </div>
        </div>
        {!enabled ? (
          <p className="mt-2 text-[0.8125rem] text-brown-soft">
            Currently switched off — guests do not see this.
          </p>
        ) : null}
      </div>

      <div className="grid gap-5">
        <div>
          <label htmlFor="message" className={labelClass}>
            Message
          </label>
          <input
            id="message"
            name="message"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            maxLength={240}
            required
            className={`mt-1.5 ${inputClass}`}
            placeholder="e.g. $1 tacos every Tuesday, 4pm to close"
          />
          <p className="mt-1 text-[0.8125rem] text-brown-soft">
            Keep it to one short sentence. {240 - message.length} characters left.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="href" className={labelClass}>
              Link <span className="font-normal text-brown-soft">(optional)</span>
            </label>
            <input
              id="href"
              name="href"
              type="url"
              value={href}
              onChange={(event) => setHref(event.target.value)}
              className={`mt-1.5 ${inputClass}`}
              placeholder="https://…"
            />
          </div>
          <div>
            <label htmlFor="linkLabel" className={labelClass}>
              Button text
            </label>
            <input
              id="linkLabel"
              name="linkLabel"
              defaultValue={announcement?.linkLabel ?? ''}
              maxLength={40}
              className={`mt-1.5 ${inputClass}`}
              placeholder="See the deal"
              required={href.length > 0}
            />
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="startsAt" className={labelClass}>
              Start showing <span className="font-normal text-brown-soft">(optional)</span>
            </label>
            <input
              id="startsAt"
              name="startsAt"
              type="datetime-local"
              defaultValue={toLocalInput(announcement?.startsAt ?? null)}
              className={`mt-1.5 ${inputClass}`}
            />
          </div>
          <div>
            <label htmlFor="endsAt" className={labelClass}>
              Stop showing <span className="font-normal text-brown-soft">(optional)</span>
            </label>
            <input
              id="endsAt"
              name="endsAt"
              type="datetime-local"
              defaultValue={toLocalInput(announcement?.endsAt ?? null)}
              className={`mt-1.5 ${inputClass}`}
            />
            <p className="mt-1 text-[0.8125rem] text-brown-soft">
              Leave both blank to show it until you switch it off.
            </p>
          </div>
        </div>

        <fieldset>
          <legend className={labelClass}>Colour</legend>
          <div className="mt-2 flex flex-wrap gap-4">
            {(['default', 'night'] as const).map((option) => (
              <label key={option} className="flex min-h-11 items-center gap-2 text-[0.9375rem]">
                <input
                  type="radio"
                  name="tone"
                  value={option}
                  checked={tone === option}
                  onChange={() => setTone(option)}
                  className="size-4 accent-[var(--color-orange)]"
                />
                {option === 'default' ? 'Orange (specials, everyday)' : 'Dark (events, nightlife)'}
              </label>
            ))}
          </div>
        </fieldset>

        <label className="flex min-h-11 items-center gap-3 text-[0.9375rem] font-medium text-brown">
          <input
            type="checkbox"
            name="enabled"
            value="true"
            checked={enabled}
            onChange={(event) => setEnabled(event.target.checked)}
            className="size-5 accent-[var(--color-orange)]"
          />
          Show this on the website
        </label>
      </div>

      <SaveBar state={state} pending={pending} hint="Changes appear on the website within a minute." />
    </form>
  );
}
