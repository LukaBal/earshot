"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const active = href === "/" ? pathname === "/" : !href.includes("#") && pathname.startsWith(href);
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`caps shrink-0 border-l-2 px-3 py-2 text-[0.7rem] transition-colors duration-200 lg:py-2.5 ${
        active
          ? "border-accent bg-accent-deep/40 text-foreground"
          : "border-transparent text-muted hover:border-line-strong hover:text-foreground"
      }`}
    >
      {children}
    </Link>
  );
}
