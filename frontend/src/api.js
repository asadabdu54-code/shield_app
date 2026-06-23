import axios from "axios";

// In dev: VITE_API_URL is empty so vite proxy handles /api → localhost:5000
// In prod: VITE_API_URL = https://your-api.onrender.com/api (set in Vercel env vars)
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
});

// Attach JWT on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("haya_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// On 401, clear token and redirect to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("haya_token");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;
