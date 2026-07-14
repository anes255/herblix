import { useEffect, useState } from "react";
import { api } from "../lib/api.js";

function formatDate(value) {
  if (!value) return null;
  try {
    return new Date(value).toLocaleDateString("ar", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return null;
  }
}

export default function Home() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [site, setSite] = useState({
    siteName: "التحقق من أصالة المنتج",
    supportPhone: "",
    logo: null,
  });

  useEffect(() => {
    api
      .get("/settings")
      .then(setSite)
      .catch(() => {});
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    const trimmed = code.trim();
    if (!trimmed) return;
    setLoading(true);
    setResult(null);
    try {
      const data = await api.post("/verify", { code: trimmed });
      setResult(data);
    } catch (err) {
      setResult({ status: "error", message: err.message });
    } finally {
      setLoading(false);
    }
  }

  const isAuthentic = result?.status === "authentic";
  const isNotFound = result?.status === "not_found";
  const isDisabled = result?.status === "disabled";
  const supportPhone = result?.supportPhone || site.supportPhone;

  return (
    <div className="min-h-full flex flex-col items-center justify-center px-5 py-12">
      <main className="w-full max-w-md text-center animate-fade-up">
        {/* Logo */}
        <img
          src={site.logo || "/logo.svg"}
          alt="الشعار"
          className="mx-auto h-20 w-20 rounded-2xl shadow-soft"
        />

        {/* Title */}
        <h1 className="mt-6 text-2xl font-extrabold text-slate-900">
          {site.siteName || "التحقق من أصالة المنتج"}
        </h1>
        <p className="mt-3 text-slate-500 leading-relaxed">
          أدخل رمز المنتج للتأكد من أنه أصلي ومطابق للمواصفات.
        </p>

        {/* Form */}
        <form onSubmit={onSubmit} className="mt-8 space-y-3">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="أدخل رمز المنتج"
            className="ltr text-center w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 text-lg font-medium tracking-wider shadow-sm outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
            autoComplete="off"
            autoFocus
          />
          <button
            type="submit"
            disabled={loading || !code.trim()}
            className="w-full rounded-2xl bg-brand-600 px-5 py-4 text-lg font-bold text-white shadow-soft transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "جارٍ التحقق..." : "تحقق"}
          </button>
        </form>

        {/* Result */}
        {result && (
          <div className="mt-8 animate-pop">
            {isAuthentic && (
              <div className="rounded-2xl border border-brand-100 bg-brand-50 p-6 text-right">
                <p className="text-center text-xl font-extrabold text-brand-700">
                  {result.message}
                </p>
                <dl className="mt-5 space-y-3 text-sm">
                  <Row label="اسم المنتج" value={result.product?.productName} />
                  <Row
                    label="تاريخ الإنتاج"
                    value={formatDate(result.product?.productionDate)}
                  />
                  <Row label="معلومات إضافية" value={result.product?.description} />
                </dl>
              </div>
            )}

            {(isNotFound || isDisabled) && (
              <div className="rounded-2xl border border-red-100 bg-red-50 p-6">
                <p className="text-xl font-extrabold text-red-600">
                  {result.message}
                </p>
                {isNotFound && supportPhone && (
                  <a
                    href={`tel:${supportPhone}`}
                    className="mt-5 block w-full rounded-2xl bg-slate-900 px-5 py-4 text-lg font-bold text-white shadow-soft transition hover:bg-slate-800"
                  >
                    اتصل بفريق الدعم
                  </a>
                )}
              </div>
            )}

            {result.status === "error" && (
              <div className="rounded-2xl border border-amber-100 bg-amber-50 p-6">
                <p className="font-bold text-amber-700">{result.message}</p>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="mt-12 text-xs text-slate-400">
        © {new Date().getFullYear()} — جميع الحقوق محفوظة
      </footer>
    </div>
  );
}

function Row({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start justify-between gap-4 border-t border-brand-100/60 pt-3">
      <dt className="font-bold text-slate-600">{label}</dt>
      <dd className="text-slate-800 text-left">{value}</dd>
    </div>
  );
}
