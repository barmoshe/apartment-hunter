"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/store/store";
import {
  RENTAL_STATUSES,
  RENTAL_STATUS_LABELS,
  type Rental,
  type RentalDraft,
  type RentalStatus,
} from "@/lib/types";
import { RentalTable } from "@/components/RentalTable";
import { RentalDialog } from "@/components/RentalDialog";
import { RentalStats } from "@/components/RentalStats";
import { RentalCompare } from "@/components/RentalCompare";
import { Dedication } from "@/components/Dedication";
import { KeySprite } from "@/components/art";

type Filter = RentalStatus | "all";

export default function RentPage() {
  const { rentals, settings } = useStore();
  const { items, hydrated, add, update, remove } = rentals;

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Rental | null>(null);

  const visible = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("he");
    return items.filter((r) => {
      if (filter !== "all" && r.status !== filter) return false;
      if (!q) return true;
      return [r.nickname, r.city, r.address, r.contact, r.notes, ...r.pros, ...r.cons]
        .join(" ")
        .toLocaleLowerCase("he")
        .includes(q);
    });
  }, [items, query, filter]);

  // Selected rentals, in the order they appear in the full list.
  const selected = useMemo(
    () => items.filter((r) => selectedIds.has(r.id)),
    [items, selectedIds],
  );

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function openAdd() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(r: Rental) {
    setEditing(r);
    setDialogOpen(true);
  }

  function handleSave(draft: RentalDraft) {
    if (editing) update(editing.id, draft);
    else add(draft);
    setDialogOpen(false);
    setEditing(null);
  }

  function handleDelete(r: Rental) {
    if (window.confirm(`למחוק את "${r.nickname}"? הפעולה אינה ניתנת לביטול.`)) {
      remove(r.id);
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(r.id);
        return next;
      });
    }
  }

  // Status filter counts, so the chips show how many sit in each bucket.
  const counts = useMemo(() => {
    const c: Record<Filter, number> = {
      all: items.length,
      "to-see": 0,
      seen: 0,
      shortlist: 0,
      rejected: 0,
      signed: 0,
    };
    for (const r of items) c[r.status] += 1;
    return c;
  }, [items]);

  return (
    <main id="main" tabIndex={-1} className="container">
      <RentalStats items={visible} settings={settings.settings} />

      <section className="toolbar" aria-label="כלים">
        <div className="search">
          <label htmlFor="search" className="visually-hidden">
            חיפוש דירות להשכרה
          </label>
          <input
            id="search"
            type="search"
            placeholder="חיפוש לפי כינוי, עיר, כתובת או הערה..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="filters" role="group" aria-label="סינון לפי סטטוס">
          <button
            type="button"
            className={filter === "all" ? "chip on" : "chip"}
            aria-pressed={filter === "all"}
            onClick={() => setFilter("all")}
          >
            הכל <span className="chip-count">{counts.all}</span>
          </button>
          {RENTAL_STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              className={filter === s ? "chip on" : "chip"}
              aria-pressed={filter === s}
              onClick={() => setFilter(s)}
            >
              {RENTAL_STATUS_LABELS[s]} <span className="chip-count">{counts[s]}</span>
            </button>
          ))}
        </div>

        <div className="toolbar-actions">
          <button type="button" className="btn" onClick={openAdd}>
            + הוספת דירה להשכרה
          </button>
        </div>
      </section>

      {selected.length >= 2 ? (
        <RentalCompare
          items={selected}
          settings={settings.settings}
          onClear={() => setSelectedIds(new Set())}
        />
      ) : selectedIds.size === 1 ? (
        <p className="muted pad compare-hint">
          סמנו עוד דירה כדי להשוות זו לצד זו.
        </p>
      ) : null}

      {!hydrated ? (
        <p className="muted pad">טוען נתונים…</p>
      ) : items.length === 0 ? (
        <div className="empty card">
          <div className="empty-art" aria-hidden="true">
            <KeySprite cell={9} />
          </div>
          <h2>אין עדיין דירות להשכרה</h2>
          <p className="muted">
            כאן עוקבים אחרי דירות לשכירות: שכר הדירה, הפיקדון, תנאי החוזה והעלות
            החודשית הכוללת. בואו נוסיף את הדירה הראשונה. הכול נשמר מקומית
            במכשיר שלכם בלבד.
          </p>
          <button type="button" className="btn" onClick={openAdd}>
            הוספת הדירה הראשונה
          </button>
        </div>
      ) : visible.length === 0 ? (
        <p className="muted pad">אין דירות שמתאימות לסינון. נסו לסנן אחרת.</p>
      ) : (
        <RentalTable
          items={visible}
          settings={settings.settings}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelect}
          onEdit={openEdit}
          onDelete={handleDelete}
        />
      )}

      <p className="privacy-note muted">
        כל הנתונים נשמרים מקומית בדפדפן של המכשיר הזה בלבד. כדאי לשמור גיבוי מדי פעם.
      </p>
      <Dedication />

      <RentalDialog
        open={dialogOpen}
        initial={editing}
        settings={settings.settings}
        onClose={() => {
          setDialogOpen(false);
          setEditing(null);
        }}
        onSave={handleSave}
      />
    </main>
  );
}
