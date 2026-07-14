import { useEffect, useState, useCallback } from "react";
import { api, apiUrl, authHeaders } from "../../lib/api.js";

const filters = [
  { key: "all", label: "الكل" },
  { key: "enabled", label: "مفعّلة" },
  { key: "disabled", label: "معطّلة" },
  { key: "most-verified", label: "الأكثر تحققاً" },
  { key: "recent", label: "الأحدث" },
];

const empty = {
  code: "",
  productName: "",
  batchNumber: "",
  description: "",
  productionDate: "",
  enabled: true,
};

export default function Codes() {
  const [data, setData] = useState({ items: [], total: 0, page: 1, pages: 1 });
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(null); // { mode: 'add'|'edit', form }
  const [msg, setMsg] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "20",
        filter,
      });
      if (search.trim()) params.set("search", search.trim());
      const res = await api.get(`/admin/codes?${params.toString()}`);
      setData(res);
    } catch (e) {
      setMsg(e.message);
    } finally {
      setLoading(false);
    }
  }, [page, filter, search]);

  useEffect(() => {
    load();
  }, [load]);

  function flash(text) {
    setMsg(text);
    setTimeout(() => setMsg(""), 3000);
  }

  async function save(e) {
    e.preventDefault();
    const f = modal.form;
    const payload = {
      code: f.code,
      productName: f.productName,
      batchNumber: f.batchNumber || null,
      description: f.description || null,
      productionDate: f.productionDate || null,
      enabled: f.enabled,
    };
    try {
      if (modal.mode === "add") {
        await api.post("/admin/code", payload);
        flash("تمت إضافة الرمز");
      } else {
        await api.put(`/admin/code/${f.id}`, payload);
        flash("تم تحديث الرمز");
      }
      setModal(null);
      load();
    } catch (err) {
      alert(err.message);
    }
  }

  async function toggle(id) {
    try {
      await api.patch(`/admin/code/${id}/toggle`);
      load();
    } catch (err) {
      alert(err.message);
    }
  }

  async function remove(id) {
    if (!confirm("هل تريد حذف هذا الرمز نهائياً؟")) return;
    try {
      await api.del(`/admin/code/${id}`);
      flash("تم حذف الرمز");
      load();
    } catch (err) {
      alert(err.message);
    }
  }

  async function onExport() {
    try {
      const res = await fetch(apiUrl("/admin/codes/export"), {
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error("تعذّر التصدير");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "codes.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert(err.message);
    }
  }

  async function onImport(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const text = await file.text();
      const rows = text.replace(/^﻿/, "").split(/\r?\n/).filter(Boolean);
      const [header, ...body] = rows;
      const cols = header.split(",").map((c) => c.replace(/(^"|"$)/g, "").trim().toLowerCase());
      const idx = (name) => cols.findIndex((c) => c.includes(name));
      const ci = idx("code");
      const pi = idx("product");
      const bi = idx("batch");
      const vi = idx("valid");
      const codes = body
        .map((line) => {
          const parts = line.match(/("([^"]|"")*"|[^,]*)/g)?.filter((_, i) => i % 2 === 0) || [];
          const val = (i) => (i >= 0 ? (parts[i] || "").replace(/(^"|"$)/g, "").trim() : "");
          const code = val(ci);
          const productName = val(pi);
          if (!code || !productName) return null;
          return {
            code,
            productName,
            batchNumber: val(bi) || null,
            enabled: vi >= 0 ? /^(yes|true|1)$/i.test(val(vi)) : true,
          };
        })
        .filter(Boolean);
      if (codes.length === 0) return alert("لم يتم العثور على رموز صالحة في الملف");
      const res = await api.post("/admin/codes/import", { codes });
      flash(`تم استيراد ${res.imported} رمز من ${res.received}`);
      load();
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold text-slate-900">إدارة الرموز</h1>
        <div className="flex flex-wrap gap-2">
          <label className="cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50">
            استيراد CSV
            <input type="file" accept=".csv" className="hidden" onChange={onImport} />
          </label>
          <button
            onClick={onExport}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50"
          >
            تصدير CSV
          </button>
          <button
            onClick={() => setModal({ mode: "add", form: { ...empty } })}
            className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-bold text-white shadow-soft hover:bg-brand-700"
          >
            + إضافة رمز
          </button>
        </div>
      </div>

      {msg && (
        <div className="rounded-xl bg-brand-50 px-4 py-2 text-sm font-bold text-brand-700">
          {msg}
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
          placeholder="ابحث بالرمز أو اسم المنتج..."
          className="w-full max-w-xs rounded-xl border border-slate-200 px-4 py-2 text-sm outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
        />
        <div className="flex flex-wrap gap-1">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => {
                setPage(1);
                setFilter(f.key);
              }}
              className={`rounded-lg px-3 py-1.5 text-sm font-bold ${
                filter === f.key
                  ? "bg-brand-50 text-brand-700"
                  : "text-slate-500 hover:bg-slate-100"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="p-3 text-right font-bold">الرمز</th>
              <th className="p-3 text-right font-bold">المنتج</th>
              <th className="p-3 text-right font-bold">الدفعة</th>
              <th className="p-3 text-center font-bold">مرات التحقق</th>
              <th className="p-3 text-center font-bold">الحالة</th>
              <th className="p-3 text-center font-bold">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-slate-400">
                  جارٍ التحميل...
                </td>
              </tr>
            )}
            {!loading && data.items.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-slate-400">
                  لا توجد رموز
                </td>
              </tr>
            )}
            {!loading &&
              data.items.map((c) => (
                <tr key={c.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="ltr p-3 font-bold text-slate-700">{c.code}</td>
                  <td className="p-3">{c.productName}</td>
                  <td className="ltr p-3 text-slate-500">{c.batchNumber || "—"}</td>
                  <td className="p-3 text-center font-bold text-brand-600">
                    {c.verifiedCount}
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => toggle(c.id)}
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        c.enabled
                          ? "bg-brand-50 text-brand-700"
                          : "bg-slate-200 text-slate-500"
                      }`}
                    >
                      {c.enabled ? "مفعّل" : "معطّل"}
                    </button>
                  </td>
                  <td className="p-3">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() =>
                          setModal({
                            mode: "edit",
                            form: {
                              id: c.id,
                              code: c.code,
                              productName: c.productName,
                              batchNumber: c.batchNumber || "",
                              description: c.description || "",
                              productionDate: c.productionDate
                                ? c.productionDate.slice(0, 10)
                                : "",
                              enabled: c.enabled,
                            },
                          })
                        }
                        className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 hover:bg-slate-200"
                      >
                        تعديل
                      </button>
                      <button
                        onClick={() => remove(c.id)}
                        className="rounded-lg bg-red-50 px-3 py-1 text-xs font-bold text-red-600 hover:bg-red-100"
                      >
                        حذف
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-slate-500">
        <span>الإجمالي: {data.total.toLocaleString("ar")}</span>
        <div className="flex items-center gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded-lg border border-slate-200 px-3 py-1.5 font-bold disabled:opacity-40"
          >
            السابق
          </button>
          <span>
            {data.page} / {data.pages}
          </span>
          <button
            disabled={page >= data.pages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-lg border border-slate-200 px-3 py-1.5 font-bold disabled:opacity-40"
          >
            التالي
          </button>
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/40 p-4">
          <form
            onSubmit={save}
            className="w-full max-w-md animate-pop space-y-3 rounded-2xl bg-white p-6 shadow-soft"
          >
            <h2 className="text-lg font-extrabold text-slate-900">
              {modal.mode === "add" ? "إضافة رمز جديد" : "تعديل الرمز"}
            </h2>
            <Field label="الرمز *">
              <input
                required
                value={modal.form.code}
                onChange={(e) =>
                  setModal({ ...modal, form: { ...modal.form, code: e.target.value } })
                }
                className="ltr w-full rounded-xl border border-slate-200 px-4 py-2 outline-none focus:border-brand-500"
              />
            </Field>
            <Field label="اسم المنتج *">
              <input
                required
                value={modal.form.productName}
                onChange={(e) =>
                  setModal({
                    ...modal,
                    form: { ...modal.form, productName: e.target.value },
                  })
                }
                className="w-full rounded-xl border border-slate-200 px-4 py-2 outline-none focus:border-brand-500"
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="رقم الدفعة">
                <input
                  value={modal.form.batchNumber}
                  onChange={(e) =>
                    setModal({
                      ...modal,
                      form: { ...modal.form, batchNumber: e.target.value },
                    })
                  }
                  className="ltr w-full rounded-xl border border-slate-200 px-4 py-2 outline-none focus:border-brand-500"
                />
              </Field>
              <Field label="تاريخ الإنتاج">
                <input
                  type="date"
                  value={modal.form.productionDate}
                  onChange={(e) =>
                    setModal({
                      ...modal,
                      form: { ...modal.form, productionDate: e.target.value },
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-2 outline-none focus:border-brand-500"
                />
              </Field>
            </div>
            <Field label="معلومات إضافية">
              <textarea
                rows={2}
                value={modal.form.description}
                onChange={(e) =>
                  setModal({
                    ...modal,
                    form: { ...modal.form, description: e.target.value },
                  })
                }
                className="w-full rounded-xl border border-slate-200 px-4 py-2 outline-none focus:border-brand-500"
              />
            </Field>
            <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
              <input
                type="checkbox"
                checked={modal.form.enabled}
                onChange={(e) =>
                  setModal({
                    ...modal,
                    form: { ...modal.form, enabled: e.target.checked },
                  })
                }
                className="h-4 w-4 accent-brand-600"
              />
              الرمز مفعّل
            </label>
            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 rounded-xl bg-brand-600 px-4 py-2.5 font-bold text-white hover:bg-brand-700"
              >
                حفظ
              </button>
              <button
                type="button"
                onClick={() => setModal(null)}
                className="flex-1 rounded-xl bg-slate-100 px-4 py-2.5 font-bold text-slate-600 hover:bg-slate-200"
              >
                إلغاء
              </button>
            </div>
          </form>
        </div>
      )}
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
