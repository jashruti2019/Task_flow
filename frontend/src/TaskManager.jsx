// TaskManager.jsx
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./TaskManager.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

/* ---------------------------------------
   DATE HELPERS — 100% LOCAL (NO TIMEZONE SHIFT)
---------------------------------------- */

function parseDateSafe(dateStr) {
  if (!dateStr) return null;

  // yyyy-mm-dd format
  const only = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
  if (only) return new Date(+only[1], +only[2] - 1, +only[3]);

  // ISO format → strip T + timezone
  if (dateStr.includes("T")) {
    const d = dateStr.split("T")[0];
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(d);
    if (m) return new Date(+m[1], +m[2] - 1, +m[3]);
  }

  // fallback
  const d = new Date(dateStr);
  if (isNaN(d)) return null;
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function isoLocalKey(dateStr) {
  const d = parseDateSafe(dateStr);
  if (!d) return null;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

function daysBetween(dateStr) {
  const d = parseDateSafe(dateStr);
  if (!d) return null;
  const today = new Date();
  const a = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const b = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  return Math.floor((b - a) / (1000 * 60 * 60 * 24));
}

function formatDateISO(dateStr) {
  const d = parseDateSafe(dateStr);
  return d ? d.toLocaleDateString() : "—";
}

/* ---------------------------------------
   COMPONENT
---------------------------------------- */

export default function TaskManager() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    due_date: "",
    status: "pending",
  });

  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("created_desc");

  const [timelineWindowDays] = useState(7);

  /* LOAD TASKS */
  useEffect(() => {
    loadTasks();
  }, []);

  async function loadTasks() {
    setLoading(true);
    try {
      const res = await fetch(`${API}/tasks`);
      const data = await res.json();
      setTasks(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("loadTasks", e);
      setTasks([]);
    }
    setLoading(false);
  }

  /* ---------------- MODAL HANDLERS ---------------- */

  function openNewTaskModal() {
    setEditingId(null);
    setForm({ title: "", description: "", due_date: "", status: "pending" });
    setShowModal(true);
  }

  function openEditModal(task) {
    setEditingId(task.id);
    setForm({
      title: task.title || "",
      description: task.description || "",
      due_date: isoLocalKey(task.due_date) || "",
      status: task.status || "pending",
    });
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditingId(null);
  }

  async function saveTask(e) {
    e?.preventDefault?.();

    if (!form.title.trim()) return alert("Title is required");

    setSaving(true);

    try {
      const method = editingId ? "PUT" : "POST";
      const url = editingId ? `${API}/tasks/${editingId}` : `${API}/tasks`;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Save failed");

      await loadTasks();
      closeModal();
    } catch (err) {
      console.error(err);
      alert("Error saving task");
    }
    setSaving(false);
  }

  async function deleteTask(id) {
    if (!confirm("Delete this task?")) return;
    try {
      const res = await fetch(`${API}/tasks/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      await loadTasks();
    } catch (e) {
      alert("Delete failed");
    }
  }

  async function markDone(id) {
    // optimistic UI
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: "done" } : t)));

    try {
      const t = tasks.find((x) => x.id === id);
      if (!t) return;

      const res = await fetch(`${API}/tasks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...t, status: "done" }),
      });

      if (!res.ok) throw new Error();

      await loadTasks();
    } catch {
      await loadTasks();
      alert("Failed");
    }
  }

  /* ---------------- FILTER + SEARCH + SORT ---------------- */

  const counts = useMemo(
    () => ({
      total: tasks.length,
      pending: tasks.filter((t) => t.status === "pending").length,
      inProgress: tasks.filter((t) => t.status === "in-progress").length,
      done: tasks.filter((t) => t.status === "done").length,
    }),
    [tasks]
  );

  const visibleTasks = useMemo(() => {
    let out = [...tasks];

    if (filter !== "all") out = out.filter((t) => t.status === filter);

    if (query.trim()) {
      const q = query.toLowerCase();
      out = out.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          (t.description || "").toLowerCase().includes(q)
      );
    }

    if (sortBy === "created_desc") out.sort((a, b) => b.id - a.id);
    if (sortBy === "created_asc") out.sort((a, b) => a.id - b.id);

    if (sortBy === "due_asc")
      out.sort((a, b) => {
        const da = parseDateSafe(a.due_date);
        const db = parseDateSafe(b.due_date);
        return (da ? da.getTime() : Infinity) - (db ? db.getTime() : Infinity);
      });

    if (sortBy === "due_desc")
      out.sort((a, b) => {
        const da = parseDateSafe(a.due_date);
        const db = parseDateSafe(b.due_date);
        return (db ? db.getTime() : -Infinity) - (da ? da.getTime() : -Infinity);
      });

    return out;
  }, [tasks, filter, query, sortBy]);

  /* ---------------- SMART DUE TEXT ---------------- */

  function smartDueText(task) {
    if (!task.due_date) return null;

    if (task.status === "done")
      return {
        text: `Completed on ${formatDateISO(task.due_date)}`,
        colorClass: "done-text",
      };

    const diff = daysBetween(task.due_date);

    if (diff < 0)
      return {
        text: `Overdue by ${Math.abs(diff)} day(s)`,
        colorClass: "overdue",
      };

    if (diff === 0) return { text: "Due today", colorClass: "today" };

    return { text: `${diff} day(s) left`, colorClass: "left" };
  }

  /* ---------------- TIMELINE (NO SHIFTING) ---------------- */

  const timelineData = useMemo(() => {
    const today = new Date();
    const base = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    return Array.from({ length: timelineWindowDays }).map((_, i) => {
      const d = new Date(base);
      d.setDate(base.getDate() + i);

      const key = isoLocalKey(d.toISOString());

      const count = tasks.filter(
        (t) => t.status !== "done" && isoLocalKey(t.due_date) === key
      ).length;

      return {
        date: key,
        short: d.toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        }),
        count,
      };
    });
  }, [tasks]);

  /* ---------------- UI ---------------- */

  return (
    <div className="tm-page">
      {/* HEADER */}
      <header className="tm-header">
        <div>
          <h1 className="tm-title">TaskFlow</h1>
          <p className="tm-sub">Organize your work efficiently</p>
        </div>

        <div className="tm-controls">
          <div className="tm-total">
            <div className="tm-total-num">{counts.total}</div>
            <div className="tm-total-label">Total</div>
          </div>

          <button className="tm-add" onClick={openNewTaskModal}>
            + Add Task
          </button>
        </div>
      </header>

      {/* TIMELINE */}
      <div className="tm-timeline">
        <div className="tm-tl-left">Upcoming</div>

        <div className="tm-tl-days">
          {timelineData.map((d) => (
            <motion.div key={d.date} className="tl-day" whileHover={{ y: -6 }}>
              <div className="tl-date">{d.short}</div>
              <div className={`tl-count ${d.count === 0 ? "empty" : "filled"}`}>
                {d.count}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="tm-search">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tasks..."
          />

          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="created_desc">Newest</option>
            <option value="created_asc">Oldest</option>
            <option value="due_asc">Due ↑</option>
            <option value="due_desc">Due ↓</option>
          </select>
        </div>
      </div>

      {/* FILTER PILLS */}
      <div className="tm-filter-pills">
        <button
          className={filter === "all" ? "pill active" : "pill"}
          onClick={() => setFilter("all")}
        >
          All ({counts.total})
        </button>

        <button
          className={filter === "pending" ? "pill active" : "pill"}
          onClick={() => setFilter("pending")}
        >
          Pending ({counts.pending})
        </button>

        <button
          className={filter === "in-progress" ? "pill active" : "pill"}
          onClick={() => setFilter("in-progress")}
        >
          In Progress ({counts.inProgress})
        </button>

        <button
          className={filter === "done" ? "pill active" : "pill"}
          onClick={() => setFilter("done")}
        >
          Done ({counts.done})
        </button>
      </div>

      {/* TASK LIST */}
      <main className="tm-content">
        {loading ? (
          <div className="tm-loading">Loading…</div>
        ) : visibleTasks.length === 0 ? (
          <div className="tm-empty">No tasks found.</div>
        ) : (
          <div className="tm-list">
            <AnimatePresence>
              {visibleTasks.map((t) => {
                const sd = smartDueText(t);

                return (
                  <motion.article
                    key={t.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    className={`tm-card ${t.status === "done" ? "done" : ""}`}
                  >
                    <div className="tm-card-top">
                      <h3 className="tm-card-title">{t.title}</h3>
                      <div className={`tm-status ${t.status}`}>
                        {t.status.replace("-", " ")}
                      </div>
                    </div>

                    <p className="tm-desc">{t.description}</p>

                    <div className="tm-meta">
                      <div>
                        <div className="tm-date">
                          Due: {formatDateISO(t.due_date)}
                        </div>
                        {sd && (
                          <div className={`tm-due ${sd.colorClass}`}>
                            {sd.text}
                          </div>
                        )}
                      </div>

                      <div className="tm-actions">
                        {t.status !== "done" && (
                          <button
                            className="action done"
                            onClick={() => markDone(t.id)}
                          >
                            Mark Done
                          </button>
                        )}

                        <button
                          className="action edit"
                          onClick={() => openEditModal(t)}
                        >
                          Edit
                        </button>

                        <button
                          className="action del"
                          onClick={() => deleteTask(t.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* MODAL */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="tm-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="tm-modal"
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 8, opacity: 0 }}
            >
              <h3>{editingId ? "Edit Task" : "Add New Task"}</h3>

              <label>Title *</label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Task title"
              />

              <label>Description</label>
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="Optional description"
              />

              <div className="row">
                <div className="col">
                  <label>Due date</label>
                  <input
                    type="date"
                    value={form.due_date}
                    onChange={(e) =>
                      setForm({ ...form, due_date: e.target.value })
                    }
                  />
                </div>

                <div className="col">
                  <label>Status</label>
                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm({ ...form, status: e.target.value })
                    }
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>
              </div>

              <div className="tm-modal-actions">
                <button className="btn muted" onClick={closeModal}>
                  Cancel
                </button>

                <button className="btn primary" onClick={saveTask}>
                  {saving
                    ? "Saving…"
                    : editingId
                    ? "Update Task"
                    : "Create Task"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
