"use client";

import { useMemo } from "react";
import {
  CONDITION_LABELS,
  pricePerMeter,
  type Apartment,
  type Settings,
} from "@/lib/types";
import { allInCost } from "@/lib/finance";
import {
  formatNumber,
  formatPerMeter,
  formatPrice,
} from "@/lib/format";
import { Stars } from "./Stars";

// Side-by-side comparison of the selected apartments. Metrics are rows,
// apartments are columns. The best value in each "lower is better" numeric row
// is highlighted so the winner on price, ₪/m² and all-in cost pops out.
export function CompareView({
  items,
  settings,
  onClear,
}: {
  items: Apartment[];
  settings: Settings;
  onClear: () => void;
}) {
  const cols = useMemo(
    () =>
      items.map((a) => ({
        a,
        ppm: pricePerMeter(a),
        cost: allInCost(a.price, settings),
      })),
    [items, settings],
  );

  // Lowest non-null value across columns, for the "best" highlight.
  function bestOf(values: (number | null)[]): number | null {
    const nums = values.filter((v): v is number => v != null);
    return nums.length ? Math.min(...nums) : null;
  }

  const bestPrice = bestOf(cols.map((c) => c.a.price));
  const bestPpm = bestOf(cols.map((c) => c.ppm));
  const bestTotal = bestOf(cols.map((c) => c.cost.total));

  const featureText = (a: Apartment) => {
    const f: string[] = [];
    if (a.elevator) f.push("מעלית");
    if (a.balcony) f.push("מרפסת");
    if (a.saferoom) f.push("ממ״ד");
    if (a.parking) f.push(`${a.parking} חניות`);
    return f.length ? f.join(" · ") : "–";
  };

  return (
    <section className="compare card" aria-label="השוואת דירות">
      <div className="compare-head">
        <h2>השוואה ({items.length})</h2>
        <button type="button" className="btn btn-ghost" onClick={onClear}>
          ניקוי הבחירה
        </button>
      </div>

      <div className="table-wrap" tabIndex={0}>
        <table className="grid compare-grid">
          <thead>
            <tr>
              <th className="cell-name">מדד</th>
              {cols.map(({ a }) => (
                <th key={a.id} scope="col">
                  {a.nickname}
                  {a.city ? <small>{a.city}</small> : null}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row" className="cell-name">
                מחיר מבוקש
              </th>
              {cols.map(({ a }) => (
                <td
                  key={a.id}
                  className={a.price != null && a.price === bestPrice ? "num best" : "num"}
                >
                  {formatPrice(a.price)}
                </td>
              ))}
            </tr>
            <tr>
              <th scope="row" className="cell-name">
                ₪ למ״ר
              </th>
              {cols.map(({ a, ppm }) => (
                <td key={a.id} className={ppm != null && ppm === bestPpm ? "num best" : "num"}>
                  {formatPerMeter(ppm)}
                </td>
              ))}
            </tr>
            <tr>
              <th scope="row" className="cell-name">
                מס רכישה
              </th>
              {cols.map(({ a, cost }) => (
                <td key={a.id} className="num">
                  {a.price ? formatPrice(cost.tax) : "–"}
                </td>
              ))}
            </tr>
            <tr>
              <th scope="row" className="cell-name">
                עלויות נלוות
              </th>
              {cols.map(({ a, cost }) => (
                <td key={a.id} className="num">
                  {a.price ? formatPrice(cost.closing.total) : "–"}
                </td>
              ))}
            </tr>
            <tr className="row-total">
              <th scope="row" className="cell-name">
                עלות כוללת
              </th>
              {cols.map(({ a, cost }) => (
                <td
                  key={a.id}
                  className={
                    cost.total != null && cost.total === bestTotal ? "num best" : "num"
                  }
                >
                  {cost.total != null ? formatPrice(cost.total) : "–"}
                </td>
              ))}
            </tr>
            <tr>
              <th scope="row" className="cell-name">
                חדרים
              </th>
              {cols.map(({ a }) => (
                <td key={a.id} className="num">
                  {formatNumber(a.rooms)}
                </td>
              ))}
            </tr>
            <tr>
              <th scope="row" className="cell-name">
                שטח
              </th>
              {cols.map(({ a }) => (
                <td key={a.id} className="num">
                  {a.area ? `${formatNumber(a.area)} מ״ר` : "–"}
                </td>
              ))}
            </tr>
            <tr>
              <th scope="row" className="cell-name">
                קומה
              </th>
              {cols.map(({ a }) => (
                <td key={a.id}>{a.floor || "–"}</td>
              ))}
            </tr>
            <tr>
              <th scope="row" className="cell-name">
                שנת בנייה
              </th>
              {cols.map(({ a }) => (
                <td key={a.id} className="num">
                  {a.yearBuilt ?? "–"}
                </td>
              ))}
            </tr>
            <tr>
              <th scope="row" className="cell-name">
                מצב
              </th>
              {cols.map(({ a }) => (
                <td key={a.id}>{CONDITION_LABELS[a.condition] || "–"}</td>
              ))}
            </tr>
            <tr>
              <th scope="row" className="cell-name">
                תוספות
              </th>
              {cols.map(({ a }) => (
                <td key={a.id}>{featureText(a)}</td>
              ))}
            </tr>
            <tr>
              <th scope="row" className="cell-name">
                ארנונה + ועד (לחודש)
              </th>
              {cols.map(({ a }) => {
                const monthly = (a.arnona ?? 0) + (a.vaad ?? 0);
                return (
                  <td key={a.id} className="num">
                    {monthly ? formatPrice(monthly) : "–"}
                  </td>
                );
              })}
            </tr>
            <tr>
              <th scope="row" className="cell-name">
                דירוג
              </th>
              {cols.map(({ a }) => (
                <td key={a.id}>
                  <Stars value={a.rating} />
                </td>
              ))}
            </tr>
            <tr>
              <th scope="row" className="cell-name">
                יתרונות
              </th>
              {cols.map(({ a }) => (
                <td key={a.id} className="cell-list">
                  {a.pros.length ? (
                    <ul>
                      {a.pros.map((p, i) => (
                        <li key={i}>{p}</li>
                      ))}
                    </ul>
                  ) : (
                    "–"
                  )}
                </td>
              ))}
            </tr>
            <tr>
              <th scope="row" className="cell-name">
                חסרונות
              </th>
              {cols.map(({ a }) => (
                <td key={a.id} className="cell-list">
                  {a.cons.length ? (
                    <ul>
                      {a.cons.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  ) : (
                    "–"
                  )}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
