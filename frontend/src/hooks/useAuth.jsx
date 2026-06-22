import { createContext, useContext, useEffect, useState } from "react";
import api from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // restore session
  useEffect(() => {
    const token = localStorage.getItem("haya_token");

    if (!token) {
      setLoading(false);
      return;
    }

    api
      .get("/auth/me")
      .then((res) => setUser(res.data.user))
      .catch(() => localStorage.removeItem("haya_token"))
      .finally(() => setLoading(false));
  }, []);

  // LOGIN
  async function login(email, password) {
    const res = await api.post("/auth/login", {
      email,
      password,
    });

    localStorage.setItem("haya_token", res.data.token);
    setUser(res.data.user);

    return res.data.user;
  }

  // REGISTER
  async function register(email, password, name) {
    const res = await api.post("/auth/register", {
      name,
      email,
      password,
    });

    localStorage.setItem("haya_token", res.data.token);
    setUser(res.data.user);

    return res.data.user;
  }

  // LOGOUT
  function logout() {
    localStorage.removeItem("haya_token");
    setUser(null);
  }

  // UPDATE PROFILE
  async function updateMe(fields) {
    const res = await api.patch("/auth/me", fields);
    setUser(res.data.user);
    return res.data.user;
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, updateMe }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
