"use client";

// Star rating. Read-only by default; pass onChange to make it an input.
// Keyboard-accessible when interactive (each star is a real button).

const FULL = "★";
const EMPTY = "☆";

export function Stars({
  value,
  onChange,
}: {
  value: number;
  onChange?: (next: number) => void;
}) {
  if (!onChange) {
    return (
      <span className="stars" aria-label={`דירוג ${value} מתוך 5`} title={`${value}/5`}>
        {[1, 2, 3, 4, 5].map((n) => (
          <span key={n} aria-hidden="true" className={n <= value ? "star on" : "star"}>
            {n <= value ? FULL : EMPTY}
          </span>
        ))}
      </span>
    );
  }

  return (
    <span className="stars" role="group" aria-label="דירוג">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          className={n <= value ? "star on" : "star"}
          aria-label={`${n} כוכבים`}
          aria-pressed={n <= value}
          // Click the current rating to clear it back to zero.
          onClick={() => onChange(value === n ? 0 : n)}
        >
          {n <= value ? FULL : EMPTY}
        </button>
      ))}
    </span>
  );
}
