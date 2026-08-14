'use client';

import { useActionState, useState } from 'react';
import { inputClass, labelClass } from '@/components/admin/SaveBar';
import type { MenuItem } from '@/content/types';
import { saveMenuItem, type ActionState } from '../actions';

export function MenuItemRow({ item }: { item: MenuItem }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(saveMenuItem, null);
  const [open, setOpen] = useState(false);

  const priceLabel =
    item.priceCents != null
      ? `$${(item.priceCents / 100).toFixed(2).replace(/\.00$/, '')}`
      : (item.priceNote ?? 'No price');

  return (
    <li className="border-b border-brown/12">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-3">
        <div className="min-w-0 flex-1">
          <p className="text-[0.9375rem] font-medium text-brown">
            {item.name}
            {!item.available ? (
              <span className="ml-2 text-[0.75rem] font-semibold text-warning">Unavailable</span>
            ) : null}
            {item.featured ? (
              <span className="ml-2 text-[0.75rem] font-semibold text-clay">Featured</span>
            ) : null}
          </p>
          {item.description ? (
            <p className="mt-0.5 line-clamp-1 text-[0.8125rem] text-brown-soft">
              {item.description}
            </p>
          ) : (
            <p className="mt-0.5 text-[0.8125rem] text-warning">No description</p>
          )}
        </div>

        <p
          className={`tabular shrink-0 text-[0.9375rem] font-semibold ${
            item.priceCents != null ? 'text-brown' : 'text-warning'
          }`}
        >
          {priceLabel}
        </p>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          className="inline-flex min-h-11 shrink-0 items-center rounded-(--radius-md) border border-brown/25 px-3 text-[0.875rem] font-medium text-brown transition-colors hover:bg-brown/8"
        >
          {open ? 'Close' : 'Edit'}
        </button>
      </div>

      {open ? (
        <form action={action} className="grid gap-4 pb-6 pt-2">
          <input type="hidden" name="id" value={item.id} />

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor={`${item.id}-name`} className={labelClass}>
                Name
              </label>
              <input
                id={`${item.id}-name`}
                name="name"
                defaultValue={item.name}
                required
                className={`mt-1.5 ${inputClass}`}
              />
            </div>
            <div>
              <label htmlFor={`${item.id}-price`} className={labelClass}>
                Price
              </label>
              <input
                id={`${item.id}-price`}
                name="price"
                inputMode="decimal"
                defaultValue={item.priceCents != null ? (item.priceCents / 100).toString() : ''}
                placeholder="16"
                className={`mt-1.5 ${inputClass}`}
              />
              <p className="mt-1 text-[0.8125rem] text-brown-soft">
                Numbers only — no dollar sign. Leave blank if the price changes.
              </p>
            </div>
          </div>

          <div>
            <label htmlFor={`${item.id}-desc`} className={labelClass}>
              Description
            </label>
            <textarea
              id={`${item.id}-desc`}
              name="description"
              rows={2}
              defaultValue={item.description ?? ''}
              className={`mt-1.5 ${inputClass}`}
            />
          </div>

          <div>
            <label htmlFor={`${item.id}-note`} className={labelClass}>
              What to show instead of a price
            </label>
            <input
              id={`${item.id}-note`}
              name="priceNote"
              defaultValue={item.priceNote ?? 'Ask your server'}
              className={`mt-1.5 ${inputClass}`}
            />
            <p className="mt-1 text-[0.8125rem] text-brown-soft">
              Only used when the price above is blank.
            </p>
          </div>

          <div className="flex flex-wrap gap-6">
            <label className="flex min-h-11 items-center gap-2 text-[0.9375rem] text-brown">
              <input
                type="checkbox"
                name="available"
                value="true"
                defaultChecked={item.available}
                className="size-5 accent-[var(--color-orange)]"
              />
              Available
            </label>
            <label className="flex min-h-11 items-center gap-2 text-[0.9375rem] text-brown">
              <input
                type="checkbox"
                name="featured"
                value="true"
                defaultChecked={item.featured}
                className="size-5 accent-[var(--color-orange)]"
              />
              Featured
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <button
              type="submit"
              disabled={pending}
              className="inline-flex min-h-11 items-center justify-center rounded-(--radius-md) bg-orange px-5 font-semibold text-on-orange transition-colors hover:bg-orange-deep disabled:opacity-50"
            >
              {pending ? 'Saving…' : 'Save'}
            </button>
            {state ? (
              <p
                role="status"
                className={`text-[0.875rem] font-medium ${state.ok ? 'text-success' : 'text-danger'}`}
              >
                {state.message}
              </p>
            ) : null}
          </div>
        </form>
      ) : null}
    </li>
  );
}
