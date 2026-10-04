/** Section heading in the sh1pc style: spaced caps, a short accent rule, and a quiet italic note. */
export function SectionTitle({ title, note, as: Tag = "h2" }: { title: string; note?: string; as?: "h1" | "h2" }) {
  return (
    <div className="mb-5">
      <Tag className={`caps text-foreground ${Tag === "h1" ? "font-display text-4xl font-medium sm:text-5xl" : "text-base"}`}>
        {title}
      </Tag>
      <div className="mt-2.5 h-px w-10 bg-accent" />
      {note && <p className="mt-2.5 text-sm italic text-muted">{note}</p>}
    </div>
  );
}

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
    <section className={`card p-5 sm:p-6 ${className}`}>
      {(title || aside) && (
        <div className="mb-5 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          {title && <h2 className="caps text-sm text-foreground">{title}</h2>}
          {aside && <div className="text-sm italic text-muted">{aside}</div>}
        </div>
      )}
      {children}
    </section>
  );
}

export function StatTile({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="card px-4 py-4 sm:px-5">
      <div className="caps text-[0.65rem] text-muted">{label}</div>
      <div className="mt-2 font-display text-3xl font-semibold leading-none text-foreground lining-nums tabular-nums sm:text-4xl">
        {value}
      </div>
      {hint && <div className="mt-2 text-xs italic text-muted">{hint}</div>}
    </div>
  );
}

export type RankItem = { key: string; title: string; subtitle?: string; value: number; display: string };

export function RankList({ items, empty = "Nothing here yet." }: { items: RankItem[]; empty?: string }) {
  if (items.length === 0) return <p className="text-sm italic text-muted">{empty}</p>;
  const max = Math.max(...items.map((i) => i.value), 1);
  return (
    <ol className="divide-y divide-line">
      {items.map((item, i) => (
        <li key={item.key} className="flex items-center gap-4 py-2.5">
          <span className="w-6 shrink-0 text-right font-display text-lg text-muted lining-nums tabular-nums">{i + 1}</span>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-3">
              <span className="truncate text-foreground">{item.title}</span>
              <span className="shrink-0 text-sm text-muted tabular-nums">{item.display}</span>
            </div>
            {item.subtitle && <div className="truncate text-sm italic text-muted">{item.subtitle}</div>}
            <div className="mt-1.5 h-px bg-line">
              <div className="h-px bg-accent/70" style={{ width: `${(item.value / max) * 100}%` }} />
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
