import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend } from 'recharts';
import api from '../api.js';

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [totals, setTotals]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/reports')
      .then(({ data }) => {
        const sorted = [...data.reports].sort((a, b) => a.date.localeCompare(b.date));
        setReports(sorted);
        setTotals(data.totals);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={styles.empty}>Loading…</div>;

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.heading}>Reports</h1>
        <p style={styles.sub}>Daily activity synced from your Android device</p>
      </div>

      {reports.length === 0 ? (
        <div style={styles.emptyCard}>
          <p style={{ fontWeight: 600, marginBottom: '8px' }}>No reports yet</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
            The Android app sends a daily sync via <code style={styles.code}>PUT /api/reports/sync</code>.<br />
            Once it starts syncing, your data will appear here.
          </p>
        </div>
      ) : (
        <>
          {/* Summary totals */}
          {totals && (
            <div style={styles.grid}>
              <MiniStat label="Threats blocked"       value={totals.threatsBlocked}     color="#ef4444" />
              <MiniStat label="Ads blocked"           value={totals.adsBlocked}         color="#4f7eff" />
              <MiniStat label="Phishing attempts"     value={totals.phishingAttempts}   color="#f59e0b" />
              <MiniStat label="Data leaks prevented"  value={totals.dataLeaksPrevented} color="#22c55e" />
            </div>
          )}

          {/* Bar chart */}
          <div style={styles.chartCard}>
            <div style={styles.chartTitle}>Daily breakdown</div>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={reports} margin={{ top: 8, right: 8, left: -20, bottom: 0 }} barSize={8} barGap={2}>
                <CartesianGrid stroke="#252a38" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: '#6b7593', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => v.slice(5)} />
                <YAxis tick={{ fill: '#6b7593', fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ background: '#13161e', border: '1px solid #252a38', borderRadius: '8px', fontSize: '12px' }}
                  labelStyle={{ color: '#9aa3be' }}
                  cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', color: '#9aa3be' }} />
                <Bar dataKey="threatsBlocked"    fill="#ef4444" name="Threats" radius={[3,3,0,0]} />
                <Bar dataKey="adsBlocked"        fill="#4f7eff" name="Ads" radius={[3,3,0,0]} />
                <Bar dataKey="phishingAttempts"  fill="#f59e0b" name="Phishing" radius={[3,3,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Table */}
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  {['Date','Threats','Ads','Phishing','Leaks'].map(h => (
                    <th key={h} style={styles.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...reports].reverse().map(r => (
                  <tr key={r._id || r.date} style={styles.tr}>
                    <td style={{ ...styles.td, fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-dim)' }}>{r.date}</td>
                    <td style={{ ...styles.td, color: '#ef4444', fontFamily: 'JetBrains Mono, monospace' }}>{r.threatsBlocked}</td>
                    <td style={{ ...styles.td, color: '#4f7eff', fontFamily: 'JetBrains Mono, monospace' }}>{r.adsBlocked}</td>
                    <td style={{ ...styles.td, color: '#f59e0b', fontFamily: 'JetBrains Mono, monospace' }}>{r.phishingAttempts}</td>
                    <td style={{ ...styles.td, color: '#22c55e', fontFamily: 'JetBrains Mono, monospace' }}>{r.dataLeaksPrevented}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

function MiniStat({ label, value, color }) {
  return (
    <div style={styles.miniCard}>
      <div style={{ fontSize: '24px', fontWeight: 700, color, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '-0.03em' }}>
        {value?.toLocaleString()}
      </div>
      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>{label}</div>
    </div>
  );
}

const styles = {
  page:   { maxWidth: 1100 },
  header: { marginBottom: '24px' },
  heading:{ fontSize: '22px', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '4px' },
  sub:    { color: 'var(--text-muted)', fontSize: '13px' },
  empty:  { color: 'var(--text-muted)', padding: '60px 0', textAlign: 'center' },
  emptyCard: { background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '48px', textAlign: 'center' },
  code:   { background: 'var(--bg-3)', padding: '1px 6px', borderRadius: '4px', fontFamily: 'JetBrains Mono, monospace', fontSize: '12px' },
  grid:   { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '20px' },
  miniCard: { background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '18px 20px' },
  chartCard: { background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '20px 24px 16px', marginBottom: '20px' },
  chartTitle: { fontSize: '13px', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '16px' },
  tableWrap: { background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' },
  table:  { width: '100%', borderCollapse: 'collapse' },
  th:     { padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid var(--border)' },
  tr:     { borderBottom: '1px solid var(--border)' },
  td:     { padding: '11px 16px', fontSize: '13px' },
};
