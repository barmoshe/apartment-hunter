"use client";

import { useState } from "react";
import { useStore } from "@/store/store";
import type { MortgageDraft, MortgageOffer } from "@/lib/types";
import { FinancingPanel } from "@/components/FinancingPanel";
import { MortgageTable } from "@/components/MortgageTable";
import { MortgageDialog } from "@/components/MortgageDialog";
import { CoinSprite } from "@/components/art";
import { Dedication } from "@/components/Dedication";

export default function MortgagePage() {
  const { apartments, mortgages, settings } = useStore();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<MortgageOffer | null>(null);

  function openAdd() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(m: MortgageOffer) {
    setEditing(m);
    setDialogOpen(true);
  }

  function handleSave(draft: MortgageDraft) {
    if (editing) mortgages.update(editing.id, draft);
    else mortgages.add(draft);
    setDialogOpen(false);
    setEditing(null);
  }

  function handleDelete(m: MortgageOffer) {
    if (window.confirm(`למחוק את "${m.label}"?`)) mortgages.remove(m.id);
  }

  return (
    <main id="main" tabIndex={-1} className="container">
      <FinancingPanel apartments={apartments.items} settings={settings.settings} />

      <section className="toolbar" aria-label="הצעות משכנתא">
        <h2 className="section-title">הצעות משכנתא</h2>
        <div className="toolbar-actions">
          <button type="button" className="btn" onClick={openAdd}>
            + הוספת הצעה
          </button>
        </div>
      </section>

      {!mortgages.hydrated ? (
        <p className="muted pad">טוען נתונים…</p>
      ) : mortgages.items.length === 0 ? (
        <div className="empty card">
          <div className="empty-art" aria-hidden="true">
            <CoinSprite cell={9} />
          </div>
          <h2>הספר עדיין ריק</h2>
          <p className="muted">
            הוסיפו הצעות מכמה בנקים כדי להשוות החזר חודשי, סך הריבית וסך ההחזר,
            ולבחור את העסקה המשתלמת ביותר.
          </p>
          <button type="button" className="btn" onClick={openAdd}>
            הוספת ההצעה הראשונה
          </button>
        </div>
      ) : (
        <MortgageTable
          items={mortgages.items}
          apartments={apartments.items}
          onEdit={openEdit}
          onDelete={handleDelete}
        />
      )}

      <p className="privacy-note muted">
        כל הנתונים נשמרים מקומית בדפדפן של המכשיר הזה בלבד. כדאי לשמור גיבוי מדי פעם.
      </p>
      <Dedication />

      <MortgageDialog
        open={dialogOpen}
        initial={editing}
        apartments={apartments.items}
        onClose={() => {
          setDialogOpen(false);
          setEditing(null);
        }}
        onSave={handleSave}
      />
    </main>
  );
}
