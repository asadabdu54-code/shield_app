import { useEffect, useState } from "react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend,
} from "recharts";
import { useAuth } from "../hooks/useAuth.jsx";
import api from "../api.js";

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

function sum(rows) {
  return rows.reduce(
    (a, r) => ({
      threatsBlocked: a.threatsBlocked + r.threatsBlocked,
      adsBlocked: a.adsBlocked + r.adsBlocked,
      phishingAttempts: a.phishingAttempts + r.phishingAttempts,
      dataLeaksPrevented: a.dataLeaksPrevented + r.dataLeaksPrevented,
    }),
    { threatsBlocked: 0, adsBlocked: 0, phishingAttempts: 0, dataLeaksPrevented: 0 }
  );
}

const CHART_METRICS = [
  { key: "adsBlocked",     name: "Ads blocked",     color: "#4f7eff" },
  { key: "threatsBlocked", name: "Threats blocked",  color: "#ef4444" },
  { key: "phishingAttempts", name: "Phishing",       color: "#f59e0b" },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData]       = useState(null);
  const [totals, setTotals]   = useState(null);
  const [live, setLive]       = useState(true);
  const [loading, setLoading] = useState(true);
  const [activeMetrics, setActiveMetrics] = useState(
    new Set(["adsBlocked", "threatsBlocked"])
  );

  useEffect(() => {
    api
      .get("/reports")
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
      })
      .finally(() => setLoading(false));
  }, []);

  function toggleMetric(key) {
    setActiveMetrics((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        if (next.size === 1) return prev; // keep at least one
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  })();
  const firstName = user?.name?.split(" ")[0] || "there";

  if (loading) {
    return (
      <div style={styles.loadingPage}>
        <div style={styles.loadingDot} />
        <span style={{ color: "var(--text-muted)" }}>Loading your dashboard…</span>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.heading}>
            {greeting}, {firstName} 👋
          </h1>
          <p style={styles.sub}>
            {live ? (
              <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={styles.liveDot} />
                Live data from your device
              </span>
            ) : (
              <span style={{ color: "var(--amber)" }}>
                ⚠ Sample data — connect the Android app to see live stats
              </span>
            )}
          </p>
        </div>
        <div style={styles.dateChip}>
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </div>
      </div>

      {/* Stat cards */}
      {totals && (
        <div style={styles.grid}>
          <StatCard label="Threats blocked"      value={totals.threatsBlocked}     color="var(--red)"    icon="🛡" trend="+12%" />
          <StatCard label="Ads blocked"          value={totals.adsBlocked}         color="var(--accent)" icon="🚫" trend="+8%" />
          <StatCard label="Phishing attempts"    value={totals.phishingAttempts}   color="var(--amber)"  icon="🎣" trend="-3%" trendDown />
          <StatCard label="Data leaks prevented" value={totals.dataLeaksPrevented} color="var(--green)"  icon="🔒" trend="+2%" />
        </div>
      )}

      {/* Chart */}
      {data && (
        <div style={styles.chartCard}>
          <div style={styles.chartHeader}>
            <div>
              <div style={styles.chartTitle}>Activity over time</div>
              <div style={styles.chartSub}>Last {data.length} days</div>
            </div>
            {/* Metric toggles */}
            <div style={styles.metricToggles}>
              {CHART_METRICS.map(({ key, name, color }) => (
                <button
                  key={key}
                  onClick={() => toggleMetric(key)}
                  style={{
                    ...styles.metricToggle,
                    borderColor: activeMetrics.has(key) ? color + "88" : "var(--border)",
                    background: activeMetrics.has(key) ? color + "18" : "transparent",
                    color: activeMetrics.has(key) ? color : "var(--text-muted)",
                  }}
                >
                  <span
                    style={{
                      width: 8, height: 8, borderRadius: "50%",
                      background: activeMetrics.has(key) ? color : "var(--border)",
                      display: "inline-block",
                    }}
                  />
                  {name}
                </button>
              ))}
            </div>
          </div>

          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={data} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}>
              <defs>
                {CHART_METRICS.map(({ key, color }) => (
                  <linearGradient key={key} id={`grad_${key}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={color} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={color} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid stroke="#1e2333" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fill: "#4d5674", fontSize: 11 }}
                tickLine={false} axisLine={false}
                tickFormatter={(v) => v.slice(5)}
              />
              <YAxis
                tick={{ fill: "#4d5674", fontSize: 11 }}
                tickLine={false} axisLine={false}
              />
              <Tooltip
                contentStyle={{ background: "#0f1219", border: "1px solid #1e2333", borderRadius: "8px", fontSize: "12px" }}
                labelStyle={{ color: "#6b7593" }}
                itemStyle={{ color: "#e8ecf4" }}
              />
              {CHART_METRICS.filter(({ key }) => activeMetrics.has(key)).map(({ key, name, color }) => (
                <Area
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={color}
                  fill={`url(#grad_${key})`}
                  strokeWidth={2}
                  dot={false}
                  name={name}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Quick actions */}
      <div style={styles.quickActions}>
        <QuickAction href="/blocklist" icon="+" label="Add rule" desc="Block a domain or keyword" />
        <QuickAction href="/reports"   icon="↗" label="View reports" desc="Browse daily breakdowns" />
        <QuickAction href="/settings"  icon="⚙" label="API setup"   desc="Connect Android app" />
      </div>
    </div>
  );
}

function StatCard({ label, value, color, icon, trend, trendDown }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      style={{
        ...styles.card,
        borderTopColor: color,
        background: hovered ? "var(--bg-3)" : "var(--bg-2)",
        transition: "background 0.15s, transform 0.15s",
        transform: hovered ? "translateY(-1px)" : "none",
        cursor: "default",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={styles.cardTop}>
        <span style={styles.cardIcon}>{icon}</span>
        {trend && (
          <span style={{ fontSize: "11px", color: trendDown ? "var(--red)" : "var(--green)", fontWeight: 600, fontFamily: "JetBrains Mono, monospace" }}>
            {trend}
          </span>
        )}
      </div>
      <div style={{ ...styles.cardValue, color }}>{value?.toLocaleString()}</div>
      <div style={styles.cardLabel}>{label}</div>
    </div>
  );
}

function QuickAction({ href, icon, label, desc }) {
  const [hovered, setHovered] = useState(false);
  return (
    <a
      href={href}
      style={{
        ...styles.qa,
        background: hovered ? "var(--bg-3)" : "var(--bg-2)",
        borderColor: hovered ? "rgba(79,126,255,0.3)" : "var(--border)",
        transition: "all 0.15s",
        textDecoration: "none",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span style={styles.qaIcon}>{icon}</span>
      <div>
        <div style={styles.qaLabel}>{label}</div>
        <div style={styles.qaDesc}>{desc}</div>
      </div>
    </a>
  );
}

const styles = {
  page: { maxWidth: 1100 },
  loadingPage: { display: "flex", alignItems: "center", justifyContent: "center", height: "50vh", gap: "12px" },
  loadingDot: { width: 8, height: 8, borderRadius: "50%", background: "var(--accent)", animation: "pulse 1s ease-in-out infinite" },
  header: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "28px" },
  heading: { fontSize: "22px", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: "6px" },
  sub: { color: "var(--text-muted)", fontSize: "13px", display: "flex", alignItems: "center" },
  liveDot: { width: 7, height: 7, borderRadius: "50%", background: "var(--green)", display: "inline-block", animation: "pulse 2s ease-in-out infinite" },
  dateChip: { fontSize: "12px", color: "var(--text-muted)", background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: "6px", padding: "5px 12px" },
  grid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px", marginBottom: "20px" },
  card: {
    background: "var(--bg-2)", border: "1px solid var(--border)",
    borderTop: "2px solid", borderRadius: "var(--radius)", padding: "18px 20px 16px",
  },
  cardTop: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" },
  cardIcon: { fontSize: "20px" },
  cardValue: { fontSize: "30px", fontWeight: 700, letterSpacing: "-0.03em", fontFamily: "JetBrains Mono, monospace", marginBottom: "4px" },
  cardLabel: { fontSize: "12px", color: "var(--text-muted)", fontWeight: 500 },
  chartCard: { background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "20px 24px 16px", marginBottom: "20px" },
  chartHeader: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "20px" },
  chartTitle: { fontSize: "14px", fontWeight: 600, color: "var(--text)", marginBottom: "2px" },
  chartSub: { fontSize: "12px", color: "var(--text-muted)" },
  metricToggles: { display: "flex", gap: "8px", flexWrap: "wrap" },
  metricToggle: { display: "flex", alignItems: "center", gap: "6px", padding: "4px 10px", borderRadius: "20px", border: "1px solid", fontSize: "11px", fontWeight: 600, cursor: "pointer", transition: "all 0.15s" },
  quickActions: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" },
  qa: { display: "flex", alignItems: "center", gap: "14px", padding: "16px 18px", background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", cursor: "pointer" },
  qaIcon: { fontSize: "18px", width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--accent-glow)", borderRadius: "8px", color: "var(--accent)", fontStyle: "normal", flexShrink: 0 },
  qaLabel: { fontSize: "13px", fontWeight: 600, marginBottom: "2px" },
  qaDesc: { fontSize: "11px", color: "var(--text-muted)" },
};
