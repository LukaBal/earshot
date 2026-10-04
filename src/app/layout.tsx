import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Source_Serif_4 } from "next/font/google";
import { Footer } from "@/components/Footer";
import { Sidebar } from "@/components/Sidebar";
import "./globals.css";

const display = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600"],
});

const body = Source_Serif_4({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: "Earshot", template: "%s · Earshot" },
  description: "An archive of everything you've played on Spotify, built from your own data export.",
};

export const viewport: Viewport = {
  themeColor: "#05080a",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} antialiased`}>
      <body className="min-h-dvh">
        <a
          href="#content"
          className="caps sr-only z-[60] bg-panel-solid px-4 py-2 text-xs text-foreground focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Skip to content
        </a>
        <Sidebar />
        <div className="flex min-h-dvh flex-col lg:pl-64">
          <main id="content" className="mx-auto w-full max-w-5xl flex-1 px-5 pb-16 pt-10 sm:px-8 lg:pt-16">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
