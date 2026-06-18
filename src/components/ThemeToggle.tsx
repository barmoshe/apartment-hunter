"use client";

import { useEffect, useState } from "react";

// Light/dark toggle. Writes the same bm:theme key the pre-paint script reads,
// so the choice survives a reload with no flash.
type Theme = "light" | "dark";

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    // Read the theme the pre-paint script already applied to <html>, after mount
    // (the server cannot know the client's stored preference). Deliberate.
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    setTheme(document.documentElement.classList.contains("dark") ? "dark" : "light");
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.classList.toggle("dark", next === "dark");
    try {
      localStorage.setItem("bm:theme", next);
    } catch {}
    setTheme(next);
  }

  // Render a stable label until hydrated to avoid a mismatch.
  const isDark = theme === "dark";
  return (
    <button
      type="button"
      className="btn btn-ghost icon-btn"
      onClick={toggle}
      aria-label={isDark ? "מעבר למצב בהיר" : "מעבר למצב כהה"}
      title={isDark ? "מצב בהיר" : "מצב כהה"}
    >
      {theme === null ? "◐" : isDark ? "☀" : "☾"}
    </button>
  );
}
