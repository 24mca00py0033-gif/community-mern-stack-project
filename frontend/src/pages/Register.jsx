import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { HeroArt } from "../components/Illustrations";
import FlowerRain from "../components/FlowerRain";
import { alertErr, btn, card, field, label, wrap } from "../ui";

export default function Register() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await register(form.name, form.email, form.password);
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
          <h2 className="text-3xl font-bold">Create your account</h2>
          <p className="text-muted">Join the Pareek community's Chartered Accountants on Community Connect.</p>

          {error && <div className={alertErr}>{error}</div>}

          <label className={label}>Name</label>
          <input className={field} name="name" value={form.name} onChange={onChange} placeholder="Your name" required />

          <label className={label}>Email</label>
          <input className={field} type="email" name="email" value={form.email} onChange={onChange} placeholder="you@example.com" required />

          <label className={label}>Password</label>
          <input className={field} type="password" name="password" value={form.password} onChange={onChange} placeholder="At least 6 characters" minLength={6} required />

          <button className={`${btn} mt-6 w-full`} disabled={busy}>{busy ? "Creating..." : "Register"}</button>

          <p className="mt-4 text-center text-sm text-muted">
            Already a member? <Link to="/login" className="font-semibold text-brand">Login</Link>
          </p>
        </form>

        <div className="hidden lg:block">
          <HeroArt />
        </div>
      </div>
    </section>
  );
}
