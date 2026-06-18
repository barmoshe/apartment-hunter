"use client";

import { useEffect, useRef, useState } from "react";
import {
  CONDITIONS,
  CONDITION_LABELS,
  FURNISHED,
  FURNISHED_LABELS,
  RENTAL_STATUSES,
  RENTAL_STATUS_LABELS,
  emptyRentalDraft,
  type Rental,
  type RentalDraft,
  type Settings,
} from "@/lib/types";
import { isDepositOverCap } from "@/lib/rentalCost";
import { Stars } from "./Stars";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";

// Native <dialog> modal for creating or editing a rental. The sibling of
// ApartmentDialog: same chrome and helpers, swapped to the rental field set
// (monthly rent, deposit, lease shape) with settings-driven prefill on new.
export function RentalDialog({
  open,
  initial,
  settings,
  onClose,
  onSave,
}: {
  open: boolean;
  initial: Rental | null;
  settings: Settings;
  onClose: () => void;
  onSave: (draft: RentalDraft) => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [draft, setDraft] = useState<RentalDraft>(emptyRentalDraft());
  useBodyScrollLock(open);

  // Sync the native dialog open state with the React prop.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  // Reset the form when the dialog opens: to the edit target, or to a fresh
  // draft prefilled from the rent-settings defaults. Deliberate sync-on-open,
  // not a render loop, so the set-state-in-effect rule is relaxed here.
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
      setDraft({
        ...emptyRentalDraft(),
        arnona: settings.rent.defaultArnona,
        vaad: settings.rent.defaultVaad,
        utilities: settings.rent.defaultUtilities,
        leaseMonths: settings.rent.defaultLeaseMonths,
      });
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [open, initial, settings]);

  function set<K extends keyof RentalDraft>(key: K, value: RentalDraft[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  // Parse a numeric input: empty string becomes null, not 0.
  function num(value: string): number | null {
    if (value.trim() === "") return null;
    const n = Number(value);
    return Number.isNaN(n) ? null : n;
  }

  // Textarea <-> string[] for the pros/cons/appliances lists (one per line).
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

  const depositWarn = isDepositOverCap(draft);

  return (
    <dialog ref={ref} className="dialog" onClose={onClose} aria-label="פרטי דירה להשכרה">
      <form method="dialog" className="dialog-form" onSubmit={submit}>
        <header className="dialog-head">
          <h2>{initial ? "עריכת דירה להשכרה" : "הוספת דירה להשכרה"}</h2>
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
            <label htmlFor="r-nickname">כינוי</label>
            <input
              id="r-nickname"
              value={draft.nickname}
              onChange={(e) => set("nickname", e.target.value)}
              placeholder='למשל: "הדירה ליד הפארק"'
              autoFocus
            />
          </div>

          <div className="field">
            <label htmlFor="r-city">עיר / שכונה</label>
            <input
              id="r-city"
              value={draft.city}
              onChange={(e) => set("city", e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="r-address">כתובת</label>
            <input
              id="r-address"
              value={draft.address}
              onChange={(e) => set("address", e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="r-rent">שכר דירה חודשי (₪)</label>
            <input
              id="r-rent"
              type="number"
              inputMode="numeric"
              min="0"
              value={draft.rent ?? ""}
              onChange={(e) => set("rent", num(e.target.value))}
            />
          </div>

          <div className="field">
            <label htmlFor="r-rooms">חדרים</label>
            <input
              id="r-rooms"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={draft.rooms ?? ""}
              onChange={(e) => set("rooms", num(e.target.value))}
            />
          </div>

          <div className="field">
            <label htmlFor="r-area">שטח (מ״ר)</label>
            <input
              id="r-area"
              type="number"
              inputMode="numeric"
              min="0"
              value={draft.area ?? ""}
              onChange={(e) => set("area", num(e.target.value))}
            />
          </div>

          <div className="field">
            <label htmlFor="r-floor">קומה</label>
            <input
              id="r-floor"
              value={draft.floor}
              onChange={(e) => set("floor", e.target.value)}
              placeholder="קרקע, 3, גג..."
            />
          </div>

          <div className="field">
            <label htmlFor="r-condition">מצב</label>
            <select
              id="r-condition"
              value={draft.condition}
              onChange={(e) =>
                set("condition", e.target.value as RentalDraft["condition"])
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
            <label htmlFor="r-parking">חניות</label>
            <input
              id="r-parking"
              type="number"
              inputMode="numeric"
              min="0"
              value={draft.parking ?? ""}
              onChange={(e) => set("parking", num(e.target.value))}
            />
          </div>

          <div className="field">
            <label htmlFor="r-status">סטטוס</label>
            <select
              id="r-status"
              value={draft.status}
              onChange={(e) => set("status", e.target.value as RentalDraft["status"])}
            >
              {RENTAL_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {RENTAL_STATUS_LABELS[s]}
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
            <label className="check">
              <input
                type="checkbox"
                checked={draft.petsAllowed}
                onChange={(e) => set("petsAllowed", e.target.checked)}
              />
              מותר בעלי חיים
            </label>
          </fieldset>

          <div className="field">
            <label htmlFor="r-arnona">ארנונה לחודש (₪)</label>
            <input
              id="r-arnona"
              type="number"
              inputMode="numeric"
              min="0"
              value={draft.arnona ?? ""}
              onChange={(e) => set("arnona", num(e.target.value))}
            />
          </div>

          <div className="field">
            <label htmlFor="r-vaad">ועד בית לחודש (₪)</label>
            <input
              id="r-vaad"
              type="number"
              inputMode="numeric"
              min="0"
              value={draft.vaad ?? ""}
              onChange={(e) => set("vaad", num(e.target.value))}
            />
          </div>

          <div className="field">
            <label htmlFor="r-utilities">חשבונות לחודש (₪)</label>
            <input
              id="r-utilities"
              type="number"
              inputMode="numeric"
              min="0"
              value={draft.utilities ?? ""}
              onChange={(e) => set("utilities", num(e.target.value))}
              placeholder="מים, חשמל, גז, אינטרנט"
            />
          </div>

          <div className="field">
            <label htmlFor="r-broker">דמי תיווך (חד-פעמי, ₪)</label>
            <input
              id="r-broker"
              type="number"
              inputMode="numeric"
              min="0"
              value={draft.brokerFee ?? ""}
              onChange={(e) => set("brokerFee", num(e.target.value))}
              placeholder="לרוב 0 לפי חוק שכירות הוגנת"
            />
          </div>

          <div className="field">
            <label htmlFor="r-deposit">פיקדון / בטוחה (₪)</label>
            <input
              id="r-deposit"
              type="number"
              inputMode="numeric"
              min="0"
              value={draft.deposit ?? ""}
              onChange={(e) => set("deposit", num(e.target.value))}
              aria-describedby={depositWarn ? "r-deposit-warn" : undefined}
            />
            {depositWarn ? (
              <span id="r-deposit-warn" className="field-hint warn" role="alert">
                הפיקדון עולה על 3 חודשי שכירות (תקרת חוק שכירות הוגנת).
              </span>
            ) : null}
          </div>

          <div className="field">
            <label htmlFor="r-lease">תקופת שכירות (חודשים)</label>
            <input
              id="r-lease"
              type="number"
              inputMode="numeric"
              min="0"
              value={draft.leaseMonths ?? ""}
              onChange={(e) => set("leaseMonths", num(e.target.value))}
            />
          </div>

          <div className="field">
            <label htmlFor="r-movein">תאריך כניסה</label>
            <input
              id="r-movein"
              type="date"
              value={draft.moveInDate}
              onChange={(e) => set("moveInDate", e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="r-furnished">ריהוט</label>
            <select
              id="r-furnished"
              value={draft.furnished}
              onChange={(e) => set("furnished", e.target.value as RentalDraft["furnished"])}
            >
              {FURNISHED.map((f) => (
                <option key={f} value={f}>
                  {FURNISHED_LABELS[f]}
                </option>
              ))}
            </select>
          </div>

          <fieldset className="field span-2 checks">
            <legend className="field-label">תנאי שכירות</legend>
            <label className="check">
              <input
                type="checkbox"
                checked={draft.hasExtensionOption}
                onChange={(e) => set("hasExtensionOption", e.target.checked)}
              />
              אופציה להארכה
            </label>
            <label className="check">
              <input
                type="checkbox"
                checked={draft.cpiLinked}
                onChange={(e) => set("cpiLinked", e.target.checked)}
              />
              צמוד למדד
            </label>
          </fieldset>

          <div className="field span-2">
            <label htmlFor="r-appliances">מוצרי חשמל כלולים (שורה לכל פריט)</label>
            <textarea
              id="r-appliances"
              rows={3}
              value={draft.appliances.join("\n")}
              onChange={(e) => set("appliances", toLines(e.target.value))}
              placeholder={"מזגן\nמקרר\nמכונת כביסה"}
            />
          </div>

          <div className="field">
            <span className="field-label">דירוג</span>
            <Stars value={draft.rating} onChange={(n) => set("rating", n)} />
          </div>

          <div className="field">
            <label htmlFor="r-contact">איש קשר</label>
            <input
              id="r-contact"
              value={draft.contact}
              onChange={(e) => set("contact", e.target.value)}
              placeholder="טלפון / מתווך / בעלים"
            />
          </div>

          <div className="field">
            <label htmlFor="r-url">קישור למודעה</label>
            <input
              id="r-url"
              type="url"
              value={draft.listingUrl}
              onChange={(e) => set("listingUrl", e.target.value)}
              placeholder="https://"
            />
          </div>

          <div className="field">
            <label htmlFor="r-pros">יתרונות (שורה לכל פריט)</label>
            <textarea
              id="r-pros"
              rows={3}
              value={draft.pros.join("\n")}
              onChange={(e) => set("pros", toLines(e.target.value))}
              placeholder={"מואר\nקרוב לעבודה"}
            />
          </div>

          <div className="field">
            <label htmlFor="r-cons">חסרונות (שורה לכל פריט)</label>
            <textarea
              id="r-cons"
              rows={3}
              value={draft.cons.join("\n")}
              onChange={(e) => set("cons", toLines(e.target.value))}
              placeholder={"רחוב רועש\nאין מעלית"}
            />
          </div>

          <div className="field span-2">
            <label htmlFor="r-notes">הערות</label>
            <textarea
              id="r-notes"
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
