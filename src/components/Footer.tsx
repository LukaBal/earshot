import Link from "next/link";

export function Footer() {
  return (
    <footer className="mx-auto w-full max-w-5xl px-5 pb-8 sm:px-8">
      <div className="rule mb-6" />
      <div className="flex flex-col gap-2 text-sm text-muted sm:flex-row sm:justify-between">
        <p>Earshot is an independent project, not affiliated with or endorsed by Spotify.</p>
        <Link href="/privacy" className="caps text-xs hover:text-foreground">
          Privacy
        </Link>
      </div>
    </footer>
  );
}
