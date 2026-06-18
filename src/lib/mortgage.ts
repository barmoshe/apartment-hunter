// Mortgage math. Israeli mortgages are almost always amortized on the
// "Spitzer" schedule (לוח שפיצר) — equal monthly payments, where each payment
// is part interest, part principal. This module computes the monthly payment
// and the totals for a single track at a fixed nominal annual rate.
//
// These are estimates for comparison only. A real mortgage is a mix of tracks
// (תמהיל) with some indexed to the CPI and some variable; the actual payment
// changes over time. We model one track at a fixed rate, which is the standard
// way to compare offers at a glance.

export interface MortgageSummary {
  monthly: number; // monthly payment (₪)
  total: number; // total paid over the life of the loan (₪)
  totalInterest: number; // total interest paid (₪)
}

// Spitzer monthly payment: P * r / (1 - (1+r)^-n)
// P = principal, r = monthly rate (annual/12/100), n = months (years*12).
export function monthlyPayment(
  principal: number,
  annualRatePct: number,
  years: number,
): number {
  if (principal <= 0 || years <= 0) return 0;
  const n = Math.round(years * 12);
  const r = annualRatePct / 100 / 12;
  if (r === 0) return principal / n; // zero-interest edge case
  return (principal * r) / (1 - Math.pow(1 + r, -n));
}

export function mortgageSummary(
  principal: number | null,
  annualRatePct: number | null,
  years: number | null,
): MortgageSummary | null {
  if (!principal || principal <= 0 || annualRatePct == null || !years || years <= 0) {
    return null;
  }
  const monthly = monthlyPayment(principal, annualRatePct, years);
  const n = Math.round(years * 12);
  const total = monthly * n;
  return {
    monthly: Math.round(monthly),
    total: Math.round(total),
    totalInterest: Math.round(total - principal),
  };
}
