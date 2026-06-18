// The all-in cost of a purchase, and the financing picture, given the buyer's
// settings. This is what turns a sticker price into the real number: price +
// purchase tax + closing costs, and how much of it the bank will finance.
//
// Financing limits are the Bank of Israel LTV caps (verified June 2026):
//   single home (דירה יחידה)        → up to 75% financing (25% equity)
//   home improver (משפר דיור)       → up to 70% financing (30% equity)
//   investment / additional (השקעה) → up to 50% financing (50% equity)
// Source: https://boi.org.il (Banking Supervision LTV directives).
//
// Estimates for comparison, not financial advice.

import type { BuyerType, Settings } from "./types";
import { purchaseTax } from "./purchaseTax";

export const MAX_LTV: Record<BuyerType, number> = {
  single: 0.75,
  upgrader: 0.7,
  investor: 0.5,
};

export interface ClosingCosts {
  lawyer: number;
  broker: number;
  appraisal: number;
  other: number;
  total: number;
}

export function closingCosts(price: number | null, s: Settings): ClosingCosts {
  const p = price && price > 0 ? price : 0;
  const lawyer = Math.round((p * s.lawyerPct) / 100);
  const broker = Math.round((p * s.brokerPct) / 100);
  const appraisal = Math.max(0, Math.round(s.appraisal));
  const other = Math.max(0, Math.round(s.otherCosts));
  return { lawyer, broker, appraisal, other, total: lawyer + broker + appraisal + other };
}

export interface CostBreakdown {
  price: number | null;
  tax: number;
  closing: ClosingCosts;
  total: number | null; // price + tax + closing.total
}

export function allInCost(price: number | null, s: Settings): CostBreakdown {
  const tax = purchaseTax(price, s.buyerType);
  const closing = closingCosts(price, s);
  const total = price && price > 0 ? price + tax + closing.total : null;
  return { price, tax, closing, total };
}

export interface Financing {
  maxLtv: number; // fraction
  maxLoan: number; // most the bank will lend against this price
  minEquity: number; // minimum cash to complete (down payment + tax + closing)
  equity: number | null; // the buyer's available equity, if set
  shortfall: number; // how much equity is missing (0 if enough)
  loanNeeded: number; // loan required given the buyer's equity
  actualLtv: number | null; // resulting LTV given the buyer's equity
  feasible: boolean | null; // null when equity is unknown
}

// Given a price and the buyer's settings, work out the financing picture.
// The bank finances the property up to maxLtv * price; purchase tax and closing
// costs always come out of the buyer's own pocket on top of the down payment.
export function financing(price: number | null, s: Settings): Financing | null {
  if (!price || price <= 0) return null;
  const maxLtv = MAX_LTV[s.buyerType];
  const maxLoan = Math.round(maxLtv * price);
  const tax = purchaseTax(price, s.buyerType);
  const closing = closingCosts(price, s).total;
  const minDownPayment = price - maxLoan;
  const minEquity = minDownPayment + tax + closing;

  const equity = s.equity;
  if (equity == null) {
    return {
      maxLtv,
      maxLoan,
      minEquity,
      equity: null,
      shortfall: 0,
      loanNeeded: maxLoan,
      actualLtv: maxLtv,
      feasible: null,
    };
  }

  const cashForDownPayment = Math.max(0, equity - tax - closing);
  const loanNeeded = Math.max(0, Math.round(price - cashForDownPayment));
  const shortfall = Math.max(0, Math.round(minEquity - equity));
  const actualLtv = loanNeeded / price;
  return {
    maxLtv,
    maxLoan,
    minEquity,
    equity,
    shortfall,
    loanNeeded,
    actualLtv,
    feasible: shortfall === 0,
  };
}
