import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-full flex flex-col items-center justify-center px-5 text-center">
      <p className="text-6xl font-extrabold text-brand-600">404</p>
      <h1 className="mt-4 text-xl font-bold text-slate-800">الصفحة غير موجودة</h1>
      <Link
        to="/"
        className="mt-6 rounded-xl bg-brand-600 px-6 py-3 font-bold text-white shadow-soft hover:bg-brand-700"
      >
        العودة للرئيسية
      </Link>
    </div>
  );
}
