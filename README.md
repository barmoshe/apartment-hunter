# דירה (Dira) — ניהול חיפוש נדל״ן

דמו ציבורי לניהול חיפוש דירה: ריכוז כל הדירות שראיתם, השוואה ביניהן, וחישוב
העלות הכוללת והמימון — הכול נשמר מקומית במכשיר שלכם, בלי חשבון ובלי שרת.

A mobile-first, Hebrew/RTL web app for managing a real-estate search, dressed as
a cozy **Stardew-Valley pixel game**. Track every apartment you have seen,
compare a shortlist side by side, and work out the all-in cost (Israeli purchase
tax + closing costs) and the mortgage picture. This is a public demo: it ships
with no data — everything you add stays in your own browser.

## עיצוב

מראה **פיקסל בסגנון Stardew Valley**: לוחות עץ, כפתורי פיקסל, צללים קשיחים,
ספרייטים מצוירים ביד (בית, רוח־עמק, מטבע), פלטת קלף + עץ, ומצב בהיר/כהה. גופן
הפיקסל (Public Pixel, CC0) מוגבל ל־לטינית/ספרות/₪ כדי שכל העברית תישאר קריאה
ב־Rubik. ללא אימוג'י — אייקונים הם ספרייטים או סמלי קו.

## יכולות

- **מדריך פתיחה** — אשף הדרכה מודאלי (multi-step) שמסביר את האפליקציה בכניסה
  הראשונה; ניתן לפתוח שוב מכפתור ה־«?».

- **דירות** — הוספה/עריכה/מחיקה, מיון לפי כל עמודה (כולל ₪/מ״ר ועלות כוללת),
  סינון לפי סטטוס, חיפוש חופשי, דירוג בכוכבים, יתרונות/חסרונות ותוספות
  (מעלית, מרפסת, ממ״ד, חניה, ארנונה, ועד בית).
- **השוואה** — בחירת שתי דירות או יותר והצגתן זו לצד זו, עם הדגשת המחיר,
  ה־₪/מ״ר והעלות הכוללת הנמוכים ביותר.
- **עלות כוללת** — מחיר + מס רכישה (מדרגות 2026, דירה יחידה / נוספת) + עלויות
  נלוות (עו״ד, תיווך, שמאי ועוד), לפי פרופיל הרוכש שמוגדר בהגדרות.
- **משכנתאות** — מחשבון מימון (שיעור מימון מרבי לפי בנק ישראל, הון עצמי נדרש,
  החזר חודשי לפי לוח שפיצר) והשוואת הצעות משכנתא מבנקים שונים.
- **גיבוי ושחזור** — ייצוא/ייבוא של כל הנתונים כקובץ JSON.
- מצב בהיר/כהה, נגישות (ניווט מקלדת, ניגודיות AA).

> כל החישובים הם הערכה להשוואה בלבד ואינם מהווים ייעוץ מס או ייעוץ פיננסי.

## הרצה מקומית

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build + type-check
npm run lint     # ESLint (a11y gate)
```

## סטאק

Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · מערכת עיצוב מבוססת
oklch (ללא Tailwind). אחסון: `localStorage` בלבד. נפרס ב־Vercel.

## CI/CD

- **CI** — GitHub Actions (`.github/workflows/ci.yml`): על כל push ל־`main` וכל PR
  רץ lint + type-check + production build.
- **CD** — אינטגרציית ה־Git של Vercel: push ל־`main` מפרסם אוטומטית ל־production,
  ו־PR מקבל preview URL. אין צורך בסודות/טוקנים ב־Actions.
