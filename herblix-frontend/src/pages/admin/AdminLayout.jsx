import { NavLink, Outlet, useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import { api } from "../../lib/api.js";

const links = [
  { to: "/admin", label: "لوحة التحكم", end: true },
  { to: "/admin/codes", label: "إدارة الرموز" },
  { to: "/admin/settings", label: "الإعدادات" },
];

export default function AdminLayout() {
  const { loading, admin } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-full flex items-center justify-center text-slate-400">
        جارٍ التحميل...
      </div>
    );
  }
  if (!admin) return <Navigate to="/admin/login" replace />;

  async function logout() {
    try {
      await api.post("/admin/logout");
    } catch {
      // ignore
    }
    navigate("/admin/login", { replace: true });
  }

  return (
    <div className="min-h-full bg-slate-50">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="" className="h-9 w-9 rounded-lg" />
            <span className="font-extrabold text-slate-800">لوحة الإدارة</span>
          </div>
          <nav className="hidden gap-1 md:flex">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={({ isActive }) =>
                  `rounded-lg px-4 py-2 text-sm font-bold transition ${
                    isActive
                      ? "bg-brand-50 text-brand-700"
                      : "text-slate-500 hover:bg-slate-100"
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-slate-500 sm:inline">
              {admin.username}
            </span>
            <button
              onClick={logout}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800"
            >
              خروج
            </button>
          </div>
        </div>
        {/* Mobile nav */}
        <nav className="flex gap-1 overflow-x-auto border-t border-slate-100 px-4 py-2 md:hidden">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-bold ${
                  isActive ? "bg-brand-50 text-brand-700" : "text-slate-500"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
