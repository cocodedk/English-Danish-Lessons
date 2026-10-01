export const FIRST_PUBLISHED = '2026-09-30'
export const BUILD_DATE: string = __BUILD_DATE__

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

/** `2026-10-01` becomes `1 October 2026`. Anything that is not a real `YYYY-MM-DD` comes back unchanged. */
export function formatDate(iso: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
  if (!match) return iso
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])]
  // setUTCFullYear, not Date.UTC: Date.UTC maps the years 0 to 99 to 1900 to 1999.
  const date = new Date(0)
  date.setUTCFullYear(year, month - 1, day)
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return iso
  return `${day} ${MONTHS[month - 1]} ${match[1]}`
}
