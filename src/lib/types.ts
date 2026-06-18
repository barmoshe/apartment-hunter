// Domain model for Dira: the real-estate search tracker.
// Two entities: apartments (the search) and mortgage offers (the financing).
// A small Settings object drives the Israeli cost model (purchase tax +
// closing costs + financing limits).

export const STATUSES = [
  "to-see",
  "seen",
  "shortlist",
  "offer",
  "rejected",
] as const;

export type Status = (typeof STATUSES)[number];

// Hebrew labels for each status, used across the UI.
export const STATUS_LABELS: Record<Status, string> = {
  "to-see": "לראות",
  seen: "ראינו",
  shortlist: "רשימה קצרה",
  offer: "הוגשה הצעה",
  rejected: "נפסל",
};

// Physical condition of the apartment — drives expectations on renovation cost.
export const CONDITIONS = ["", "new", "renovated", "good", "needs-work"] as const;
export type Condition = (typeof CONDITIONS)[number];

export const CONDITION_LABELS: Record<Condition, string> = {
  "": "ללא",
  new: "חדש מקבלן",
  renovated: "משופץ",
  good: "שמור",
  "needs-work": "דורש שיפוץ",
};

export interface Apartment {
  id: string;
  nickname: string; // short human label, e.g. "הדירה עם המרפסת"
  city: string; // עיר / שכונה
  address: string;
  price: number | null; // מחיר מבוקש, בש"ח
  rooms: number | null; // מספר חדרים
  area: number | null; // שטח במ"ר
  floor: string; // קומה (string: allows "קרקע", "גג")
  status: Status;
  rating: number; // 0..5 (0 = ללא דירוג)
  listingUrl: string;
  contact: string; // טלפון / שם מתווך או בעלים
  notes: string;
  visitDate: string; // ISO date (yyyy-mm-dd) or ""
  // --- richer fields (v2): what Israeli buyers actually compare ---
  yearBuilt: number | null; // שנת בנייה
  condition: Condition; // מצב הנכס
  parking: number | null; // מספר חניות
  elevator: boolean; // מעלית
  balcony: boolean; // מרפסת
  saferoom: boolean; // ממ"ד
  arnona: number | null; // ארנונה חודשית (₪)
  vaad: number | null; // ועד בית חודשי (₪)
  pros: string[]; // יתרונות
  cons: string[]; // חסרונות
  createdAt: number; // epoch ms
  updatedAt: number; // epoch ms
}

// A new apartment carries everything but the system-managed fields.
export type ApartmentDraft = Omit<Apartment, "id" | "createdAt" | "updatedAt">;

export function emptyDraft(): ApartmentDraft {
  return {
    nickname: "",
    city: "",
    address: "",
    price: null,
    rooms: null,
    area: null,
    floor: "",
    status: "to-see",
    rating: 0,
    listingUrl: "",
    contact: "",
    notes: "",
    visitDate: "",
    yearBuilt: null,
    condition: "",
    parking: null,
    elevator: false,
    balcony: false,
    saferoom: false,
    arnona: null,
    vaad: null,
    pros: [],
    cons: [],
  };
}

// ₪ per square meter, the key comparison metric. null when inputs are missing.
export function pricePerMeter(a: Pick<Apartment, "price" | "area">): number | null {
  if (!a.price || !a.area) return null;
  return Math.round(a.price / a.area);
}

// --- Rentals (the שכירות track) ---
// A parallel entity to Apartment, not an overload: renting shares the physical
// shape (rooms, area, features) but diverges on money (monthly rent, deposit,
// arnona — no purchase tax, no LTV) and on lease shape (term, move-in,
// furnished). Kept explicit and parallel rather than abstracted into one type.

// Rental statuses mirror the Buy set, minus "offer" (no offers when renting)
// plus "signed" (נחתמה) as the terminal state.
export const RENTAL_STATUSES = [
  "to-see",
  "seen",
  "shortlist",
  "rejected",
  "signed",
] as const;

export type RentalStatus = (typeof RENTAL_STATUSES)[number];

export const RENTAL_STATUS_LABELS: Record<RentalStatus, string> = {
  "to-see": "לבדיקה",
  seen: "נצפתה",
  shortlist: "מועמדת",
  rejected: "נפסלה",
  signed: "נחתמה",
};

// How furnished the rental comes — a common deciding factor.
export const FURNISHED = ["none", "partial", "full"] as const;
export type Furnished = (typeof FURNISHED)[number];

export const FURNISHED_LABELS: Record<Furnished, string> = {
  none: "ללא ריהוט",
  partial: "מרוהטת חלקית",
  full: "מרוהטת",
};

export interface Rental {
  id: string;
  nickname: string; // short human label
  city: string; // עיר / שכונה
  address: string;
  rooms: number | null;
  area: number | null; // מ"ר
  floor: string;
  // physical features (shared shape with Apartment)
  elevator: boolean;
  parking: number | null;
  balcony: boolean;
  saferoom: boolean; // ממ"ד
  condition: Condition;
  // money — monthly unless noted
  rent: number | null; // שכר דירה חודשי (the headline)
  arnona: number | null; // ארנונה חודשית
  vaad: number | null; // ועד בית חודשי
  utilities: number | null; // הערכת חשבונות חודשית (מים/חשמל/גז/אינטרנט)
  brokerFee: number | null; // דמי תיווך (חד-פעמי; לרוב 0 לפי חוק שכירות הוגנת)
  deposit: number | null; // בטוחה / פיקדון (תקרה 3× שכ"ד → אזהרה)
  cpiLinked: boolean; // הצמדה למדד
  // lease shape
  leaseMonths: number | null; // תקופת שכירות
  moveInDate: string; // תאריך כניסה — ISO (yyyy-mm-dd) or ""
  hasExtensionOption: boolean; // אופציה להארכה
  furnished: Furnished;
  appliances: string[]; // מוצרי חשמל כלולים (מזגן, מקרר...)
  petsAllowed: boolean; // חיות מחמד
  // shared meta
  status: RentalStatus;
  rating: number; // 0..5
  contact: string;
  listingUrl: string;
  notes: string;
  pros: string[];
  cons: string[];
  createdAt: number; // epoch ms
  updatedAt: number; // epoch ms
}

export type RentalDraft = Omit<Rental, "id" | "createdAt" | "updatedAt">;

export function emptyRentalDraft(): RentalDraft {
  return {
    nickname: "",
    city: "",
    address: "",
    rooms: null,
    area: null,
    floor: "",
    elevator: false,
    parking: null,
    balcony: false,
    saferoom: false,
    condition: "",
    rent: null,
    arnona: null,
    vaad: null,
    utilities: null,
    brokerFee: null,
    deposit: null,
    cpiLinked: false,
    leaseMonths: 12,
    moveInDate: "",
    hasExtensionOption: false,
    furnished: "none",
    appliances: [],
    petsAllowed: false,
    status: "to-see",
    rating: 0,
    contact: "",
    listingUrl: "",
    notes: "",
    pros: [],
    cons: [],
  };
}

// --- Mortgage offers (the financing half of the brief) ---

// Common Israeli mortgage tracks (מסלולים). Free text is allowed too, but the
// preset list keeps offers comparable.
export const MORTGAGE_TRACKS = [
  "פריים",
  "קבועה לא צמודה (קל״צ)",
  "קבועה צמודה (ק״צ)",
  "משתנה לא צמודה",
  "משתנה צמודה",
  "אחר",
] as const;

export interface MortgageOffer {
  id: string;
  label: string; // שם ההצעה / בנק
  lender: string; // הגוף המלווה
  principal: number | null; // סכום ההלוואה (₪)
  annualRate: number | null; // ריבית שנתית נומינלית (%)
  years: number | null; // תקופה (שנים)
  track: string; // מסלול
  linkedApartmentId: string | null; // קישור לדירה (אופציונלי)
  notes: string;
  createdAt: number;
  updatedAt: number;
}

export type MortgageDraft = Omit<MortgageOffer, "id" | "createdAt" | "updatedAt">;

export function emptyMortgageDraft(): MortgageDraft {
  return {
    label: "",
    lender: "",
    principal: null,
    annualRate: null,
    years: 25,
    track: "פריים",
    linkedApartmentId: null,
    notes: "",
  };
}

// --- Settings: the buyer profile that drives tax + financing limits ---

// Buyer type affects both purchase tax brackets and the max financing (LTV)
// the Bank of Israel allows.
export const BUYER_TYPES = ["single", "upgrader", "investor"] as const;
export type BuyerType = (typeof BUYER_TYPES)[number];

export const BUYER_TYPE_LABELS: Record<BuyerType, string> = {
  single: "דירה יחידה",
  upgrader: "משפר דיור",
  investor: "דירה להשקעה / נוספת",
};

// Rent-track settings: defaults for new rentals + how the monthly headline is
// computed. Kept as a nested block on the shared Settings so there is still one
// settings store / key / dialog (Buy fields above are untouched).
export interface RentSettings {
  amortizeOneOffs: boolean; // fold one-off costs into the monthly all-in?
  defaultArnona: number | null; // prefill new rentals
  defaultVaad: number | null;
  defaultUtilities: number | null;
  defaultLeaseMonths: number;
}

export interface Settings {
  buyerType: BuyerType;
  equity: number | null; // הון עצמי זמין (₪)
  lawyerPct: number; // שכ"ט עו"ד (% מהמחיר)
  brokerPct: number; // דמי תיווך (% מהמחיר, כולל מע"מ)
  appraisal: number; // שמאי (₪, סכום קבוע)
  otherCosts: number; // עלויות נוספות (₪): הובלה, ריהוט, תיקונים
  rent: RentSettings; // שכירות
}

export function defaultSettings(): Settings {
  return {
    buyerType: "single",
    equity: null,
    lawyerPct: 0.5,
    brokerPct: 2,
    appraisal: 700,
    otherCosts: 0,
    rent: {
      amortizeOneOffs: false,
      defaultArnona: null,
      defaultVaad: null,
      defaultUtilities: null,
      defaultLeaseMonths: 12,
    },
  };
}
