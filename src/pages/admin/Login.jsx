import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, setToken } from "../../lib/api.js";
import { Lock, ShieldCheck, LogOut } from "../../components/Icons.jsx";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await api.post("/admin/login", { username, password });
      setToken(data.token);
      navigate("/admin", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-full overflow-hidden bg-slate-50 bg-mesh flex items-center justify-center px-5 py-12">
      <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-brand-300/25 blur-3xl" />
      <div className="relative w-full max-w-sm animate-fade-up">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-glow">
            <Lock size={30} />
          </div>
          <h1 className="mt-5 text-xl font-extrabold text-slate-900">
            تسجيل دخول المشرف
          </h1>
          <p className="mt-1.5 flex items-center justify-center gap-1.5 text-sm text-slate-400">
            <ShieldCheck size={15} />
            منطقة محمية — للمصرّح لهم فقط
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          className="mt-8 space-y-4 rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-card backdrop-blur"
        >
          {error && (
            <div className="rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
              {error}
            </div>
          )}
          <div>
            <label className="mb-1 block text-sm font-bold text-slate-600">
              اسم المستخدم
            </label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
              autoComplete="username"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-bold text-slate-600">
              كلمة المرور
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
              autoComplete="current-password"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gradient px-5 py-3 font-bold text-white shadow-glow transition hover:brightness-105 active:scale-[0.99] disabled:opacity-50"
          >
            {loading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                جارٍ الدخول...
              </>
            ) : (
              <>
                <LogOut size={18} className="rotate-180" />
                دخول
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
