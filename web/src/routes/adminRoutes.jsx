import React from "react";
import { Navigate, Route } from "react-router-dom";
import { useAdminAuth } from "@/context/AdminAuthContext";
import AdminLayout from "@/layout/AdminLayout";
import AdminAvailabilityPage from "@/pages/admin/AdminAvailabilityPage";
import AdminBookingsPage from "@/pages/admin/AdminBookingsPage";
import AdminDashboardPage from "@/pages/admin/AdminDashboardPage";
import AdminLoginPage from "@/pages/admin/AdminLoginPage";
import AdminPropertiesPage from "@/pages/admin/AdminPropertiesPage";

function AdminRouteGuard() {
  const { isAuthenticated, isLoading } = useAdminAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fff8f1] text-[#182230]">
        Loading admin console...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate replace to="/admin/login" />;
  }

  return <AdminLayout />;
}

function AdminLoginGuard() {
  const { isAuthenticated, isLoading } = useAdminAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fff8f1] text-[#182230]">
        Loading admin console...
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate replace to="/admin" />;
  }

  return <AdminLoginPage />;
}

const adminRouteElements = (
  <Route path="/admin">
    <Route path="login" element={<AdminLoginGuard />} />
    <Route element={<AdminRouteGuard />}>
      <Route index element={<AdminDashboardPage />} />
      <Route path="bookings" element={<AdminBookingsPage />} />
      <Route path="availability" element={<AdminAvailabilityPage />} />
      <Route path="properties" element={<AdminPropertiesPage />} />
    </Route>
  </Route>
);

export default adminRouteElements;
