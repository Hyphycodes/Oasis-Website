import { describe, expect, it } from 'vitest';
import { signOrderToken, signTicketToken, verifyOrderToken, verifyTicketToken } from './tokens';

const KEY = 'a-test-secret-that-is-long-enough-for-hmac-1234';

describe('order tokens', () => {
  it('round-trips and expires after 30 days', () => {
    const now = new Date('2026-09-18T12:00:00Z');
    const token = signOrderToken('order-1', now, KEY);
    expect(verifyOrderToken(token, now, KEY)).toBe('order-1');
    expect(verifyOrderToken(token, new Date('2026-10-19T12:00:00Z'), KEY)).toBeNull();
  });
  it('rejects tampering and the wrong key', () => {
    const token = signOrderToken('order-1', new Date(), KEY);
    const [prefix, payload, sig] = token.split('.');
    const forged = `${prefix}.${Buffer.from(JSON.stringify({ oid: 'order-2', exp: 9999999999 })).toString('base64url')}.${sig}`;
    expect(verifyOrderToken(forged, new Date(), KEY)).toBeNull();
    expect(verifyOrderToken(`${prefix}.${payload}.${sig}x`, new Date(), KEY)).toBeNull();
    expect(verifyOrderToken(token, new Date(), `${KEY}-other`)).toBeNull();
  });
});

describe('ticket tokens', () => {
  it('round-trips without a database', () => {
    const token = signTicketToken('ticket-1', 'event-1', KEY);
    expect(token.startsWith('t1.')).toBe(true);
    expect(verifyTicketToken(token, KEY)).toEqual({ tid: 'ticket-1', eid: 'event-1', v: 1 });
  });
  it('fails instantly on a tampered payload', () => {
    const token = signTicketToken('ticket-1', 'event-1', KEY);
    const [prefix, , sig] = token.split('.');
    const forged = `${prefix}.${Buffer.from(JSON.stringify({ tid: 'ticket-1', eid: 'event-2', v: 1 })).toString('base64url')}.${sig}`;
    expect(verifyTicketToken(forged, KEY)).toBeNull();
    expect(verifyTicketToken('garbage', KEY)).toBeNull();
  });
});
