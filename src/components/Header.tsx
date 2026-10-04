import Link from "next/link";
import { clientId } from "@/lib/spotify";
import { NavLink } from "./NavLink";

export function Header() {
  return (
    <header className="border-b border-line">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 font-display text-xl font-extrabold tracking-tight">
          <Logo />
          Earshot
        </Link>
        <nav className="flex gap-1 text-sm" aria-label="Main">
          <NavLink href="/history">All-time</NavLink>
          {clientId() && <NavLink href="/now">Right now</NavLink>}
        </nav>
      </div>
    </header>
  );
}

function Logo() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
      {[
        [1, 8],
        [6, 14],
        [11, 20],
        [16, 11],
      ].map(([x, h]) => (
        <rect key={x} x={x} y={(22 - h) / 2} width="4" height={h} rx="2" fill="#c6f24e" />
      ))}
    </svg>
  );
}
