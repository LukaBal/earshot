import Link from "next/link";
import { clientId } from "@/lib/spotify";
import { NavLink } from "./NavLink";

export function Sidebar() {
  const live = clientId() !== null;
  const links = [
    { href: "/", label: "Home" },
    { href: "/history", label: "All-time" },
    ...(live ? [{ href: "/now", label: "Right now" }] : []),
    { href: "/#export", label: "Your data" },
    { href: "/privacy", label: "Privacy" },
  ];

  return (
    <aside className="sticky top-0 z-40 border-b border-line bg-[#070b0d]/90 backdrop-blur lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:border-b-0 lg:border-r lg:bg-[#070b0d]/80">
      {/* Fine crosshatch, like old record-sleeve paper. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 hidden opacity-[0.035] lg:block"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, #fff 0 1px, transparent 1px 9px), repeating-linear-gradient(-45deg, #fff 0 1px, transparent 1px 9px)",
        }}
      />

      <div className="relative flex items-center justify-between gap-4 px-5 py-3 lg:h-full lg:flex-col lg:items-stretch lg:justify-start lg:px-0 lg:py-0">
        <Link href="/" className="group flex items-center gap-3 lg:flex-col lg:gap-4 lg:px-6 lg:pb-8 lg:pt-10">
          <Emblem className="h-9 w-9 lg:h-16 lg:w-16" />
          <span className="lg:text-center">
            <span className="caps block text-sm text-foreground lg:text-base lg:tracking-[0.3em]">Earshot</span>
            <span className="caps hidden text-[0.6rem] tracking-[0.3em] text-muted lg:block">Listening archive</span>
          </span>
        </Link>

        <div className="rule hidden lg:block" />

        <nav aria-label="Main" className="flex gap-1 overflow-x-auto lg:mt-6 lg:flex-col lg:gap-0.5 lg:px-3">
          {links.map((l) => (
            <NavLink key={l.href} href={l.href}>
              {l.label}
            </NavLink>
          ))}
        </nav>

        <p className="mt-auto hidden px-6 pb-8 text-xs leading-relaxed text-muted lg:block">
          Independent project.
          <br />
          Not affiliated with Spotify.
        </p>
      </div>
    </aside>
  );
}

export function Emblem({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <circle cx="32" cy="32" r="30.5" fill="#0c1416" stroke="#52c7b0" strokeOpacity="0.55" />
      <circle cx="32" cy="32" r="25" fill="none" stroke="#e6e4dc" strokeOpacity="0.12" />
      {[
        [19, 12],
        [25.5, 22],
        [32, 30],
        [38.5, 18],
        [45, 9],
      ].map(([x, h]) => (
        <rect key={x} x={x - 1.75} y={32 - h / 2} width="3.5" height={h} fill={x === 32 ? "#86dccb" : "#e6e4dc"} opacity={x === 32 ? 1 : 0.8} />
      ))}
    </svg>
  );
}
