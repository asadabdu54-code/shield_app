import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

// ── Animated threat particle canvas ──────────────────────────────────────────
function ThreatCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener('resize', resize);

    const W = () => canvas.offsetWidth;
    const H = () => canvas.offsetHeight;

    // Threat nodes flying toward shield center
    const cx = () => W() / 2;
    const cy = () => H() / 2;

    const THREAT_COLORS = ['#ef4444', '#f59e0b', '#a78bfa', '#f97316'];
    const SAFE_COLOR    = '#4f7eff';

    // Particles
    const particles = Array.from({ length: 38 }, (_, i) => createParticle(i));

    function createParticle(i) {
      const angle = Math.random() * Math.PI * 2;
      const dist  = 160 + Math.random() * 220;
      return {
        x:       cx() + Math.cos(angle) * dist,
        y:       cy() + Math.sin(angle) * dist,
        originX: cx() + Math.cos(angle) * dist,
        originY: cy() + Math.sin(angle) * dist,
        angle,
        speed:   0.4 + Math.random() * 0.6,
        size:    1.5 + Math.random() * 2,
        color:   THREAT_COLORS[Math.floor(Math.random() * THREAT_COLORS.length)],
        phase:   Math.random() * Math.PI * 2,
        blocked: false,
        blockTimer: 0,
        alpha: 0.6 + Math.random() * 0.4,
      };
    }

    // Pulse rings
    let pulseRings = [];
    let lastPulse = 0;

    // Shield glow oscillation
    let t = 0;

    function drawShield(x, y, size, glowIntensity) {
      const s = size;
      // Outer glow
      const grd = ctx.createRadialGradient(x, y, s * 0.2, x, y, s * 1.4);
      grd.addColorStop(0, `rgba(79,126,255,${0.08 + glowIntensity * 0.12})`);
      grd.addColorStop(1, 'rgba(79,126,255,0)');
      ctx.beginPath();
      ctx.arc(x, y, s * 1.4, 0, Math.PI * 2);
      ctx.fillStyle = grd;
      ctx.fill();

      // Shield body path (scaled)
      const scale = s / 40;
      ctx.save();
      ctx.translate(x - 20 * scale, y - 22 * scale);
      ctx.scale(scale, scale);

      // Fill
      ctx.beginPath();
      ctx.moveTo(20, 2);
      ctx.lineTo(4, 7);
      ctx.lineTo(4, 14);
      ctx.bezierCurveTo(4, 20.5, 8, 26, 12, 28.5);
      ctx.bezierCurveTo(14, 30, 16.5, 31, 20, 32);
      ctx.bezierCurveTo(23.5, 31, 26, 30, 28, 28.5);
      ctx.bezierCurveTo(32, 26, 36, 20.5, 36, 14);
      ctx.lineTo(36, 7);
      ctx.closePath();
      ctx.fillStyle = `rgba(79,126,255,${0.12 + glowIntensity * 0.08})`;
      ctx.fill();
      ctx.strokeStyle = `rgba(79,126,255,${0.7 + glowIntensity * 0.3})`;
      ctx.lineWidth = 1.5 / scale;
      ctx.stroke();

      // Checkmark
      ctx.beginPath();
      ctx.moveTo(13, 17);
      ctx.lineTo(17.5, 22);
      ctx.lineTo(27, 12);
      ctx.strokeStyle = `rgba(79,126,255,${0.8 + glowIntensity * 0.2})`;
      ctx.lineWidth = 2.2 / scale;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();

      ctx.restore();
    }

    function frame(ts) {
      ctx.clearRect(0, 0, W(), H());
      t += 0.012;

      const shieldX = cx();
      const shieldY = cy();
      const shieldR = 42;
      const glow    = (Math.sin(t) + 1) / 2;

      // Spawn pulse rings occasionally
      if (ts - lastPulse > 2200) {
        pulseRings.push({ r: shieldR, alpha: 0.5, ts });
        lastPulse = ts;
      }

      // Draw pulse rings
      pulseRings = pulseRings.filter(ring => ring.alpha > 0.01);
      for (const ring of pulseRings) {
        ring.r += 1.2;
        ring.alpha *= 0.965;
        ctx.beginPath();
        ctx.arc(shieldX, shieldY, ring.r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(79,126,255,${ring.alpha})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }

      // Connection lines from particles to shield
      for (const p of particles) {
        const dx = shieldX - p.x;
        const dy = shieldY - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > shieldR + 6 && !p.blocked) {
          p.x += (dx / dist) * p.speed;
          p.y += (dy / dist) * p.speed;
        }

        // Block at shield edge
        if (dist < shieldR + 8 && !p.blocked) {
          p.blocked = true;
          p.blockTimer = 60;
        }

        if (p.blocked) {
          p.blockTimer--;
          // Flash then reset
          if (p.blockTimer < 0) {
            const angle = Math.random() * Math.PI * 2;
            const d = 160 + Math.random() * 200;
            p.x = shieldX + Math.cos(angle) * d;
            p.y = shieldY + Math.sin(angle) * d;
            p.originX = p.x;
            p.originY = p.y;
            p.blocked = false;
            p.color = THREAT_COLORS[Math.floor(Math.random() * THREAT_COLORS.length)];
            p.speed = 0.4 + Math.random() * 0.6;
          }
          // Block burst effect
          if (p.blockTimer > 40) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, 5 * (1 - p.blockTimer / 60), 0, Math.PI * 2);
            ctx.fillStyle = `rgba(239,68,68,${0.6 * (p.blockTimer / 60)})`;
            ctx.fill();
          }
          continue;
        }

        // Trail line
        const lineAlpha = Math.max(0, (1 - dist / 380) * 0.25);
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(shieldX, shieldY);
        ctx.strokeStyle = `rgba(239,68,68,${lineAlpha})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();

        // Particle dot
        const flicker = 0.7 + 0.3 * Math.sin(t * 3 + p.phase);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * flicker, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha * flicker;
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      drawShield(shieldX, shieldY, shieldR, glow);

      raf = requestAnimationFrame(frame);
    }

    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        display: 'block',
      }}
    />
  );
}

// ── Live counter ticker ───────────────────────────────────────────────────────
function LiveCounter({ target, label, color, icon, delay = 0 }) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    let current = 0;
    const step = Math.ceil(target / 60);
    const interval = setInterval(() => {
      current = Math.min(current + step, target);
      setCount(current);
      if (current >= target) clearInterval(interval);
    }, 16);
    return () => clearInterval(interval);
  }, [started, target]);

  return (
    <div style={s.counterCard}>
      <div style={{ ...s.counterIcon, background: `${color}18` }}>{icon}</div>
      <div style={{ ...s.counterValue, color }}>{count.toLocaleString()}+</div>
      <div style={s.counterLabel}>{label}</div>
    </div>
  );
}

// ── Feature card ─────────────────────────────────────────────────────────────
function FeatureCard({ icon, title, desc, accent }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      style={{
        ...s.featureCard,
        borderColor: hovered ? accent : 'var(--border)',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: hovered ? `0 12px 40px ${accent}22` : 'none',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{ ...s.featureIconWrap, background: `${accent}15`, color: accent }}>
        {icon}
      </div>
      <div style={s.featureTitle}>{title}</div>
      <div style={s.featureDesc}>{desc}</div>
    </div>
  );
}

// ── Scrolling threat ticker ───────────────────────────────────────────────────
const THREATS = [
  { type: 'AD', domain: 'ads.doubleclick.net', color: '#4f7eff' },
  { type: 'PHISH', domain: 'secure-paypal-login.xyz', color: '#ef4444' },
  { type: 'MALWARE', domain: 'cdn.trackerking.io', color: '#f97316' },
  { type: 'LEAK', domain: 'telemetry.analytics.co', color: '#f59e0b' },
  { type: 'AD', domain: 'pixel.facebook.com', color: '#4f7eff' },
  { type: 'PHISH', domain: 'amazon-account-verify.ru', color: '#ef4444' },
  { type: 'SPYWARE', domain: 'sdk.adcolony.net', color: '#a78bfa' },
  { type: 'AD', domain: 'googlesyndication.com', color: '#4f7eff' },
  { type: 'MALWARE', domain: 'update-flash-now.com', color: '#f97316' },
  { type: 'LEAK', domain: 'data.adjust.com', color: '#f59e0b' },
];

function ThreatTicker() {
  const [offset, setOffset] = useState(0);
  const speedRef = useRef(0.6);
  const rafRef = useRef();

  useEffect(() => {
    const tick = () => {
      setOffset(o => {
        const itemW = 220;
        const total = THREATS.length * itemW;
        return (o + speedRef.current) % total;
      });
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const doubled = [...THREATS, ...THREATS];

  return (
    <div style={s.tickerOuter}>
      <div style={s.tickerLabel}>
        <span style={s.tickerDot} />
        LIVE THREATS BLOCKED
      </div>
      <div style={s.tickerTrack}>
        <div style={{ display: 'flex', transform: `translateX(-${offset}px)`, willChange: 'transform' }}>
          {doubled.map((t, i) => (
            <div key={i} style={{ ...s.tickerItem, borderColor: `${t.color}40` }}>
              <span style={{ ...s.tickerBadge, background: `${t.color}20`, color: t.color }}>
                {t.type}
              </span>
              <span style={s.tickerDomain}>{t.domain}</span>
              <span style={{ ...s.tickerX, color: t.color }}>✕</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main Home Page ────────────────────────────────────────────────────────────
export default function Home() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={s.page}>
      {/* ── Hero ── */}
      <section style={s.hero}>
        {/* Radial bg glow */}
        <div style={s.heroBg} />

        {/* Nav */}
        <nav style={s.nav}>
          <div style={s.brand}>
            <ShieldMark />
            <span style={s.brandName}>Haya Shield</span>
          </div>
          <div style={s.navLinks}>
            <Link to="/login"    style={s.navBtn}>Sign in</Link>
            <Link to="/register" style={s.navBtnPrimary}>Get started →</Link>
          </div>
        </nav>

        {/* Hero content */}
        <div style={{ ...s.heroContent, opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(24px)', transition: 'all 0.7s cubic-bezier(.4,0,.2,1)' }}>
          <div style={s.eyebrow}>
            <span style={s.eyebrowDot} />
            Android Network Security
          </div>
          <h1 style={s.heroTitle}>
            Your phone's<br />
            <span style={s.heroAccent}>invisible shield</span>
          </h1>
          <p style={s.heroSub}>
            Haya Shield intercepts threats, blocks ads, stops phishing attacks,
            and prevents data leaks — silently, in real time, on every connection
            your Android device makes.
          </p>
          <div style={s.heroCta}>
            <Link to="/register" style={s.ctaPrimary}>Start protecting your device</Link>
            <Link to="/login"    style={s.ctaSecondary}>View dashboard</Link>
          </div>
        </div>

        {/* Canvas animation */}
        <div style={{ ...s.canvasWrap, opacity: visible ? 1 : 0, transition: 'opacity 1s ease 0.4s' }}>
          <ThreatCanvas />
          <div style={s.canvasLabel}>Threats being intercepted live</div>
        </div>

        {/* Threat ticker */}
        <div style={{ ...s.tickerWrapper, opacity: visible ? 1 : 0, transition: 'opacity 0.8s ease 0.8s' }}>
          <ThreatTicker />
        </div>
      </section>

      {/* ── Stats ── */}
      <section style={s.statsSection}>
        <LiveCounter target={284917} label="Threats blocked today"      color="#ef4444" icon={<ShieldIcon />} delay={300} />
        <LiveCounter target={1203482} label="Ads eliminated"            color="#4f7eff" icon={<BlockIcon />}  delay={450} />
        <LiveCounter target={12841}   label="Phishing attempts stopped" color="#f59e0b" icon={<FishIcon />}   delay={600} />
        <LiveCounter target={4293}    label="Data leaks prevented"      color="#22c55e" icon={<LockIcon />}   delay={750} />
      </section>

      {/* ── How it works ── */}
      <section style={s.section}>
        <div style={s.sectionHead}>
          <div style={s.sectionEyebrow}>HOW IT WORKS</div>
          <h2 style={s.sectionTitle}>Protection that runs before threats reach you</h2>
          <p style={s.sectionSub}>Haya Shield acts as a local VPN on your Android device — intercepting every DNS query and network request before it ever connects.</p>
        </div>

        <div style={s.stepsWrap}>
          {[
            { n: '01', title: 'Traffic intercepted', desc: 'Every DNS lookup and network request from your device passes through Haya Shield\'s local engine first.' },
            { n: '02', title: 'Rules applied', desc: 'Your custom blocklist of domains, keywords, apps, and regex patterns is checked in milliseconds.' },
            { n: '03', title: 'Threats nullified', desc: 'Malicious, tracking, or unwanted traffic is dropped silently. Clean traffic passes through instantly.' },
            { n: '04', title: 'Stats reported', desc: 'Every blocked request is logged and surfaced in your dashboard so you always know what\'s being stopped.' },
          ].map((step, i) => (
            <div key={i} style={s.step}>
              <div style={s.stepNum}>{step.n}</div>
              <div style={s.stepTitle}>{step.title}</div>
              <div style={s.stepDesc}>{step.desc}</div>
              {i < 3 && <div style={s.stepArrow}>→</div>}
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section style={s.section}>
        <div style={s.sectionHead}>
          <div style={s.sectionEyebrow}>CAPABILITIES</div>
          <h2 style={s.sectionTitle}>Every layer of your connection, defended</h2>
        </div>

        <div style={s.featuresGrid}>
          <FeatureCard
            icon={<ThreatIcon />}
            title="Threat blocking"
            desc="Known malware domains, command-and-control servers, and exploit kits are blocked the moment your device tries to connect."
            accent="#ef4444"
          />
          <FeatureCard
            icon={<AdIcon />}
            title="Ad elimination"
            desc="Advertising networks, tracking pixels, and data brokers are silenced across all apps — not just your browser."
            accent="#4f7eff"
          />
          <FeatureCard
            icon={<PhishIcon />}
            title="Phishing defense"
            desc="Lookalike domains and credential-harvesting sites are identified and blocked before any page loads."
            accent="#f59e0b"
          />
          <FeatureCard
            icon={<LeakIcon />}
            title="Data leak prevention"
            desc="Covert exfiltration attempts from apps trying to phone home with your personal data are caught and stopped."
            accent="#22c55e"
          />
          <FeatureCard
            icon={<RulesIcon />}
            title="Custom blocklist"
            desc="Build rules using domains, keywords, app names, or regex patterns. You control exactly what gets blocked."
            accent="#a78bfa"
          />
          <FeatureCard
            icon={<ReportIcon />}
            title="Live reports"
            desc="See every blocked request in a clean timeline. Understand your device's threat landscape at a glance."
            accent="#f97316"
          />
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section style={s.ctaBanner}>
        <div style={s.ctaBannerGlow} />
        <ShieldMark large />
        <h2 style={s.ctaBannerTitle}>Start blocking threats today</h2>
        <p style={s.ctaBannerSub}>Create a free account, pair the Android app, and your device is protected within minutes.</p>
        <Link to="/register" style={s.ctaPrimary}>Create your free account →</Link>
      </section>

      {/* ── Footer ── */}
      <footer style={s.footer}>
        <div style={s.footerBrand}>
          <ShieldMark />
          <span style={s.brandName}>Haya Shield</span>
        </div>
        <div style={s.footerLinks}>
          <Link to="/login"    style={s.footerLink}>Sign in</Link>
          <Link to="/register" style={s.footerLink}>Register</Link>
        </div>
        <div style={s.footerCopy}>© {new Date().getFullYear()} Haya Shield. All rights reserved.</div>
      </footer>
    </div>
  );
}

// ── Icon components ───────────────────────────────────────────────────────────
const ip = { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' };

function ShieldMark({ large }) {
  const sz = large ? 48 : 28;
  return (
    <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none">
      <path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.5C16.5 22.15 20 17.25 20 12V6L12 2z" fill="var(--accent)" opacity=".2"/>
      <path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.5C16.5 22.15 20 17.25 20 12V6L12 2z" stroke="var(--accent)" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M9 12l2 2 4-4" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function ShieldIcon()  { return <svg {...ip}><path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.5C16.5 22.15 20 17.25 20 12V6L12 2z"/><path d="M9 12l2 2 4-4"/></svg>; }
function BlockIcon()   { return <svg {...ip}><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>; }
function FishIcon()    { return <svg {...ip}><path d="M6 12l10-6v12L6 12z"/><path d="M18 12h3"/></svg>; }
function LockIcon()    { return <svg {...ip}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>; }
function ThreatIcon()  { return <svg {...ip}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>; }
function AdIcon()      { return <svg {...ip}><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 17V7l6 5-6 5z"/></svg>; }
function PhishIcon()   { return <svg {...ip}><path d="M18 20l-6-8-6 8"/><path d="M12 4c0 4 4 8 4 8"/></svg>; }
function LeakIcon()    { return <svg {...ip}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>; }
function RulesIcon()   { return <svg {...ip}><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><circle cx="3" cy="6" r="1.5" fill="currentColor"/><circle cx="3" cy="12" r="1.5" fill="currentColor"/><circle cx="3" cy="18" r="1.5" fill="currentColor"/></svg>; }
function ReportIcon()  { return <svg {...ip}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>; }

// ── Styles ────────────────────────────────────────────────────────────────────
const s = {
  page: {
    minHeight: '100vh',
    background: 'var(--bg)',
    color: 'var(--text)',
    fontFamily: "'Inter', system-ui, sans-serif",
    overflowX: 'hidden',
  },

  // Hero
  hero: {
    position: 'relative',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    overflow: 'hidden',
    paddingBottom: '60px',
  },
  heroBg: {
    position: 'absolute',
    top: '-200px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '900px',
    height: '700px',
    background: 'radial-gradient(ellipse 60% 60% at 50% 30%, rgba(79,126,255,0.13) 0%, transparent 70%)',
    pointerEvents: 'none',
    zIndex: 0,
  },

  // Nav
  nav: {
    width: '100%',
    maxWidth: '1100px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '24px 32px',
    zIndex: 10,
    position: 'relative',
  },
  brand: { display: 'flex', alignItems: 'center', gap: '10px' },
  brandName: { fontWeight: 700, fontSize: '16px', letterSpacing: '-0.02em' },
  navLinks: { display: 'flex', alignItems: 'center', gap: '12px' },
  navBtn: {
    padding: '8px 16px',
    borderRadius: '8px',
    color: 'var(--text-muted)',
    fontSize: '14px',
    fontWeight: 500,
    transition: 'color 0.15s',
  },
  navBtnPrimary: {
    padding: '8px 18px',
    borderRadius: '8px',
    background: 'var(--accent)',
    color: '#fff',
    fontSize: '14px',
    fontWeight: 600,
  },

  // Hero content
  heroContent: {
    position: 'relative',
    zIndex: 5,
    textAlign: 'center',
    maxWidth: '680px',
    padding: '60px 24px 0',
  },
  eyebrow: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '11px',
    fontWeight: 600,
    letterSpacing: '0.12em',
    color: 'var(--accent)',
    textTransform: 'uppercase',
    marginBottom: '20px',
    background: 'rgba(79,126,255,0.1)',
    padding: '5px 14px',
    borderRadius: '100px',
    border: '1px solid rgba(79,126,255,0.2)',
  },
  eyebrowDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: 'var(--accent)',
    animation: 'pulse 2s infinite',
    boxShadow: '0 0 0 0 rgba(79,126,255,0.4)',
  },
  heroTitle: {
    fontSize: 'clamp(38px, 6vw, 68px)',
    fontWeight: 800,
    letterSpacing: '-0.04em',
    lineHeight: 1.08,
    marginBottom: '20px',
    color: 'var(--text)',
  },
  heroAccent: {
    background: 'linear-gradient(135deg, #4f7eff 0%, #a78bfa 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  heroSub: {
    fontSize: '17px',
    color: 'var(--text-dim)',
    lineHeight: 1.65,
    maxWidth: '520px',
    margin: '0 auto 32px',
  },
  heroCta: { display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' },
  ctaPrimary: {
    padding: '13px 28px',
    background: 'var(--accent)',
    color: '#fff',
    borderRadius: '10px',
    fontWeight: 600,
    fontSize: '15px',
    boxShadow: '0 0 32px rgba(79,126,255,0.35)',
    transition: 'box-shadow 0.2s, transform 0.2s',
  },
  ctaSecondary: {
    padding: '13px 24px',
    background: 'var(--bg-2)',
    color: 'var(--text-dim)',
    borderRadius: '10px',
    fontWeight: 500,
    fontSize: '15px',
    border: '1px solid var(--border)',
  },

  // Canvas
  canvasWrap: {
    position: 'relative',
    zIndex: 3,
    width: '340px',
    height: '340px',
    marginTop: '40px',
  },
  canvasLabel: {
    position: 'absolute',
    bottom: '-28px',
    left: '50%',
    transform: 'translateX(-50%)',
    fontSize: '11px',
    color: 'var(--text-muted)',
    letterSpacing: '0.06em',
    whiteSpace: 'nowrap',
  },

  // Ticker
  tickerWrapper: {
    position: 'relative',
    zIndex: 4,
    width: '100%',
    marginTop: '64px',
  },
  tickerOuter: {
    width: '100%',
    overflow: 'hidden',
    borderTop: '1px solid var(--border)',
    borderBottom: '1px solid var(--border)',
    background: 'rgba(19,22,30,0.8)',
    backdropFilter: 'blur(8px)',
    padding: '14px 0',
  },
  tickerLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '10px',
    fontWeight: 700,
    letterSpacing: '0.1em',
    color: 'var(--text-muted)',
    padding: '0 24px 8px',
  },
  tickerDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: '#ef4444',
    boxShadow: '0 0 6px #ef4444',
    display: 'inline-block',
    flexShrink: 0,
  },
  tickerTrack: { overflow: 'hidden', width: '100%' },
  tickerItem: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 16px',
    marginRight: '8px',
    background: 'var(--bg-3)',
    borderRadius: '6px',
    border: '1px solid',
    width: '212px',
    flexShrink: 0,
  },
  tickerBadge: {
    fontSize: '9px',
    fontWeight: 700,
    letterSpacing: '0.05em',
    padding: '2px 6px',
    borderRadius: '4px',
    flexShrink: 0,
  },
  tickerDomain: {
    fontSize: '11px',
    color: 'var(--text-dim)',
    fontFamily: 'JetBrains Mono, monospace',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    flex: 1,
  },
  tickerX: { fontSize: '12px', fontWeight: 700, flexShrink: 0 },

  // Stats
  statsSection: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '1px',
    background: 'var(--border)',
    borderTop: '1px solid var(--border)',
    borderBottom: '1px solid var(--border)',
  },
  counterCard: {
    background: 'var(--bg-2)',
    padding: '36px 28px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
    textAlign: 'center',
  },
  counterIcon: {
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'inherit',
  },
  counterValue: {
    fontSize: '32px',
    fontWeight: 800,
    letterSpacing: '-0.04em',
    fontFamily: 'JetBrains Mono, monospace',
    lineHeight: 1,
  },
  counterLabel: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    fontWeight: 500,
  },

  // Sections
  section: {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '80px 32px',
  },
  sectionHead: {
    textAlign: 'center',
    marginBottom: '56px',
  },
  sectionEyebrow: {
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '0.12em',
    color: 'var(--accent)',
    marginBottom: '12px',
  },
  sectionTitle: {
    fontSize: 'clamp(26px, 4vw, 40px)',
    fontWeight: 800,
    letterSpacing: '-0.03em',
    marginBottom: '16px',
    lineHeight: 1.15,
  },
  sectionSub: {
    fontSize: '16px',
    color: 'var(--text-dim)',
    maxWidth: '540px',
    margin: '0 auto',
    lineHeight: 1.65,
  },

  // Steps
  stepsWrap: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '0',
    position: 'relative',
  },
  step: {
    padding: '28px 24px',
    background: 'var(--bg-2)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    margin: '0 6px',
    position: 'relative',
  },
  stepNum: {
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '0.1em',
    color: 'var(--accent)',
    marginBottom: '12px',
    fontFamily: 'JetBrains Mono, monospace',
  },
  stepTitle: {
    fontSize: '15px',
    fontWeight: 700,
    marginBottom: '8px',
    letterSpacing: '-0.02em',
  },
  stepDesc: {
    fontSize: '13px',
    color: 'var(--text-muted)',
    lineHeight: 1.6,
  },
  stepArrow: {
    position: 'absolute',
    right: '-18px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'var(--border)',
    fontSize: '18px',
    zIndex: 2,
  },

  // Features
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px',
  },
  featureCard: {
    background: 'var(--bg-2)',
    border: '1px solid var(--border)',
    borderRadius: '14px',
    padding: '28px 24px',
    transition: 'border-color 0.2s, transform 0.2s, box-shadow 0.2s',
    cursor: 'default',
  },
  featureIconWrap: {
    width: '44px',
    height: '44px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '16px',
  },
  featureTitle: {
    fontSize: '15px',
    fontWeight: 700,
    letterSpacing: '-0.02em',
    marginBottom: '8px',
  },
  featureDesc: {
    fontSize: '13px',
    color: 'var(--text-muted)',
    lineHeight: 1.65,
  },

  // CTA Banner
  ctaBanner: {
    position: 'relative',
    textAlign: 'center',
    padding: '100px 32px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '20px',
    borderTop: '1px solid var(--border)',
  },
  ctaBannerGlow: {
    position: 'absolute',
    inset: 0,
    background: 'radial-gradient(ellipse 60% 80% at 50% 0%, rgba(79,126,255,0.1) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  ctaBannerTitle: {
    fontSize: 'clamp(28px, 4vw, 44px)',
    fontWeight: 800,
    letterSpacing: '-0.03em',
    position: 'relative',
    zIndex: 1,
  },
  ctaBannerSub: {
    fontSize: '16px',
    color: 'var(--text-dim)',
    maxWidth: '460px',
    lineHeight: 1.6,
    position: 'relative',
    zIndex: 1,
  },

  // Footer
  footer: {
    borderTop: '1px solid var(--border)',
    padding: '28px 40px',
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
  },
  footerBrand: { display: 'flex', alignItems: 'center', gap: '8px' },
  footerLinks: { display: 'flex', gap: '16px', marginLeft: 'auto' },
  footerLink: { fontSize: '13px', color: 'var(--text-muted)' },
  footerCopy: { fontSize: '12px', color: 'var(--text-muted)' },
};
