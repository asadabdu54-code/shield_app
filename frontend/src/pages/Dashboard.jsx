import { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useAuth } from '../hooks/useAuth.jsx';
import api from '../api.js';

// Sample fallback data when API is unreachable
const SAMPLE = Array.from({ length: 14 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - (13 - i));
  return {
    date: d.toISOString().slice(0, 10),
    threatsBlocked: Math.floor(Math.random() * 80 + 20),
    adsBlocked: Math.floor(Math.random() * 200 + 50),
    phishingAttempts: Math.floor(Math.random() * 15),
    dataLeaksPrevented: Math.floor(Math.random() * 5),
  };
});

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData]     = useState(null);
  const [totals, setTotals] = useState(null);
  const [live, setLive]     = useState(true);

  useEffect(() => {
    api.get('/reports')
      .then(({ data: d }) => {
        if (d.reports.length === 0) {
          setData(SAMPLE);
          setTotals(sum(SAMPLE));
          setLive(false);
        } else {
          const sorted = [...d.reports].sort((a, b) => a.date.localeCompare(b.date));
          setData(sorted);
          setTotals(d.totals);
        }
      })
      .catch(() => {
        setData(SAMPLE);
        setTotals(sum(SAMPLE));
        setLive(false);
      });
  }, []);

  function sum(rows) {
    return rows.reduce((a, r) => ({
      threatsBlocked:    a.threatsBlocked    + r.threatsBlocked,
      adsBlocked:        a.adsBlocked        + r.adsBlocked,
      phishingAttempts:  a.phishingAttempts  + r.phishingAttempts,
      dataLeaksPrevented: a.dataLeaksPrevented + r.dataLeaksPrevented,
    }), { threatsBlocked: 0, adsBlocked: 0, phishingAttempts: 0, dataLeaksPrevented: 0 });
  }

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  })();

  const firstName = user?.name?.split(' ')[0] || 'there';

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.heading}>{greeting}, {firstName}</h1>
          <p style={styles.sub}>
            {live ? 'Live data from your device' : (
              <span style={{ color: 'var(--amber)' }}>⚠ Sample data — connect the Android app to see live stats</span>
            )}
          </p>
        </div>
      </div>

      {/* Stat cards */}
      {totals && (
        <div style={styles.grid}>
          <StatCard label="Threats blocked"      value={totals.threatsBlocked}    color="var(--red)"    icon="🛡" />
          <StatCard label="Ads blocked"          value={totals.adsBlocked}        color="var(--accent)" icon="🚫" />
          <StatCard label="Phishing attempts"    value={totals.phishingAttempts}  color="var(--amber)"  icon="🎣" />
          <StatCard label="Data leaks prevented" value={totals.dataLeaksPrevented} color="var(--green)" icon="🔒" />
        </div>
      )}

      {/* Chart */}
      {data && (
        <div style={styles.chartCard}>
          <div style={styles.chartHeader}>
            <span style={styles.chartTitle}>Threats blocked — last {data.length} days</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gBlue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#4f7eff" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#4f7eff" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="gRed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#252a38" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: '#6b7593', fontSize: 11 }} tickLine={false} axisLine={false}
                tickFormatter={v => v.slice(5)} />
              <YAxis tick={{ fill: '#6b7593', fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ background: '#13161e', border: '1px solid #252a38', borderRadius: '8px', fontSize: '12px' }}
                labelStyle={{ color: '#9aa3be' }}
                itemStyle={{ color: '#e8ecf4' }}
              />
              <Area type="monotone" dataKey="adsBlocked"     stroke="#4f7eff" fill="url(#gBlue)" strokeWidth={2} dot={false} name="Ads blocked" />
              <Area type="monotone" dataKey="threatsBlocked" stroke="#ef4444" fill="url(#gRed)"  strokeWidth={2} dot={false} name="Threats blocked" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, color, icon }) {
  return (
    <div style={{ ...styles.card, borderTop: `2px solid ${color}` }}>
      <div style={styles.cardTop}>
        <span style={styles.cardIcon}>{icon}</span>
        <span style={{ ...styles.cardValue, color }}>{value?.toLocaleString()}</span>
      </div>
      <div style={styles.cardLabel}>{label}</div>
    </div>
  );
}

const styles = {
  page:    { maxWidth: 1100 },
  header:  { marginBottom: '28px' },
  heading: { fontSize: '22px', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '4px' },
  sub:     { color: 'var(--text-muted)', fontSize: '13px' },
  grid:    { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' },
  card: {
    background: 'var(--bg-2)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '20px 20px 16px',
  },
  cardTop:   { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' },
  cardIcon:  { fontSize: '20px' },
  cardValue: { fontSize: '28px', fontWeight: 700, letterSpacing: '-0.03em', fontFamily: 'JetBrains Mono, monospace' },
  cardLabel: { fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 },
  chartCard: {
    background: 'var(--bg-2)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '20px 24px 16px',
  },
  chartHeader: { marginBottom: '16px' },
  chartTitle:  { fontSize: '13px', fontWeight: 600, color: 'var(--text-dim)' },
};
