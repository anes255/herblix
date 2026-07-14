import React, { lazy, Suspense } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";

// Home is the landing page — keep it eager so it paints instantly.
import Home from "./pages/Home.jsx";

// Everything else is lazy-loaded so the public homepage bundle stays tiny
// (the admin dashboard pulls in Recharts, which we don't want on mobile landing).
const NotFound = lazy(() => import("./pages/NotFound.jsx"));
const AdminLogin = lazy(() => import("./pages/admin/Login.jsx"));
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout.jsx"));
const Dashboard = lazy(() => import("./pages/admin/Dashboard.jsx"));
const Codes = lazy(() => import("./pages/admin/Codes.jsx"));
const SettingsPage = lazy(() => import("./pages/admin/Settings.jsx"));

function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center text-sm text-slate-400">
      جارٍ التحميل...
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="codes" element={<Codes />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  </React.StrictMode>
);
