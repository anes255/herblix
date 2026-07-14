import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { api } from "../../lib/api.js";
import {
  Search,
  Calendar,
  ShieldCheck,
  ShieldAlert,
  QrCode,
  CheckCircle,
  Ban,
  Sparkles,
} from "../../components/Icons.jsx";

const resultLabels = {
  authentic: "أصلي",
  not_found: "غير موجود",
  disabled: "معطّل",
};

function StatCard({ label, value, tone = "slate", icon }) {
  const tones = {
    slate: { text: "text-slate-900", chip: "bg-slate-100 text-slate-600" },
    green: { text: "text-brand-600", chip: "bg-brand-50 text-brand-600" },
    red: { text: "text-red-600", chip: "bg-red-50 text-red-500" },
    amber: { text: "text-amber-600", chip: "bg-amber-50 text-amber-500" },
    teal: { text: "text-accent-600", chip: "bg-accent-50 text-accent-600" },
  };
  const t = tones[tone] || tones.slate;
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-card">
      <div className="flex items-start justify-between">
        <p className="text-sm font-bold text-slate-500">{label}</p>
        {icon && (
          <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${t.chip}`}>
            {icon}
          </span>
        )}
      </div>
      <p className={`mt-2 text-3xl font-extrabold ${t.text}`}>
        {value?.toLocaleString("ar") ?? "0"}
      </p>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/admin/stats").then(setStats).catch((e) => setError(e.message));
  }, []);

  if (error) return <p className="text-red-600">{error}</p>;
  if (!stats) return <p className="text-slate-400">جارٍ تحميل الإحصائيات...</p>;

  const t = stats.totals;
  const pieData = [
    { name: "رموز مفعّلة", value: t.activeCodes, color: "#059669" },
    { name: "رموز معطّلة", value: t.disabledCodes, color: "#f43f5e" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">لوحة التحكم</h1>
        <p className="mt-1 text-sm text-slate-500">
          نظرة عامة على عمليات التحقق وحالة الرموز في الوقت الحقيقي.
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="إجمالي عمليات البحث" value={t.totalSearches} icon={<Search size={18} />} />
        <StatCard label="عمليات البحث اليوم" value={t.searchesToday} tone="teal" icon={<Calendar size={18} />} />
        <StatCard label="نتائج أصلية" value={t.authenticSearches} tone="green" icon={<ShieldCheck size={18} />} />
        <StatCard label="نتائج مقلّدة/غير موجودة" value={t.fakeSearches} tone="red" icon={<ShieldAlert size={18} />} />
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="إجمالي الرموز" value={t.totalCodes} icon={<QrCode size={18} />} />
        <StatCard label="رموز مفعّلة" value={t.activeCodes} tone="green" icon={<CheckCircle size={18} />} />
        <StatCard label="رموز معطّلة" value={t.disabledCodes} tone="amber" icon={<Ban size={18} />} />
        <StatCard label="إجمالي مرات التحقق" value={t.totalVerifications} tone="teal" icon={<Sparkles size={18} />} />
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <h2 className="mb-4 font-bold text-slate-700">
            عمليات البحث (آخر 7 أيام)
          </h2>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={stats.trend} margin={{ left: -20, right: 10 }}>
              <defs>
                <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(d) => d.slice(5)} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="total"
                name="إجمالي"
                stroke="#059669"
                fill="url(#g)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-bold text-slate-700">حالة الرموز</h2>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
              >
                {pieData.map((d, i) => (
                  <Cell key={i} fill={d.color} />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tables */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-bold text-slate-700">الأكثر بحثاً</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-400">
                <th className="py-2 text-right font-bold">المنتج</th>
                <th className="py-2 text-right font-bold">الرمز</th>
                <th className="py-2 text-left font-bold">المرات</th>
              </tr>
            </thead>
            <tbody>
              {stats.mostSearched.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-4 text-center text-slate-400">
                    لا توجد بيانات بعد
                  </td>
                </tr>
              )}
              {stats.mostSearched.map((m) => (
                <tr key={m.code} className="border-t border-slate-100">
                  <td className="py-2">{m.productName}</td>
                  <td className="ltr py-2 text-slate-500">{m.code}</td>
                  <td className="py-2 text-left font-bold text-brand-600">
                    {m.verifiedCount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-bold text-slate-700">أحدث عمليات البحث</h2>
          <div className="max-h-72 overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-400">
                  <th className="py-2 text-right font-bold">الرمز</th>
                  <th className="py-2 text-right font-bold">النتيجة</th>
                  <th className="py-2 text-left font-bold">الوقت</th>
                </tr>
              </thead>
              <tbody>
                {stats.latestSearches.map((l) => (
                  <tr key={l.id} className="border-t border-slate-100">
                    <td className="ltr py-2 text-slate-600">{l.verificationCode}</td>
                    <td className="py-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                          l.result === "authentic"
                            ? "bg-brand-50 text-brand-700"
                            : l.result === "disabled"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-red-50 text-red-600"
                        }`}
                      >
                        {resultLabels[l.result] || l.result}
                      </span>
                    </td>
                    <td className="ltr py-2 text-left text-xs text-slate-400">
                      {new Date(l.timestamp).toLocaleString("ar")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
