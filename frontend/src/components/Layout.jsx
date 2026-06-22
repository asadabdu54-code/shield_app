import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';

const NAV = [
  { to: '/',          label: 'Dashboard', icon: <GridIcon /> },
  { to: '/blocklist', label: 'Blocklist',  icon: <ListIcon /> },
  { to: '/reports',   label: 'Reports',    icon: <ChartIcon /> },
  { to: '/settings',  label: 'Settings',   icon: <GearIcon /> },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : (user?.email?.[0] ?? '?').toUpperCase();

  return (
    <div style={styles.shell}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <div style={styles.brand}>
          <ShieldIcon />
          <span style={styles.brandName}>Haya Shield</span>
        </div>

        <nav style={styles.nav}>
          {NAV.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              style={({ isActive }) => ({
                ...styles.navItem,
                ...(isActive ? styles.navItemActive : {}),
              })}
            >
              <span style={styles.navIcon}>{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        <div style={styles.userArea}>
          <div style={styles.avatar}>{initials}</div>
          <div style={styles.userInfo}>
            <div style={styles.userName}>{user?.name || 'User'}</div>
            <div style={styles.userEmail}>{user?.email}</div>
          </div>
          <button onClick={handleLogout} style={styles.logoutBtn} title="Sign out">
            <LogoutIcon />
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}

// ── Icons ──────────────────────────────────────────────────────────────────────
const iconProps = { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' };

function ShieldIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.5C16.5 22.15 20 17.25 20 12V6L12 2z" fill="var(--accent)" opacity=".2"/>
      <path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.5C16.5 22.15 20 17.25 20 12V6L12 2z" stroke="var(--accent)" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M9 12l2 2 4-4" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function GridIcon() {
  return <svg {...iconProps}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>;
}
function ListIcon() {
  return <svg {...iconProps}><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><circle cx="3" cy="6" r="1.5" fill="currentColor"/><circle cx="3" cy="12" r="1.5" fill="currentColor"/><circle cx="3" cy="18" r="1.5" fill="currentColor"/></svg>;
}
function ChartIcon() {
  return <svg {...iconProps}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>;
}
function GearIcon() {
  return <svg {...iconProps}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>;
}
function LogoutIcon() {
  return <svg {...iconProps}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
}

// ── Styles ─────────────────────────────────────────────────────────────────────
const styles = {
  shell: { display: 'flex', height: '100vh', overflow: 'hidden' },
  sidebar: {
    width: '220px',
    flexShrink: 0,
    background: 'var(--bg-2)',
    borderRight: '1px solid var(--border)',
    display: 'flex',
    flexDirection: 'column',
    padding: '20px 12px',
  },
  brand: { display: 'flex', alignItems: 'center', gap: '10px', padding: '4px 8px', marginBottom: '28px' },
  brandName: { fontWeight: 700, fontSize: '15px', letterSpacing: '-0.02em' },
  nav: { display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '9px 10px',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-muted)',
    fontSize: '13.5px',
    fontWeight: 500,
    transition: 'all 0.15s',
    textDecoration: 'none',
  },
  navItemActive: {
    background: 'var(--accent-glow)',
    color: 'var(--accent)',
  },
  navIcon: { display: 'flex', alignItems: 'center', width: '16px' },
  userArea: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 8px',
    borderTop: '1px solid var(--border)',
    marginTop: '12px',
  },
  avatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: 'var(--accent)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: 700,
    flexShrink: 0,
  },
  userInfo: { flex: 1, overflow: 'hidden' },
  userName: { fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  userEmail: { fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  logoutBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    display: 'flex',
    alignItems: 'center',
    padding: '4px',
    borderRadius: '4px',
    transition: 'color 0.15s',
    flexShrink: 0,
  },
  main: { flex: 1, overflow: 'auto', padding: '32px', background: 'var(--bg)' },
};
