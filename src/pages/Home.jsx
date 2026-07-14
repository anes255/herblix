import { useEffect, useState } from "react";
import {
  ShieldCheck,
  AlertTriangle,
  XCircle,
  Phone,
  CheckCircle,
  RefreshCw,
} from "../components/Icons.jsx";

const BRAND = "HERBLIX";

function formatUsedAt(value) {
  if (!value) return "وقت سابق";
  try {
    const d = new Date(value);
    const date = d.toLocaleDateString("ar-DZ-u-nu-latn", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const time = d.toLocaleTimeString("ar-DZ-u-nu-latn", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${date} في ${time}`;
  } catch {
    return "وقت سابق";
  }
}

export default function Home() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [supportPhone, setSupportPhone] = useState("");

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_BASE || ""}/api/settings`)
      .then((r) => r.json())
      .then((s) => setSupportPhone(s.supportPhone || ""))
      .catch(() => {});
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    const trimmed = code.trim();
    if (!trimmed) return;
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE || ""}/api/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: trimmed }),
      });
      setResult(await res.json());
    } catch {
      setResult({ status: "error" });
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setResult(null);
    setCode("");
  }

  const phone = result?.supportPhone || supportPhone;

  return (
    <div className="min-h-full bg-[#faf7f0] px-4 py-8">
      <div className="mx-auto w-full max-w-md">
        {/* Header */}
        <header className="text-center animate-fade-up">
          <h1 className="text-3xl font-extrabold tracking-[0.18em] text-gold-600">
            {BRAND}
          </h1>
          <p className="mt-1 font-bold text-herb-600">Produits Authentiques</p>
          <div className="mt-5 flex items-center gap-3">
            <span className="h-px flex-1 bg-gold-300" />
            <span className="h-2.5 w-2.5 rounded-full bg-gold-500" />
            <span className="h-px flex-1 bg-gold-300" />
          </div>
        </header>

        {/* Main card */}
        <div className="mt-6 overflow-hidden rounded-3xl border-t-[6px] border-gold-500 bg-white shadow-card">
          <div className="p-6 sm:p-7">
            <h2 className="text-center text-2xl font-extrabold leading-snug text-herb-700">
              تحقق من أصالة منتج <span className="text-gold-600">{BRAND}</span>
            </h2>
            <p className="mx-auto mt-3 max-w-sm text-center text-sm leading-relaxed text-slate-500">
              لحمايتك من المنتجات المقلدة، أدخل رمز التحقق الموجود أسفل طبقة الخدش.
            </p>

            {!result ? (
              <form onSubmit={onSubmit} className="mt-6 space-y-4">
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="أدخل رمز التحقق هنا"
                  className="ltr w-full rounded-2xl border-2 border-gold-200 bg-gold-50 px-5 py-4 text-center text-lg font-semibold tracking-wider text-slate-700 outline-none transition placeholder:tracking-normal placeholder:text-slate-400 focus:border-gold-400 focus:ring-4 focus:ring-gold-100"
                  autoComplete="off"
                />
                <button
                  type="submit"
                  disabled={loading || !code.trim()}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-herb-500 px-5 py-4 text-lg font-bold text-white shadow-lg shadow-herb-500/30 transition hover:bg-herb-600 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      جارٍ التحقق...
                    </>
                  ) : (
                    <>
                      تحقق الآن
                      <CheckCircle size={22} />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="mt-6 animate-pop space-y-4">
                <ResultCard result={result} phone={phone} />
                <button
                  onClick={reset}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-herb-200 bg-white px-5 py-3.5 font-bold text-herb-700 transition hover:bg-herb-50 active:scale-[0.99]"
                >
                  تحقق من رمز آخر
                  <RefreshCw size={18} />
                </button>
              </div>
            )}
          </div>
        </div>

        <footer className="mt-8 text-center text-xs text-slate-400">
          جميع الحقوق محفوظة © {BRAND} {new Date().getFullYear()}
        </footer>
      </div>
    </div>
  );
}

function ResultCard({ result, phone }) {
  const { status } = result;

  if (status === "authentic") {
    return (
      <div className="rounded-2xl border-2 border-herb-200 bg-herb-50 p-6 text-center">
        <Badge tone="herb">
          <CheckCircle size={44} />
        </Badge>
        <h3 className="text-xl font-extrabold text-herb-700">✅ تم التحقق بنجاح</h3>
        <p className="mt-3 font-medium leading-relaxed text-herb-800">
          تم التحقق من الرمز بنجاح، والمنتج الذي بين يديك أصلي 100% ومعتمد من {BRAND}.
        </p>
        {result.product?.productName && (
          <p className="mt-3 text-sm font-bold text-herb-700">
            المنتج: {result.product.productName}
          </p>
        )}
        <p className="mt-3 text-sm leading-relaxed text-herb-600">
          شكراً لثقتك بعلامتنا التجارية وحرصك على اقتناء المنتجات الأصلية.
        </p>
        <div className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-herb-100 bg-white/70 px-4 py-3 text-xs font-bold text-herb-700">
          <ShieldCheck size={16} />
          محمي بتقنية {BRAND} Anti-Counterfeit
        </div>
      </div>
    );
  }

  if (status === "used_before") {
    return (
      <div className="rounded-2xl border-2 border-gold-200 bg-gold-50 p-6 text-center">
        <Badge tone="gold">
          <AlertTriangle size={40} />
        </Badge>
        <h3 className="text-xl font-extrabold text-gold-700">
          ⚠️ الرمز تم استخدامه مسبقًا
        </h3>
        <p className="mt-3 font-medium leading-relaxed text-gold-700">
          تم استخدام هذا الرمز سابقًا للتحقق من الأصالة بتاريخ: {formatUsedAt(result.usedAt)}.
        </p>
        <div className="mt-4 rounded-xl border border-gold-100 bg-white/70 p-4 text-sm leading-relaxed text-slate-600">
          إذا لم تكن قد أجريت عملية التحقق بنفسك من قبل، فقد يكون هذا المنتج غير
          أصلي أو تم تداول رمز التحقق الخاص به مسبقًا.
        </div>
        <SupportBox phone={phone} tone="gold" />
      </div>
    );
  }

  // not_found / disabled / error → red card
  const isDisabled = status === "disabled";
  return (
    <div className="rounded-2xl border-2 border-red-200 bg-red-50 p-6 text-center">
      <Badge tone="red">
        <XCircle size={44} />
      </Badge>
      <h3 className="text-xl font-extrabold text-red-600">
        ❌ {isDisabled ? "هذا الرمز غير صالح" : "تعذر التحقق من الرمز"}
      </h3>
      <p className="mt-3 font-medium leading-relaxed text-red-600">
        {isDisabled
          ? "هذا الرمز معطّل حالياً ولا يمكن استخدامه للتحقق."
          : "الرمز المدخل غير صحيح أو غير موجود في قاعدة البيانات."}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-red-500">
        يرجى التأكد من الرمز وإعادة المحاولة. إذا استمرت المشكلة، فقد يكون هذا
        المنتج غير أصلي.
      </p>
      <SupportBox phone={phone} tone="red" />
    </div>
  );
}

function Badge({ tone, children }) {
  const tones = {
    herb: "bg-herb-600 shadow-herb-600/30",
    gold: "bg-gold-500 shadow-gold-500/30",
    red: "bg-red-500 shadow-red-500/30",
  };
  return (
    <div
      className={`mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full text-white shadow-lg ${tones[tone]}`}
    >
      {children}
    </div>
  );
}

function SupportBox({ phone, tone }) {
  if (!phone) return null;
  const tones = {
    gold: "border-gold-100 text-gold-700",
    red: "border-red-100 text-red-600",
  };
  return (
    <a
      href={`tel:${phone}`}
      className={`mt-4 flex items-center justify-center gap-2 rounded-xl border bg-white/70 px-4 py-3 text-sm font-bold leading-relaxed ${tones[tone]}`}
    >
      <Phone size={18} className="shrink-0" />
      يرجى التواصل مع خدمة العملاء للتحقق من المنتج
    </a>
  );
}
