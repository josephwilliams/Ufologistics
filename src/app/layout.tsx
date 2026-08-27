import type { Metadata, Viewport } from "next";
import "./globals.css";

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
    <html lang="en" data-theme="night" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT }} />
      </head>
      <body className="min-h-svh antialiased">{children}</body>
    </html>
  );
}
