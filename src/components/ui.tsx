export function Panel({
  title,
  aside,
  children,
  className = "",
}: {
  title?: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-2xl border border-line bg-panel p-5 sm:p-6 ${className}`}>
      {(title || aside) && (
        <div className="mb-4 flex items-baseline justify-between gap-3">
          {title && <h2 className="font-display text-lg font-bold tracking-tight">{title}</h2>}
          {aside && <div className="text-sm text-muted">{aside}</div>}
        </div>
      )}
      {children}
    </section>
  );
}

export function StatTile({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-line bg-panel p-4 sm:p-5">
      <div className="text-xs font-medium uppercase tracking-wider text-muted">{label}</div>
      <div className="mt-1.5 font-display text-2xl font-extrabold tracking-tight tabular-nums sm:text-3xl">
        {value}
      </div>
      {hint && <div className="mt-1 text-xs text-muted">{hint}</div>}
    </div>
  );
}

export type RankItem = { key: string; title: string; subtitle?: string; value: number; display: string };

export function RankList({ items, empty = "Nothing here yet." }: { items: RankItem[]; empty?: string }) {
  if (items.length === 0) return <p className="text-sm text-muted">{empty}</p>;
  const max = Math.max(...items.map((i) => i.value), 1);
  return (
    <ol className="space-y-1">
      {items.map((item, i) => (
        <li key={item.key} className="relative overflow-hidden rounded-lg px-3 py-2">
          <div
            className="absolute inset-y-0 left-0 rounded-lg bg-accent/10"
            style={{ width: `${(item.value / max) * 100}%` }}
            aria-hidden="true"
          />
          <div className="relative flex items-center gap-3">
            <span className="w-6 shrink-0 text-right text-sm tabular-nums text-muted">{i + 1}</span>
            <div className="min-w-0 flex-1">
              <div className="truncate font-medium">{item.title}</div>
              {item.subtitle && <div className="truncate text-sm text-muted">{item.subtitle}</div>}
            </div>
            <span className="shrink-0 text-sm tabular-nums text-muted">{item.display}</span>
          </div>
        </li>
      ))}
    </ol>
  );
}
