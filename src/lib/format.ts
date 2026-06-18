// Israeli-locale formatting helpers (shekel currency, numbers, dates).

const ils = new Intl.NumberFormat("he-IL", {
  style: "currency",
  currency: "ILS",
  maximumFractionDigits: 0,
});

const num = new Intl.NumberFormat("he-IL");

const pct = new Intl.NumberFormat("he-IL", {
  style: "percent",
  maximumFractionDigits: 1,
});

export function formatPrice(value: number | null): string {
  if (value === null || Number.isNaN(value)) return "–";
  return ils.format(value);
}

export function formatNumber(value: number | null): string {
  if (value === null || Number.isNaN(value)) return "–";
  return num.format(value);
}

export function formatPerMeter(value: number | null): string {
  if (value === null || Number.isNaN(value)) return "–";
  return `${num.format(value)} ₪ למ״ר`;
}

// Compact shekels for tight spots (table, stats): 1.85M ₪ / 320K ₪.
// Mirrors the full-price RTL structure (RLM marks + ₪ at the end) so the
// abbreviated value sits the same way as a full price in a right-to-left cell.
export function formatPriceShort(value: number | null): string {
  if (value === null || Number.isNaN(value)) return "–";
  let abbrev: string | null = null;
  if (Math.abs(value) >= 1_000_000) {
    abbrev = `${(value / 1_000_000).toLocaleString("he-IL", { maximumFractionDigits: 2 })}M`;
  } else if (Math.abs(value) >= 1_000) {
    abbrev = `${Math.round(value / 1000).toLocaleString("he-IL")}K`;
  }
  if (abbrev === null) return ils.format(value);
  // ‏ = RLM (forces RTL context);   = nbsp, like Intl's currency output.
  return `‏${abbrev} ‏₪`;
}

export function formatPercent(fraction: number | null): string {
  if (fraction === null || Number.isNaN(fraction)) return "–";
  return pct.format(fraction);
}

export function formatDate(iso: string): string {
  if (!iso) return "–";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "–";
  return d.toLocaleDateString("he-IL", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
