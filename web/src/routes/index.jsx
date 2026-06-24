import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AdminAuthProvider } from "@/context/AdminAuthContext";
import adminRouteElements from "./adminRoutes";
import publicRouteElements from "./publicRoutes";

const AppRoutes = () => {
  return (
    <AdminAuthProvider>
      <Routes>
        {adminRouteElements}
        {publicRouteElements}
        <Route path="*" element={<Navigate replace to="/" />} />
      </Routes>
    </AdminAuthProvider>
  );
};

export default AppRoutes;
