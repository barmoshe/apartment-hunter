"use client";

import { useMemo } from "react";
import {
  CONDITION_LABELS,
  FURNISHED_LABELS,
  type Rental,
  type Settings,
} from "@/lib/types";
import { isDepositOverCap, monthlyAllIn } from "@/lib/rentalCost";
import { formatDate, formatNumber, formatPrice } from "@/lib/format";
import { Stars } from "./Stars";

// Side-by-side comparison of the selected rentals. The sibling of CompareView:
// metrics are rows, rentals are columns, and the best value in each
// "lower is better" row (rent, monthly all-in) is highlighted.
export function RentalCompare({
  items,
  settings,
  onClear,
}: {
  items: Rental[];
  settings: Settings;
  onClear: () => void;
}) {
  const cols = useMemo(
    () =>
      items.map((r) => ({
        r,
        monthly: monthlyAllIn(r, settings),
      })),
    [items, settings],
  );

  // Lowest non-null value across columns, for the "best" highlight.
  function bestOf(values: (number | null)[]): number | null {
    const nums = values.filter((v): v is number => v != null);
    return nums.length ? Math.min(...nums) : null;
  }

  const bestRent = bestOf(cols.map((c) => c.r.rent));
  const bestMonthly = bestOf(cols.map((c) => c.monthly));

  const featureText = (r: Rental) => {
    const f: string[] = [];
    if (r.elevator) f.push("מעלית");
    if (r.balcony) f.push("מרפסת");
    if (r.saferoom) f.push("ממ״ד");
    if (r.parking) f.push(`${r.parking} חניות`);
    return f.length ? f.join(" · ") : "–";
  };

  return (
    <section className="compare card" aria-label="השוואת דירות להשכרה">
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
              {cols.map(({ r }) => (
                <th key={r.id} scope="col">
                  {r.nickname}
                  {r.city ? <small>{r.city}</small> : null}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row" className="cell-name">
                שכר דירה חודשי
              </th>
              {cols.map(({ r }) => (
                <td
                  key={r.id}
                  className={r.rent != null && r.rent === bestRent ? "num best" : "num"}
                >
                  {formatPrice(r.rent)}
                </td>
              ))}
            </tr>
            <tr className="row-total">
              <th scope="row" className="cell-name">
                עלות חודשית כוללת
              </th>
              {cols.map(({ r, monthly }) => (
                <td
                  key={r.id}
                  className={monthly != null && monthly === bestMonthly ? "num best" : "num"}
                >
                  {monthly != null ? formatPrice(monthly) : "–"}
                </td>
              ))}
            </tr>
            <tr>
              <th scope="row" className="cell-name">
                ארנונה (לחודש)
              </th>
              {cols.map(({ r }) => (
                <td key={r.id} className="num">
                  {r.arnona ? formatPrice(r.arnona) : "–"}
                </td>
              ))}
            </tr>
            <tr>
              <th scope="row" className="cell-name">
                ועד בית (לחודש)
              </th>
              {cols.map(({ r }) => (
                <td key={r.id} className="num">
                  {r.vaad ? formatPrice(r.vaad) : "–"}
                </td>
              ))}
            </tr>
            <tr>
              <th scope="row" className="cell-name">
                חשבונות (לחודש)
              </th>
              {cols.map(({ r }) => (
                <td key={r.id} className="num">
                  {r.utilities ? formatPrice(r.utilities) : "–"}
                </td>
              ))}
            </tr>
            <tr>
              <th scope="row" className="cell-name">
                פיקדון
              </th>
              {cols.map(({ r }) => (
                <td key={r.id} className="num">
                  {r.deposit ? (
                    <>
                      {formatPrice(r.deposit)}
                      {isDepositOverCap(r) ? (
                        <span className="cell-flag" title="מעל 3 חודשי שכירות">
                          {" "}
                          ⚠
                        </span>
                      ) : null}
                    </>
                  ) : (
                    "–"
                  )}
                </td>
              ))}
            </tr>
            <tr>
              <th scope="row" className="cell-name">
                דמי תיווך
              </th>
              {cols.map(({ r }) => (
                <td key={r.id} className="num">
                  {r.brokerFee ? formatPrice(r.brokerFee) : "–"}
                </td>
              ))}
            </tr>
            <tr>
              <th scope="row" className="cell-name">
                חדרים
              </th>
              {cols.map(({ r }) => (
                <td key={r.id} className="num">
                  {formatNumber(r.rooms)}
                </td>
              ))}
            </tr>
            <tr>
              <th scope="row" className="cell-name">
                שטח
              </th>
              {cols.map(({ r }) => (
                <td key={r.id} className="num">
                  {r.area ? `${formatNumber(r.area)} מ״ר` : "–"}
                </td>
              ))}
            </tr>
            <tr>
              <th scope="row" className="cell-name">
                קומה
              </th>
              {cols.map(({ r }) => (
                <td key={r.id}>{r.floor || "–"}</td>
              ))}
            </tr>
            <tr>
              <th scope="row" className="cell-name">
                תאריך כניסה
              </th>
              {cols.map(({ r }) => (
                <td key={r.id}>{formatDate(r.moveInDate)}</td>
              ))}
            </tr>
            <tr>
              <th scope="row" className="cell-name">
                תקופת שכירות
              </th>
              {cols.map(({ r }) => (
                <td key={r.id} className="num">
                  {r.leaseMonths ? `${r.leaseMonths} ח׳` : "–"}
                </td>
              ))}
            </tr>
            <tr>
              <th scope="row" className="cell-name">
                ריהוט
              </th>
              {cols.map(({ r }) => (
                <td key={r.id}>{FURNISHED_LABELS[r.furnished]}</td>
              ))}
            </tr>
            <tr>
              <th scope="row" className="cell-name">
                מצב
              </th>
              {cols.map(({ r }) => (
                <td key={r.id}>{CONDITION_LABELS[r.condition] || "–"}</td>
              ))}
            </tr>
            <tr>
              <th scope="row" className="cell-name">
                תוספות
              </th>
              {cols.map(({ r }) => (
                <td key={r.id}>{featureText(r)}</td>
              ))}
            </tr>
            <tr>
              <th scope="row" className="cell-name">
                בעלי חיים
              </th>
              {cols.map(({ r }) => (
                <td key={r.id}>{r.petsAllowed ? "מותר" : "–"}</td>
              ))}
            </tr>
            <tr>
              <th scope="row" className="cell-name">
                דירוג
              </th>
              {cols.map(({ r }) => (
                <td key={r.id}>
                  <Stars value={r.rating} />
                </td>
              ))}
            </tr>
            <tr>
              <th scope="row" className="cell-name">
                יתרונות
              </th>
              {cols.map(({ r }) => (
                <td key={r.id} className="cell-list">
                  {r.pros.length ? (
                    <ul>
                      {r.pros.map((p, i) => (
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
              {cols.map(({ r }) => (
                <td key={r.id} className="cell-list">
                  {r.cons.length ? (
                    <ul>
                      {r.cons.map((c, i) => (
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
