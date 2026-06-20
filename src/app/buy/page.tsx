"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/store/store";
import {
  STATUSES,
  STATUS_LABELS,
  type Apartment,
  type ApartmentDraft,
  type Status,
} from "@/lib/types";
import { ApartmentTable } from "@/components/ApartmentTable";
import { ApartmentDialog } from "@/components/ApartmentDialog";
import { StatsBar } from "@/components/StatsBar";
import { CompareView } from "@/components/CompareView";
import { Dedication } from "@/components/Dedication";
import { HouseSprite } from "@/components/art";

type Filter = Status | "all";

export default function Home() {
  const { apartments, settings } = useStore();
  const { items, hydrated, add, update, remove } = apartments;

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Apartment | null>(null);

  const visible = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("he");
    return items.filter((a) => {
      if (filter !== "all" && a.status !== filter) return false;
      if (!q) return true;
      return [a.nickname, a.city, a.address, a.contact, a.notes, ...a.pros, ...a.cons]
        .join(" ")
        .toLocaleLowerCase("he")
        .includes(q);
    });
  }, [items, query, filter]);

  // Selected apartments, in the order they appear in the full list.
  const selected = useMemo(
    () => items.filter((a) => selectedIds.has(a.id)),
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

  function openEdit(a: Apartment) {
    setEditing(a);
    setDialogOpen(true);
  }

  function handleSave(draft: ApartmentDraft) {
    if (editing) update(editing.id, draft);
    else add(draft);
    setDialogOpen(false);
    setEditing(null);
  }

  function handleDelete(a: Apartment) {
    if (window.confirm(`למחוק את "${a.nickname}"? הפעולה אינה ניתנת לביטול.`)) {
      remove(a.id);
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(a.id);
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
      offer: 0,
      rejected: 0,
    };
    for (const a of items) c[a.status] += 1;
    return c;
  }, [items]);

  return (
    <main id="main" tabIndex={-1} className="container">
      <StatsBar items={visible} settings={settings.settings} />

      <section className="toolbar" aria-label="כלים">
        <div className="search">
          <label htmlFor="search" className="visually-hidden">
            חיפוש דירות
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
          {STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              className={filter === s ? "chip on" : "chip"}
              aria-pressed={filter === s}
              onClick={() => setFilter(s)}
            >
              {STATUS_LABELS[s]} <span className="chip-count">{counts[s]}</span>
            </button>
          ))}
        </div>

        <div className="toolbar-actions">
          <button type="button" className="btn" onClick={openAdd}>
            + הוספת דירה
          </button>
        </div>
      </section>

      {selected.length >= 2 ? (
        <CompareView
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
            <HouseSprite cell={9} />
          </div>
          <h2>הרשימה עדיין ריקה</h2>
          <p className="muted">
            הוסיפו את הדירה הראשונה שראיתם. כל המידע נשמר מקומית
            במכשיר שלכם בלבד, שום דבר לא יוצא ממנו.
          </p>
          <button type="button" className="btn" onClick={openAdd}>
            הוספת הדירה הראשונה
          </button>
        </div>
      ) : visible.length === 0 ? (
        <p className="muted pad">אין דירות שמתאימות לסינון. נסו לסנן אחרת.</p>
      ) : (
        <ApartmentTable
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

      <ApartmentDialog
        open={dialogOpen}
        initial={editing}
        onClose={() => {
          setDialogOpen(false);
          setEditing(null);
        }}
        onSave={handleSave}
      />
    </main>
  );
}
