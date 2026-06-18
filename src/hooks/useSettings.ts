"use client";

import { useCallback, useEffect, useState } from "react";
import { defaultSettings, type Settings } from "@/lib/types";
import { loadSettings, saveSettings } from "@/lib/storage";

// Owns the buyer-profile settings that drive the tax + financing model.
// Starts from defaults on the server / first render, then loads on mount.
export function useSettings() {
  const [settings, setSettings] = useState<Settings>(defaultSettings());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setSettings(loadSettings());
    setHydrated(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  useEffect(() => {
    if (hydrated) saveSettings(settings);
  }, [settings, hydrated]);

  const replace = useCallback((next: Settings) => setSettings(next), []);

  return { settings, hydrated, replace };
}
