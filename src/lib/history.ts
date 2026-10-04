// Parsing + stats for Spotify data exports. Runs entirely in the browser.

export type Play = {
  ts: number; // epoch ms, when the play ended
  ms: number; // how long it was played
  track: string;
  artist: string;
  album: string | null;
  skipped: boolean | null; // null = unknown (basic export has no skip info)
};

// "Extended streaming history" — Streaming_History_Audio_*.json
type ExtendedEntry = {
  ts: string;
  ms_played: number;
  master_metadata_track_name: string | null;
  master_metadata_album_artist_name: string | null;
  master_metadata_album_album_name: string | null;
  skipped?: boolean | null;
  reason_end?: string | null;
};

// Basic "Account data" export — StreamingHistory_music_*.json
type BasicEntry = {
  endTime: string; // "2024-03-01 13:45", UTC
  artistName: string;
  trackName: string;
  msPlayed: number;
};

// Spotify itself only counts a stream after 30 seconds.
export const MIN_PLAY_MS = 30_000;

export function parseExport(raw: unknown): Play[] {
  if (!Array.isArray(raw)) throw new Error("Not a streaming history file (expected a JSON array).");

  const plays: Play[] = [];
  for (const entry of raw) {
    if (!entry || typeof entry !== "object") continue;

    if ("ms_played" in entry) {
      const e = entry as ExtendedEntry;
      // Podcast episodes and audiobooks have no track/artist — skip them.
      if (!e.master_metadata_track_name || !e.master_metadata_album_artist_name) continue;
      plays.push({
        ts: Date.parse(e.ts),
        ms: e.ms_played,
        track: e.master_metadata_track_name,
        artist: e.master_metadata_album_artist_name,
        album: e.master_metadata_album_album_name,
        skipped: e.skipped ?? (e.reason_end ? e.reason_end === "fwdbtn" : null),
      });
    } else if ("msPlayed" in entry) {
      const e = entry as BasicEntry;
      if (!e.trackName || !e.artistName) continue;
      plays.push({
        ts: Date.parse(e.endTime.replace(" ", "T") + "Z"),
        ms: e.msPlayed,
        track: e.trackName,
        artist: e.artistName,
        album: null,
        skipped: null,
      });
    }
  }

  if (plays.length === 0 && raw.length > 0) {
    throw new Error("No music plays found — is this a Spotify streaming history file?");
  }
  return plays.filter((p) => Number.isFinite(p.ts));
}

/** Merge new plays into existing ones, dropping duplicates (same file uploaded twice). */
export function mergePlays(existing: Play[], incoming: Play[]): Play[] {
  const seen = new Set(existing.map(playKey));
  const merged = [...existing];
  for (const p of incoming) {
    const k = playKey(p);
    if (seen.has(k)) continue;
    seen.add(k);
    merged.push(p);
  }
  return merged.sort((a, b) => a.ts - b.ts);
}

function playKey(p: Play) {
  return `${p.ts}|${p.ms}|${p.artist}|${p.track}`;
}

export type RankedArtist = { name: string; ms: number; plays: number };
export type RankedTrack = { name: string; artist: string; ms: number; plays: number };

export type Stats = {
  totalMs: number;
  playCount: number;
  uniqueArtists: number;
  uniqueTracks: number;
  first: number | null;
  last: number | null;
  skipRate: number | null;
  topArtists: RankedArtist[];
  topTracks: RankedTrack[];
  byHour: { hour: number; ms: number }[];
  byWeekday: { day: string; ms: number }[];
  byMonth: { month: string; ms: number }[]; // "2024-03"
};

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const TOP_N = 25;

export function yearsIn(plays: Play[]): number[] {
  return [...new Set(plays.map((p) => new Date(p.ts).getFullYear()))].sort((a, b) => b - a);
}

export function computeStats(all: Play[], year: number | null): Stats {
  const plays = year === null ? all : all.filter((p) => new Date(p.ts).getFullYear() === year);

  const artists = new Map<string, RankedArtist>();
  const tracks = new Map<string, RankedTrack>();
  const byHour = new Array<number>(24).fill(0);
  const byWeekday = new Array<number>(7).fill(0);
  const byMonth = new Map<string, number>();
  let totalMs = 0;
  let playCount = 0;
  let skipKnown = 0;
  let skipped = 0;
  let first = Infinity;
  let last = -Infinity;

  for (const p of plays) {
    const d = new Date(p.ts);
    const counted = p.ms >= MIN_PLAY_MS;
    totalMs += p.ms;
    if (counted) playCount++;
    if (p.ts < first) first = p.ts;
    if (p.ts > last) last = p.ts;

    byHour[d.getHours()] += p.ms;
    byWeekday[(d.getDay() + 6) % 7] += p.ms;
    const mk = monthKey(d);
    byMonth.set(mk, (byMonth.get(mk) ?? 0) + p.ms);

    if (p.skipped !== null) {
      skipKnown++;
      if (p.skipped) skipped++;
    }

    const a = artists.get(p.artist) ?? { name: p.artist, ms: 0, plays: 0 };
    a.ms += p.ms;
    if (counted) a.plays++;
    artists.set(p.artist, a);

    const tk = `${p.artist}\u0000${p.track}`;
    const t = tracks.get(tk) ?? { name: p.track, artist: p.artist, ms: 0, plays: 0 };
    t.ms += p.ms;
    if (counted) t.plays++;
    tracks.set(tk, t);
  }

  const hasData = plays.length > 0;
  return {
    totalMs,
    playCount,
    uniqueArtists: artists.size,
    uniqueTracks: tracks.size,
    first: hasData ? first : null,
    last: hasData ? last : null,
    skipRate: skipKnown > 0 ? skipped / skipKnown : null,
    topArtists: [...artists.values()].sort((a, b) => b.ms - a.ms).slice(0, TOP_N),
    topTracks: [...tracks.values()]
      .sort((a, b) => b.plays - a.plays || b.ms - a.ms)
      .slice(0, TOP_N),
    byHour: byHour.map((ms, hour) => ({ hour, ms })),
    byWeekday: byWeekday.map((ms, i) => ({ day: WEEKDAYS[i], ms })),
    byMonth: hasData ? fillMonths(byMonth, first, last) : [],
  };
}

/** Per-year totals with that year's #1 artist — for the all-time view. */
export function yearlyOverview(plays: Play[]) {
  const years = new Map<number, { ms: number; artists: Map<string, number> }>();
  for (const p of plays) {
    const y = new Date(p.ts).getFullYear();
    const entry = years.get(y) ?? { ms: 0, artists: new Map() };
    entry.ms += p.ms;
    entry.artists.set(p.artist, (entry.artists.get(p.artist) ?? 0) + p.ms);
    years.set(y, entry);
  }
  return [...years.entries()]
    .sort(([a], [b]) => a - b)
    .map(([year, { ms, artists }]) => {
      let topArtist = "";
      let topMs = -1;
      for (const [name, aMs] of artists) {
        if (aMs > topMs) {
          topArtist = name;
          topMs = aMs;
        }
      }
      return { year: String(year), ms, topArtist };
    });
}

function monthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

// Include empty months so the timeline doesn't silently skip gaps.
function fillMonths(byMonth: Map<string, number>, first: number, last: number) {
  const out: { month: string; ms: number }[] = [];
  const cursor = new Date(first);
  cursor.setDate(1);
  const end = new Date(last);
  while (
    cursor.getFullYear() < end.getFullYear() ||
    (cursor.getFullYear() === end.getFullYear() && cursor.getMonth() <= end.getMonth())
  ) {
    const k = monthKey(cursor);
    out.push({ month: k, ms: byMonth.get(k) ?? 0 });
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return out;
}
