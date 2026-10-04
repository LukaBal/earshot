import Link from "next/link";

export default function NotFound() {
  return (
    <section className="flex min-h-[60dvh] flex-col items-center justify-center text-center">
      <p className="caps text-xs tracking-[0.3em] text-accent">404</p>
      <h1 className="caps mt-4 font-display text-4xl font-medium text-foreground sm:text-5xl">Nothing on this track</h1>
      <p className="mt-4 max-w-sm italic text-muted">This page doesn&apos;t exist, or it was moved.</p>
      <div className="mt-8 flex gap-3">
        <Link href="/" className="btn">
          Home
        </Link>
        <Link href="/history" className="btn btn-primary">
          Open the archive
        </Link>
      </div>
    </section>
  );
}
