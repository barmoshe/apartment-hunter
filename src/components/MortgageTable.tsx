"use client";

import { useMemo } from "react";
import type { Apartment, MortgageOffer } from "@/lib/types";
import { mortgageSummary } from "@/lib/mortgage";
import { formatNumber, formatPrice } from "@/lib/format";
import { TrashSprite } from "./art";

// Offers table: each row shows the computed monthly payment, total paid, and
// total interest (Spitzer). The lowest monthly payment and the lowest total
// interest are highlighted so the cheapest offer stands out.
export function MortgageTable({
  items,
  apartments,
  onEdit,
  onDelete,
}: {
  items: MortgageOffer[];
  apartments: Apartment[];
  onEdit: (m: MortgageOffer) => void;
  onDelete: (m: MortgageOffer) => void;
}) {
  const rows = useMemo(
    () =>
      items.map((m) => ({
        m,
        summary: mortgageSummary(m.principal, m.annualRate, m.years),
        apt: apartments.find((a) => a.id === m.linkedApartmentId) ?? null,
      })),
    [items, apartments],
  );

  const bestMonthly = useMemo(() => {
    const xs = rows.map((r) => r.summary?.monthly).filter((n): n is number => n != null);
    return xs.length ? Math.min(...xs) : null;
  }, [rows]);

  const bestInterest = useMemo(() => {
    const xs = rows
      .map((r) => r.summary?.totalInterest)
      .filter((n): n is number => n != null);
    return xs.length ? Math.min(...xs) : null;
  }, [rows]);

  return (
    <div className="table-wrap" role="region" aria-label="טבלת הצעות משכנתא" tabIndex={0}>
      <table className="grid">
        <thead>
          <tr>
            <th>הצעה</th>
            <th>מסלול</th>
            <th>סכום</th>
            <th>ריבית</th>
            <th>שנים</th>
            <th>החזר חודשי</th>
            <th>סה״כ ריבית</th>
            <th>סה״כ החזר</th>
            <th className="col-actions">פעולות</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ m, summary, apt }) => (
            <tr key={m.id}>
              <th scope="row" className="cell-name">
                {m.label}
                {m.lender ? <small>{m.lender}</small> : null}
                {apt ? <small>↪ {apt.nickname}</small> : null}
              </th>
              <td>{m.track}</td>
              <td className="num">{formatPrice(m.principal)}</td>
              <td className="num">
                {m.annualRate != null ? `${formatNumber(m.annualRate)}%` : "–"}
              </td>
              <td className="num">{formatNumber(m.years)}</td>
              <td
                className={
                  summary && summary.monthly === bestMonthly ? "num best" : "num"
                }
              >
                {summary ? formatPrice(summary.monthly) : "–"}
              </td>
              <td
                className={
                  summary && summary.totalInterest === bestInterest ? "num best" : "num"
                }
              >
                {summary ? formatPrice(summary.totalInterest) : "–"}
              </td>
              <td className="num">{summary ? formatPrice(summary.total) : "–"}</td>
              <td className="col-actions">
                <div className="row-actions">
                  <button
                    type="button"
                    className="btn btn-ghost icon-btn"
                    onClick={() => onEdit(m)}
                    aria-label={`עריכת ${m.label}`}
                    title="עריכה"
                  >
                    ✎
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost icon-btn danger"
                    onClick={() => onDelete(m)}
                    aria-label={`מחיקת ${m.label}`}
                    title="מחיקה"
                  >
                    <TrashSprite />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
