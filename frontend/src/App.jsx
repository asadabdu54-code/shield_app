import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Layout from './components/Layout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Blocklist from './pages/Blocklist.jsx';
import Reports from './pages/Reports.jsx';
import Settings from './pages/Settings.jsx';

function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display:'flex', height:'100vh', alignItems:'center', justifyContent:'center', color:'var(--text-muted)' }}>Loading…</div>;
  return user ? children : <Navigate to="/login" replace />;
}

function GuestOnly({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/" replace /> : children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login"    element={<GuestOnly><Login /></GuestOnly>} />
      <Route path="/register" element={<GuestOnly><Register /></GuestOnly>} />

      <Route path="/" element={<RequireAuth><Layout /></RequireAuth>}>
        <Route index           element={<Dashboard />} />
        <Route path="blocklist" element={<Blocklist />} />
        <Route path="reports"   element={<Reports />} />
        <Route path="settings"  element={<Settings />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
