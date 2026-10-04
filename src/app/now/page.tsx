import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Panel, SectionTitle } from "@/components/ui";
import {
  COOKIE,
  SpotifyError,
  clientId,
  pickImage,
  spotifyGet,
  type Me,
  type Paging,
  type RecentlyPlayed,
  type SpotifyArtist,
  type SpotifyTrack,
} from "@/lib/spotify";

export const metadata: Metadata = { title: "Right now" };

const RANGES = {
  short_term: "4 weeks",
  medium_term: "6 months",
  long_term: "12 months",
} as const;
type Range = keyof typeof RANGES;

const ERRORS: Record<string, string> = {
  config: "SPOTIFY_CLIENT_ID isn't set. See the setup steps below.",
  denied: "Spotify login was cancelled.",
  state: "Login couldn't be verified. Please try again.",
  token: "Spotify rejected the login. Check that the Redirect URI in your Spotify app matches exactly.",
  expired: "Your Spotify session expired. Connect again.",
};

export default async function NowPage({ searchParams }: PageProps<"/now">) {
  const params = await searchParams;
  const range: Range = typeof params.range === "string" && params.range in RANGES ? (params.range as Range) : "short_term";
  const errorKey = typeof params.error === "string" ? params.error : null;

  const store = await cookies();
  const access = store.get(COOKIE.access)?.value;
  const hasRefresh = store.has(COOKIE.refresh);
  const refreshUrl = `/api/auth/refresh?next=${encodeURIComponent(`/now?range=${range}`)}`;

  if (!access) {
    if (hasRefresh) redirect(refreshUrl);
    return <ConnectScreen error={errorKey ? ERRORS[errorKey] : null} />;
  }

  let data: [Me, Paging<SpotifyArtist>, Paging<SpotifyTrack>, RecentlyPlayed] | null = null;
  let status: number | null = null;
  try {
    data = await Promise.all([
      spotifyGet<Me>("/me", access),
      spotifyGet<Paging<SpotifyArtist>>(`/me/top/artists?time_range=${range}&limit=20`, access),
      spotifyGet<Paging<SpotifyTrack>>(`/me/top/tracks?time_range=${range}&limit=20`, access),
      spotifyGet<RecentlyPlayed>("/me/player/recently-played?limit=20", access),
    ]);
  } catch (err) {
    if (!(err instanceof SpotifyError)) throw err;
    status = err.status;
  }

  if (status === 401) redirect(refreshUrl); // redirect() throws, so it must live outside the try
  if (!data) {
    return (
      <ConnectScreen
        error={
          status === 403
            ? "Spotify blocked this account. While your Spotify app is in Development Mode, add your account under User Management in the Spotify dashboard."
            : `Spotify returned an error (${status}). Try again in a moment.`
        }
        connected
      />
    );
  }

  const [me, artists, tracks, recent] = data;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <SectionTitle as="h1" title="Right now" note={`What ${me.display_name ?? "you"} has had on repeat`} />
        </div>
        <form action="/api/auth/logout" method="post">
          <button className="btn mb-5">
            Disconnect Spotify
          </button>
        </form>
      </div>

      <nav className="flex gap-2" aria-label="Time range">
        {(Object.keys(RANGES) as Range[]).map((r) => (
          <Link
            key={r}
            href={`/now?range=${r}`}
            aria-current={r === range ? "page" : undefined}
            className={`caps border px-3.5 py-1.5 text-[0.7rem] transition-colors duration-200 ${
              r === range ? "border-accent bg-accent-deep/50 text-foreground" : "border-line text-muted hover:border-line-strong hover:text-foreground"
            }`}
          >
            {RANGES[r]}
          </Link>
        ))}
      </nav>

      <Panel title="Top artists" aside={`last ${RANGES[range]}`}>
        {artists.items.length === 0 ? (
          <p className="text-sm italic text-muted">Not enough listening in this range yet.</p>
        ) : (
          <ol className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {artists.items.map((a, i) => {
              const img = pickImage(a.images, 160);
              return (
                <li key={a.id}>
                  <a href={a.external_urls.spotify} target="_blank" rel="noreferrer" className="group block">
                    <div className="relative aspect-square overflow-hidden border border-line bg-panel-solid">
                      {img && (
                        <Image src={img} alt="" fill sizes="(min-width: 1024px) 200px, 45vw" className="object-cover grayscale-[35%] transition duration-300 group-hover:scale-105 group-hover:grayscale-0" />
                      )}
                      <span className="absolute left-0 top-0 bg-[#05080a]/85 px-2 py-0.5 font-display text-base text-foreground tabular-nums">
                        {i + 1}
                      </span>
                    </div>
                    <div className="mt-2 truncate text-foreground transition-colors group-hover:text-accent-bright">{a.name}</div>
                  </a>
                </li>
              );
            })}
          </ol>
        )}
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Top tracks" aside={`last ${RANGES[range]}`}>
          <ol className="divide-y divide-line">
            {tracks.items.map((t, i) => (
              <TrackRow key={t.id} track={t} lead={String(i + 1)} />
            ))}
          </ol>
        </Panel>
        <Panel title="Recently played">
          <ol className="divide-y divide-line">
            {recent.items.map((item) => (
              <TrackRow
                key={item.played_at}
                track={item.track}
                trailing={new Date(item.played_at).toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              />
            ))}
          </ol>
        </Panel>
      </div>
    </div>
  );
}

function TrackRow({ track, lead, trailing }: { track: SpotifyTrack; lead?: string; trailing?: string }) {
  const img = pickImage(track.album.images, 64);
  return (
    <li>
      <a
        href={track.external_urls.spotify}
        target="_blank"
        rel="noreferrer"
        className="flex items-center gap-3 py-2 transition-colors hover:bg-accent-deep/15"
      >
        {lead && <span className="w-6 shrink-0 text-right font-display text-lg tabular-nums text-muted">{lead}</span>}
        <div className="relative h-10 w-10 shrink-0 overflow-hidden border border-line bg-panel-solid">
          {img && <Image src={img} alt="" fill sizes="40px" className="object-cover" />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-foreground">{track.name}</div>
          <div className="truncate text-sm italic text-muted">{track.artists.map((a) => a.name).join(", ")}</div>
        </div>
        {trailing && <span className="shrink-0 text-xs text-muted tabular-nums">{trailing}</span>}
      </a>
    </li>
  );
}

function ConnectScreen({ error, connected = false }: { error: string | null; connected?: boolean }) {
  const configured = clientId() !== null;
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <SectionTitle as="h1" title="Right now" note="Your current rotation, live from Spotify" />
        <p className="leading-relaxed">
          Connect Spotify to see your top artists and tracks over the last 4 weeks, 6 months and year, plus your
          recent plays. Read-only: Earshot can&apos;t change anything in your account.
        </p>
        {configured && (
          <p className="mt-3 text-sm italic text-muted">
            Invite-only for now: Spotify only lets accounts the site owner has added log in. Everyone can use the{" "}
            <Link href="/history" className="not-italic text-accent-bright underline decoration-accent/40 underline-offset-4">
              all-time dashboard
            </Link>
            .
          </p>
        )}
      </div>

      {error && <p className="border border-[#d9927f]/40 border-l-2 border-l-[#d9927f] bg-[#d9927f]/5 px-4 py-3 text-sm text-[#e7b3a5]">{error}</p>}

      {configured ? (
        <div className="flex gap-3">
          {/* Plain <a>: this hits a route handler that redirects off-site, so no client-side navigation. */}
          <a href="/api/auth/login" className="btn btn-primary">
            {connected ? "Reconnect Spotify" : "Connect Spotify"}
          </a>
          {connected && (
            <form action="/api/auth/logout" method="post">
              <button className="btn">Disconnect</button>
            </form>
          )}
        </div>
      ) : (
        <Panel title="One-time setup">
          <ol className="list-decimal space-y-2 pl-5 leading-relaxed marker:text-accent">
            <li>
              Create an app at <span className="text-foreground">developer.spotify.com/dashboard</span> and select{" "}
              <span className="text-foreground">Web API</span>.
            </li>
            <li>
              Add the Redirect URI <code className="text-foreground">http://127.0.0.1:3000/api/auth/callback</code>.
            </li>
            <li>
              Copy the Client ID into <code className="text-foreground">.env.local</code> as{" "}
              <code className="text-foreground">SPOTIFY_CLIENT_ID=…</code> and restart the dev server.
            </li>
          </ol>
        </Panel>
      )}
    </div>
  );
}
