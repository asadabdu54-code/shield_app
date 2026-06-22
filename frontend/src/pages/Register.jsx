import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.jsx";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });

  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function set(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirm) {
      setError("Passwords do not match");
      return;
    }

    setBusy(true);

    try {
      await register(form.name, form.email, form.password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input value={form.name} onChange={set("name")} placeholder="Name" />

      <input
        type="email"
        value={form.email}
        onChange={set("email")}
        placeholder="Email"
        required
      />

      <input
        type="password"
        value={form.password}
        onChange={set("password")}
        placeholder="Password"
        required
      />

      <input
        type="password"
        value={form.confirm}
        onChange={set("confirm")}
        placeholder="Confirm password"
        required
      />

      <button disabled={busy}>{busy ? "Creating..." : "Register"}</button>

      <Link to="/login">Login</Link>

      {error && <p>{error}</p>}
    </form>
  );
}
