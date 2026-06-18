// Israeli purchase tax (מס רכישה) — the marginal-bracket tax a buyer pays on a
// home purchase. The brackets are frozen for 16.1.2025–15.1.2028 (no annual
// index update), so the 2026 figures below also hold for 2027.
//
// Sources (verified June 2026):
//  - Single home (דירה יחידה) brackets:
//    https://www.amitvered.co.il/מס-רכישה/
//  - Additional / investment home (דירה נוספת) brackets:
//    https://klikatnadlan.co.il/masrechishay2026/
//
// This is an estimate to compare apartments, NOT tax advice. It assumes an
// Israeli resident and ignores exemptions/discounts (new immigrant, disability,
// etc.). A "home improver" (משפר דיור) who sells the old home within 24 months
// is taxed at the single-home brackets, so we treat that case as single here.

import type { BuyerType } from "./types";

interface Bracket {
  upTo: number | null; // null = no upper limit (top bracket)
  rate: number; // fraction, e.g. 0.035
}

// דירה יחידה — 2026 (frozen). First bracket is fully exempt.
const SINGLE_2026: Bracket[] = [
  { upTo: 1_978_745, rate: 0 },
  { upTo: 2_347_040, rate: 0.035 },
  { upTo: 6_055_070, rate: 0.05 },
  { upTo: 20_183_565, rate: 0.08 },
  { upTo: null, rate: 0.1 },
];

// דירה נוספת / להשקעה — 2026 (frozen). Taxed from the first shekel.
const ADDITIONAL_2026: Bracket[] = [
  { upTo: 6_055_070, rate: 0.08 },
  { upTo: null, rate: 0.1 },
];

function bracketsFor(buyerType: BuyerType): Bracket[] {
  // single + upgrader (assuming sale of old home within 24mo) → single brackets.
  return buyerType === "investor" ? ADDITIONAL_2026 : SINGLE_2026;
}

// Marginal-bracket computation: each slice of the price is taxed at its rate.
export function purchaseTax(price: number | null, buyerType: BuyerType): number {
  if (!price || price <= 0) return 0;
  const brackets = bracketsFor(buyerType);
  let tax = 0;
  let prev = 0;
  for (const b of brackets) {
    const ceiling = b.upTo ?? Infinity;
    const slice = Math.min(price, ceiling) - prev;
    if (slice > 0) tax += slice * b.rate;
    if (price <= ceiling) break;
    prev = ceiling;
  }
  return Math.round(tax);
}

// Effective rate, for display (tax / price).
export function effectiveTaxRate(price: number | null, buyerType: BuyerType): number | null {
  if (!price || price <= 0) return null;
  return purchaseTax(price, buyerType) / price;
}
