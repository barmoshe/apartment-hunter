"use client";

import { useCallback, useEffect, useState } from "react";
import type { MortgageDraft, MortgageOffer } from "@/lib/types";
import { loadMortgages, newId, saveMortgages } from "@/lib/storage";

// Owns the mortgage-offer collection and persists every change to localStorage.
// Same hydration pattern as useApartments: empty on the server, load on mount.
export function useMortgages() {
  const [items, setItems] = useState<MortgageOffer[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Deliberate post-mount load from storage (would mismatch the empty SSR
    // markup if read during render), not a cascading-render bug.
    /* eslint-disable react-hooks/set-state-in-effect */
    setItems(loadMortgages());
    setHydrated(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  useEffect(() => {
    if (hydrated) saveMortgages(items);
  }, [items, hydrated]);

  const add = useCallback((draft: MortgageDraft) => {
    const now = Date.now();
    const offer: MortgageOffer = { ...draft, id: newId(), createdAt: now, updatedAt: now };
    setItems((prev) => [offer, ...prev]);
    return offer.id;
  }, []);

  const update = useCallback((id: string, draft: MortgageDraft) => {
    setItems((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...draft, updatedAt: Date.now() } : m)),
    );
  }, []);

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const replaceAll = useCallback((next: MortgageOffer[]) => {
    setItems(next);
  }, []);

  return { items, hydrated, add, update, remove, replaceAll };
}
