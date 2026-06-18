"use client";

import { useMemo } from "react";
import { pricePerMeter, type Apartment, type Settings } from "@/lib/types";
import { allInCost } from "@/lib/finance";
import { formatPerMeter, formatPrice } from "@/lib/format";

// At-a-glance numbers over the currently visible apartments: how many,
// the price range, average price per square meter, and the average all-in
// cost (price + tax + closing) under the current buyer settings.
export function StatsBar({ items, settings }: { items: Apartment[]; settings: Settings }) {
  const stats = useMemo(() => {
    const prices = items.map((a) => a.price).filter((p): p is number => p != null);
    const ppms = items
      .map((a) => pricePerMeter(a))
      .filter((p): p is number => p != null);
    const totals = items
      .map((a) => allInCost(a.price, settings).total)
      .filter((p): p is number => p != null);
    const avg = (xs: number[]) =>
      xs.length ? Math.round(xs.reduce((s, n) => s + n, 0) / xs.length) : null;
    return {
      count: items.length,
      min: prices.length ? Math.min(...prices) : null,
      max: prices.length ? Math.max(...prices) : null,
      avgPpm: avg(ppms),
      avgTotal: avg(totals),
    };
  }, [items, settings]);

  return (
    <dl className="stats">
      <div className="stat">
        <dt>דירות</dt>
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
        <dt>מחיר ממוצע למ״ר</dt>
        <dd>{formatPerMeter(stats.avgPpm)}</dd>
      </div>
      <div className="stat">
        <dt>עלות כוללת ממוצעת</dt>
        <dd>{formatPrice(stats.avgTotal)}</dd>
      </div>
    </dl>
  );
}
