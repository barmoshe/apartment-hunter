"use client";

import { useMemo, useState } from "react";
import { pricePerMeter, type Apartment, type Settings } from "@/lib/types";
import { allInCost } from "@/lib/finance";
import { formatNumber, formatPerMeter, formatPrice, formatPriceShort } from "@/lib/format";
import { StatusBadge } from "./StatusBadge";
import { Stars } from "./Stars";
import { TrashSprite } from "./art";

type SortKey =
  | "nickname"
  | "city"
  | "price"
  | "rooms"
  | "area"
  | "ppm"
  | "total"
  | "rating";
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

// Tiny feature badges (elevator / balcony / safe-room / parking) shown under
// the name so the spreadsheet stays scannable without extra columns.
function Features({ a }: { a: Apartment }) {
  const items: string[] = [];
  if (a.elevator) items.push("מעלית");
  if (a.balcony) items.push("מרפסת");
  if (a.saferoom) items.push("ממ״ד");
  if (a.parking) items.push(`${a.parking} חניות`);
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

// Spreadsheet-style table. Headers toggle sort; the wrapper scrolls
// horizontally on narrow screens and the first column stays pinned.
// A checkbox per row feeds the side-by-side comparison.
export function ApartmentTable({
  items,
  settings,
  selectedIds,
  onToggleSelect,
  onEdit,
  onDelete,
}: {
  items: Apartment[];
  settings: Settings;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onEdit: (a: Apartment) => void;
  onDelete: (a: Apartment) => void;
}) {
  const [sortKey, setSortKey] = useState<SortKey>("price");
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
    const valueOf = (a: Apartment): string | number | null => {
      switch (sortKey) {
        case "ppm":
          return pricePerMeter(a);
        case "total":
          return allInCost(a.price, settings).total;
        case "nickname":
          return a.nickname.toLocaleLowerCase("he");
        case "city":
          return a.city.toLocaleLowerCase("he");
        default:
          return a[sortKey];
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
    <div className="table-wrap" role="region" aria-label="טבלת דירות" tabIndex={0}>
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
            <SortHeader k="price" {...headProps}>
              מחיר
            </SortHeader>
            <SortHeader k="rooms" {...headProps}>
              חדרים
            </SortHeader>
            <SortHeader k="area" {...headProps}>
              שטח
            </SortHeader>
            <SortHeader k="ppm" {...headProps}>
              ₪ למ״ר
            </SortHeader>
            <SortHeader k="total" {...headProps}>
              עלות כוללת
            </SortHeader>
            <th>קומה</th>
            <SortHeader k="rating" {...headProps}>
              דירוג
            </SortHeader>
            <th>סטטוס</th>
            <th className="col-actions">פעולות</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((a) => {
            const cost = allInCost(a.price, settings);
            const selected = selectedIds.has(a.id);
            return (
              <tr key={a.id} className={selected ? "row-selected" : undefined}>
                <td className="col-pick">
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => onToggleSelect(a.id)}
                    aria-label={`בחירת ${a.nickname} להשוואה`}
                  />
                </td>
                <th scope="row" className="cell-name">
                  {a.listingUrl ? (
                    <a href={a.listingUrl} target="_blank" rel="noopener noreferrer">
                      {a.nickname}
                    </a>
                  ) : (
                    a.nickname
                  )}
                  {a.address ? <small>{a.address}</small> : null}
                  <Features a={a} />
                </th>
                <td>{a.city || "–"}</td>
                <td className="num">{formatPrice(a.price)}</td>
                <td className="num">{formatNumber(a.rooms)}</td>
                <td className="num">{a.area ? `${formatNumber(a.area)} מ״ר` : "–"}</td>
                <td className="num">{formatPerMeter(pricePerMeter(a))}</td>
                <td className="num" title="מחיר + מס רכישה + עלויות נלוות">
                  {cost.total != null ? formatPriceShort(cost.total) : "–"}
                </td>
                <td>{a.floor || "–"}</td>
                <td>
                  <Stars value={a.rating} />
                </td>
                <td>
                  <StatusBadge status={a.status} />
                </td>
                <td className="col-actions">
                  <div className="row-actions">
                    <button
                      type="button"
                      className="btn btn-ghost icon-btn"
                      onClick={() => onEdit(a)}
                      aria-label={`עריכת ${a.nickname}`}
                      title="עריכה"
                    >
                      ✎
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost icon-btn danger"
                      onClick={() => onDelete(a)}
                      aria-label={`מחיקת ${a.nickname}`}
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
