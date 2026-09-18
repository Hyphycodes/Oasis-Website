# Stripe setup — the account owner's checklist

Everything here happens in the Stripe Dashboard, not in code. None of it can be done by a
developer on the owner's behalf: it needs the restaurant's bank details, its legal name and the
person who will answer disputes. Work down the list in order.

## Before test purchases

1. **Complete business verification** and connect the restaurant's bank account. Payouts will
   not start until this is done.
2. **Set the public details** under Settings → Business → Public details: business name, support
   email and phone. These print on every receipt.
3. **Set the statement descriptor** to `OASIS MEXICAN`. The site adds the suffix `OASIS EVENT`
   to every ticket charge, so a card statement reads `OASIS MEXICAN* OASIS EVENT`. Unrecognised
   descriptors are the number one cause of chargebacks.
4. **Payment methods** (Settings → Payments → Payment methods): turn on card, Apple Pay, Google
   Pay, Link and Cash App Pay. Leave Klarna, Affirm and Afterpay **off** — buy-now-pay-later on a
   $10 ticket reads cheap.
5. **Register the domain** under Settings → Payments → Payment method domains. Apple Pay will not
   appear on a domain that is not registered, and it is not reliable on `*.vercel.app`. A real
   custom domain is effectively a prerequisite for Apple Pay.
6. **Create the webhook endpoint** (Developers → Webhooks → Add endpoint):
   - URL: `https://<your domain>/api/webhooks/stripe`
   - Events: `payment_intent.succeeded`, `payment_intent.payment_failed`,
     `payment_intent.canceled`, `charge.refunded`, `charge.dispute.created`
   - Copy the signing secret into `STRIPE_WEBHOOK_SECRET` in Vercel (all environments that
     should fulfil orders).
7. **Radar**: leave the default rules on. Add the owner's email under Settings → Emails for
   dispute and refund notifications.
8. **Stripe Tax**: leave it off. It costs 0.5% per transaction and we do not yet know whether these
   admissions are taxable in Lockport. The site's `tax_rate_bps` stays 0 until the accountant says.

## Keys into Vercel

| Variable | Where it comes from |
|---|---|
| `STRIPE_SECRET_KEY` | Developers → API keys → Secret key |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Developers → API keys → Publishable key |
| `STRIPE_WEBHOOK_SECRET` | The endpoint created in step 6 |
| `TICKET_SIGNING_SECRET` | `openssl rand -base64 48` — never reuse across environments |
| `CRON_SECRET` | `openssl rand -base64 32` |

Use **test-mode** keys on preview deployments and **live** keys only on production. Before the
first real sale, confirm no test key is left in the production environment.

## Testing the flow

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Then, on a local event with `ticketing_enabled` on (`npm run seed:events` against Supabase makes
one):

| Card | Exercises |
|---|---|
| `4242 4242 4242 4242` | Success |
| `4000 0025 0000 3155` | 3D Secure challenge — the page must survive the redirect |
| `4000 0000 0000 0002` | Declined — the form says so and nothing is charged |
| `4000 0000 0000 9995` | Insufficient funds |

Also:

- Replay a `payment_intent.succeeded` event from the Dashboard twice and confirm the ticket count
  did not change (`processed_stripe_events` refuses the replay before the order is touched, and
  `fulfill_order` refuses to mint twice even if it were not).
- Trigger the webhook before the browser redirects (`stripe trigger`) and after a 20-second delay;
  both should land on a correct tickets page.
- Refund an order in the Dashboard, not the admin, and confirm its tickets read "No longer valid".
- Set `p_hold_minutes` to 1 on a test reservation to walk the hold-expiry path.
- Apple Pay on a real iPhone in Safari, Google Pay on a real Android. Simulators lie.
