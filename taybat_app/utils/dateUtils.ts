/**
 * Returns a YYYY-MM-DD string using the device's LOCAL calendar date.
 *
 * `new Date().toISOString()` returns UTC time. At 2 AM local in UTC+3,
 * UTC is still 11 PM of the previous day — so the UTC-based date is wrong
 * for any "today" filter or display. Always use this helper instead of
 * `new Date().toISOString().slice(0, 10)` when you need today's local date.
 */
export const localDateISO = (d: Date = new Date()): string => {
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  const dy = String(d.getDate()).padStart(2, '0');
  return `${y}-${mo}-${dy}`;
};

/**
 * Adds `days` to an ISO date (or full timestamp) and returns a "YYYY-MM-DD"
 * string, using the device's LOCAL calendar throughout.
 *
 * The naive `new Date(isoString)` + `.setDate()` + `.toISOString()` pattern
 * round-trips through UTC on both ends: a bare date like "2026-03-15" parses
 * as UTC midnight, `.setDate()`/`.getDate()` then mutate using LOCAL calendar
 * fields, and `.toISOString()` serializes back to UTC. That mismatch silently
 * shifts the result by a day whenever the arithmetic crosses a DST
 * transition in the device's timezone (e.g. Egypt reinstated DST in 2023) —
 * always use this helper instead for date-only arithmetic.
 */
export const addDaysToISODate = (iso: string, days: number): string => {
  const dateOnly = iso.length === 10 ? iso : localDateISO(new Date(iso));
  const [y, m, d] = dateOnly.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + days);
  return localDateISO(dt);
};
