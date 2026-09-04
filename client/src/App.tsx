import { lazy, Suspense, type ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { PublicLayout } from "./layouts/public-layout";
import { AdminLayout } from "./layouts/admin-layout";
import { useAuth } from "./lib/auth";
const HomePage = lazy(() => import("./pages/home-page").then((module) => ({ default: module.HomePage })));
const SearchPage = lazy(() => import("./pages/search-page").then((module) => ({ default: module.SearchPage })));
const PropertyPage = lazy(() => import("./pages/property-page").then((module) => ({ default: module.PropertyPage })));
const CheckoutPage = lazy(() => import("./pages/checkout-page").then((module) => ({ default: module.CheckoutPage })));
const AuthPage = lazy(() => import("./pages/auth-page").then((module) => ({ default: module.AuthPage })));
const AccountPage = lazy(() => import("./pages/account-page").then((module) => ({ default: module.AccountPage })));
const ReservationSuccessPage = lazy(() => import("./pages/reservation-success-page").then((module) => ({ default: module.ReservationSuccessPage })));
const ReservationLookupPage = lazy(() => import("./pages/reservation-lookup-page").then((module) => ({ default: module.ReservationLookupPage })));
const ContentPage = lazy(() => import("./pages/content-page").then((module) => ({ default: module.ContentPage })));
const PasswordPage = lazy(() => import("./pages/password-page").then((module) => ({ default: module.PasswordPage })));
const AdminDashboardPage = lazy(() => import("./pages/admin-dashboard-page").then((module) => ({ default: module.AdminDashboardPage })));
const AdminModulePage = lazy(() => import("./pages/admin-module-page").then((module) => ({ default: module.AdminModulePage })));
const AdminBookingsPage = lazy(() => import("./pages/admin-bookings-page").then((module) => ({ default: module.AdminBookingsPage })));
const AdminSettingsPage = lazy(() => import("./pages/admin-settings-page").then((module) => ({ default: module.AdminSettingsPage })));
function Protected({ admin = false, children }: { admin?: boolean; children: ReactNode }) {
  const { user, role, loading } = useAuth();
  if (loading) return <div className="container-shell py-16">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (admin && role !== "ADMIN") return <Navigate to="/account" replace />;
  return children;
}
export function App() {
  return (
    <Suspense fallback={<div className="container-shell py-16 text-sm text-muted-foreground">Loading…</div>}>
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<HomePage />} />
        <Route path="search" element={<SearchPage />} />
        <Route path="properties/:slug" element={<PropertyPage />} />
        <Route path="checkout" element={<CheckoutPage />} />
        <Route path="login" element={<AuthPage />} />
        <Route path="register" element={<AuthPage />} />
        <Route path="forgot-password" element={<PasswordPage />} />
        <Route path="reset-password" element={<PasswordPage />} />
        <Route path="reservation-success/:reference" element={<ReservationSuccessPage />} />
        <Route path="reservation-lookup" element={<ReservationLookupPage />} />
        <Route path="account" element={<Protected><AccountPage /></Protected>} />
        {["about", "contact", "faq", "terms", "privacy"].map((path) => (
          <Route path={path} element={<ContentPage />} key={path} />
        ))}
      </Route>
      <Route path="admin" element={<Protected admin><AdminLayout /></Protected>}>
        <Route index element={<AdminDashboardPage />} />
        <Route path="bookings" element={<AdminBookingsPage />} />
        <Route path="settings" element={<AdminSettingsPage />} />
        {[
          "calendar",
          "properties",
          "rooms",
          "customers",
          "payments",
          "reports",
        ].map((path) => (
          <Route path={path} element={<AdminModulePage />} key={path} />
        ))}
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </Suspense>
  );
}
