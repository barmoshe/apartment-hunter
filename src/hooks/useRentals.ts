"use client";

import { useCallback, useEffect, useState } from "react";
import type { Rental, RentalDraft } from "@/lib/types";
import { loadRentals, newId, saveRentals } from "@/lib/storage";

// Owns the rental collection and persists every change to localStorage.
// Same hydration pattern as useApartments: empty on the server, load on mount.
export function useRentals() {
  const [items, setItems] = useState<Rental[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Deliberate post-mount load from storage (would mismatch the empty SSR
    // markup if read during render), not a cascading-render bug.
    /* eslint-disable react-hooks/set-state-in-effect */
    setItems(loadRentals());
    setHydrated(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  useEffect(() => {
    if (hydrated) saveRentals(items);
  }, [items, hydrated]);

  const add = useCallback((draft: RentalDraft) => {
    const now = Date.now();
    const rental: Rental = { ...draft, id: newId(), createdAt: now, updatedAt: now };
    setItems((prev) => [rental, ...prev]);
    return rental.id;
  }, []);

  const update = useCallback((id: string, draft: RentalDraft) => {
    setItems((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...draft, updatedAt: Date.now() } : r)),
    );
  }, []);

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const replaceAll = useCallback((next: Rental[]) => {
    setItems(next);
  }, []);

  return { items, hydrated, add, update, remove, replaceAll };
}
