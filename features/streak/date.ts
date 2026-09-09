// All streak logic works on local calendar dates (YYYY-MM-DD), not
// timestamps, so a streak day boundary is always local midnight -
// never UTC midnight, which would break streaks for users outside
// UTC around their local midnight.

export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function addDaysToDateString(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const utcMs = Date.UTC(y, m - 1, d) + days * 86400000;
  const result = new Date(utcMs);
  return `${result.getUTCFullYear()}-${String(result.getUTCMonth() + 1).padStart(2, '0')}-${String(
    result.getUTCDate()
  ).padStart(2, '0')}`;
}

export function daysBetweenDateStrings(from: string, to: string): number {
  const [fy, fm, fd] = from.split('-').map(Number);
  const [ty, tm, td] = to.split('-').map(Number);
  const diffMs = Date.UTC(ty, tm - 1, td) - Date.UTC(fy, fm - 1, fd);
  return Math.round(diffMs / 86400000);
}
