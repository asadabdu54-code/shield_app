import { useEffect, useState, useCallback } from "react";
import api from "../api.js";

const TYPES = ["keyword", "domain", "app", "regex"];

const TYPE_META = {
  keyword: { color: "#4f7eff", bg: "rgba(79,126,255,0.12)", border: "rgba(79,126,255,0.25)" },
  domain:  { color: "#22c55e", bg: "rgba(34,197,94,0.12)",  border: "rgba(34,197,94,0.25)" },
  app:     { color: "#f59e0b", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.25)" },
  regex:   { color: "#a78bfa", bg: "rgba(167,139,250,0.12)",border: "rgba(167,139,250,0.25)" },
};

const PLACEHOLDER = { keyword: "spam", domain: "ads.example.com", app: "com.example.app", regex: "^ad\\." };

export default function Blocklist() {
  const [rules, setRules]         = useState([]);
  const [total, setTotal]         = useState(0);
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState({ type: "", enabled: "" });
  const [search, setSearch]       = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing]     = useState(null);
  const [form, setForm]           = useState({ type: "keyword", value: "", description: "", enabled: true });
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filter.type) params.type = filter.type;
      if (filter.enabled !== "") params.enabled = filter.enabled;
      const { data } = await api.get("/rules", { params });
      setRules(data.rules);
      setTotal(data.total);
    } catch {}
    setLoading(false);
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const displayed = search
    ? rules.filter(
        (r) =>
          r.value.toLowerCase().includes(search.toLowerCase()) ||
          (r.description || "").toLowerCase().includes(search.toLowerCase())
      )
    : rules;

  function openAdd() {
    setEditing(null);
    setForm({ type: "keyword", value: "", description: "", enabled: true });
    setError("");
    setShowModal(true);
  }

  function openEdit(rule) {
    setEditing(rule);
    setForm({ type: rule.type, value: rule.value, description: rule.description, enabled: rule.enabled });
    setError("");
    setShowModal(true);
  }

  async function handleSave() {
    if (!form.value.trim()) { setError("Value is required."); return; }
    setSaving(true); setError("");
    try {
      if (editing) {
        const { data } = await api.patch(`/rules/${editing._id}`, form);
        setRules((rs) => rs.map((r) => r._id === editing._id ? data.rule : r));
      } else {
        await api.post("/rules", form);
        await load();
      }
      setShowModal(false);
    } catch (err) {
      setError(err.response?.data?.error || "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleEnabled(rule) {
    const updated = { ...rule, enabled: !rule.enabled };
    setRules((rs) => rs.map((r) => r._id === rule._id ? updated : r));
    try {
      await api.patch(`/rules/${rule._id}`, { enabled: !rule.enabled });
    } catch {
      // revert on error
      setRules((rs) => rs.map((r) => r._id === rule._id ? rule : r));
    }
  }

  async function confirmDelete(id) {
    try {
      await api.delete(`/rules/${id}`);
      setRules((rs) => rs.filter((r) => r._id !== id));
      setTotal((t) => t - 1);
    } catch {}
    setDeleteConfirm(null);
  }

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.heading}>Blocklist</h1>
          <p style={styles.sub}>
            {total} rule{total !== 1 ? "s" : ""} •{" "}
            {rules.filter((r) => r.enabled).length} active
          </p>
        </div>
        <button onClick={openAdd} style={styles.addBtn}>
          <span style={{ fontSize: "16px", lineHeight: 1 }}>+</span>
          Add rule
        </button>
      </div>

      {/* Toolbar */}
      <div style={styles.toolbar}>
        <div style={styles.searchWrap}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" style={styles.searchIcon}>
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search rules…"
            style={styles.searchInput}
          />
          {search && (
            <button onClick={() => setSearch("")} style={styles.clearSearch}>×</button>
          )}
        </div>
        <select value={filter.type} onChange={(e) => setFilter((f) => ({ ...f, type: e.target.value }))} style={styles.select}>
          <option value="">All types</option>
          {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={filter.enabled} onChange={(e) => setFilter((f) => ({ ...f, enabled: e.target.value }))} style={styles.select}>
          <option value="">All statuses</option>
          <option value="true">Enabled</option>
          <option value="false">Disabled</option>
        </select>
      </div>

      {/* Table */}
      <div style={styles.tableWrap}>
        {loading ? (
          <div style={styles.empty}>Loading…</div>
        ) : displayed.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>🛡</div>
            <p style={{ fontWeight: 600, marginBottom: "6px", fontSize: "15px" }}>
              {search || filter.type || filter.enabled !== "" ? "No matching rules" : "No rules yet"}
            </p>
            <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>
              {search ? `Nothing matches "${search}"` : "Add your first rule to start blocking."}
            </p>
            {!search && (
              <button onClick={openAdd} style={{ ...styles.addBtn, marginTop: "16px" }}>
                + Add first rule
              </button>
            )}
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                {["Type", "Value", "Description", "Hits", "Status", ""].map((h) => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayed.map((rule) => (
                <TableRow
                  key={rule._id}
                  rule={rule}
                  onEdit={openEdit}
                  onToggle={toggleEnabled}
                  onDelete={() => setDeleteConfirm(rule._id)}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Delete confirm dialog */}
      {deleteConfirm && (
        <div style={styles.overlay} onClick={() => setDeleteConfirm(null)}>
          <div style={{ ...styles.modal, maxWidth: "360px" }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "8px" }}>Delete rule?</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "13px", marginBottom: "20px" }}>This action cannot be undone.</p>
            <div style={styles.modalActions}>
              <button onClick={() => setDeleteConfirm(null)} style={styles.cancelBtn}>Cancel</button>
              <button onClick={() => confirmDelete(deleteConfirm)} style={{ ...styles.saveBtn, background: "var(--red)" }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div style={styles.overlay} onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>{editing ? "Edit rule" : "Add rule"}</h2>

            {error && <div style={styles.errorMsg}>{error}</div>}

            <label style={styles.label}>
              Type
              <div style={styles.typeGrid}>
                {TYPES.map((t) => {
                  const meta = TYPE_META[t];
                  const selected = form.type === t;
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, type: t }))}
                      style={{
                        padding: "8px 12px",
                        borderRadius: "6px",
                        border: `1px solid ${selected ? meta.border : "var(--border)"}`,
                        background: selected ? meta.bg : "var(--bg-3)",
                        color: selected ? meta.color : "var(--text-muted)",
                        fontSize: "12px",
                        fontWeight: 600,
                        cursor: "pointer",
                        transition: "all 0.15s",
                      }}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            </label>

            <label style={styles.label}>
              Value
              <input
                value={form.value}
                onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
                placeholder={PLACEHOLDER[form.type]}
                style={styles.input}
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && handleSave()}
              />
            </label>

            <label style={styles.label}>
              Description{" "}
              <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>(optional)</span>
              <input
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Why this is blocked"
                style={styles.input}
              />
            </label>

            <label style={{ ...styles.label, flexDirection: "row", alignItems: "center", gap: "10px", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={form.enabled}
                onChange={(e) => setForm((f) => ({ ...f, enabled: e.target.checked }))}
                style={{ width: "auto", accentColor: "var(--accent)" }}
              />
              Enable immediately
            </label>

            <div style={styles.modalActions}>
              <button onClick={() => setShowModal(false)} style={styles.cancelBtn}>Cancel</button>
              <button onClick={handleSave} disabled={saving} style={styles.saveBtn}>
                {saving ? "Saving…" : editing ? "Save changes" : "Add rule"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TableRow({ rule, onEdit, onToggle, onDelete }) {
  const [hovered, setHovered] = useState(false);
  const meta = TYPE_META[rule.type] || TYPE_META.keyword;

  return (
    <tr
      style={{ ...styles.tr, background: hovered ? "rgba(255,255,255,0.02)" : "transparent" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <td style={styles.td}>
        <span style={{ padding: "2px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: 600, letterSpacing: "0.04em", color: meta.color, background: meta.bg, border: `1px solid ${meta.border}` }}>
          {rule.type}
        </span>
      </td>
      <td style={{ ...styles.td, fontFamily: "JetBrains Mono, monospace", fontSize: "12px", maxWidth: "220px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {rule.value}
      </td>
      <td style={{ ...styles.td, color: "var(--text-muted)", fontSize: "12px", maxWidth: "180px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {rule.description || <span style={{ opacity: 0.3 }}>—</span>}
      </td>
      <td style={{ ...styles.td, fontFamily: "JetBrains Mono, monospace", fontSize: "12px", color: "var(--text-dim)" }}>
        {rule.hitCount?.toLocaleString() ?? 0}
      </td>
      <td style={styles.td}>
        <button
          onClick={() => onToggle(rule)}
          style={{
            padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 600,
            cursor: "pointer", transition: "all 0.15s",
            background: rule.enabled ? "rgba(34,197,94,0.12)" : "var(--bg-3)",
            color: rule.enabled ? "var(--green)" : "var(--text-muted)",
            border: `1px solid ${rule.enabled ? "rgba(34,197,94,0.3)" : "var(--border)"}`,
          }}
        >
          {rule.enabled ? "● Active" : "○ Off"}
        </button>
      </td>
      <td style={{ ...styles.td, textAlign: "right" }}>
        <div style={{ display: "flex", gap: "4px", justifyContent: "flex-end", opacity: hovered ? 1 : 0, transition: "opacity 0.15s" }}>
          <button onClick={() => onEdit(rule)} style={styles.rowBtn} title="Edit">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="m18.5 2.5 2.83 2.83L12 14.66l-4 1 1-4z"/></svg>
          </button>
          <button onClick={onDelete} style={{ ...styles.rowBtn, color: "var(--red)", background: "var(--red-dim)", borderColor: "rgba(239,68,68,0.2)" }} title="Delete">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="m19 6-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
          </button>
        </div>
      </td>
    </tr>
  );
}

const styles = {
  page: { maxWidth: 1100 },
  header: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "20px" },
  heading: { fontSize: "22px", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: "4px" },
  sub: { color: "var(--text-muted)", fontSize: "13px" },
  addBtn: {
    display: "flex", alignItems: "center", gap: "6px",
    background: "var(--accent)", color: "#fff", border: "none",
    borderRadius: "var(--radius-sm)", padding: "9px 16px",
    fontWeight: 600, fontSize: "13px", cursor: "pointer",
  },
  toolbar: { display: "flex", gap: "10px", marginBottom: "14px" },
  searchWrap: { position: "relative", flex: 1, maxWidth: "320px" },
  searchIcon: { position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" },
  searchInput: { width: "100%", padding: "8px 32px 8px 32px", background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", color: "var(--text)", fontSize: "13px", outline: "none" },
  clearSearch: { position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "16px", lineHeight: 1 },
  select: { background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", padding: "8px 12px", color: "var(--text)", fontSize: "13px", cursor: "pointer", outline: "none" },
  tableWrap: { background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden" },
  emptyState: { padding: "64px 20px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" },
  emptyIcon: { fontSize: "36px", marginBottom: "16px", opacity: 0.4 },
  empty: { padding: "60px 20px", textAlign: "center", color: "var(--text-muted)" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { padding: "10px 14px", textAlign: "left", fontSize: "11px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1px solid var(--border)" },
  tr: { borderBottom: "1px solid var(--border)", transition: "background 0.1s" },
  td: { padding: "12px 14px", fontSize: "13px" },
  rowBtn: { background: "var(--bg-3)", border: "1px solid var(--border)", color: "var(--text-muted)", borderRadius: "5px", padding: "5px 7px", cursor: "pointer", display: "flex", alignItems: "center" },
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, backdropFilter: "blur(4px)" },
  modal: { background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: "14px", padding: "28px", width: "100%", maxWidth: "440px", display: "flex", flexDirection: "column", gap: "16px", boxShadow: "0 24px 64px rgba(0,0,0,0.6)" },
  modalTitle: { fontSize: "17px", fontWeight: 700, letterSpacing: "-0.02em" },
  typeGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "6px", marginTop: "6px" },
  label: { display: "flex", flexDirection: "column", gap: "6px", fontSize: "13px", fontWeight: 500, color: "var(--text-dim)" },
  input: { background: "var(--bg-3)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", padding: "9px 12px", color: "var(--text)", fontSize: "13px", outline: "none", width: "100%" },
  errorMsg: { background: "var(--red-dim)", border: "1px solid rgba(239,68,68,.3)", color: "#fca5a5", borderRadius: "var(--radius-sm)", padding: "8px 12px", fontSize: "12px" },
  modalActions: { display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "4px" },
  cancelBtn: { background: "var(--bg-3)", border: "1px solid var(--border)", color: "var(--text-muted)", borderRadius: "var(--radius-sm)", padding: "8px 16px", fontSize: "13px", fontWeight: 500, cursor: "pointer" },
  saveBtn: { background: "var(--accent)", color: "#fff", border: "none", borderRadius: "var(--radius-sm)", padding: "8px 18px", fontSize: "13px", fontWeight: 600, cursor: "pointer" },
};
