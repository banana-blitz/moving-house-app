import { useEffect, useMemo, useState } from "react";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  doc,
  setDoc,
  onSnapshot,
  getDoc,
  serverTimestamp
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCuI-ozA7qrQR7-CuY9c9wHl4MLsZuJoo",
  authDomain: "moving-house-36edb.firebaseapp.com",
  projectId: "moving-house-36edb",
  storageBucket: "moving-house-36edb.firebasestorage.app",
  messagingSenderId: "427501826897",
  appId: "1:427501826897:web:0e6dfe2d956f2a47c69970"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const BOARD_REF = doc(db, "boards", "main-moving-board");

const INITIAL_TASKS = [
  { area: "old", areaLabel: "דירה נוכחית", category: "תיעוד וסגירה", task: "צילום הדירה שלא נקבל הפתעות", priority: "גבוה", timing: "לפני מסירה", source: "מקורי" },
  { area: "old", areaLabel: "דירה נוכחית", category: "בטחונות ומסמכים", task: "לקחת מבעלת הדירה הנוכחית שטר חוב על סך 75 אלף", priority: "גבוה", timing: "לפני סגירה", source: "מקורי" },
  { area: "old", areaLabel: "דירה נוכחית", category: "בטחונות ומסמכים", task: "לקחת / להסדיר ערבויות מול בעלת הדירה הנוכחית", priority: "גבוה", timing: "לפני סגירה", source: "מקורי" },
  { area: "old", areaLabel: "דירה נוכחית", category: "בטחונות ומסמכים", task: "לקחת שיקים לכל החשבונות שהיו: חשמל, מים, ארנונה", priority: "גבוה", timing: "לפני סגירה", source: "מקורי" },
  { area: "old", areaLabel: "דירה נוכחית", category: "מה נשאר בדירה", task: "להחליט / לתאם האם משאירים ארונות", priority: "בינוני", timing: "לפני מעבר", source: "מקורי" },
  { area: "old", areaLabel: "דירה נוכחית", category: "מה נשאר בדירה", task: "להחליט / לתאם האם משאירים מדיח", priority: "בינוני", timing: "לפני מעבר", source: "מקורי" },
  { area: "old", areaLabel: "דירה נוכחית", category: "ניתוקים", task: "לנתק חשמל מהשם שלי", priority: "גבוה", timing: "סמוך לעזיבה", source: "מקורי" },
  { area: "old", areaLabel: "דירה נוכחית", category: "ניתוקים", task: "לנתק מים מהשם שלי", priority: "גבוה", timing: "סמוך לעזיבה", source: "מקורי" },
  { area: "old", areaLabel: "דירה נוכחית", category: "ניתוקים", task: "לנתק ארנונה מהשם שלי", priority: "גבוה", timing: "סמוך לעזיבה", source: "מקורי" },
  { area: "old", areaLabel: "דירה נוכחית", category: "ניתוקים", task: "לנתק / לסגור ועד בית", priority: "גבוה", timing: "סמוך לעזיבה", source: "מקורי" },
  { area: "old", areaLabel: "דירה נוכחית", category: "מול יפה", task: "יפה — לעדכן עד 14.5 אם יש מחליפים או אין", priority: "גבוה", timing: "14.5", source: "מקורי" },
  { area: "old", areaLabel: "דירה נוכחית", category: "תיקונים", task: "לבדוק אם צריך לצבוע דירה או שיפה אמרה שנסתדר", priority: "בינוני", timing: "לפני מסירה", source: "מקורי" },
  { area: "old", areaLabel: "דירה נוכחית", category: "תיקונים", task: "ממ״ד — לתקן סגירה", priority: "בינוני", timing: "לפני מסירה", source: "מקורי" },
  { area: "old", areaLabel: "דירה נוכחית", category: "תיקונים", task: "מטבח — להחליף מנורה קטנה פאן", priority: "נמוך", timing: "לפני מסירה", source: "מקורי" },
  { area: "old", areaLabel: "דירה נוכחית", category: "תיקונים", task: "ברז כיור חדר שינה — יצא מהמקום", priority: "נמוך", timing: "לפני מסירה", source: "מקורי" },

  { area: "new", areaLabel: "דירה חדשה", category: "ליאם / מסגרת", task: "בייבי קלאב — להעביר לסניף החדש; אמרו ב־13.5 שיש מקום", priority: "גבוה", timing: "בהקדם", source: "מקורי" },
  { area: "new", areaLabel: "דירה חדשה", category: "חוזה ותשלומים", task: "מאיר בעל דירה — ממתין לחוזה סופי", priority: "גבוה", timing: "בהקדם", source: "מקורי" },
  { area: "new", areaLabel: "דירה חדשה", category: "חוזה ותשלומים", task: "אייל — ממתין לגבי דמי תיווך כמה", priority: "גבוה", timing: "בהקדם", source: "מקורי" },
  { area: "new", areaLabel: "דירה חדשה", category: "תאריכים", task: "חוזה בדירה קיימת נגמר ב־15.6", priority: "גבוה", timing: "תזכורת", source: "מקורי" },
  { area: "new", areaLabel: "דירה חדשה", category: "תאריכים", task: "דירה חדשה ניתן להיכנס כבר ב־1.6", priority: "גבוה", timing: "תזכורת", source: "מקורי" },
  { area: "new", areaLabel: "דירה חדשה", category: "רואת חשבון", task: "עדכונים למס הכנסה, ביטוח לאומי וכל מה שקשור במעבר דירה", priority: "בינוני", timing: "אחרי חוזה", source: "מקורי" },
  { area: "new", areaLabel: "דירה חדשה", category: "רואת חשבון", task: "לשאול אם אפשר לקבל החזרים על דמי תיווך, שכר דירה וכו׳", priority: "בינוני", timing: "אחרי חוזה", source: "מקורי" },
  { area: "new", areaLabel: "דירה חדשה", category: "דוחות", task: "בדוחות לשנות את העלויות החדשות של כל הדירה החדשה", priority: "בינוני", timing: "אחרי חוזה", source: "מקורי" },
  { area: "new", areaLabel: "דירה חדשה", category: "שינוי כתובת", task: "כתובת דואר — לשנות לאזור החדש", priority: "בינוני", timing: "אחרי מעבר", source: "מקורי" },
  { area: "new", areaLabel: "דירה חדשה", category: "שינוי כתובת", task: "אוטו / רכב — לשנות לאזור החדש", priority: "בינוני", timing: "אחרי מעבר", source: "מקורי" },
  { area: "new", areaLabel: "דירה חדשה", category: "שינוי כתובת", task: "תושב / משרד הפנים — לשנות לאזור החדש", priority: "בינוני", timing: "אחרי מעבר", source: "מקורי" },
  { area: "new", areaLabel: "דירה חדשה", category: "הובלה", task: "מובילים + פירוק והרכבה — להתחיל לחפש ולבדוק מה עושים", priority: "גבוה", timing: "בהקדם", source: "מקורי" },
  { area: "new", areaLabel: "דירה חדשה", category: "חוזה ותשלומים", task: "להכין 12 צ׳קים לדירה החדשה", priority: "גבוה", timing: "לפני חתימה/כניסה", source: "מקורי" },
  { area: "new", areaLabel: "דירה חדשה", category: "חוזה ותשלומים", task: "להכין צ׳ק ביטחון / שטר חוב / ערבויות", priority: "גבוה", timing: "לפני חתימה/כניסה", source: "מקורי" },
  { area: "new", areaLabel: "דירה חדשה", category: "לפני כניסה", task: "חברת ניקיון לדירה החדשה", priority: "גבוה", timing: "לפני 1.6", source: "מקורי" },
  { area: "new", areaLabel: "דירה חדשה", category: "לפני כניסה", task: "ריסוס לדירה החדשה", priority: "גבוה", timing: "לפני 1.6", source: "מקורי" },
  { area: "new", areaLabel: "דירה חדשה", category: "לפני כניסה", task: "לראות שיש מנעול חדש", priority: "גבוה", timing: "לפני כניסה", source: "מקורי" },
  { area: "new", areaLabel: "דירה חדשה", category: "לפני כניסה", task: "אמר שיש רשתות כבר — לבדוק בפועל", priority: "בינוני", timing: "לפני כניסה", source: "מקורי" },
  { area: "new", areaLabel: "דירה חדשה", category: "לפני כניסה", task: "לבדוק כיריים", priority: "בינוני", timing: "לפני כניסה", source: "מקורי" },
  { area: "new", areaLabel: "דירה חדשה", category: "לפני כניסה", task: "לבדוק מנורות בכל הבית", priority: "בינוני", timing: "לפני כניסה", source: "מקורי" },
  { area: "new", areaLabel: "דירה חדשה", category: "לפני כניסה", task: "לדבר מול אשתו לגבי רשתות / כיריים / מנורות", priority: "בינוני", timing: "לפני כניסה", source: "מקורי" },
  { area: "new", areaLabel: "דירה חדשה", category: "התקנות", task: "להזמין את יניב להתקין הכל על הקירות או לבקש מהמובילים", priority: "בינוני", timing: "אחרי כניסה", source: "מקורי" },
  { area: "new", areaLabel: "דירה חדשה", category: "קניות שימושיות", task: "דייסון או סוג של שואב חדש לבית", priority: "נמוך", timing: "בהמשך", source: "מקורי" },
  { area: "new", areaLabel: "דירה חדשה", category: "תשתיות", task: "להעביר את סלקום לדירה החדשה — אינטרנט והכל", priority: "גבוה", timing: "לפני/ביום כניסה", source: "מקורי" },
  { area: "new", areaLabel: "דירה חדשה", category: "אריזות", task: "לחפש קרטונים להתחיל לארוז", priority: "גבוה", timing: "עכשיו", source: "מקורי" },
  { area: "new", areaLabel: "דירה חדשה", category: "שינוי כתובת", task: "קופת חולים — להעביר לכתובת החדשה", priority: "בינוני", timing: "אחרי מעבר", source: "מקורי" },
  { area: "new", areaLabel: "דירה חדשה", category: "שינוי כתובת", task: "סלקום — להעביר לכתובת החדשה", priority: "בינוני", timing: "אחרי/לפני מעבר", source: "מקורי" },
  { area: "new", areaLabel: "דירה חדשה", category: "שינוי כתובת", task: "משרד הפנים — להעביר לכתובת החדשה", priority: "בינוני", timing: "אחרי מעבר", source: "מקורי" },
  { area: "new", areaLabel: "דירה חדשה", category: "שינוי כתובת", task: "כרטיסי אשראי — להעביר לכתובת החדשה", priority: "בינוני", timing: "אחרי מעבר", source: "מקורי" },
  { area: "new", areaLabel: "דירה חדשה", category: "בדיקות לפני כניסה", task: "לצלם מצב דירה חדשה לפני כניסה", priority: "גבוה", timing: "ביום קבלת מפתח", source: "תוספת" },
  { area: "new", areaLabel: "דירה חדשה", category: "בדיקות לפני כניסה", task: "לצלם מוני מים/חשמל בכניסה", priority: "גבוה", timing: "ביום קבלת מפתח", source: "תוספת" },
  { area: "new", areaLabel: "דירה חדשה", category: "בדיקות לפני כניסה", task: "לבדוק מים חמים, לחץ מים ונזילות", priority: "בינוני", timing: "לפני/ביום כניסה", source: "תוספת" },
  { area: "new", areaLabel: "דירה חדשה", category: "בדיקות לפני כניסה", task: "לבדוק חשמל, מזגנים, תריסים וחלונות", priority: "בינוני", timing: "לפני/ביום כניסה", source: "תוספת" },
  { area: "new", areaLabel: "דירה חדשה", category: "בטיחות", task: "לבדוק ביטוח דירה / צד ג׳", priority: "בינוני", timing: "אחרי חוזה", source: "תוספת" },
  { area: "new", areaLabel: "דירה חדשה", category: "אריזות", task: "לסמן קרטונים לפי חדרים", priority: "בינוני", timing: "בזמן אריזה", source: "תוספת" },
  { area: "new", areaLabel: "דירה חדשה", category: "אריזות", task: "להכין קרטון לילה ראשון", priority: "גבוה", timing: "לפני הובלה", source: "תוספת" },

  { area: "shopping", areaLabel: "קניות", category: "ליאם", task: "ליאם — מיטה חדשה או לראות שאפשר להנמיך", priority: "בינוני", timing: "בהמשך", source: "מקורי" },
  { area: "shopping", areaLabel: "קניות", category: "ליאם", task: "חסימת מגירות / הגנת שקעים — ליאם", priority: "גבוה", timing: "לפני/מיד אחרי כניסה", source: "מקורי" },
  { area: "shopping", areaLabel: "קניות", category: "סלון", task: "מזנון חדש", priority: "נמוך", timing: "בהמשך", source: "מקורי" },
  { area: "shopping", areaLabel: "קניות", category: "אחסון", task: "ארונות", priority: "נמוך", timing: "בהמשך", source: "מקורי" },
  { area: "shopping", areaLabel: "קניות", category: "סלון", task: "טלוויזיה נוספת לסלון", priority: "נמוך", timing: "בהמשך", source: "מקורי" },
  { area: "shopping", areaLabel: "קניות", category: "מרפסת", task: "ריהוט למרפסת", priority: "נמוך", timing: "בהמשך", source: "מקורי" },
  { area: "shopping", areaLabel: "קניות", category: "מרפסת", task: "מנגל", priority: "נמוך", timing: "בהמשך", source: "מקורי" },
  { area: "shopping", areaLabel: "קניות", category: "תאורה", task: "תאורה נוספת תחתונה", priority: "נמוך", timing: "בהמשך", source: "מקורי" }
].map((item, index) => ({ id: index + 1, status: "לא התחיל", noteOpen: false, owner: "", notes: "", ...item }));

const TABS = [
  { id: "today", label: "דחוף", icon: "🔥" },
  { id: "new", label: "חדשה", icon: "🏠" },
  { id: "old", label: "נוכחית", icon: "📦" },
  { id: "shopping", label: "קניות", icon: "🛒" },
  { id: "done", label: "בוצע", icon: "✅" }
];

const nextStatus = { "לא התחיל": "בטיפול", "בטיפול": "בוצע", "בוצע": "לא התחיל" };

function statusClasses(status) {
  if (status === "בוצע") return "bg-emerald-50 border-emerald-200 text-emerald-700";
  if (status === "בטיפול") return "bg-amber-50 border-amber-200 text-amber-700";
  return "bg-rose-50 border-rose-200 text-rose-700";
}

function groupTasks(tasks) {
  return tasks.reduce((acc, task) => {
    acc[task.category] = acc[task.category] || [];
    acc[task.category].push(task);
    return acc;
  }, {});
}

export default function MovingChecklistApp() {
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [tab, setTab] = useState("today");
  const [query, setQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [syncStatus, setSyncStatus] = useState("מתחבר...");

  useEffect(() => {
    let unsubscribe = () => {};

    async function connect() {
      try {
        const snap = await getDoc(BOARD_REF);

        if (!snap.exists()) {
          await setDoc(BOARD_REF, {
            tasks: INITIAL_TASKS,
            updatedAt: serverTimestamp()
          });
        }

        unsubscribe = onSnapshot(
          BOARD_REF,
          (docSnap) => {
            const data = docSnap.data();
            if (data?.tasks?.length) {
              setTasks(data.tasks);
              setSyncStatus("מסונכרן");
            }
          },
          () => setSyncStatus("שגיאת סנכרון")
        );
      } catch (error) {
        console.error(error);
        setSyncStatus("שגיאת חיבור");
      }
    }

    connect();
    return () => unsubscribe();
  }, []);

  const saveTasks = async (nextTasks) => {
    setTasks(nextTasks);
    setSyncStatus("שומר...");
    try {
      await setDoc(BOARD_REF, {
        tasks: nextTasks,
        updatedAt: serverTimestamp()
      });
      setSyncStatus("מסונכרן");
    } catch (error) {
      console.error(error);
      setSyncStatus("שגיאת שמירה");
    }
  };

  const stats = useMemo(() => {
    const total = tasks.length;
    const done = tasks.filter((t) => t.status === "בוצע").length;
    return { total, done, percent: total ? Math.round((done / total) * 100) : 0 };
  }, [tasks]);

  const visibleTasks = useMemo(() => {
    return tasks.filter((task) => {
      const byTab =
        tab === "today" ? task.priority === "גבוה" && task.status !== "בוצע" :
        tab === "done" ? task.status === "בוצע" :
        task.area === tab && task.status !== "בוצע";

      const bySearch = !query.trim() || `${task.task} ${task.category} ${task.timing}`.includes(query.trim());
      return byTab && bySearch;
    });
  }, [tasks, tab, query]);

  const grouped = groupTasks(visibleTasks);

  const updateTask = (id, patch) => {
    const nextTasks = tasks.map((task) => task.id === id ? { ...task, ...patch } : task);
    saveTasks(nextTasks);
  };

  const toggleStatus = (id) => {
    const nextTasks = tasks.map((task) => task.id === id ? { ...task, status: nextStatus[task.status] } : task);
    saveTasks(nextTasks);
  };

  const pageTitle = TABS.find((item) => item.id === tab)?.label || "משימות";

  return (
    <div className="min-h-screen bg-slate-100 text-right pb-24" dir="rtl">
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200">
        <div className="px-4 py-3 max-w-2xl mx-auto">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-lg font-black text-slate-900 leading-tight">מעבר דירה</h1>
              <p className="text-xs text-slate-500 truncate">יכין 4 ➜ הרא״ה 92 · {stats.done}/{stats.total} בוצעו</p>
              <p className="text-[11px] text-emerald-700 font-bold mt-1">{syncStatus}</p>
            </div>
            <button
              onClick={() => setShowSearch((v) => !v)}
              className="h-10 w-10 rounded-full bg-slate-100 border border-slate-200 text-lg shrink-0"
              aria-label="חיפוש"
            >
              🔎
            </button>
          </div>

          <div className="mt-3 flex items-center gap-3">
            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${stats.percent}%` }} />
            </div>
            <span className="text-xs font-black text-slate-700 w-10 text-left">{stats.percent}%</span>
          </div>

          {showSearch && (
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="חיפוש מהיר..."
              className="mt-3 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-slate-300"
            />
          )}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-900">{pageTitle}</h2>
            <p className="text-xs text-slate-500 mt-1">{visibleTasks.length} משימות מוצגות</p>
          </div>
          {query && (
            <button onClick={() => setQuery("")} className="text-xs font-bold bg-white border border-slate-200 rounded-full px-3 py-2">
              ניקוי חיפוש
            </button>
          )}
        </div>

        {visibleTasks.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center text-slate-500">
            אין פה משימות כרגע 🎉
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(grouped).map(([category, items]) => (
              <section key={category}>
                <div className="sticky top-[92px] z-10 -mx-4 px-4 py-2 bg-slate-100/95 backdrop-blur">
                  <h3 className="text-sm font-black text-slate-700">{category}</h3>
                </div>

                <div className="space-y-2">
                  {items.map((task) => (
                    <article key={task.id} className={`rounded-2xl border bg-white overflow-hidden shadow-sm ${task.status === "בוצע" ? "opacity-70" : ""}`}>
                      <div className="p-3">
                        <div className="flex gap-3 items-start">
                          <button
                            onClick={() => toggleStatus(task.id)}
                            className={`mt-1 h-8 w-8 rounded-full border-2 shrink-0 font-black ${task.status === "בוצע" ? "bg-emerald-500 border-emerald-500 text-white" : task.status === "בטיפול" ? "bg-amber-100 border-amber-400 text-amber-700" : "bg-white border-slate-300 text-slate-300"}`}
                            aria-label="שינוי סטטוס"
                          >
                            {task.status === "בוצע" ? "✓" : task.status === "בטיפול" ? "•" : ""}
                          </button>

                          <button onClick={() => toggleStatus(task.id)} className="flex-1 text-right min-w-0">
                            <p className={`text-[15px] leading-6 font-bold ${task.status === "בוצע" ? "line-through text-slate-400" : "text-slate-900"}`}>{task.task}</p>
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              <span className={`text-[10px] px-2 py-1 rounded-full border font-bold ${statusClasses(task.status)}`}>{task.status}</span>
                              <span className="text-[10px] px-2 py-1 rounded-full bg-slate-100 text-slate-600 font-bold">{task.timing}</span>
                              {task.priority === "גבוה" && <span className="text-[10px] px-2 py-1 rounded-full bg-red-600 text-white font-bold">דחוף</span>}
                            </div>
                          </button>
                        </div>

                        <button
                          onClick={() => updateTask(task.id, { noteOpen: !task.noteOpen })}
                          className="mt-2 text-xs font-bold text-slate-500"
                        >
                          {task.noteOpen ? "סגור הערות" : "הערות / אחריות"}
                        </button>
                      </div>

                      {task.noteOpen && (
                        <div className="border-t border-slate-100 bg-slate-50 p-3 space-y-2">
                          <input
                            value={task.owner || ""}
                            onChange={(e) => updateTask(task.id, { owner: e.target.value })}
                            placeholder="אחריות"
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
                          />
                          <input
                            value={task.notes || ""}
                            onChange={(e) => updateTask(task.id, { notes: e.target.value })}
                            placeholder="הערה קצרה"
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
                          />
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-t border-slate-200" dir="rtl">
        <div className="max-w-2xl mx-auto grid grid-cols-5 px-1 py-2">
          {TABS.map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`rounded-2xl py-2 text-center transition ${tab === item.id ? "bg-slate-900 text-white" : "text-slate-500"}`}
            >
              <div className="text-lg leading-none">{item.icon}</div>
              <div className="text-[11px] font-bold mt-1">{item.label}</div>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
