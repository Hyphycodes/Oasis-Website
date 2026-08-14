'use client';

import { useActionState } from 'react';
import { inputClass, labelClass, SaveBar } from '@/components/admin/SaveBar';
import type { EventSeries } from '@/content/types';
import { saveEventSeries, type ActionState } from '../actions';

const STATUS_OPTIONS = [
  { value: 'scheduled', label: 'Running as normal' },
  { value: 'sold-out', label: 'Sold out' },
  { value: 'free', label: 'Free entry' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'postponed', label: 'Postponed' },
];

export function EventEditor({ series }: { series: EventSeries }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(saveEventSeries, null);

  return (
    <form action={action}>
      <input type="hidden" name="slug" value={series.slug} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={`${series.slug}-status`} className={labelClass}>
            Status
          </label>
          <select
            id={`${series.slug}-status`}
            name="status"
            defaultValue={series.status}
            className={`mt-1.5 ${inputClass}`}
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <p className="mt-1 text-[0.8125rem] text-brown-soft">
            Cancelled nights stay on the website for two weeks so guests are not surprised.
          </p>
        </div>

        <div>
          <label htmlFor={`${series.slug}-price`} className={labelClass}>
            Ticket price
          </label>
          <input
            id={`${series.slug}-price`}
            name="price"
            inputMode="decimal"
            defaultValue={series.priceCents != null ? (series.priceCents / 100).toString() : ''}
            placeholder="10"
            className={`mt-1.5 ${inputClass}`}
          />
        </div>
      </div>

      <div className="mt-4">
        <label htmlFor={`${series.slug}-ticket`} className={labelClass}>
          Ticket link
        </label>
        <input
          id={`${series.slug}-ticket`}
          name="ticketUrl"
          type="url"
          defaultValue={series.ticketUrl ?? ''}
          className={`mt-1.5 ${inputClass}`}
        />
        <p className="mt-1 text-[0.8125rem] text-brown-soft">
          Leave blank if tickets are only sold at the door.
        </p>
      </div>

      <SaveBar state={state} pending={pending} label={`Save ${series.title}`} />
    </form>
  );
}
