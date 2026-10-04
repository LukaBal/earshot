import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>Earshot is an independent project, not affiliated with or endorsed by Spotify.</p>
        <Link href="/privacy" className="hover:text-foreground">
          Privacy
        </Link>
      </div>
    </footer>
  );
}
