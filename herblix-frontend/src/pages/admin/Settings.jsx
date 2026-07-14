import { useEffect, useState } from "react";
import { api } from "../../lib/api.js";

export default function SettingsPage() {
  const [form, setForm] = useState({ siteName: "", supportPhone: "", logo: "" });
  const [pwd, setPwd] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [msg, setMsg] = useState("");
  const [pwdMsg, setPwdMsg] = useState("");

  useEffect(() => {
    api
      .get("/admin/settings")
      .then((s) => setForm({ siteName: s.siteName || "", supportPhone: s.supportPhone || "", logo: s.logo || "" }))
      .catch(() => {});
  }, []);

  async function saveSettings(e) {
    e.preventDefault();
    setMsg("");
    try {
      await api.put("/admin/settings", {
        siteName: form.siteName,
        supportPhone: form.supportPhone,
        logo: form.logo || null,
      });
      setMsg("تم حفظ الإعدادات بنجاح");
    } catch (err) {
      setMsg(err.message);
    }
  }

  async function savePassword(e) {
    e.preventDefault();
    setPwdMsg("");
    if (pwd.newPassword !== pwd.confirm) {
      setPwdMsg("كلمتا المرور غير متطابقتين");
      return;
    }
    try {
      await api.put("/admin/password", {
        currentPassword: pwd.currentPassword,
        newPassword: pwd.newPassword,
      });
      setPwdMsg("تم تغيير كلمة المرور بنجاح");
      setPwd({ currentPassword: "", newPassword: "", confirm: "" });
    } catch (err) {
      setPwdMsg(err.message);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-extrabold text-slate-900">الإعدادات</h1>

      <form
        onSubmit={saveSettings}
        className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <h2 className="font-bold text-slate-700">إعدادات الموقع</h2>
        {msg && (
          <div className="rounded-xl bg-brand-50 px-4 py-2 text-sm font-bold text-brand-700">
            {msg}
          </div>
        )}
        <Field label="اسم الموقع">
          <input
            value={form.siteName}
            onChange={(e) => setForm({ ...form, siteName: e.target.value })}
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
          />
        </Field>
        <Field label="رقم هاتف الدعم">
          <input
            value={form.supportPhone}
            onChange={(e) => setForm({ ...form, supportPhone: e.target.value })}
            placeholder="+213779452212"
            className="ltr w-full rounded-xl border border-slate-200 px-4 py-2.5 text-right outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
          />
        </Field>
        <Field label="رابط الشعار (اختياري)">
          <input
            value={form.logo}
            onChange={(e) => setForm({ ...form, logo: e.target.value })}
            placeholder="https://..."
            className="ltr w-full rounded-xl border border-slate-200 px-4 py-2.5 text-right outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
          />
        </Field>
        <button className="rounded-xl bg-brand-600 px-6 py-2.5 font-bold text-white shadow-soft hover:bg-brand-700">
          حفظ
        </button>
      </form>

      <form
        onSubmit={savePassword}
        className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <h2 className="font-bold text-slate-700">تغيير كلمة المرور</h2>
        {pwdMsg && (
          <div className="rounded-xl bg-amber-50 px-4 py-2 text-sm font-bold text-amber-700">
            {pwdMsg}
          </div>
        )}
        <Field label="كلمة المرور الحالية">
          <input
            type="password"
            value={pwd.currentPassword}
            onChange={(e) => setPwd({ ...pwd, currentPassword: e.target.value })}
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
            required
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="كلمة المرور الجديدة">
            <input
              type="password"
              value={pwd.newPassword}
              onChange={(e) => setPwd({ ...pwd, newPassword: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
              minLength={8}
              required
            />
          </Field>
          <Field label="تأكيد كلمة المرور">
            <input
              type="password"
              value={pwd.confirm}
              onChange={(e) => setPwd({ ...pwd, confirm: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
              minLength={8}
              required
            />
          </Field>
        </div>
        <button className="rounded-xl bg-slate-900 px-6 py-2.5 font-bold text-white hover:bg-slate-800">
          تحديث كلمة المرور
        </button>
      </form>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-bold text-slate-600">{label}</label>
      {children}
    </div>
  );
}
