"use client";

import { useMemo } from "react";
import type { Rental, Settings } from "@/lib/types";
import { monthlyAllIn } from "@/lib/rentalCost";
import { formatPrice } from "@/lib/format";

// At-a-glance numbers over the currently visible rentals: how many, the rent
// range, the average monthly rent and the average monthly all-in cost (rent +
// arnona + ועד + utilities, plus amortised one-offs when that setting is on).
export function RentalStats({ items, settings }: { items: Rental[]; settings: Settings }) {
  const stats = useMemo(() => {
    const rents = items.map((r) => r.rent).filter((p): p is number => p != null);
    const monthlies = items
      .map((r) => monthlyAllIn(r, settings))
      .filter((p): p is number => p != null);
    const avg = (xs: number[]) =>
      xs.length ? Math.round(xs.reduce((s, n) => s + n, 0) / xs.length) : null;
    return {
      count: items.length,
      min: rents.length ? Math.min(...rents) : null,
      max: rents.length ? Math.max(...rents) : null,
      avgRent: avg(rents),
      avgMonthly: avg(monthlies),
    };
  }, [items, settings]);

  return (
    <dl className="stats">
      <div className="stat">
        <dt>דירות להשכרה</dt>
        <dd>{stats.count}</dd>
      </div>
      <div className="stat">
        <dt>הזולה ביותר</dt>
        <dd>{formatPrice(stats.min)}</dd>
      </div>
      <div className="stat">
        <dt>היקרה ביותר</dt>
        <dd>{formatPrice(stats.max)}</dd>
      </div>
      <div className="stat">
        <dt>שכ״ד ממוצע</dt>
        <dd>{formatPrice(stats.avgRent)}</dd>
      </div>
      <div className="stat">
        <dt>עלות חודשית ממוצעת</dt>
        <dd>{formatPrice(stats.avgMonthly)}</dd>
      </div>
    </dl>
  );
}
