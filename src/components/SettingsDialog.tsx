"use client";

import { useEffect, useRef, useState } from "react";
import {
  BUYER_TYPES,
  BUYER_TYPE_LABELS,
  type Settings,
} from "@/lib/types";
import { MAX_LTV } from "@/lib/finance";
import { formatPercent } from "@/lib/format";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";

// Settings drive the whole cost model: buyer type (tax brackets + max
// financing), available equity, and the closing-cost assumptions.
export function SettingsDialog({
  open,
  initial,
  onClose,
  onSave,
}: {
  open: boolean;
  initial: Settings;
  onClose: () => void;
  onSave: (next: Settings) => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [draft, setDraft] = useState<Settings>(initial);
  useBodyScrollLock(open);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    setDraft(initial);
  }, [open, initial]);

  function set<K extends keyof Settings>(key: K, value: Settings[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  // Nested setter for the rent-settings block.
  function setRent<K extends keyof Settings["rent"]>(key: K, value: Settings["rent"][K]) {
    setDraft((d) => ({ ...d, rent: { ...d.rent, [key]: value } }));
  }

  function num(value: string): number | null {
    if (value.trim() === "") return null;
    const n = Number(value);
    return Number.isNaN(n) ? null : n;
  }

  function numOr0(value: string): number {
    return num(value) ?? 0;
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    onSave(draft);
  }

  return (
    <dialog ref={ref} className="dialog" onClose={onClose} aria-label="הגדרות">
      <form method="dialog" className="dialog-form" onSubmit={submit}>
        <header className="dialog-head">
          <h2>הגדרות והנחות חישוב</h2>
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
            <label htmlFor="s-buyer">סוג רוכש</label>
            <select
              id="s-buyer"
              value={draft.buyerType}
              onChange={(e) => set("buyerType", e.target.value as Settings["buyerType"])}
            >
              {BUYER_TYPES.map((t) => (
                <option key={t} value={t}>
                  {BUYER_TYPE_LABELS[t]} · מימון עד {formatPercent(MAX_LTV[t])}
                </option>
              ))}
            </select>
            <span className="field-hint muted">
              קובע את מדרגות מס הרכישה ואת שיעור המימון המרבי מבנק ישראל.
            </span>
          </div>

          <div className="field span-2">
            <label htmlFor="s-equity">הון עצמי זמין (₪)</label>
            <input
              id="s-equity"
              type="number"
              inputMode="numeric"
              min="0"
              value={draft.equity ?? ""}
              onChange={(e) => set("equity", num(e.target.value))}
              placeholder="כמה מזומן יש לרכישה"
            />
          </div>

          <div className="field">
            <label htmlFor="s-lawyer">שכ״ט עו״ד (%)</label>
            <input
              id="s-lawyer"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.1"
              value={draft.lawyerPct}
              onChange={(e) => set("lawyerPct", numOr0(e.target.value))}
            />
          </div>

          <div className="field">
            <label htmlFor="s-broker">דמי תיווך (%, כולל מע״מ)</label>
            <input
              id="s-broker"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.1"
              value={draft.brokerPct}
              onChange={(e) => set("brokerPct", numOr0(e.target.value))}
            />
          </div>

          <div className="field">
            <label htmlFor="s-appraisal">שמאי (₪)</label>
            <input
              id="s-appraisal"
              type="number"
              inputMode="numeric"
              min="0"
              value={draft.appraisal}
              onChange={(e) => set("appraisal", numOr0(e.target.value))}
            />
          </div>

          <div className="field">
            <label htmlFor="s-other">עלויות נוספות (₪)</label>
            <input
              id="s-other"
              type="number"
              inputMode="numeric"
              min="0"
              value={draft.otherCosts}
              onChange={(e) => set("otherCosts", numOr0(e.target.value))}
              placeholder="הובלה, ריהוט, תיקונים"
            />
          </div>

          <h3 className="field span-2 form-subhead">שכירות</h3>

          <fieldset className="field span-2 checks">
            <legend className="field-label">חישוב עלות חודשית</legend>
            <label className="check">
              <input
                type="checkbox"
                checked={draft.rent.amortizeOneOffs}
                onChange={(e) => setRent("amortizeOneOffs", e.target.checked)}
              />
              כלול עלויות חד-פעמיות (דמי תיווך) בפריסה על פני תקופת השכירות
            </label>
          </fieldset>

          <div className="field">
            <label htmlFor="s-rent-arnona">ארנונה — ברירת מחדל (₪)</label>
            <input
              id="s-rent-arnona"
              type="number"
              inputMode="numeric"
              min="0"
              value={draft.rent.defaultArnona ?? ""}
              onChange={(e) => setRent("defaultArnona", num(e.target.value))}
            />
          </div>

          <div className="field">
            <label htmlFor="s-rent-vaad">ועד בית — ברירת מחדל (₪)</label>
            <input
              id="s-rent-vaad"
              type="number"
              inputMode="numeric"
              min="0"
              value={draft.rent.defaultVaad ?? ""}
              onChange={(e) => setRent("defaultVaad", num(e.target.value))}
            />
          </div>

          <div className="field">
            <label htmlFor="s-rent-utilities">חשבונות — ברירת מחדל (₪)</label>
            <input
              id="s-rent-utilities"
              type="number"
              inputMode="numeric"
              min="0"
              value={draft.rent.defaultUtilities ?? ""}
              onChange={(e) => setRent("defaultUtilities", num(e.target.value))}
            />
          </div>

          <div className="field">
            <label htmlFor="s-rent-lease">תקופת שכירות — ברירת מחדל (חודשים)</label>
            <input
              id="s-rent-lease"
              type="number"
              inputMode="numeric"
              min="0"
              value={draft.rent.defaultLeaseMonths}
              onChange={(e) => setRent("defaultLeaseMonths", numOr0(e.target.value))}
            />
          </div>

          <span className="field span-2 field-hint muted">
            ברירות המחדל ממלאות אוטומטית דירה חדשה להשכרה, וניתן לשנותן בכל דירה.
          </span>

          <p className="field span-2 disclaimer muted">
            כל החישובים הם הערכה להשוואה בלבד ואינם מהווים ייעוץ מס או ייעוץ
            פיננסי. מדרגות מס הרכישה לפי 2026 (מוקפאות עד 15.1.2028).
          </p>
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
