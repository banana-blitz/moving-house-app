import { useEffect, useMemo, useState } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, onSnapshot, getDoc, serverTimestamp } from "firebase/firestore";
import { INITIAL_TASKS } from "./tasks.js";

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

const TABS = [
  { id: "today", label: "דחוף", icon: "🔥" },
  { id: "new", label: "חדשה", icon: "🏠" },
  { id: "old", label: "נוכחית", icon: "📦" },
  { id: "shopping", label: "קניות", icon: "🛒" },
  { id: "done", label: "בוצע", icon: "✅" }
];

const nextStatus = { "לא התחיל": "בטיפול", "בטיפול": "בוצע", "בוצע": "לא התחיל" };

function statusClass(status) {
  if (status === "בוצע") return "done-status";
  if (status === "בטיפול") return "in-progress";
  return "not-started";
}

function groupTasks(tasks) {
  return tasks.reduce((acc, task) => {
    acc[task.category] = acc[task.category] || [];
    acc[task.category].push(task);
    return acc;
  }, {});
}

export default function App() {
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
          await setDoc(BOARD_REF, { tasks: INITIAL_TASKS, updatedAt: serverTimestamp() });
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

  async function saveTasks(nextTasks) {
    setTasks(nextTasks);
    setSyncStatus("שומר...");
    try {
      await setDoc(BOARD_REF, { tasks: nextTasks, updatedAt: serverTimestamp() });
      setSyncStatus("מסונכרן");
    } catch (error) {
      console.error(error);
      setSyncStatus("שגיאת שמירה");
    }
  }

  const stats = useMemo(() => {
    const total = tasks.length;
    const done = tasks.filter((task) => task.status === "בוצע").length;
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
  const pageTitle = TABS.find((item) => item.id === tab)?.label || "משימות";

  function updateTask(id, patch) {
    saveTasks(tasks.map((task) => task.id === id ? { ...task, ...patch } : task));
  }

  function toggleStatus(id) {
    saveTasks(tasks.map((task) => task.id === id ? { ...task, status: nextStatus[task.status] } : task));
  }

  return (
    <div className="app" dir="rtl">
      <header className="header">
        <div className="header-inner">
          <div className="header-row">
            <div>
              <h1 className="title">מעבר דירה</h1>
              <p className="subtitle">יכין 4 ➜ הרא״ה 92 · {stats.done}/{stats.total} בוצעו</p>
              <p className="sync">{syncStatus}</p>
            </div>
            <button onClick={() => setShowSearch((value) => !value)} className="search-toggle" aria-label="חיפוש">🔎</button>
          </div>

          <div className="progress-row">
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${stats.percent}%` }} />
            </div>
            <span className="progress-number">{stats.percent}%</span>
          </div>

          {showSearch && (
            <input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="חיפוש מהיר..."
              className="search-input"
            />
          )}
        </div>
      </header>

      <main className="main">
        <div className="page-heading">
          <div>
            <h2>{pageTitle}</h2>
            <p className="count">{visibleTasks.length} משימות מוצגות</p>
          </div>
          {query && <button onClick={() => setQuery("")} className="clear-search">ניקוי חיפוש</button>}
        </div>

        {visibleTasks.length === 0 ? (
          <div className="empty">אין פה משימות כרגע 🎉</div>
        ) : (
          <div className="sections">
            {Object.entries(grouped).map(([category, items]) => (
              <section key={category}>
                <h3 className="category-title">{category}</h3>
                <div className="cards">
                  {items.map((task) => (
                    <article key={task.id} className={`card ${task.status === "בוצע" ? "done" : ""}`}>
                      <div className="card-main">
                        <div className="task-row">
                          <button
                            onClick={() => toggleStatus(task.id)}
                            className={`status-dot ${task.status === "בוצע" ? "done" : task.status === "בטיפול" ? "progress" : ""}`}
                            aria-label="שינוי סטטוס"
                          >
                            {task.status === "בוצע" ? "✓" : task.status === "בטיפול" ? "•" : ""}
                          </button>

                          <button onClick={() => toggleStatus(task.id)} className="task-content">
                            <p className={`task-text ${task.status === "בוצע" ? "done" : ""}`}>{task.task}</p>
                            <div className="badges">
                              <span className={`badge ${statusClass(task.status)}`}>{task.status}</span>
                              <span className="badge time">{task.timing}</span>
                              {task.priority === "גבוה" && <span className="badge urgent">דחוף</span>}
                            </div>
                          </button>
                        </div>

                        <button onClick={() => updateTask(task.id, { noteOpen: !task.noteOpen })} className="note-toggle">
                          {task.noteOpen ? "סגור הערות" : "הערות / אחריות"}
                        </button>
                      </div>

                      {task.noteOpen && (
                        <div className="notes">
                          <input value={task.owner || ""} onChange={(event) => updateTask(task.id, { owner: event.target.value })} placeholder="אחריות" />
                          <input value={task.notes || ""} onChange={(event) => updateTask(task.id, { notes: event.target.value })} placeholder="הערה קצרה" />
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

      <nav className="nav">
        <div className="nav-inner">
          {TABS.map((item) => (
            <button key={item.id} onClick={() => setTab(item.id)} className={`nav-button ${tab === item.id ? "active" : ""}`}>
              <div className="nav-icon">{item.icon}</div>
              <div className="nav-label">{item.label}</div>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
