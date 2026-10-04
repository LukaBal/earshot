"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const active = usePathname().startsWith(href);
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`rounded-full px-3.5 py-1.5 transition-colors ${
        active ? "bg-accent font-semibold text-black" : "text-muted hover:bg-panel-2 hover:text-foreground"
      }`}
    >
      {children}
    </Link>
  );
}
