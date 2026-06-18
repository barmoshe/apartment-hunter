"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useApartments } from "@/hooks/useApartments";
import { useMortgages } from "@/hooks/useMortgages";
import { useRentals } from "@/hooks/useRentals";
import { useSettings } from "@/hooks/useSettings";

// One provider owns every localStorage-backed store so every route and the
// shared app bar read the same instance. Backup/restore and the settings dialog
// live here because they touch all of them at once.
type Store = {
  apartments: ReturnType<typeof useApartments>;
  mortgages: ReturnType<typeof useMortgages>;
  rentals: ReturnType<typeof useRentals>;
  settings: ReturnType<typeof useSettings>;
};

const StoreContext = createContext<Store | null>(null);

export function DiraProvider({ children }: { children: ReactNode }) {
  const apartments = useApartments();
  const mortgages = useMortgages();
  const rentals = useRentals();
  const settings = useSettings();
  return (
    <StoreContext.Provider value={{ apartments, mortgages, rentals, settings }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore(): Store {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within DiraProvider");
  return ctx;
}
