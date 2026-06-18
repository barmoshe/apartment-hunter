"use client";

import { useCallback, useEffect, useState } from "react";
import type { Apartment, ApartmentDraft } from "@/lib/types";
import {
  loadApartments,
  newId,
  saveApartments,
} from "@/lib/storage";

// Owns the apartment collection and persists every change to localStorage.
// Hydration: starts empty on the server and first client render, then loads
// from storage in an effect to avoid an SSR/client mismatch.
export function useApartments() {
  const [items, setItems] = useState<Apartment[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Hydrate from localStorage after mount. Reading storage during render
    // would diverge from the server-rendered (empty) markup, so this deliberate
    // post-mount setState is the correct pattern, not a cascading-render bug.
    /* eslint-disable react-hooks/set-state-in-effect */
    setItems(loadApartments());
    setHydrated(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  useEffect(() => {
    if (hydrated) saveApartments(items);
  }, [items, hydrated]);

  const add = useCallback((draft: ApartmentDraft) => {
    const now = Date.now();
    const apt: Apartment = { ...draft, id: newId(), createdAt: now, updatedAt: now };
    setItems((prev) => [apt, ...prev]);
    return apt.id;
  }, []);

  const update = useCallback((id: string, draft: ApartmentDraft) => {
    setItems((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, ...draft, updatedAt: Date.now() } : a,
      ),
    );
  }, []);

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const replaceAll = useCallback((next: Apartment[]) => {
    setItems(next);
  }, []);

  return { items, hydrated, add, update, remove, replaceAll };
}
