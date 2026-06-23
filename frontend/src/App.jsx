import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Layout from "./components/Layout.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Blocklist from "./pages/Blocklist.jsx";
import Reports from "./pages/Reports.jsx";
import Settings from "./pages/Settings.jsx";

function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  if (loading)
    return (
      <div
        style={{
          display: "flex",
          height: "100vh",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--text-muted)",
          gap: "12px",
        }}
      >
        <LoadingSpinner />
        Loading…
      </div>
    );
  return user ? children : <Navigate to="/login" replace />;
}

function GuestOnly({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/dashboard" replace /> : children;
}

function LoadingSpinner() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      style={{ animation: "spin 1s linear infinite" }}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round" />
    </svg>
  );
}

export default function App() {
  return (
    <>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <Routes>
        {/* Public home page */}
        <Route path="/" element={<GuestOnly><Home /></GuestOnly>} />

        {/* Auth pages */}
        <Route path="/login"    element={<GuestOnly><Login /></GuestOnly>} />
        <Route path="/register" element={<GuestOnly><Register /></GuestOnly>} />

        {/* Protected app */}
        <Route path="/dashboard" element={<RequireAuth><Layout /></RequireAuth>}>
          <Route index element={<Dashboard />} />
        </Route>
        <Route path="/blocklist" element={<RequireAuth><Layout /></RequireAuth>}>
          <Route index element={<Blocklist />} />
        </Route>
        <Route path="/reports" element={<RequireAuth><Layout /></RequireAuth>}>
          <Route index element={<Reports />} />
        </Route>
        <Route path="/settings" element={<RequireAuth><Layout /></RequireAuth>}>
          <Route index element={<Settings />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
