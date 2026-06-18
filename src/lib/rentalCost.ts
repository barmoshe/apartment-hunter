// The monthly all-in cost of a rental, the Rent track's headline metric — the
// mirror of finance.ts's all-in *purchase* cost. It turns a sticker rent into
// the real monthly number: rent + arnona + ועד בית + utilities, and optionally
// folds one-off costs (broker fee) amortised over the lease.
//
// The deposit (בטוחה) is locked-up cash, not an expense, so it never enters the
// monthly figure — it is surfaced only via the Fair Rental Law 3×-rent cap
// warning. Estimates for comparison, not legal or financial advice.

import type { Rental, Settings } from "./types";

// Fair Rental Law caps a money-costing guarantee at 3 months' rent.
export function depositCap(rent: number | null): number | null {
  if (rent == null || rent <= 0) return null;
  return 3 * rent;
}

export function isDepositOverCap(r: Pick<Rental, "deposit" | "rent">): boolean {
  const cap = depositCap(r.rent);
  return cap != null && (r.deposit ?? 0) > cap;
}

// One-off entry costs spread across the lease, only when the setting is on.
// Just the broker fee — the deposit is returnable, so it is not amortised.
export function amortizedOneOffs(r: Rental, s: Settings): number {
  if (!s.rent.amortizeOneOffs) return 0;
  const months = r.leaseMonths && r.leaseMonths > 0 ? r.leaseMonths : s.rent.defaultLeaseMonths || 12;
  const oneOffs = r.brokerFee ?? 0;
  return Math.round(oneOffs / months);
}

// The headline: total monthly outlay. null when there is no rent figure yet, so
// the UI shows "–". A null arnona/vaad/utilities counts as 0 (the settings
// defaults only prefill new rentals; they do not silently re-enter here).
export function monthlyAllIn(r: Rental, s: Settings): number | null {
  if (r.rent == null) return null;
  const base = r.rent + (r.arnona ?? 0) + (r.vaad ?? 0) + (r.utilities ?? 0);
  return Math.round(base + amortizedOneOffs(r, s));
}
