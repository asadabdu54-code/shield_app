import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount, verify existing token
  useEffect(() => {
    const token = localStorage.getItem('haya_token');
    if (!token) { setLoading(false); return; }

    api.get('/auth/me')
      .then(({ data }) => setUser(data.user))
      .catch(() => localStorage.removeItem('haya_token'))
      .finally(() => setLoading(false));
  }, []);

  async function login(email, password) {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('haya_token', data.token);
    setUser(data.user);
    return data.user;
  }

  async function register(email, password, name) {
    const { data } = await api.post('/auth/register', { email, password, name });
    localStorage.setItem('haya_token', data.token);
    setUser(data.user);
    return data.user;
  }

  function logout() {
    localStorage.removeItem('haya_token');
    setUser(null);
  }

  async function updateMe(fields) {
    const { data } = await api.patch('/auth/me', fields);
    setUser(data.user);
    return data.user;
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateMe }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
