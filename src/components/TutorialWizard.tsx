"use client";

import { useEffect, useRef, useState } from "react";
import { SpiritMascot } from "./art";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";

const KEY = "dira:welcome:v2";

// Fired by the app-bar help button to reopen the tutorial on demand.
export const OPEN_TUTORIAL_EVENT = "dira:open-tutorial";

type Step = { title: string; body: string };

const STEPS: Step[] = [
  {
    title: "ברוכים הבאים!",
    body: "נעים להכיר! «דירה» מרכזת את כל הדירות שתראו במקום אחד, כדי שתשוו בראש שקט ותמצאו את הבית המושלם. הסיור קצרצר, מבטיחים.",
  },
  {
    title: "שני מסלולים: קנייה ושכירות",
    body: "למעלה יש מתג «קנייה | שכירות». מסלול הקנייה עוקב אחרי דירות לרכישה, העלות הכוללת והמשכנתאות. מסלול השכירות עוקב אחרי דירות לשכירות והעלות החודשית. לכל מסלול רשימה, שדות והשוואה משלו, כדי לנהל את שני החיפושים בלי לבלבל ביניהם.",
  },
  {
    title: "מתעדים כל דירה",
    body: "אחרי כל ביקור, הוסיפו את הדירה בכפתור «+ הוספת דירה»: מחיר, חדרים, שטח, מצב ותוספות, ואיך הרגשתם, יתרונות, חסרונות ודירוג בכוכבים. ככה שום פרט לא נשכח.",
  },
  {
    title: "משווים זו לצד זו",
    body: "סמנו שתי דירות או יותר, ו«דירה» תפרוס אותן בטבלה אחת. המחיר, המחיר למ״ר והעלות הכוללת הזולים ביותר יודגשו, כדי שתראו במבט אחד מי מובילה.",
  },
  {
    title: "העלות האמיתית, לא רק המחיר",
    body: "בלשונית «משכנתאות» נחשב לכם את העלות הכוללת: מחיר, מס רכישה ועלויות נלוות, ונשווה הצעות משכנתא עם החזר חודשי וריבית. ככה תדעו כמה הבית באמת עולה.",
  },
  {
    title: "גיבוי ושחזור: אל תאבדו את הנתונים",
    body: "חשוב! כל המידע נשמר רק בדפדפן של המכשיר הזה. בכפתור הגיבוי «⤓» שבסרגל העליון שומרים קובץ עם כל הדירות וההצעות, ובכפתור השחזור «⤒» טוענים אותו בחזרה. שמרו גיבוי מדי פעם וקובץ אחד במקום בטוח (מייל לעצמכם או הענן), והמשיכו לעבוד תמיד מאותו דפדפן ומכשיר. אם תנקו את נתוני הדפדפן או תעברו מכשיר בלי גיבוי, הכול יימחק.",
  },
  {
    title: "הכול נשאר אצלכם",
    body: "המידע פרטי לחלוטין ונשאר רק אצלכם, בלי חשבון ובלי שרת. המשיכו להיכנס ולעדכן את «דירה» לאורך כל החיפוש, ושתמצאו את הבית שתאהבו. בהצלחה!",
  },
];

// A multi-step onboarding "wizard" — a modal overlay that guides the user
// through the app on first run, and can be reopened later from the help button.
export function TutorialWizard() {
  const ref = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  useBodyScrollLock(open);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    if (localStorage.getItem(KEY) !== "dismissed") setOpen(true);
    /* eslint-enable react-hooks/set-state-in-effect */
    const reopen = () => {
      setStep(0);
      setOpen(true);
    };
    window.addEventListener(OPEN_TUTORIAL_EVENT, reopen);
    return () => window.removeEventListener(OPEN_TUTORIAL_EVENT, reopen);
  }, []);

  // Drive the native dialog from React state.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  function finish() {
    try {
      localStorage.setItem(KEY, "dismissed");
    } catch {}
    setOpen(false);
  }

  const isLast = step === STEPS.length - 1;
  const s = STEPS[step];

  return (
    <dialog ref={ref} className="dialog tutorial" onClose={() => setOpen(false)} aria-label="מדריך">
      <button type="button" className="tut-skip" onClick={finish}>
        דלג
      </button>
      <div className="tut">
        <div className="tut-art bob" aria-hidden="true">
          <SpiritMascot cell={9} />
        </div>
        <span className="tut-step">שלב {step + 1} מתוך {STEPS.length}</span>
        <h2 className="tut-title">{s.title}</h2>
        <p className="tut-body">{s.body}</p>

        <div className="tut-dots" aria-hidden="true">
          {STEPS.map((_, i) => (
            <span key={i} className={i === step ? "tut-dot on" : "tut-dot"} />
          ))}
        </div>

        <div className="tut-nav">
          {step > 0 ? (
            <button type="button" className="btn btn-ghost" onClick={() => setStep((n) => n - 1)}>
              הקודם
            </button>
          ) : (
            <span />
          )}
          {isLast ? (
            <button type="button" className="btn" onClick={finish}>
              בואו נתחיל
            </button>
          ) : (
            <button type="button" className="btn" onClick={() => setStep((n) => n + 1)}>
              הבא
            </button>
          )}
        </div>
      </div>
    </dialog>
  );
}
