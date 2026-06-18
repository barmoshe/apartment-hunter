// localStorage persistence. v1 keeps all data on the device (no server, no
// accounts), so this module is the single source of truth for apartments,
// mortgage offers, and settings. SSR-safe: every access guards on window.

import {
  defaultSettings,
  emptyDraft,
  emptyRentalDraft,
  type Apartment,
  type MortgageOffer,
  type Rental,
  type Settings,
} from "./types";

const APARTMENTS_KEY = "dira:apartments:v1";
const MORTGAGES_KEY = "dira:mortgages:v1";
const RENTALS_KEY = "dira:rentals:v1";
const SETTINGS_KEY = "dira:settings:v1";

export function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// Fill any fields missing from older stored records (the model grew in v2), so
// apartments saved by an earlier version load cleanly with sane defaults.
function normalizeApartment(raw: Partial<Apartment>): Apartment {
  const base = emptyDraft();
  return {
    ...base,
    ...raw,
    // arrays must be arrays even if absent/garbled in old data
    pros: Array.isArray(raw.pros) ? raw.pros : [],
    cons: Array.isArray(raw.cons) ? raw.cons : [],
    id: raw.id ?? newId(),
    createdAt: raw.createdAt ?? Date.now(),
    updatedAt: raw.updatedAt ?? Date.now(),
  } as Apartment;
}

export function loadApartments(): Apartment[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(APARTMENTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeApartment);
  } catch {
    return [];
  }
}

export function saveApartments(items: Apartment[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(APARTMENTS_KEY, JSON.stringify(items));
  } catch {
    // Storage full or blocked: nothing we can do silently; the UI keeps state.
  }
}

export function loadMortgages(): MortgageOffer[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(MORTGAGES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as MortgageOffer[];
  } catch {
    return [];
  }
}

export function saveMortgages(items: MortgageOffer[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(MORTGAGES_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
}

// Fill any fields missing from older/partial rental records, mirroring
// normalizeApartment so list-shape arrays are always arrays.
function normalizeRental(raw: Partial<Rental>): Rental {
  const base = emptyRentalDraft();
  return {
    ...base,
    ...raw,
    pros: Array.isArray(raw.pros) ? raw.pros : [],
    cons: Array.isArray(raw.cons) ? raw.cons : [],
    appliances: Array.isArray(raw.appliances) ? raw.appliances : [],
    id: raw.id ?? newId(),
    createdAt: raw.createdAt ?? Date.now(),
    updatedAt: raw.updatedAt ?? Date.now(),
  } as Rental;
}

export function loadRentals(): Rental[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RENTALS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeRental);
  } catch {
    return [];
  }
}

export function saveRentals(items: Rental[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(RENTALS_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
}

// Merge stored settings over defaults. The nested `rent` block is merged
// field-by-field so settings saved before the Rent track (no `rent` key) — or
// with only some rent fields — still load with sane defaults.
function mergeSettings(parsed: Partial<Settings>): Settings {
  const base = defaultSettings();
  return { ...base, ...parsed, rent: { ...base.rent, ...(parsed.rent ?? {}) } };
}

export function loadSettings(): Settings {
  if (typeof window === "undefined") return defaultSettings();
  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY);
    if (!raw) return defaultSettings();
    return mergeSettings(JSON.parse(raw) as Partial<Settings>);
  } catch {
    return defaultSettings();
  }
}

export function saveSettings(s: Settings): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
  } catch {
    // ignore
  }
}

// --- Backup / restore: a single bundle of everything, since the data lives on
// one device. Backwards-compatible with v1 backups that were a bare array. ---

interface Backup {
  version: 3;
  exportedAt: string;
  apartments: Apartment[];
  mortgages: MortgageOffer[];
  rentals: Rental[];
  settings: Settings;
}

export function exportJson(
  apartments: Apartment[],
  mortgages: MortgageOffer[],
  rentals: Rental[],
  settings: Settings,
): string {
  const backup: Backup = {
    version: 3,
    exportedAt: new Date().toISOString(),
    apartments,
    mortgages,
    rentals,
    settings,
  };
  return JSON.stringify(backup, null, 2);
}

export interface ImportResult {
  apartments: Apartment[];
  mortgages: MortgageOffer[];
  rentals: Rental[];
  settings: Settings | null;
}

export function parseImport(raw: string): ImportResult | null {
  try {
    const parsed = JSON.parse(raw);
    // v1 backup: a bare array of apartments.
    if (Array.isArray(parsed)) {
      return {
        apartments: parsed.map(normalizeApartment),
        mortgages: [],
        rentals: [],
        settings: null,
      };
    }
    // v2/v3 backup: a bundle. Missing sections (e.g. a v2 file with no
    // `rentals`) default to empty, so older backups import cleanly.
    if (parsed && typeof parsed === "object") {
      const b = parsed as Partial<Backup>;
      return {
        apartments: Array.isArray(b.apartments) ? b.apartments.map(normalizeApartment) : [],
        mortgages: Array.isArray(b.mortgages) ? b.mortgages : [],
        rentals: Array.isArray(b.rentals) ? b.rentals.map(normalizeRental) : [],
        settings: b.settings ? mergeSettings(b.settings) : null,
      };
    }
    return null;
  } catch {
    return null;
  }
}
