/**
 * Parses a date-only string ("YYYY-MM-DD") as a local-midnight Date,
 * avoiding the UTC-offset bug where `new Date("2024-03-15")` is parsed
 * as UTC midnight and displayed as the previous day in UTC-5 timezones.
 *
 * If the string already contains a "T" (full ISO timestamp), it is passed
 * directly to `new Date()` so existing behaviour is unchanged.
 */
export function parseLocalDate(dateStr: string): Date {
  if (dateStr.includes("T")) {
    return new Date(dateStr);
  }
  return new Date(dateStr + "T00:00:00");
}
