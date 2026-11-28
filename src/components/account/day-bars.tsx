/** A small bar chart of one value per day (oldest first). */
export function DayBars({
  days,
  label,
  format = String,
}: {
  days: { day: string; value: number }[];
  label: string;
  format?: (v: number) => string;
}) {
  const peak = Math.max(1, ...days.map((d) => d.value));
  return (
    <ol className="flex h-24 items-end gap-1" aria-label={label}>
      {days.map((d) => (
        <li key={d.day} className="flex h-full flex-1 flex-col justify-end" title={`${d.day}: ${format(d.value)}`}>
          <span
            className={`block rounded-t ${d.value ? "bg-accent/70" : "bg-line"}`}
            style={{ height: `${d.value ? Math.max(4, (d.value / peak) * 100) : 2}%` }}
          />
          <span className="sr-only">
            {d.day}: {format(d.value)}
          </span>
        </li>
      ))}
    </ol>
  );
}

/** The last n days (Vietnam time) as YYYY-MM-DD, oldest first, filled from rows. */
export function fillDays<T extends { day: string }>(rows: T[], pick: (r: T) => number, n = 14) {
  const out: { day: string; value: number }[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const day = new Date(Date.now() + 7 * 3_600_000 - i * 86_400_000).toISOString().slice(0, 10);
    out.push({ day, value: rows.filter((r) => r.day === day).reduce((s, r) => s + pick(r), 0) });
  }
  return out;
}
