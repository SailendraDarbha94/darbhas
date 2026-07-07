const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/**
 * Deterministic "6 July 2026" formatting. Locale-aware APIs like
 * toLocaleDateString can differ between server and browser ICU builds,
 * which causes React hydration mismatches.
 */
export function formatDate(value: string | Date): string {
  const d = new Date(value);
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}
