import { useEffect, useState } from 'react';
import api from '../api.js';

const TYPES = ['keyword', 'domain', 'app', 'regex'];

const TYPE_COLOR = {
  keyword: 'var(--accent)',
  domain:  'var(--green)',
  app:     'var(--amber)',
  regex:   '#a78bfa',
};

export default function Blocklist() {
  const [rules, setRules]   = useState([]);
  const [total, setTotal]   = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState({ type: '', enabled: '' });
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing]     = useState(null); // rule object or null
  const [form, setForm]           = useState({ type: 'keyword', value: '', description: '', enabled: true });
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState('');

  async function load() {
    setLoading(true);
    try {
      const params = {};
      if (filter.type)    params.type    = filter.type;
      if (filter.enabled !== '') params.enabled = filter.enabled;
      const { data } = await api.get('/rules', { params });
      setRules(data.rules);
      setTotal(data.total);
    } catch { /* stay silent, show empty state */ }
    setLoading(false);
  }

  useEffect(() => { load(); }, [filter]);

  function openAdd() {
    setEditing(null);
    setForm({ type: 'keyword', value: '', description: '', enabled: true });
    setError('');
    setShowModal(true);
  }

  function openEdit(rule) {
    setEditing(rule);
    setForm({ type: rule.type, value: rule.value, description: rule.description, enabled: rule.enabled });
    setError('');
    setShowModal(true);
  }

  async function handleSave() {
    if (!form.value.trim()) { setError('Value is required.'); return; }
    setSaving(true);
    setError('');
    try {
      if (editing) {
        await api.patch(`/rules/${editing._id}`, form);
      } else {
        await api.post('/rules', form);
      }
      setShowModal(false);
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Save failed.');
    } finally {
      setSaving(false);
    }
  }

  async function toggleEnabled(rule) {
    await api.patch(`/rules/${rule._id}`, { enabled: !rule.enabled });
    setRules(rs => rs.map(r => r._id === rule._id ? { ...r, enabled: !r.enabled } : r));
  }

  async function deleteRule(id) {
    if (!confirm('Delete this rule?')) return;
    await api.delete(`/rules/${id}`);
    setRules(rs => rs.filter(r => r._id !== id));
    setTotal(t => t - 1);
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.heading}>Blocklist</h1>
          <p style={styles.sub}>{total} rule{total !== 1 ? 's' : ''} total</p>
        </div>
        <button onClick={openAdd} style={styles.addBtn}>+ Add rule</button>
      </div>

      {/* Filters */}
      <div style={styles.filters}>
        <select
          value={filter.type}
          onChange={e => setFilter(f => ({ ...f, type: e.target.value }))}
          style={styles.select}
        >
          <option value="">All types</option>
          {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select
          value={filter.enabled}
          onChange={e => setFilter(f => ({ ...f, enabled: e.target.value }))}
          style={styles.select}
        >
          <option value="">All statuses</option>
          <option value="true">Enabled</option>
          <option value="false">Disabled</option>
        </select>
      </div>

      {/* Table */}
      <div style={styles.tableWrap}>
        {loading ? (
          <div style={styles.empty}>Loading…</div>
        ) : rules.length === 0 ? (
          <div style={styles.empty}>
            <p style={{ marginBottom: '8px', fontWeight: 600 }}>No rules yet</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Add your first rule to start blocking.</p>
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                {['Type', 'Value', 'Description', 'Hits', 'Status', ''].map(h => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rules.map(rule => (
                <tr key={rule._id} style={styles.tr}>
                  <td style={styles.td}>
                    <span style={{ ...styles.badge, color: TYPE_COLOR[rule.type], background: TYPE_COLOR[rule.type] + '22', border: `1px solid ${TYPE_COLOR[rule.type]}44` }}>
                      {rule.type}
                    </span>
                  </td>
                  <td style={{ ...styles.td, fontFamily: 'JetBrains Mono, monospace', fontSize: '12px' }}>{rule.value}</td>
                  <td style={{ ...styles.td, color: 'var(--text-muted)' }}>{rule.description || '—'}</td>
                  <td style={{ ...styles.td, fontFamily: 'JetBrains Mono, monospace' }}>{rule.hitCount}</td>
                  <td style={styles.td}>
                    <button onClick={() => toggleEnabled(rule)} style={{ ...styles.toggle, background: rule.enabled ? 'var(--green-dim)' : 'var(--bg-3)', color: rule.enabled ? 'var(--green)' : 'var(--text-muted)', border: `1px solid ${rule.enabled ? 'rgba(34,197,94,0.3)' : 'var(--border)'}` }}>
                      {rule.enabled ? 'Enabled' : 'Disabled'}
                    </button>
                  </td>
                  <td style={{ ...styles.td, textAlign: 'right' }}>
                    <button onClick={() => openEdit(rule)} style={styles.iconBtn} title="Edit">✏️</button>
                    <button onClick={() => deleteRule(rule._id)} style={{ ...styles.iconBtn, marginLeft: '4px' }} title="Delete">🗑</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div style={styles.overlay} onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div style={styles.modal}>
            <h2 style={styles.modalTitle}>{editing ? 'Edit rule' : 'Add rule'}</h2>

            {error && <div style={styles.error}>{error}</div>}

            <label style={styles.label}>
              Type
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} style={styles.input}>
                {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </label>

            <label style={styles.label}>
              Value
              <input
                value={form.value}
                onChange={e => setForm(f => ({ ...f, value: e.target.value }))}
                placeholder={form.type === 'domain' ? 'ads.example.com' : form.type === 'regex' ? '^ad\\.' : 'spam'}
                style={styles.input}
                autoFocus
              />
            </label>

            <label style={styles.label}>
              Description <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span>
              <input
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Why this is blocked"
                style={styles.input}
              />
            </label>

            <label style={{ ...styles.label, flexDirection: 'row', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={form.enabled}
                onChange={e => setForm(f => ({ ...f, enabled: e.target.checked }))}
                style={{ width: 'auto', accentColor: 'var(--accent)' }}
              />
              Enable immediately
            </label>

            <div style={styles.modalActions}>
              <button onClick={() => setShowModal(false)} style={styles.cancelBtn}>Cancel</button>
              <button onClick={handleSave} disabled={saving} style={styles.saveBtn}>
                {saving ? 'Saving…' : editing ? 'Save changes' : 'Add rule'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  page:   { maxWidth: 1100 },
  header: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' },
  heading:{ fontSize: '22px', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '4px' },
  sub:    { color: 'var(--text-muted)', fontSize: '13px' },
  addBtn: { background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', padding: '9px 16px', fontWeight: 600, fontSize: '13px', cursor: 'pointer' },
  filters:{ display: 'flex', gap: '10px', marginBottom: '16px' },
  select: { background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '7px 10px', color: 'var(--text)', fontSize: '13px', cursor: 'pointer', outline: 'none' },
  tableWrap: { background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' },
  empty:  { padding: '60px 20px', textAlign: 'center' },
  table:  { width: '100%', borderCollapse: 'collapse' },
  th:     { padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid var(--border)' },
  tr:     { borderBottom: '1px solid var(--border)' },
  td:     { padding: '12px 16px', fontSize: '13px' },
  badge:  { display: 'inline-block', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600, letterSpacing: '0.04em' },
  toggle: { padding: '3px 9px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, cursor: 'pointer' },
  iconBtn:{ background: 'none', border: 'none', fontSize: '14px', cursor: 'pointer', padding: '4px', opacity: 0.7 },
  overlay:{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(2px)' },
  modal:  { background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: '14px', padding: '32px 28px', width: '100%', maxWidth: '440px', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: '0 24px 64px rgba(0,0,0,0.6)' },
  modalTitle: { fontSize: '18px', fontWeight: 700, letterSpacing: '-0.02em' },
  label:  { display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', fontWeight: 500, color: 'var(--text-dim)' },
  input:  { background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '9px 12px', color: 'var(--text)', fontSize: '13px', outline: 'none', width: '100%' },
  error:  { background: 'var(--red-dim)', border: '1px solid rgba(239,68,68,.3)', color: '#fca5a5', borderRadius: 'var(--radius-sm)', padding: '8px 12px', fontSize: '12px' },
  modalActions: { display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '4px' },
  cancelBtn:{ background: 'var(--bg-3)', border: '1px solid var(--border)', color: 'var(--text-muted)', borderRadius: 'var(--radius-sm)', padding: '8px 16px', fontSize: '13px', fontWeight: 500, cursor: 'pointer' },
  saveBtn:  { background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', padding: '8px 18px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' },
};
