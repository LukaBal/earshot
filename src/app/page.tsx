import Link from "next/link";
import { SectionTitle } from "@/components/ui";
import { clientId } from "@/lib/spotify";

const FEATURES = [
  {
    title: "Year by year",
    body: "Hours listened for every year since you joined, and the artist who owned each one.",
  },
  {
    title: "All-time rankings",
    body: "Your top artists by time actually spent, and your top tracks by how often you came back to them.",
  },
  {
    title: "When you listen",
    body: "By hour and by weekday, so you can see the commute, the late nights and the Sunday mornings.",
  },
  {
    title: "Skip habits",
    body: "How often you bail on a track before it ends. The extended export records every skip.",
  },
];

export default function Home() {
  const live = clientId() !== null;

  return (
    <div className="space-y-24 sm:space-y-32">
      <section className="flex min-h-[70dvh] flex-col items-center justify-center text-center">
        <h1 className="font-display text-6xl font-medium uppercase tracking-[0.16em] text-foreground sm:text-8xl">
          Earshot
        </h1>
        <p className="caps mt-5 text-lg tracking-[0.4em] text-accent sm:text-xl">Listening archive</p>
        <p className="caps mt-6 text-xs tracking-[0.3em] text-accent/70">Your full Spotify history · read in your browser</p>
        <p className="mt-8 max-w-[34rem] text-pretty leading-relaxed">
          Wrapped gives you one year, once a year. Earshot reads the export Spotify keeps on you: every play since you
          signed up, broken down by year, by hour and by artist.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link href="/history" className="btn btn-primary">
            Open the archive
          </Link>
          <Link href="#export" className="btn">
            Get your data
          </Link>
          {live && (
            <Link href="/now" className="btn">
              Right now
            </Link>
          )}
        </div>
        <a href="#about" className="caps mt-20 text-[0.6rem] tracking-[0.3em] text-muted transition-colors hover:text-foreground">
          Scroll ↓
        </a>
      </section>

      <section id="about" className="grid scroll-mt-24 gap-10 lg:grid-cols-[1fr_1.4fr] lg:gap-14">
        <div>
          <SectionTitle title="What it shows" note="From a single folder of JSON files" />
          <p className="max-w-md leading-relaxed">
            Spotify&apos;s extended streaming history logs every track you&apos;ve played: when it ended, how long you
            listened, and whether you skipped. Earshot turns that into something you can actually read.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {FEATURES.map((f) => (
            <article key={f.title} className="card p-5">
              <h3 className="caps text-xs text-accent-bright">{f.title}</h3>
              <p className="mt-3 text-[0.95rem] leading-relaxed">{f.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="export" className="scroll-mt-24">
        <SectionTitle title="Your data" note="Request it once, keep it forever" />
        <ol className="max-w-3xl divide-y divide-line border-y border-line">
          <Step n="I">
            On spotify.com, open <span className="text-foreground">Account → Privacy settings</span>.
          </Step>
          <Step n="II">
            Tick <span className="text-foreground">Extended streaming history</span> and request it. The basic account
            data works too, but only covers the last year.
          </Step>
          <Step n="III">
            Spotify emails a zip within a few days, sometimes up to thirty. Unzip it and drop the{" "}
            <code className="text-foreground">Streaming_History_Audio_*.json</code> files into{" "}
            <Link href="/history" className="text-accent-bright underline decoration-accent/40 underline-offset-4 hover:decoration-accent">
              the archive
            </Link>
            .
          </Step>
        </ol>
        <p className="mt-6 max-w-3xl text-sm">
          <span className="text-foreground">Note:</span> your files never leave your device. They&apos;re read and stored
          by your own browser. See <Link href="/privacy" className="italic text-foreground hover:text-accent-bright">privacy</Link>.
        </p>
      </section>
    </div>
  );
}

function Step({ n, children }: { n: string; children: React.ReactNode }) {
  return (
    <li className="grid grid-cols-[3rem_1fr] items-baseline gap-4 py-5">
      <span className="font-display text-2xl text-accent">{n}</span>
      <p className="leading-relaxed">{children}</p>
    </li>
  );
}
