/**
 * Returns a YYYY-MM-DD string using the device's LOCAL calendar date.
 *
 * `new Date().toISOString()` returns UTC time. At 2 AM local in UTC+3,
 * UTC is still 11 PM of the previous day — so the UTC-based date is wrong
 * for any "today" filter or display. Always use this helper instead of
 * `new Date().toISOString().slice(0, 10)` when you need today's local date.
 */
export const localDateISO = (d: Date = new Date()): string => {
  const y  = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  const dy = String(d.getDate()).padStart(2, '0');
  return `${y}-${mo}-${dy}`;
};
