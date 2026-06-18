"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ThemeToggle } from "./ThemeToggle";
import { SettingsDialog } from "./SettingsDialog";
import { HouseSprite, KeySprite } from "./art";
import { OPEN_TUTORIAL_EVENT } from "./TutorialWizard";
import { useStore } from "@/store/store";
import { exportJson, parseImport } from "@/lib/storage";
import {
  TRACKS,
  TRACK_LABELS,
  saveActiveTrack,
  trackFromPathname,
  trackHome,
  type Track,
} from "@/lib/track";

// Sub-tabs shown within each track. The mortgage tab lives under Buy only, so
// it never clutters the Rent track.
const TRACK_NAV: Record<Track, { href: string; label: string }[]> = {
  buy: [
    { href: "/buy", label: "דירות" },
    { href: "/buy/mortgage", label: "משכנתאות" },
  ],
  rent: [{ href: "/rent", label: "דירות להשכרה" }],
};

// The sticky top bar shared by every route: brand, the Buy/Rent track switch,
// per-track sub-nav, backup/restore of the whole dataset, settings, and theme.
export function AppBar() {
  const pathname = usePathname();
  const track = trackFromPathname(pathname);
  const { apartments, mortgages, rentals, settings } = useStore();
  const fileInput = useRef<HTMLInputElement>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Remember the active track so the root route reopens where you left off.
  useEffect(() => {
    saveActiveTrack(track);
  }, [track]);

  function handleExport() {
    const data = exportJson(
      apartments.items,
      mortgages.items,
      rentals.items,
      settings.settings,
    );
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dira-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = parseImport(String(reader.result));
      if (!result) {
        window.alert("קובץ הגיבוי אינו תקין.");
        return;
      }
      const ok = window.confirm(
        `הקובץ מכיל ${result.apartments.length} דירות לקנייה, ${result.rentals.length} ` +
          `דירות להשכרה ו-${result.mortgages.length} הצעות משכנתא. ` +
          "להחליף את כל הנתונים הקיימים?",
      );
      if (ok) {
        apartments.replaceAll(result.apartments);
        mortgages.replaceAll(result.mortgages);
        rentals.replaceAll(result.rentals);
        if (result.settings) settings.replace(result.settings);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  return (
    <header className="app-bar">
      <div className="app-bar-inner container">
        <Link href={trackHome(track)} className="brand" aria-label="דירה, דף הבית">
          <span className="brand-mark" aria-hidden="true">
            <HouseSprite cell={4} />
          </span>
          <div>
            <h1>דירה</h1>
            <p className="brand-sub">ניהול חיפוש נדל״ן</p>
          </div>
        </Link>

        <div className="track-switch" role="group" aria-label="מצב: קנייה או שכירות">
          {TRACKS.map((t) => {
            const active = t === track;
            return (
              <Link
                key={t}
                href={trackHome(t)}
                className={active ? "seg active" : "seg"}
                aria-current={active ? "page" : undefined}
              >
                <span className="seg-icon" aria-hidden="true">
                  {t === "buy" ? <HouseSprite cell={3} /> : <KeySprite cell={3} />}
                </span>
                {TRACK_LABELS[t]}
              </Link>
            );
          })}
        </div>

        <nav className="top-nav" aria-label="ניווט ראשי">
          {TRACK_NAV[track].map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={active ? "nav-link active" : "nav-link"}
                aria-current={active ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="app-bar-actions">
          <button
            type="button"
            className="btn btn-ghost icon-btn"
            onClick={handleExport}
            aria-label="גיבוי הנתונים"
            title="גיבוי"
          >
            ⤓
          </button>
          <button
            type="button"
            className="btn btn-ghost icon-btn"
            onClick={() => fileInput.current?.click()}
            aria-label="שחזור מגיבוי"
            title="שחזור"
          >
            ⤒
          </button>
          <input
            ref={fileInput}
            type="file"
            accept="application/json"
            className="visually-hidden"
            onChange={handleImportFile}
          />
          <button
            type="button"
            className="btn btn-ghost icon-btn"
            onClick={() => window.dispatchEvent(new Event(OPEN_TUTORIAL_EVENT))}
            aria-label="מדריך"
            title="מדריך"
          >
            ?
          </button>
          <button
            type="button"
            className="btn btn-ghost icon-btn"
            onClick={() => setSettingsOpen(true)}
            aria-label="הגדרות"
            title="הגדרות"
          >
            ⚙
          </button>
          <ThemeToggle />
        </div>
      </div>

      <SettingsDialog
        open={settingsOpen}
        initial={settings.settings}
        onClose={() => setSettingsOpen(false)}
        onSave={(next) => {
          settings.replace(next);
          setSettingsOpen(false);
        }}
      />
    </header>
  );
}
