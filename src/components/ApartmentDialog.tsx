"use client";

import { useEffect, useRef, useState } from "react";
import {
  CONDITIONS,
  CONDITION_LABELS,
  STATUSES,
  STATUS_LABELS,
  emptyDraft,
  type Apartment,
  type ApartmentDraft,
} from "@/lib/types";
import { Stars } from "./Stars";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";

// Native <dialog> modal for creating or editing an apartment. Receives the
// apartment to edit (or null to create), and reports the saved draft up.
export function ApartmentDialog({
  open,
  initial,
  onClose,
  onSave,
}: {
  open: boolean;
  initial: Apartment | null;
  onClose: () => void;
  onSave: (draft: ApartmentDraft) => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [draft, setDraft] = useState<ApartmentDraft>(emptyDraft());
  useBodyScrollLock(open);

  // Sync the native dialog open state with the React prop.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  // Reset the form to match the edit target whenever the dialog opens. This is
  // a deliberate "sync local form state to props on open" effect, not a render
  // loop, so the set-state-in-effect rule is relaxed for the body.
  useEffect(() => {
    if (!open) return;
    /* eslint-disable react-hooks/set-state-in-effect */
    if (initial) {
      const { id, createdAt, updatedAt, ...rest } = initial;
      void id;
      void createdAt;
      void updatedAt;
      setDraft(rest);
    } else {
      setDraft(emptyDraft());
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [open, initial]);

  function set<K extends keyof ApartmentDraft>(key: K, value: ApartmentDraft[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  // Parse a numeric input: empty string becomes null, not 0.
  function num(value: string): number | null {
    if (value.trim() === "") return null;
    const n = Number(value);
    return Number.isNaN(n) ? null : n;
  }

  // Textarea <-> string[] for the pros/cons lists (one item per line).
  function toLines(value: string): string[] {
    return value
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const nickname = draft.nickname.trim() || draft.address.trim() || "דירה ללא שם";
    onSave({ ...draft, nickname });
  }

  return (
    <dialog ref={ref} className="dialog" onClose={onClose} aria-label="פרטי דירה">
      <form method="dialog" className="dialog-form" onSubmit={submit}>
        <header className="dialog-head">
          <h2>{initial ? "עריכת דירה" : "הוספת דירה"}</h2>
          <button
            type="button"
            className="btn btn-ghost icon-btn"
            onClick={onClose}
            aria-label="סגירה"
          >
            ✕
          </button>
        </header>

        <div className="form-grid">
          <div className="field span-2">
            <label htmlFor="f-nickname">כינוי</label>
            <input
              id="f-nickname"
              value={draft.nickname}
              onChange={(e) => set("nickname", e.target.value)}
              placeholder='למשל: "הדירה עם המרפסת"'
              autoFocus
            />
          </div>

          <div className="field">
            <label htmlFor="f-city">עיר / שכונה</label>
            <input
              id="f-city"
              value={draft.city}
              onChange={(e) => set("city", e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="f-address">כתובת</label>
            <input
              id="f-address"
              value={draft.address}
              onChange={(e) => set("address", e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="f-price">מחיר מבוקש (₪)</label>
            <input
              id="f-price"
              type="number"
              inputMode="numeric"
              min="0"
              value={draft.price ?? ""}
              onChange={(e) => set("price", num(e.target.value))}
            />
          </div>

          <div className="field">
            <label htmlFor="f-rooms">חדרים</label>
            <input
              id="f-rooms"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={draft.rooms ?? ""}
              onChange={(e) => set("rooms", num(e.target.value))}
            />
          </div>

          <div className="field">
            <label htmlFor="f-area">שטח (מ״ר)</label>
            <input
              id="f-area"
              type="number"
              inputMode="numeric"
              min="0"
              value={draft.area ?? ""}
              onChange={(e) => set("area", num(e.target.value))}
            />
          </div>

          <div className="field">
            <label htmlFor="f-floor">קומה</label>
            <input
              id="f-floor"
              value={draft.floor}
              onChange={(e) => set("floor", e.target.value)}
              placeholder="קרקע, 3, גג..."
            />
          </div>

          <div className="field">
            <label htmlFor="f-year">שנת בנייה</label>
            <input
              id="f-year"
              type="number"
              inputMode="numeric"
              min="1900"
              max="2100"
              value={draft.yearBuilt ?? ""}
              onChange={(e) => set("yearBuilt", num(e.target.value))}
              placeholder="למשל: 2015"
            />
          </div>

          <div className="field">
            <label htmlFor="f-condition">מצב</label>
            <select
              id="f-condition"
              value={draft.condition}
              onChange={(e) =>
                set("condition", e.target.value as ApartmentDraft["condition"])
              }
            >
              {CONDITIONS.map((c) => (
                <option key={c || "none"} value={c}>
                  {CONDITION_LABELS[c]}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="f-parking">חניות</label>
            <input
              id="f-parking"
              type="number"
              inputMode="numeric"
              min="0"
              value={draft.parking ?? ""}
              onChange={(e) => set("parking", num(e.target.value))}
            />
          </div>

          <div className="field">
            <label htmlFor="f-status">סטטוס</label>
            <select
              id="f-status"
              value={draft.status}
              onChange={(e) => set("status", e.target.value as ApartmentDraft["status"])}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </div>

          <fieldset className="field span-2 checks">
            <legend className="field-label">תוספות</legend>
            <label className="check">
              <input
                type="checkbox"
                checked={draft.elevator}
                onChange={(e) => set("elevator", e.target.checked)}
              />
              מעלית
            </label>
            <label className="check">
              <input
                type="checkbox"
                checked={draft.balcony}
                onChange={(e) => set("balcony", e.target.checked)}
              />
              מרפסת
            </label>
            <label className="check">
              <input
                type="checkbox"
                checked={draft.saferoom}
                onChange={(e) => set("saferoom", e.target.checked)}
              />
              ממ״ד
            </label>
          </fieldset>

          <div className="field">
            <label htmlFor="f-arnona">ארנונה לחודש (₪)</label>
            <input
              id="f-arnona"
              type="number"
              inputMode="numeric"
              min="0"
              value={draft.arnona ?? ""}
              onChange={(e) => set("arnona", num(e.target.value))}
            />
          </div>

          <div className="field">
            <label htmlFor="f-vaad">ועד בית לחודש (₪)</label>
            <input
              id="f-vaad"
              type="number"
              inputMode="numeric"
              min="0"
              value={draft.vaad ?? ""}
              onChange={(e) => set("vaad", num(e.target.value))}
            />
          </div>

          <div className="field">
            <label htmlFor="f-visit">תאריך ביקור</label>
            <input
              id="f-visit"
              type="date"
              value={draft.visitDate}
              onChange={(e) => set("visitDate", e.target.value)}
            />
          </div>

          <div className="field">
            <span className="field-label">דירוג</span>
            <Stars value={draft.rating} onChange={(n) => set("rating", n)} />
          </div>

          <div className="field">
            <label htmlFor="f-contact">איש קשר</label>
            <input
              id="f-contact"
              value={draft.contact}
              onChange={(e) => set("contact", e.target.value)}
              placeholder="טלפון / מתווך"
            />
          </div>

          <div className="field">
            <label htmlFor="f-url">קישור למודעה</label>
            <input
              id="f-url"
              type="url"
              value={draft.listingUrl}
              onChange={(e) => set("listingUrl", e.target.value)}
              placeholder="https://"
            />
          </div>

          <div className="field">
            <label htmlFor="f-pros">יתרונות (שורה לכל פריט)</label>
            <textarea
              id="f-pros"
              rows={3}
              value={draft.pros.join("\n")}
              onChange={(e) => set("pros", toLines(e.target.value))}
              placeholder={"מואר\nשקט\nקרוב לתחבורה"}
            />
          </div>

          <div className="field">
            <label htmlFor="f-cons">חסרונות (שורה לכל פריט)</label>
            <textarea
              id="f-cons"
              rows={3}
              value={draft.cons.join("\n")}
              onChange={(e) => set("cons", toLines(e.target.value))}
              placeholder={"קומה גבוהה בלי מעלית\nצריך שיפוץ"}
            />
          </div>

          <div className="field span-2">
            <label htmlFor="f-notes">הערות</label>
            <textarea
              id="f-notes"
              rows={3}
              value={draft.notes}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="רושם כללי, נקודות לבדיקה..."
            />
          </div>
        </div>

        <footer className="dialog-foot">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            ביטול
          </button>
          <button type="submit" className="btn">
            שמירה
          </button>
        </footer>
      </form>
    </dialog>
  );
}
