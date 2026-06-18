"use client";

import { useMemo, useState } from "react";
import {
  FURNISHED_LABELS,
  RENTAL_STATUS_LABELS,
  type Rental,
  type Settings,
} from "@/lib/types";
import { monthlyAllIn } from "@/lib/rentalCost";
import { formatNumber, formatPrice, formatPriceShort } from "@/lib/format";
import { StatusBadge } from "./StatusBadge";
import { Stars } from "./Stars";
import { TrashSprite } from "./art";

type SortKey = "nickname" | "city" | "rent" | "rooms" | "area" | "monthly" | "rating";
type SortDir = "asc" | "desc";

// A sortable column header. Hoisted to module scope (not defined inside the
// table render) so it keeps a stable identity across renders.
function SortHeader({
  k,
  sortKey,
  sortDir,
  onToggle,
  children,
}: {
  k: SortKey;
  sortKey: SortKey;
  sortDir: SortDir;
  onToggle: (k: SortKey) => void;
  children: React.ReactNode;
}) {
  const active = k === sortKey;
  const ariaSort = active ? (sortDir === "asc" ? "ascending" : "descending") : "none";
  return (
    <th aria-sort={ariaSort} className="th-sort">
      <button type="button" onClick={() => onToggle(k)}>
        {children}
        <span aria-hidden="true" className="sort-mark">
          {active ? (sortDir === "asc" ? "▲" : "▼") : ""}
        </span>
      </button>
    </th>
  );
}

// Tiny feature badges shown under the name so the spreadsheet stays scannable.
function Features({ r }: { r: Rental }) {
  const items: string[] = [];
  if (r.elevator) items.push("מעלית");
  if (r.balcony) items.push("מרפסת");
  if (r.saferoom) items.push("ממ״ד");
  if (r.parking) items.push(`${r.parking} חניות`);
  if (r.furnished !== "none") items.push(FURNISHED_LABELS[r.furnished]);
  if (r.petsAllowed) items.push("חיות מחמד");
  if (items.length === 0) return null;
  return (
    <span className="features" aria-label="תוספות">
      {items.map((t) => (
        <span key={t} className="feature">
          {t}
        </span>
      ))}
    </span>
  );
}

// Spreadsheet-style table for the Rent track. The sibling of ApartmentTable:
// same chrome and sort/select behaviour, swapped to the rental field set and
// the monthly all-in cost in place of the all-in purchase cost.
export function RentalTable({
  items,
  settings,
  selectedIds,
  onToggleSelect,
  onEdit,
  onDelete,
}: {
  items: Rental[];
  settings: Settings;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onEdit: (r: Rental) => void;
  onDelete: (r: Rental) => void;
}) {
  const [sortKey, setSortKey] = useState<SortKey>("rent");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const sorted = useMemo(() => {
    const valueOf = (r: Rental): string | number | null => {
      switch (sortKey) {
        case "monthly":
          return monthlyAllIn(r, settings);
        case "nickname":
          return r.nickname.toLocaleLowerCase("he");
        case "city":
          return r.city.toLocaleLowerCase("he");
        default:
          return r[sortKey];
      }
    };
    const dir = sortDir === "asc" ? 1 : -1;
    return [...items].sort((a, b) => {
      const va = valueOf(a);
      const vb = valueOf(b);
      // Empty values always sink to the bottom regardless of direction.
      if (va === null || va === "") return 1;
      if (vb === null || vb === "") return -1;
      if (typeof va === "number" && typeof vb === "number") return (va - vb) * dir;
      return String(va).localeCompare(String(vb), "he") * dir;
    });
  }, [items, sortKey, sortDir, settings]);

  const headProps = { sortKey, sortDir, onToggle: toggleSort };

  return (
    <div className="table-wrap" role="region" aria-label="טבלת דירות להשכרה" tabIndex={0}>
      <table className="grid">
        <thead>
          <tr>
            <th className="col-pick" aria-label="בחירה להשוואה" />
            <SortHeader k="nickname" {...headProps}>
              כינוי
            </SortHeader>
            <SortHeader k="city" {...headProps}>
              עיר / שכונה
            </SortHeader>
            <SortHeader k="rent" {...headProps}>
              שכ״ד חודשי
            </SortHeader>
            <SortHeader k="rooms" {...headProps}>
              חדרים
            </SortHeader>
            <SortHeader k="area" {...headProps}>
              שטח
            </SortHeader>
            <SortHeader k="monthly" {...headProps}>
              עלות חודשית
            </SortHeader>
            <SortHeader k="rating" {...headProps}>
              דירוג
            </SortHeader>
            <th>סטטוס</th>
            <th className="col-actions">פעולות</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((r) => {
            const monthly = monthlyAllIn(r, settings);
            const selected = selectedIds.has(r.id);
            return (
              <tr key={r.id} className={selected ? "row-selected" : undefined}>
                <td className="col-pick">
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => onToggleSelect(r.id)}
                    aria-label={`בחירת ${r.nickname} להשוואה`}
                  />
                </td>
                <th scope="row" className="cell-name">
                  {r.listingUrl ? (
                    <a href={r.listingUrl} target="_blank" rel="noopener noreferrer">
                      {r.nickname}
                    </a>
                  ) : (
                    r.nickname
                  )}
                  {r.address ? <small>{r.address}</small> : null}
                  <Features r={r} />
                </th>
                <td>{r.city || "–"}</td>
                <td className="num">{formatPrice(r.rent)}</td>
                <td className="num">{formatNumber(r.rooms)}</td>
                <td className="num">{r.area ? `${formatNumber(r.area)} מ״ר` : "–"}</td>
                <td className="num" title="שכר דירה + ארנונה + ועד בית + חשבונות">
                  {monthly != null ? formatPriceShort(monthly) : "–"}
                </td>
                <td>
                  <Stars value={r.rating} />
                </td>
                <td>
                  <StatusBadge status={r.status} label={RENTAL_STATUS_LABELS[r.status]} />
                </td>
                <td className="col-actions">
                  <div className="row-actions">
                    <button
                      type="button"
                      className="btn btn-ghost icon-btn"
                      onClick={() => onEdit(r)}
                      aria-label={`עריכת ${r.nickname}`}
                      title="עריכה"
                    >
                      ✎
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost icon-btn danger"
                      onClick={() => onDelete(r)}
                      aria-label={`מחיקת ${r.nickname}`}
                      title="מחיקה"
                    >
                      <TrashSprite />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
