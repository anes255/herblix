import { useEffect, useState } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  Ban,
  Phone,
  Search,
  Package,
  Calendar,
  Info,
  Leaf,
  Sparkles,
} from "../components/Icons.jsx";

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

// Strip leading emojis/symbols the API may include, so we can pair the text
// with a real icon instead.
function cleanMsg(m = "") {
  return m.replace(/^[^؀-ۿA-Za-z]+/, "").trim();
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
    fetch(`${import.meta.env.VITE_API_BASE || ""}/api/settings`)
      .then((r) => r.json())
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
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE || ""}/api/verify`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: trimmed }),
        }
      );
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({ status: "error", message: "تعذّر الاتصال بالخادم. حاول مجدداً." });
    } finally {
      setLoading(false);
    }
  }

  const isAuthentic = result?.status === "authentic";
  const isNotFound = result?.status === "not_found";
  const isDisabled = result?.status === "disabled";
  const supportPhone = result?.supportPhone || site.supportPhone;

  return (
    <div className="relative min-h-full overflow-hidden bg-slate-50 bg-mesh">
      {/* Decorative blurred blobs */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-brand-300/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-accent-400/20 blur-3xl" />

      <div className="relative flex min-h-full flex-col items-center justify-center px-5 py-14">
        <main className="w-full max-w-md text-center animate-fade-up">
          {/* Brand logo */}
          <div className="relative mx-auto flex items-center justify-center">
            <span className="pointer-events-none absolute h-20 w-40 bg-brand-gradient opacity-15 blur-2xl" />
            <img
              src={site.logo || "/logo-wordmark.svg"}
              alt="ERBLIX"
              className="relative mx-auto h-16 w-auto max-w-[260px] object-contain"
            />
          </div>

          {/* Trust badge */}
          <div className="mt-6 inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-white/70 px-3 py-1 text-xs font-bold text-brand-700 backdrop-blur">
            <Sparkles size={14} />
            منتج موثوق ومحمي من التقليد
          </div>

          {/* Title */}
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900">
            {site.siteName || "التحقق من أصالة المنتج"}
          </h1>
          <p className="mx-auto mt-3 max-w-sm leading-relaxed text-slate-500">
            أدخل الرمز الموجود على غلاف منتجك للتأكد من أصالته خلال ثوانٍ.
            نحميك من المنتجات المقلّدة ونضمن حصولك على الجودة الحقيقية.
          </p>

          {/* Form */}
          <form onSubmit={onSubmit} className="mt-8 space-y-3">
            <div className="relative">
              <span className="absolute inset-y-0 right-4 flex items-center text-slate-400">
                <Search size={20} />
              </span>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="أدخل رمز المنتج"
                className="ltr w-full rounded-2xl border border-slate-200 bg-white/90 py-4 pr-12 pl-5 text-center text-lg font-semibold tracking-[0.2em] shadow-card outline-none backdrop-blur transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
                autoComplete="off"
                autoFocus
              />
            </div>
            <button
              type="submit"
              disabled={loading || !code.trim()}
              className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-gradient px-5 py-4 text-lg font-bold text-white shadow-glow transition hover:brightness-105 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  جارٍ التحقق...
                </>
              ) : (
                <>
                  <ShieldCheck size={22} />
                  تحقق الآن
                </>
              )}
            </button>
          </form>

          {/* Result */}
          {result && (
            <div className="mt-8 animate-pop">
              {isAuthentic && (
                <div className="overflow-hidden rounded-3xl border border-brand-200 bg-white shadow-card">
                  <div className="flex flex-col items-center gap-3 bg-brand-gradient px-6 py-7 text-white">
                    <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
                      <span className="absolute inset-0 rounded-full bg-white/30 animate-pulse-ring" />
                      <ShieldCheck size={38} />
                    </span>
                    <p className="text-xl font-extrabold">
                      {cleanMsg(result.message)}
                    </p>
                    <p className="text-sm text-white/80">
                      تم التحقق بنجاح — هذا المنتج مسجّل ومضمون.
                    </p>
                  </div>
                  <dl className="space-y-1 p-5 text-right">
                    <DetailRow
                      icon={<Package size={18} />}
                      label="اسم المنتج"
                      value={result.product?.productName}
                    />
                    <DetailRow
                      icon={<Calendar size={18} />}
                      label="تاريخ الإنتاج"
                      value={formatDate(result.product?.productionDate)}
                    />
                    <DetailRow
                      icon={<Info size={18} />}
                      label="معلومات إضافية"
                      value={result.product?.description}
                    />
                  </dl>
                </div>
              )}

              {(isNotFound || isDisabled) && (
                <div className="overflow-hidden rounded-3xl border border-red-200 bg-white shadow-card">
                  <div
                    className={`flex flex-col items-center gap-3 px-6 py-7 text-white ${
                      isDisabled
                        ? "bg-gradient-to-br from-amber-500 to-orange-500"
                        : "bg-gradient-to-br from-red-500 to-rose-600"
                    }`}
                  >
                    <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
                      {isDisabled ? <Ban size={36} /> : <ShieldAlert size={38} />}
                    </span>
                    <p className="text-xl font-extrabold">
                      {cleanMsg(result.message)}
                    </p>
                    <p className="text-sm text-white/85">
                      {isDisabled
                        ? "هذا الرمز موجود لكنه معطّل حالياً."
                        : "قد يكون المنتج مقلّداً أو الرمز غير صحيح."}
                    </p>
                  </div>
                  {isNotFound && supportPhone && (
                    <div className="p-5">
                      <p className="mb-3 text-sm text-slate-500">
                        هل تعتقد أن هناك خطأ؟ تواصل مع فريق الدعم للتأكد.
                      </p>
                      <a
                        href={`tel:${supportPhone}`}
                        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-4 text-lg font-bold text-white shadow-soft transition hover:bg-slate-800 active:scale-[0.99]"
                      >
                        <Phone size={20} />
                        اتصل بفريق الدعم
                      </a>
                    </div>
                  )}
                </div>
              )}

              {result.status === "error" && (
                <div className="flex items-center justify-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-5 font-bold text-amber-700">
                  <Info size={20} />
                  {result.message}
                </div>
              )}
            </div>
          )}

        </main>

        <footer className="mt-14 flex items-center gap-1.5 text-xs text-slate-400">
          <Leaf size={14} />
          © {new Date().getFullYear()} — جميع الحقوق محفوظة
        </footer>
      </div>
    </div>
  );
}

function DetailRow({ icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-center justify-between gap-4 border-t border-slate-100 py-3 first:border-t-0">
      <dt className="flex items-center gap-2 font-bold text-slate-500">
        <span className="text-brand-600">{icon}</span>
        {label}
      </dt>
      <dd className="text-left font-semibold text-slate-800">{value}</dd>
    </div>
  );
}

