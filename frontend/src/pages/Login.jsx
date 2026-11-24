import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { HeroArt } from "../components/Illustrations";
import FlowerRain from "../components/FlowerRain";
import { alertErr, btn, card, field, label, wrap } from "../ui";

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login(form.email, form.password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#f3f1ff] via-white to-[#fff4ec]">
      <FlowerRain />
      <div className={`${wrap} grid items-center gap-10 py-12 lg:grid-cols-[440px_1fr] lg:py-16`}>
        <form className={card} onSubmit={onSubmit}>
          <h2 className="text-3xl font-bold">Welcome back</h2>
          <p className="text-muted">Login to connect with fellow Chartered Accountants of the Pareek community.</p>

          {error && <div className={alertErr}>{error}</div>}

          <label className={label}>Email</label>
          <input className={field} type="email" name="email" value={form.email} onChange={onChange} placeholder="you@example.com" required />

          <label className={label}>Password</label>
          <input className={field} type="password" name="password" value={form.password} onChange={onChange} placeholder="Your password" required />

          <button className={`${btn} mt-6 w-full`} disabled={busy}>{busy ? "Logging in..." : "Login"}</button>

          <p className="mt-4 text-center text-sm text-muted">
            New here? <Link to="/register" className="font-semibold text-brand">Create an account</Link>
          </p>
        </form>

        <div className="hidden lg:block">
          <HeroArt />
        </div>
      </div>
    </section>
  );
}
