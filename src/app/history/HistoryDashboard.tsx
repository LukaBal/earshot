"use client";

import { useEffect, useMemo, useState } from "react";
import { HourChart, MonthChart, WeekdayChart, YearChart } from "@/components/Charts";
import { Panel, RankList, SectionTitle, StatTile } from "@/components/ui";
import { fmtDate, fmtDuration, fmtHour, fmtNum } from "@/lib/format";
import { computeStats, mergePlays, parseExport, yearlyOverview, yearsIn, type Play } from "@/lib/history";
import { clearPlays, loadPlays, savePlays } from "@/lib/store";
import { Dropzone } from "./Dropzone";

type Notice = { kind: "ok" | "error"; text: string };

export function HistoryDashboard() {
  const [plays, setPlays] = useState<Play[] | null>(null); // null = still loading from IndexedDB
  const [year, setYear] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [notices, setNotices] = useState<Notice[]>([]);

  useEffect(() => {
    loadPlays().then(setPlays);
  }, []);

  const years = useMemo(() => yearsIn(plays ?? []), [plays]);
  const stats = useMemo(() => computeStats(plays ?? [], year), [plays, year]);
  const yearly = useMemo(() => yearlyOverview(plays ?? []), [plays]);

  async function handleFiles(files: File[]) {
    if (files.length === 0) return;
    setBusy(true);
    const next: Notice[] = [];
    let incoming: Play[] = [];

    for (const file of files) {
      try {
        const parsed = parseExport(JSON.parse(await file.text()));
        incoming = incoming.concat(parsed);
      } catch (err) {
        next.push({ kind: "error", text: `${file.name}: ${err instanceof Error ? err.message : "couldn't read file"}` });
      }
    }

    if (incoming.length > 0) {
      const before = plays?.length ?? 0;
      const merged = mergePlays(plays ?? [], incoming);
      try {
        await savePlays(merged);
      } catch {
        next.push({ kind: "error", text: "Couldn't save to browser storage. Stats will reset on reload." });
      }
      setPlays(merged);
      next.unshift({ kind: "ok", text: `Added ${fmtNum(merged.length - before)} new plays.` });
    }

    setNotices(next);
    setBusy(false);
  }

  async function handleClear() {
    if (!confirm("Remove all imported history from this browser?")) return;
    await clearPlays();
    setPlays([]);
    setYear(null);
    setNotices([]);
  }

  if (plays === null) {
    return <div className="card h-64 animate-pulse" aria-label="Loading" />;
  }

  if (plays.length === 0) {
    return (
      <div className="max-w-3xl space-y-6">
        <div>
          <SectionTitle as="h1" title="The archive" note="Files are read by your browser and stay on this device" />
          <p className="max-w-xl leading-relaxed">
            Add the streaming history files from your Spotify export. Select every file in the folder at once; Earshot
            merges them and ignores duplicates.
          </p>
        </div>
        <Dropzone onFiles={handleFiles} busy={busy} />
        <NoticeList notices={notices} />
      </div>
    );
  }

  const peakHour = stats.byHour.reduce((a, b) => (b.ms > a.ms ? b : a));
  const peakDay = stats.byWeekday.reduce((a, b) => (b.ms > a.ms ? b : a));

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <SectionTitle
          as="h1"
          title={year === null ? "All-time" : String(year)}
          note={stats.first !== null && stats.last !== null ? `${fmtDate(stats.first)} – ${fmtDate(stats.last)}` : undefined}
        />
        <div className="mb-5 flex items-center gap-2">
          <Dropzone onFiles={handleFiles} busy={busy} compact />
          <button
            onClick={handleClear}
            className="btn"
          >
            Clear data
          </button>
        </div>
      </div>

      <NoticeList notices={notices} />

      <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:flex-wrap sm:px-0" role="tablist" aria-label="Year">
        <YearChip active={year === null} onClick={() => setYear(null)}>
          All time
        </YearChip>
        {years.map((y) => (
          <YearChip key={y} active={year === y} onClick={() => setYear(y)}>
            {y}
          </YearChip>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatTile label="Listened" value={fmtDuration(stats.totalMs)} hint={`${fmtNum(Math.round(stats.totalMs / 86_400_000))} days nonstop`} />
        <StatTile label="Plays" value={fmtNum(stats.playCount)} hint="30 seconds or longer" />
        <StatTile label="Artists" value={fmtNum(stats.uniqueArtists)} />
        <StatTile label="Tracks" value={fmtNum(stats.uniqueTracks)} />
        <StatTile
          label="Skip rate"
          value={stats.skipRate === null ? "—" : `${Math.round(stats.skipRate * 100)}%`}
          hint={stats.skipRate === null ? "Needs extended history" : undefined}
        />
      </div>

      <Panel title="Over time" aside="hours per month">
        <MonthChart data={stats.byMonth} />
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Time of day" aside={`peak ${fmtHour(peakHour.hour)}–${fmtHour((peakHour.hour + 1) % 24)}`}>
          <HourChart data={stats.byHour} />
        </Panel>
        <Panel title="Day of week" aside={`most on ${peakDay.day}`}>
          <WeekdayChart data={stats.byWeekday} />
        </Panel>
      </div>

      {year === null && yearly.length > 1 && (
        <Panel title="Year by year" aside="hover for each year's #1 artist">
          <YearChart data={yearly} />
        </Panel>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Top artists" aside="by time listened">
          <RankList
            items={stats.topArtists.map((a) => ({
              key: a.name,
              title: a.name,
              subtitle: `${fmtNum(a.plays)} plays`,
              value: a.ms,
              display: fmtDuration(a.ms),
            }))}
          />
        </Panel>
        <Panel title="Top tracks" aside="by play count">
          <RankList
            items={stats.topTracks.map((t) => ({
              key: `${t.artist}-${t.name}`,
              title: t.name,
              subtitle: t.artist,
              value: t.plays,
              display: `${fmtNum(t.plays)}×`,
            }))}
          />
        </Panel>
      </div>
    </div>
  );
}

function YearChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`caps shrink-0 border px-3.5 py-1.5 text-[0.7rem] tabular-nums transition-colors duration-200 ${
        active ? "border-accent bg-accent-deep/50 text-foreground" : "border-line text-muted hover:border-line-strong hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function NoticeList({ notices }: { notices: Notice[] }) {
  if (notices.length === 0) return null;
  return (
    <ul className="space-y-1 text-sm" aria-live="polite">
      {notices.map((n, i) => (
        <li key={i} className={n.kind === "ok" ? "text-accent-bright" : "text-[#d9927f]"}>
          {n.text}
        </li>
      ))}
    </ul>
  );
}
