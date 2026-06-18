"use client";

import { useMemo, useState } from "react";
import {
  BUYER_TYPE_LABELS,
  type Apartment,
  type Settings,
} from "@/lib/types";
import { MAX_LTV, allInCost, financing } from "@/lib/finance";
import { monthlyPayment } from "@/lib/mortgage";
import { formatPercent, formatPrice } from "@/lib/format";

// The financing calculator: pick an apartment (or type a price), and see the
// all-in cost, the Bank-of-Israel financing limits for the buyer type, the
// equity needed, and the monthly payment for the loan at a chosen rate/term.
export function FinancingPanel({
  apartments,
  settings,
}: {
  apartments: Apartment[];
  settings: Settings;
}) {
  const [aptId, setAptId] = useState<string>("");
  const [manualPrice, setManualPrice] = useState<number | null>(null);
  const [rate, setRate] = useState<number>(4.5);
  const [years, setYears] = useState<number>(25);

  const price = useMemo(() => {
    if (aptId) return apartments.find((a) => a.id === aptId)?.price ?? null;
    return manualPrice;
  }, [aptId, manualPrice, apartments]);

  const cost = useMemo(() => allInCost(price, settings), [price, settings]);
  const fin = useMemo(() => financing(price, settings), [price, settings]);

  const monthly = useMemo(() => {
    if (!fin) return null;
    return Math.round(monthlyPayment(fin.loanNeeded, rate, years));
  }, [fin, rate, years]);

  function num(value: string): number | null {
    if (value.trim() === "") return null;
    const n = Number(value);
    return Number.isNaN(n) ? null : n;
  }

  return (
    <section className="card finance-panel" aria-label="מחשבון מימון">
      <h2>מחשבון מימון ועלות כוללת</h2>
      <p className="muted">
        סוג רוכש: <strong>{BUYER_TYPE_LABELS[settings.buyerType]}</strong> · מימון
        עד <strong>{formatPercent(MAX_LTV[settings.buyerType])}</strong>.
        ניתן לשנות בהגדרות (⚙).
      </p>

      <div className="finance-inputs">
        <div className="field">
          <label htmlFor="fin-apt">דירה</label>
          <select
            id="fin-apt"
            value={aptId}
            onChange={(e) => setAptId(e.target.value)}
          >
            <option value="">מחיר ידני</option>
            {apartments.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nickname}
                {a.price ? ` · ${formatPrice(a.price)}` : ""}
              </option>
            ))}
          </select>
        </div>

        {!aptId ? (
          <div className="field">
            <label htmlFor="fin-price">מחיר הדירה (₪)</label>
            <input
              id="fin-price"
              type="number"
              inputMode="numeric"
              min="0"
              value={manualPrice ?? ""}
              onChange={(e) => setManualPrice(num(e.target.value))}
            />
          </div>
        ) : null}

        <div className="field">
          <label htmlFor="fin-rate">ריבית שנתית (%)</label>
          <input
            id="fin-rate"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.1"
            value={rate}
            onChange={(e) => setRate(num(e.target.value) ?? 0)}
          />
        </div>

        <div className="field">
          <label htmlFor="fin-years">תקופה (שנים)</label>
          <input
            id="fin-years"
            type="number"
            inputMode="numeric"
            min="1"
            max="40"
            value={years}
            onChange={(e) => setYears(num(e.target.value) ?? 1)}
          />
        </div>
      </div>

      {price && price > 0 && fin ? (
        <>
          <dl className="finance-grid">
            <div className="fin-row">
              <dt>מחיר מבוקש</dt>
              <dd>{formatPrice(price)}</dd>
            </div>
            <div className="fin-row">
              <dt>מס רכישה</dt>
              <dd>{formatPrice(cost.tax)}</dd>
            </div>
            <div className="fin-row">
              <dt>עלויות נלוות (עו״ד, תיווך, שמאי, נוסף)</dt>
              <dd>{formatPrice(cost.closing.total)}</dd>
            </div>
            <div className="fin-row fin-emph">
              <dt>עלות כוללת</dt>
              <dd>{cost.total != null ? formatPrice(cost.total) : "–"}</dd>
            </div>
            <div className="fin-row">
              <dt>הלוואה מקסימלית ({formatPercent(fin.maxLtv)})</dt>
              <dd>{formatPrice(fin.maxLoan)}</dd>
            </div>
            <div className="fin-row">
              <dt>הון עצמי נדרש (מינימום)</dt>
              <dd>{formatPrice(fin.minEquity)}</dd>
            </div>
            {fin.equity != null ? (
              <>
                <div className="fin-row">
                  <dt>ההון העצמי שלכם</dt>
                  <dd>{formatPrice(fin.equity)}</dd>
                </div>
                <div className="fin-row">
                  <dt>הלוואה נדרשת</dt>
                  <dd>{formatPrice(fin.loanNeeded)}</dd>
                </div>
                <div className="fin-row">
                  <dt>שיעור מימון בפועל</dt>
                  <dd>{formatPercent(fin.actualLtv)}</dd>
                </div>
              </>
            ) : null}
            <div className="fin-row fin-emph">
              <dt>החזר חודשי משוער</dt>
              <dd>{monthly ? formatPrice(monthly) : "–"}</dd>
            </div>
          </dl>

          {fin.equity != null ? (
            fin.feasible ? (
              <p className="callout callout-ok">
                ההון העצמי מספיק. עודף מעל המינימום:{" "}
                <strong>{formatPrice(Math.max(0, fin.equity - fin.minEquity))}</strong>.
              </p>
            ) : (
              <p className="callout callout-warn">
                חסר הון עצמי של <strong>{formatPrice(fin.shortfall)}</strong> כדי
                לעמוד בשיעור המימון המרבי. אפשר לבחור דירה זולה יותר או להגדיל את
                ההון העצמי.
              </p>
            )
          ) : (
            <p className="muted finance-tip">
              הזינו הון עצמי זמין בהגדרות (⚙) כדי לבדוק התאמה לשיעור המימון.
            </p>
          )}

          <p className="disclaimer muted">
            הערכה להשוואה בלבד, אינה ייעוץ. ההחזר מחושב במסלול אחד בריבית קבועה
            (לוח שפיצר); משכנתא בפועל היא תמהיל מסלולים שחלקו צמוד או משתנה.
          </p>
        </>
      ) : (
        <p className="muted pad">בחרו דירה או הזינו מחיר כדי לחשב.</p>
      )}
    </section>
  );
}
