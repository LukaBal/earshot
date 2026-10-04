export const fmtNum = (n: number) => n.toLocaleString("en-US");

export const msToHours = (ms: number) => ms / 3_600_000;

export function fmtDuration(ms: number) {
  const hours = msToHours(ms);
  if (hours >= 1) return `${fmtNum(Math.round(hours))} h`;
  return `${Math.round(ms / 60_000)} min`;
}

export function fmtDate(ts: number) {
  return new Date(ts).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export function fmtMonth(key: string) {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, m - 1).toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

export function fmtHour(h: number) {
  if (h === 0) return "12a";
  if (h === 12) return "12p";
  return h < 12 ? `${h}a` : `${h - 12}p`;
}
