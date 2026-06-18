import { STATUS_LABELS, type Status } from "@/lib/types";

// Colored pill for a listing's status. Color is driven by a data attribute so
// the palette lives in CSS (globals.css) next to the rest of the theme.
// Apartments call it with just a Status (label looked up from STATUS_LABELS);
// rentals pass an explicit label since their status set has its own wording.
export function StatusBadge({ status, label }: { status: string; label?: string }) {
  return (
    <span className="badge" data-status={status}>
      {label ?? STATUS_LABELS[status as Status]}
    </span>
  );
}
