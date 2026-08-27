import type { Metadata, Viewport } from "next";
import { Source_Serif_4 } from "next/font/google";
import "./globals.css";

/**
 * Body and display face.
 *
 * Georgia was fine on paper and muddy at 15px on a dark ground — thin strokes,
 * small x-height, tight apertures. Source Serif 4 was drawn for screen reading:
 * bigger x-height, open apertures and sturdier stems, so it holds up in the
 * night edition without losing the newsprint register the game is built on.
 *
 * next/font self-hosts the files at build time, so there is no request to a
 * font CDN at runtime.
 */
const serif = Source_Serif_4({
  // Spanish accents live in `latin`; `latin-ext` is Central/Eastern European
  // and would double the payload for glyphs neither edition renders.
  //
  // No `weight` list on purpose: Source Serif 4 is a variable font, so leaving
  // it off ships two files (roman and italic) that cover every weight the UI
  // uses — 400 body, 600 semibold, 700 figures, 900 display — instead of six
  // static cuts that between them covered fewer.
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
  fallback: ["ui-serif", "Georgia", "Times New Roman", "serif"],
});

export const metadata: Metadata = {
  title: "Ufologistics",
  description:
    "You run Earth's secret harvesting operation. Wire routes, move cargo, and keep the papers from working out what you are.",
};

export const viewport: Viewport = {
  themeColor: "#0a0912",
  // The map handles its own pinch-zoom, so the page must not fight it.
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

// Applied before first paint so a saved edition never flashes the wrong one.
const THEME_BOOT = `try{var t=localStorage.getItem("bt-theme");document.documentElement.dataset.theme=t==="day"?"day":"night"}catch(e){document.documentElement.dataset.theme="night"}`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // suppressHydrationWarning: THEME_BOOT rewrites data-theme before React
  // hydrates, which is the whole point of it — React must not fight that.
  return (
    <html lang="en" data-theme="night" className={serif.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT }} />
      </head>
      <body className="min-h-svh antialiased">{children}</body>
    </html>
  );
}
