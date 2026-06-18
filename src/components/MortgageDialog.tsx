"use client";

import { useEffect, useRef, useState } from "react";
import {
  MORTGAGE_TRACKS,
  emptyMortgageDraft,
  type Apartment,
  type MortgageDraft,
  type MortgageOffer,
} from "@/lib/types";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";

// Create or edit a mortgage offer. Offers can optionally be linked to an
// apartment so a financing picture has a concrete price behind it.
export function MortgageDialog({
  open,
  initial,
  apartments,
  onClose,
  onSave,
}: {
  open: boolean;
  initial: MortgageOffer | null;
  apartments: Apartment[];
  onClose: () => void;
  onSave: (draft: MortgageDraft) => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [draft, setDraft] = useState<MortgageDraft>(emptyMortgageDraft());
  useBodyScrollLock(open);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

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
      setDraft(emptyMortgageDraft());
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [open, initial]);

  function set<K extends keyof MortgageDraft>(key: K, value: MortgageDraft[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  function num(value: string): number | null {
    if (value.trim() === "") return null;
    const n = Number(value);
    return Number.isNaN(n) ? null : n;
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const label = draft.label.trim() || draft.lender.trim() || "הצעה";
    onSave({ ...draft, label });
  }

  return (
    <dialog ref={ref} className="dialog" onClose={onClose} aria-label="פרטי הצעת משכנתא">
      <form method="dialog" className="dialog-form" onSubmit={submit}>
        <header className="dialog-head">
          <h2>{initial ? "עריכת הצעה" : "הוספת הצעת משכנתא"}</h2>
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
          <div className="field">
            <label htmlFor="m-label">שם ההצעה</label>
            <input
              id="m-label"
              value={draft.label}
              onChange={(e) => set("label", e.target.value)}
              placeholder='למשל: "מסלול פריים, בנק הפועלים"'
              autoFocus
            />
          </div>

          <div className="field">
            <label htmlFor="m-lender">בנק / גוף מלווה</label>
            <input
              id="m-lender"
              value={draft.lender}
              onChange={(e) => set("lender", e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="m-principal">סכום ההלוואה (₪)</label>
            <input
              id="m-principal"
              type="number"
              inputMode="numeric"
              min="0"
              value={draft.principal ?? ""}
              onChange={(e) => set("principal", num(e.target.value))}
            />
          </div>

          <div className="field">
            <label htmlFor="m-rate">ריבית שנתית (%)</label>
            <input
              id="m-rate"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={draft.annualRate ?? ""}
              onChange={(e) => set("annualRate", num(e.target.value))}
            />
          </div>

          <div className="field">
            <label htmlFor="m-years">תקופה (שנים)</label>
            <input
              id="m-years"
              type="number"
              inputMode="numeric"
              min="1"
              max="40"
              value={draft.years ?? ""}
              onChange={(e) => set("years", num(e.target.value))}
            />
          </div>

          <div className="field">
            <label htmlFor="m-track">מסלול</label>
            <select
              id="m-track"
              value={draft.track}
              onChange={(e) => set("track", e.target.value)}
            >
              {MORTGAGE_TRACKS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="field span-2">
            <label htmlFor="m-apt">דירה מקושרת (אופציונלי)</label>
            <select
              id="m-apt"
              value={draft.linkedApartmentId ?? ""}
              onChange={(e) => set("linkedApartmentId", e.target.value || null)}
            >
              <option value="">ללא</option>
              {apartments.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nickname}
                </option>
              ))}
            </select>
          </div>

          <div className="field span-2">
            <label htmlFor="m-notes">הערות</label>
            <textarea
              id="m-notes"
              rows={2}
              value={draft.notes}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="תנאים, עמלות, נקודות להשוואה..."
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
