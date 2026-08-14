'use client';

import { useActionState, useState } from 'react';
import { inputClass, SaveBar } from '@/components/admin/SaveBar';
import { DAY_NAMES } from '@/content/site';
import type { DayHours } from '@/content/types';
import { saveHours, type ActionState } from '../actions';

interface DayRow {
  day: number;
  closed: boolean;
  open: string;
  close: string;
}

function toTimeValue(minutes: number): string {
  const normalized = ((minutes % 1440) + 1440) % 1440;
  return `${String(Math.floor(normalized / 60)).padStart(2, '0')}:${String(normalized % 60).padStart(2, '0')}`;
}

const ORDER = [1, 2, 3, 4, 5, 6, 0];

export function HoursEditor({ hours }: { hours: DayHours[] }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(saveHours, null);

  const [rows, setRows] = useState<DayRow[]>(() =>
    ORDER.map((day) => {
      const entry = hours.find((h) => h.day === day);
      const range = entry?.ranges[0];
      return {
        day,
        closed: entry?.closed || !range,
        open: range ? toTimeValue(range.openMinutes) : '10:00',
        close: range ? toTimeValue(range.closeMinutes) : '22:00',
      };
    }),
  );

  function update(day: number, patch: Partial<DayRow>) {
    setRows((current) => current.map((row) => (row.day === day ? { ...row, ...patch } : row)));
  }

  return (
    <form action={action}>
      <input type="hidden" name="hours" value={JSON.stringify(rows)} />

      <table className="w-full border-collapse text-[0.9375rem]">
        <caption className="sr-only">Opening hours for each day of the week</caption>
        <thead>
          <tr className="border-b border-brown/20 text-left">
            <th scope="col" className="py-2 font-medium text-brown-soft">
              Day
            </th>
            <th scope="col" className="py-2 font-medium text-brown-soft">
              Opens
            </th>
            <th scope="col" className="py-2 font-medium text-brown-soft">
              Closes
            </th>
            <th scope="col" className="py-2 font-medium text-brown-soft">
              Closed
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.day} className="border-b border-brown/12">
              <th scope="row" className="py-3 pr-4 text-left font-medium text-brown">
                {DAY_NAMES[row.day]}
              </th>
              <td className="py-3 pr-3">
                <input
                  type="time"
                  aria-label={`${DAY_NAMES[row.day]} opening time`}
                  value={row.open}
                  disabled={row.closed}
                  onChange={(event) => update(row.day, { open: event.target.value })}
                  className={`${inputClass} max-w-36 disabled:opacity-40`}
                />
              </td>
              <td className="py-3 pr-3">
                <input
                  type="time"
                  aria-label={`${DAY_NAMES[row.day]} closing time`}
                  value={row.close}
                  disabled={row.closed}
                  onChange={(event) => update(row.day, { close: event.target.value })}
                  className={`${inputClass} max-w-36 disabled:opacity-40`}
                />
              </td>
              <td className="py-3">
                <label className="flex min-h-11 items-center gap-2">
                  <input
                    type="checkbox"
                    checked={row.closed}
                    onChange={(event) => update(row.day, { closed: event.target.checked })}
                    className="size-5 accent-[var(--color-orange)]"
                  />
                  <span className="sr-only">{DAY_NAMES[row.day]} closed all day</span>
                </label>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="mt-4 max-w-prose text-[0.8125rem] leading-relaxed text-brown-soft">
        For a night that runs past midnight, set the closing time to the small hours — for example
        opens 10:00, closes 01:00. The website works out that it is the next day.
      </p>

      <SaveBar state={state} pending={pending} label="Save hours" />
    </form>
  );
}
