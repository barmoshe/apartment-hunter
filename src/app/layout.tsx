import type { Metadata, Viewport } from "next";
import { Rubik } from "next/font/google";
import "./tokens.css";
import "./base.css";
import "./components.css";
import "./globals.css";
import { DiraProvider } from "@/store/store";
import { AppBar } from "@/components/AppBar";
import { BuilderCredit } from "@/components/BuilderCredit";
import { PixelBackground } from "@/components/PixelBackground";
import { TutorialWizard } from "@/components/TutorialWizard";

// Friendly rounded body (Rubik) — also the fallback that renders all Hebrew.
// The pixel face (Public Pixel) is declared in tokens.css with a unicode-range
// limited to Latin/digits/₪ so Hebrew never uses its rough 8x8 glyphs.
const rubik = Rubik({
  subsets: ["hebrew", "latin"],
  variable: "--font-app",
  display: "swap",
});

export const metadata: Metadata = {
  title: "דירה: ניהול חיפוש נדל״ן",
  description:
    "כלי לניהול חיפוש דירה: ריכוז כל הדירות שראיתם, מחירים, דירוגים, השוואה ועלות כוללת. הכול נשמר מקומית במכשיר.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f0e6cf" },
    { media: "(prefers-color-scheme: dark)", color: "#1b1c22" },
  ],
};

// No-FOUC pre-paint: apply theme + a11y prefs before first paint.
// Storage keys kept in lockstep with the client toggle (bm:theme etc.).
const prePaint = `(function () {
  try {
    var d = document.documentElement;
    var theme = localStorage.getItem("bm:theme") || "auto";
    var dark = theme === "dark" ||
      (theme === "auto" && window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);
    d.classList.toggle("dark", dark);
    var contrast = localStorage.getItem("bm:contrast");
    if (contrast) d.dataset.contrast = contrast;
    var scale = parseFloat(localStorage.getItem("bm:text-scale"));
    if (scale && scale > 0) d.style.setProperty("--text-scale", String(scale));
  } catch (e) {}
})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="he"
      dir="rtl"
      className={rubik.variable}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: prePaint }} />
      </head>
      <body>
        <PixelBackground />
        <a className="skip-link" href="#main">
          דילוג לתוכן
        </a>
        <DiraProvider>
          <AppBar />
          {children}
          <TutorialWizard />
        </DiraProvider>
        <BuilderCredit />
      </body>
    </html>
  );
}
