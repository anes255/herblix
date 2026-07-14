import { NavLink, Outlet, useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import { api } from "../../lib/api.js";
import {
  LayoutDashboard,
  QrCode,
  Settings,
  LogOut,
  Leaf,
} from "../../components/Icons.jsx";

const links = [
  { to: "/admin", label: "لوحة التحكم", end: true, icon: LayoutDashboard },
  { to: "/admin/codes", label: "إدارة الرموز", icon: QrCode },
  { to: "/admin/settings", label: "الإعدادات", icon: Settings },
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
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-gradient text-white shadow-soft">
              <Leaf size={20} />
            </span>
            <span className="font-extrabold text-slate-800">لوحة الإدارة</span>
          </div>
          <nav className="hidden gap-1 md:flex">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition ${
                    isActive
                      ? "bg-brand-50 text-brand-700"
                      : "text-slate-500 hover:bg-slate-100"
                  }`
                }
              >
                <l.icon size={17} />
                {l.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <span className="hidden items-center gap-2 text-sm text-slate-500 sm:flex">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 text-xs font-extrabold text-brand-700">
                {admin.username?.[0]?.toUpperCase()}
              </span>
              {admin.username}
            </span>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-bold text-white transition hover:bg-slate-800"
            >
              <LogOut size={16} />
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
                `flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-bold ${
                  isActive ? "bg-brand-50 text-brand-700" : "text-slate-500"
                }`
              }
            >
              <l.icon size={16} />
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
