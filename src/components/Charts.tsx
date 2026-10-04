"use client";

import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { fmtHour, fmtMonth, fmtNum, msToHours } from "@/lib/format";

// Recharts takes literal colors; keep in sync with globals.css.
const C = {
  accent: "#c6f24e",
  accent2: "#ff7a59",
  grid: "rgba(255,255,255,0.06)",
  tick: "#8e8c96",
  panel: "#1d1d24",
};

const axis = { stroke: C.tick, fontSize: 12, tickLine: false, axisLine: false } as const;
const tooltip = {
  contentStyle: { background: C.panel, border: "1px solid rgba(255,255,255,0.16)", borderRadius: 10, fontSize: 13 },
  labelStyle: { color: "#f3f1ea", fontWeight: 600 },
  itemStyle: { color: "#f3f1ea" },
  cursor: { fill: "rgba(255,255,255,0.04)" },
};
const hoursLabel = (v: unknown) => [`${fmtNum(Math.round(Number(v)))} h`, "Listened"] as [string, string];

export function MonthChart({ data }: { data: { month: string; ms: number }[] }) {
  const rows = data.map((d) => ({ month: d.month, hours: msToHours(d.ms) }));
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={rows} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <defs>
            <linearGradient id="monthFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={C.accent} stopOpacity={0.35} />
              <stop offset="100%" stopColor={C.accent} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={C.grid} vertical={false} />
          <XAxis dataKey="month" tickFormatter={fmtMonth} minTickGap={24} {...axis} />
          <YAxis tickFormatter={(v) => `${v}h`} width={48} {...axis} />
          <Tooltip {...tooltip} labelFormatter={(l) => fmtMonth(String(l))} formatter={hoursLabel} />
          <Area type="monotone" dataKey="hours" stroke={C.accent} strokeWidth={2} fill="url(#monthFill)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function HourChart({ data }: { data: { hour: number; ms: number }[] }) {
  const peak = data.reduce((best, d) => (d.ms > best.ms ? d : best), data[0]);
  const rows = data.map((d) => ({ hour: d.hour, hours: msToHours(d.ms) }));
  return (
    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} margin={{ top: 8, right: 0, left: -16, bottom: 0 }}>
          <CartesianGrid stroke={C.grid} vertical={false} />
          <XAxis dataKey="hour" tickFormatter={fmtHour} interval={2} {...axis} />
          <YAxis tickFormatter={(v) => `${v}h`} width={48} {...axis} />
          <Tooltip {...tooltip} labelFormatter={(l) => `${fmtHour(Number(l))}–${fmtHour((Number(l) + 1) % 24)}`} formatter={hoursLabel} />
          <Bar
            dataKey="hours"
            radius={[4, 4, 0, 0]}
            shape={(props: { x?: number; y?: number; width?: number; height?: number; payload?: { hour: number } }) => (
              <rect
                x={props.x}
                y={props.y}
                width={props.width}
                height={props.height}
                rx={3}
                fill={props.payload?.hour === peak?.hour ? C.accent2 : C.accent}
              />
            )}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function WeekdayChart({ data }: { data: { day: string; ms: number }[] }) {
  const rows = data.map((d) => ({ day: d.day, hours: msToHours(d.ms) }));
  return (
    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} margin={{ top: 8, right: 0, left: -16, bottom: 0 }}>
          <CartesianGrid stroke={C.grid} vertical={false} />
          <XAxis dataKey="day" {...axis} />
          <YAxis tickFormatter={(v) => `${v}h`} width={48} {...axis} />
          <Tooltip {...tooltip} formatter={hoursLabel} />
          <Bar dataKey="hours" fill={C.accent} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function YearChart({ data }: { data: { year: string; ms: number; topArtist: string }[] }) {
  const rows = data.map((d) => ({ ...d, hours: msToHours(d.ms) }));
  return (
    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} margin={{ top: 8, right: 0, left: -16, bottom: 0 }}>
          <CartesianGrid stroke={C.grid} vertical={false} />
          <XAxis dataKey="year" {...axis} />
          <YAxis tickFormatter={(v) => `${v}h`} width={48} {...axis} />
          <Tooltip
            {...tooltip}
            content={({ active, payload }) => {
              const row = payload?.[0]?.payload as (typeof rows)[number] | undefined;
              if (!active || !row) return null;
              return (
                <div style={tooltip.contentStyle} className="px-3 py-2">
                  <div className="font-semibold">{row.year}</div>
                  <div>{fmtNum(Math.round(row.hours))} h listened</div>
                  <div className="text-muted">
                    #1: <span className="text-accent">{row.topArtist}</span>
                  </div>
                </div>
              );
            }}
          />
          <Bar dataKey="hours" fill={C.accent2} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
