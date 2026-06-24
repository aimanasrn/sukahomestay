import React, { Suspense, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Header from "@/components/partials/header";
import Footer from "@/components/partials/footer";
import Loading from "@/components/Loading";
import LanguageFloatingButton from "@/components/sukahomestay/LanguageFloatingButton";

const Layout = () => {
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) {
      return;
    }

    const targetId = location.hash.replace("#", "");
    const target = document.getElementById(targetId);

    if (target) {
      requestAnimationFrame(() => {
        target.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    }
  }, [location.hash]);

  return (
    <>
      <ToastContainer />
      <Header />
      <div className="min-h-screen bg-[#ffffff]">
        <div className="container mx-auto px-4 py-8 md:px-6 lg:py-10">
          <Suspense fallback={<Loading />}>
            <Outlet />
          </Suspense>
        </div>
      </div>
      <LanguageFloatingButton />
      <Footer />
    </>
  );
};

export default Layout;
