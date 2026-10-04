import type { Metadata } from "next";
import { SectionTitle } from "@/components/ui";

export const metadata: Metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <article className="max-w-2xl space-y-8 leading-relaxed">
      <SectionTitle as="h1" title="Privacy" note="Short version: nothing leaves your device" />

      <section className="space-y-2">
        <h2 className="caps text-sm text-accent-bright">Your history files</h2>
        <p>
          Files you add on the All-time page are read by your own browser and saved in its local storage (IndexedDB)
          so your stats survive a reload. They are never uploaded to Earshot or anyone else. &ldquo;Clear data&rdquo;
          removes them, as does clearing your browser&apos;s site data.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="caps text-sm text-accent-bright">Connecting Spotify</h2>
        <p>
          If you connect Spotify, Earshot asks only for read access to your top artists, top tracks and recently
          played tracks. Your login tokens are kept in secure, http-only cookies in your browser and used only to
          fetch those lists when you open the page. Nothing is stored on a server. &ldquo;Disconnect&rdquo; deletes
          the cookies, and you can revoke access any time under Apps in your Spotify account settings.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="caps text-sm text-accent-bright">Everything else</h2>
        <p>No accounts, no analytics, no ads, no tracking cookies.</p>
      </section>
    </article>
  );
}
