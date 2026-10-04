import Link from "next/link";
import { clientId } from "@/lib/spotify";

export default function Home() {
  const live = clientId() !== null;
  return (
    <div className="space-y-14">
      <section className="max-w-3xl pt-4 sm:pt-10">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-accent">Spotify stats, unwrapped</p>
        <h1 className="mt-4 font-display text-5xl font-extrabold leading-[0.95] tracking-tight sm:text-7xl">
          Everything you&apos;ve ever played.
        </h1>
        <p className="mt-6 max-w-xl text-lg text-muted">
          Wrapped shows you one year, once a year. Earshot reads your full listening history: every artist, every
          late-night loop, every year since you signed up.
        </p>
      </section>

      <section className={`grid gap-4 ${live ? "md:grid-cols-2" : ""}`}>
        <Link
          href="/history"
          className="group rounded-2xl border border-line bg-panel p-6 transition-colors hover:border-accent/60 sm:p-8"
        >
          <div className="text-sm font-medium text-accent">All-time</div>
          <h2 className="mt-2 font-display text-2xl font-bold tracking-tight">Your full history</h2>
          <p className="mt-2 text-muted">
            Drop in your Spotify data export and get hours per year, top artists of all time, when you listen, and
            how your taste changed.
          </p>
          <span className="mt-6 inline-block font-medium group-hover:text-accent">Open dashboard →</span>
        </Link>
        {live && (
        <Link
          href="/now"
          className="group rounded-2xl border border-line bg-panel p-6 transition-colors hover:border-accent-2/60 sm:p-8"
        >
          <div className="text-sm font-medium text-accent-2">Right now · invite-only</div>
          <h2 className="mt-2 font-display text-2xl font-bold tracking-tight">Your current rotation</h2>
          <p className="mt-2 text-muted">
            Connect Spotify for your top artists and tracks over the last 4 weeks, 6 months and year, plus what you
            just played.
          </p>
          <span className="mt-6 inline-block font-medium group-hover:text-accent-2">Connect →</span>
        </Link>
        )}
      </section>

      <section className="rounded-2xl border border-line p-6 sm:p-8">
        <h2 className="font-display text-xl font-bold tracking-tight">Getting your data export</h2>
        <ol className="mt-4 grid gap-4 text-muted sm:grid-cols-3">
          <Step n={1}>
            Go to <span className="text-foreground">spotify.com → Account → Privacy settings</span>.
          </Step>
          <Step n={2}>
            Tick <span className="text-foreground">Extended streaming history</span> and request it. The basic
            account data works too, but only covers the last year.
          </Step>
          <Step n={3}>
            Spotify emails a zip within a few days (sometimes up to 30). Unzip it and drop the{" "}
            <code className="text-foreground">Streaming_History_Audio_*.json</code> files in.
          </Step>
        </ol>
      </section>
    </div>
  );
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-panel-2 font-display text-sm font-bold text-foreground">
        {n}
      </span>
      <p>{children}</p>
    </li>
  );
}
