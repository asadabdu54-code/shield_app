import { useState } from 'react';
import { useAuth } from '../hooks/useAuth.jsx';

export default function Settings() {
  const { user, updateMe, logout } = useAuth();

  const [profileForm, setProfileForm] = useState({ name: user?.name || '' });
  const [profileMsg, setProfileMsg]   = useState('');
  const [profileErr, setProfileErr]   = useState('');
  const [profileBusy, setProfileBusy] = useState(false);

  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [pwMsg, setPwMsg]   = useState('');
  const [pwErr, setPwErr]   = useState('');
  const [pwBusy, setPwBusy] = useState(false);

  async function saveProfile(e) {
    e.preventDefault();
    setProfileMsg(''); setProfileErr('');
    setProfileBusy(true);
    try {
      await updateMe({ name: profileForm.name });
      setProfileMsg('Profile updated.');
    } catch (err) {
      setProfileErr(err.response?.data?.error || 'Update failed.');
    } finally {
      setProfileBusy(false);
    }
  }

  async function savePassword(e) {
    e.preventDefault();
    setPwMsg(''); setPwErr('');
    if (pwForm.newPassword !== pwForm.confirm) { setPwErr('Passwords do not match.'); return; }
    if (pwForm.newPassword.length < 8) { setPwErr('New password must be at least 8 characters.'); return; }
    setPwBusy(true);
    try {
      await updateMe({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      setPwMsg('Password changed.');
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      setPwErr(err.response?.data?.error || 'Password update failed.');
    } finally {
      setPwBusy(false);
    }
  }

  return (
    <div style={styles.page}>
      <h1 style={styles.heading}>Settings</h1>

      {/* Profile */}
      <Section title="Profile" description="Update your display name and account details.">
        <form onSubmit={saveProfile} style={styles.form}>
          <div style={styles.row}>
            <label style={styles.label}>
              Email
              <input value={user?.email || ''} disabled style={{ ...styles.input, opacity: 0.5 }} />
            </label>
            <label style={styles.label}>
              Name
              <input
                value={profileForm.name}
                onChange={e => setProfileForm({ name: e.target.value })}
                placeholder="Your name"
                style={styles.input}
              />
            </label>
          </div>
          {profileErr && <Msg type="error">{profileErr}</Msg>}
          {profileMsg && <Msg type="success">{profileMsg}</Msg>}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" disabled={profileBusy} style={styles.saveBtn}>
              {profileBusy ? 'Saving…' : 'Save profile'}
            </button>
          </div>
        </form>
      </Section>

      {/* Password */}
      <Section title="Change password" description="Choose a strong password of at least 8 characters.">
        <form onSubmit={savePassword} style={styles.form}>
          <label style={styles.label}>
            Current password
            <input
              type="password"
              value={pwForm.currentPassword}
              onChange={e => setPwForm(f => ({ ...f, currentPassword: e.target.value }))}
              placeholder="••••••••"
              required
              style={styles.input}
              autoComplete="current-password"
            />
          </label>
          <div style={styles.row}>
            <label style={styles.label}>
              New password
              <input
                type="password"
                value={pwForm.newPassword}
                onChange={e => setPwForm(f => ({ ...f, newPassword: e.target.value }))}
                placeholder="••••••••"
                required
                style={styles.input}
                autoComplete="new-password"
              />
            </label>
            <label style={styles.label}>
              Confirm new password
              <input
                type="password"
                value={pwForm.confirm}
                onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))}
                placeholder="••••••••"
                required
                style={styles.input}
                autoComplete="new-password"
              />
            </label>
          </div>
          {pwErr && <Msg type="error">{pwErr}</Msg>}
          {pwMsg && <Msg type="success">{pwMsg}</Msg>}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" disabled={pwBusy} style={styles.saveBtn}>
              {pwBusy ? 'Updating…' : 'Update password'}
            </button>
          </div>
        </form>
      </Section>

      {/* API info */}
      <Section title="Android app sync" description="Use this endpoint to sync daily stats from the Haya Shield Android app.">
        <div style={styles.codeBlock}>
          <div style={styles.codeLine}><span style={{ color: '#4f7eff' }}>PUT</span> /api/reports/sync</div>
          <div style={styles.codeLine}>{'Authorization: Bearer <your_token>'}</div>
          <div style={styles.codeLine}>{'Content-Type: application/json'}</div>
          <div style={{ marginTop: '8px', color: '#9aa3be' }}>
            {`{
  "date": "2024-12-01",
  "threatsBlocked": 42,
  "adsBlocked": 318,
  "phishingAttempts": 3,
  "dataLeaksPrevented": 1,
  "topBlockedDomains": ["ads.example.com"]
}`}
          </div>
        </div>
      </Section>

      {/* Danger zone */}
      <Section title="Sign out" description="You'll need to log in again to access your dashboard.">
        <button onClick={logout} style={styles.dangerBtn}>Sign out of all sessions</button>
      </Section>
    </div>
  );
}

function Section({ title, description, children }) {
  return (
    <div style={styles.section}>
      <div style={styles.sectionLeft}>
        <h2 style={styles.sectionTitle}>{title}</h2>
        <p style={styles.sectionDesc}>{description}</p>
      </div>
      <div style={styles.sectionRight}>{children}</div>
    </div>
  );
}

function Msg({ type, children }) {
  const isErr = type === 'error';
  return (
    <div style={{
      background: isErr ? 'var(--red-dim)' : 'var(--green-dim)',
      border: `1px solid ${isErr ? 'rgba(239,68,68,.3)' : 'rgba(34,197,94,.3)'}`,
      color: isErr ? '#fca5a5' : '#86efac',
      borderRadius: 'var(--radius-sm)',
      padding: '8px 12px',
      fontSize: '12px',
    }}>
      {children}
    </div>
  );
}

const styles = {
  page:    { maxWidth: 800 },
  heading: { fontSize: '22px', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '32px' },
  section: {
    display: 'grid',
    gridTemplateColumns: '220px 1fr',
    gap: '24px',
    padding: '28px 0',
    borderTop: '1px solid var(--border)',
  },
  sectionLeft: {},
  sectionTitle: { fontSize: '14px', fontWeight: 600, marginBottom: '6px' },
  sectionDesc:  { fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.6 },
  sectionRight: { display: 'flex', flexDirection: 'column', gap: '0' },
  form: { display: 'flex', flexDirection: 'column', gap: '14px' },
  row:  { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  label:{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', fontWeight: 500, color: 'var(--text-dim)' },
  input:{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '9px 12px', color: 'var(--text)', fontSize: '13px', outline: 'none', width: '100%' },
  saveBtn: { background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', padding: '8px 18px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' },
  dangerBtn: { background: 'var(--red-dim)', color: 'var(--red)', border: '1px solid rgba(239,68,68,.3)', borderRadius: 'var(--radius-sm)', padding: '9px 16px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' },
  codeBlock: { background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '16px', fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', color: 'var(--text-dim)', lineHeight: 1.8 },
  codeLine: { lineHeight: 1.8 },
};
