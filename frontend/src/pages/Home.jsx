import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

// Animated shield + particles
function HeroShield() {
  const [pulse, setPulse] = useState(false);
  useEffect(() => {
    const t = setInterval(() => setPulse((p) => !p), 2000);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={s.heroShieldWrap}>
      {/* Glow rings */}
      <div style={{ ...s.ring, width: 260, height: 260, opacity: pulse ? 0.15 : 0.06, transition: "opacity 2s ease" }} />
      <div style={{ ...s.ring, width: 200, height: 200, opacity: pulse ? 0.22 : 0.1, transition: "opacity 2s ease 0.3s" }} />
      <div style={{ ...s.ring, width: 140, height: 140, opacity: pulse ? 0.3 : 0.15, transition: "opacity 2s ease 0.6s" }} />

      {/* Shield SVG */}
      <svg width="80" height="80" viewBox="0 0 24 24" fill="none" style={{ position: "relative", zIndex: 1 }}>
        <path
          d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.5C16.5 22.15 20 17.25 20 12V6L12 2z"
          fill="#4f7eff"
          opacity="0.25"
        />
        <path
          d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.5C16.5 22.15 20 17.25 20 12V6L12 2z"
          stroke="#4f7eff"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path d="M9 12l2 2 4-4" stroke="#4f7eff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      style={{
        ...s.featureCard,
        borderColor: hovered ? "rgba(79,126,255,0.4)" : "rgba(255,255,255,0.06)",
        background: hovered ? "rgba(79,126,255,0.06)" : "rgba(255,255,255,0.03)",
        transform: hovered ? "translateY(-2px)" : "none",
        transition: "all 0.2s ease",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={s.featureIcon}>{icon}</div>
      <h3 style={s.featureTitle}>{title}</h3>
      <p style={s.featureDesc}>{desc}</p>
    </div>
  );
}

function StatPill({ value, label }) {
  return (
    <div style={s.statPill}>
      <div style={s.statValue}>{value}</div>
      <div style={s.statLabel}>{label}</div>
    </div>
  );
}

export default function Home() {
  return (
    <div style={s.page}>
      {/* Nav */}
      <nav style={s.nav}>
        <div style={s.navBrand}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.5C16.5 22.15 20 17.25 20 12V6L12 2z" fill="#4f7eff" opacity="0.2" />
            <path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.5C16.5 22.15 20 17.25 20 12V6L12 2z" stroke="#4f7eff" strokeWidth="1.5" strokeLinejoin="round" />
            <path d="M9 12l2 2 4-4" stroke="#4f7eff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span style={s.navBrandText}>Haya Shield</span>
        </div>
        <div style={s.navLinks}>
          <Link to="/login" style={s.navLink}>Sign in</Link>
          <Link to="/register" style={s.ctaBtn}>Get started free</Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={s.hero}>
        <div style={s.heroTag}>Android Protection Dashboard</div>
        <HeroShield />
        <h1 style={s.heroHeading}>
          Block threats before<br />they reach your device
        </h1>
        <p style={s.heroSub}>
          Haya Shield monitors your Android traffic in real time — blocking ads,<br />
          phishing attempts, and malicious domains, all from one clean dashboard.
        </p>
        <div style={s.heroCtas}>
          <Link to="/register" style={s.primaryBtn}>Create free account</Link>
          <Link to="/login" style={s.ghostBtn}>Sign in to dashboard →</Link>
        </div>

        {/* Stats row */}
        <div style={s.statsRow}>
          <StatPill value="99.7%" label="Threat detection rate" />
          <div style={s.statDivider} />
          <StatPill value="<1ms" label="Block latency" />
          <div style={s.statDivider} />
          <StatPill value="4 types" label="Domain, keyword, app, regex" />
        </div>
      </section>

      {/* Features */}
      <section style={s.section}>
        <div style={s.sectionLabel}>What's inside</div>
        <h2 style={s.sectionHeading}>Everything you need to stay protected</h2>
        <div style={s.featureGrid}>
          <FeatureCard
            icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4f7eff" strokeWidth="1.5" strokeLinecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>}
            title="Live dashboard"
            desc="See threats blocked, ads filtered, and phishing attempts stopped in a real-time chart — updated daily from your device."
          />
          <FeatureCard
            icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><circle cx="3" cy="6" r="1.5" fill="#22c55e"/><circle cx="3" cy="12" r="1.5" fill="#22c55e"/><circle cx="3" cy="18" r="1.5" fill="#22c55e"/></svg>}
            title="Custom blocklist"
            desc="Add domains, keywords, app names, or regex patterns. Enable and disable rules instantly without restarting."
          />
          <FeatureCard
            icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>}
            title="Daily reports"
            desc="Your Android app syncs stats once a day. Browse historical breakdowns and spot patterns over time."
          />
          <FeatureCard
            icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>}
            title="Secure by design"
            desc="JWT-authenticated API, bcrypt-hashed passwords, per-user data isolation. Your shield data stays yours."
          />
        </div>
      </section>

      {/* How it works */}
      <section style={{ ...s.section, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={s.sectionLabel}>Setup in 3 steps</div>
        <h2 style={s.sectionHeading}>Up and running in minutes</h2>
        <div style={s.stepsGrid}>
          {[
            { n: "01", title: "Create your account", desc: "Register with email and password. Your dashboard is ready instantly." },
            { n: "02", title: "Connect the Android app", desc: "Add your API token to the Haya Shield Android app. It will sync stats daily." },
            { n: "03", title: "Set your rules", desc: "Add domains, keywords, or apps to your blocklist. Changes apply immediately." },
          ].map(({ n, title, desc }) => (
            <div key={n} style={s.step}>
              <div style={s.stepNum}>{n}</div>
              <h3 style={s.stepTitle}>{title}</h3>
              <p style={s.stepDesc}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA banner */}
      <section style={s.ctaBanner}>
        <div style={s.ctaBannerGlow} />
        <h2 style={s.ctaBannerHeading}>Start protecting your device today</h2>
        <p style={s.ctaBannerSub}>Free account. No credit card. Takes 30 seconds.</p>
        <Link to="/register" style={{ ...s.primaryBtn, padding: "13px 32px", fontSize: "15px" }}>
          Create free account
        </Link>
      </section>

      {/* Footer */}
      <footer style={s.footer}>
        <div style={s.footerBrand}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.5C16.5 22.15 20 17.25 20 12V6L12 2z" fill="#4f7eff" opacity="0.3" />
            <path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.5C16.5 22.15 20 17.25 20 12V6L12 2z" stroke="#4f7eff" strokeWidth="1.5" strokeLinejoin="round" />
          </svg>
          <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)" }}>Haya Shield © 2026</span>
        </div>
        <div style={{ display: "flex", gap: "24px" }}>
          <Link to="/login" style={s.footerLink}>Sign in</Link>
          <Link to="/register" style={s.footerLink}>Register</Link>
        </div>
      </footer>
    </div>
  );
}

const s = {
  page: {
    minHeight: "100vh",
    background: "#080a0f",
    color: "#e8ecf4",
    fontFamily: "'Inter', system-ui, sans-serif",
    overflowX: "hidden",
  },

  // Nav
  nav: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "20px 48px",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    position: "sticky",
    top: 0,
    background: "rgba(8,10,15,0.85)",
    backdropFilter: "blur(12px)",
    zIndex: 100,
  },
  navBrand: { display: "flex", alignItems: "center", gap: "10px" },
  navBrandText: { fontSize: "16px", fontWeight: 700, letterSpacing: "-0.02em" },
  navLinks: { display: "flex", alignItems: "center", gap: "16px" },
  navLink: { color: "rgba(255,255,255,0.5)", fontSize: "14px", textDecoration: "none" },

  // Hero
  hero: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    padding: "80px 24px 100px",
    background: "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(79,126,255,0.12) 0%, transparent 70%)",
  },
  heroTag: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "11px",
    fontWeight: 600,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: "#4f7eff",
    background: "rgba(79,126,255,0.12)",
    border: "1px solid rgba(79,126,255,0.25)",
    borderRadius: "20px",
    padding: "5px 14px",
    marginBottom: "36px",
  },
  heroShieldWrap: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 260,
    height: 260,
    marginBottom: "8px",
  },
  ring: {
    position: "absolute",
    borderRadius: "50%",
    border: "1px solid #4f7eff",
  },
  heroHeading: {
    fontSize: "clamp(36px, 5vw, 60px)",
    fontWeight: 800,
    letterSpacing: "-0.04em",
    lineHeight: 1.1,
    marginBottom: "20px",
    background: "linear-gradient(180deg, #ffffff 0%, rgba(255,255,255,0.65) 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  heroSub: {
    fontSize: "17px",
    color: "rgba(255,255,255,0.45)",
    lineHeight: 1.7,
    maxWidth: "520px",
    marginBottom: "40px",
  },
  heroCtas: { display: "flex", gap: "12px", alignItems: "center", marginBottom: "60px" },
  statsRow: {
    display: "flex",
    alignItems: "center",
    gap: "32px",
    padding: "20px 32px",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: "12px",
  },
  statPill: { display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" },
  statValue: { fontSize: "18px", fontWeight: 700, letterSpacing: "-0.02em", color: "#fff" },
  statLabel: { fontSize: "11px", color: "rgba(255,255,255,0.35)", textAlign: "center" },
  statDivider: { width: "1px", height: "32px", background: "rgba(255,255,255,0.08)" },

  // Buttons
  primaryBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "11px 24px",
    background: "#4f7eff",
    color: "#fff",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: 600,
    textDecoration: "none",
    transition: "opacity 0.15s",
  },
  ghostBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "11px 20px",
    background: "transparent",
    color: "rgba(255,255,255,0.6)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: 500,
    textDecoration: "none",
  },
  ctaBtn: {
    display: "inline-flex",
    alignItems: "center",
    padding: "8px 16px",
    background: "#4f7eff",
    color: "#fff",
    borderRadius: "7px",
    fontSize: "13px",
    fontWeight: 600,
    textDecoration: "none",
  },

  // Features
  section: {
    maxWidth: "1100px",
    margin: "0 auto",
    padding: "80px 24px",
  },
  sectionLabel: {
    fontSize: "11px",
    fontWeight: 600,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: "#4f7eff",
    marginBottom: "12px",
  },
  sectionHeading: {
    fontSize: "clamp(24px, 3vw, 36px)",
    fontWeight: 700,
    letterSpacing: "-0.03em",
    color: "#fff",
    marginBottom: "48px",
  },
  featureGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "16px",
  },
  featureCard: {
    padding: "28px 24px",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "12px",
    cursor: "default",
  },
  featureIcon: { marginBottom: "16px" },
  featureTitle: { fontSize: "15px", fontWeight: 600, marginBottom: "8px", color: "#fff" },
  featureDesc: { fontSize: "13px", color: "rgba(255,255,255,0.4)", lineHeight: 1.65 },

  // Steps
  stepsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "16px",
  },
  step: {
    padding: "32px 24px",
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "12px",
  },
  stepNum: {
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "0.1em",
    color: "#4f7eff",
    fontFamily: "JetBrains Mono, monospace",
    marginBottom: "14px",
  },
  stepTitle: { fontSize: "15px", fontWeight: 600, color: "#fff", marginBottom: "8px" },
  stepDesc: { fontSize: "13px", color: "rgba(255,255,255,0.4)", lineHeight: 1.65 },

  // CTA Banner
  ctaBanner: {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    padding: "100px 24px",
    overflow: "hidden",
  },
  ctaBannerGlow: {
    position: "absolute",
    inset: 0,
    background: "radial-gradient(ellipse 50% 70% at 50% 100%, rgba(79,126,255,0.15) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  ctaBannerHeading: {
    fontSize: "clamp(28px, 4vw, 44px)",
    fontWeight: 800,
    letterSpacing: "-0.03em",
    color: "#fff",
    marginBottom: "12px",
  },
  ctaBannerSub: {
    fontSize: "15px",
    color: "rgba(255,255,255,0.4)",
    marginBottom: "32px",
  },

  // Footer
  footer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "24px 48px",
    borderTop: "1px solid rgba(255,255,255,0.06)",
  },
  footerBrand: { display: "flex", alignItems: "center", gap: "8px" },
  footerLink: { fontSize: "13px", color: "rgba(255,255,255,0.3)", textDecoration: "none" },
};
