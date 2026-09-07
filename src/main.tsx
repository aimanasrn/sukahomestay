import { StrictMode, Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Outlet, Link } from "react-router-dom";
import { LanguageProvider, useLanguage } from "./i18n";
import { AppProvider, useApp } from "./state";
import { Header, Footer, WhatsApp, ScrollManager, Notice } from "./components";
import Home from "./pages/Home";
import "./styles.css";
const Stay = lazy(() => import("./pages/Stay"));
const Booking = lazy(() => import("./pages/Booking"));
const Admin = lazy(() => import("./pages/Admin"));
function Layout() {
  const { t } = useLanguage();
  const { error, reload, loading } = useApp();
  return (
    <>
      <a className="skip-link" href="#main-content">
        {t("stays")}
      </a>
      <Header />
      {error && (
        <Notice type="error">
          {t("REQUEST_FAILED")}{" "}
          <button onClick={() => void reload()}>{t("retry")}</button>
        </Notice>
      )}
      <main id="main-content" tabIndex={-1}>
        {loading ? (
          <div className="page-loading">{t("loading")}</div>
        ) : error ? (
          <div className="page-loading">{t("REQUEST_FAILED")}</div>
        ) : (
          <Outlet />
        )}
      </main>
      <Footer />
      <WhatsApp />
    </>
  );
}
function NotFound() {
  const { t } = useLanguage();
  return (
    <div className="section">
      <h1>{t("notFound")}</h1>
      <Link to="/">{t("home")}</Link>
    </div>
  );
}
function App() {
  const { t } = useLanguage();
  return (
    <BrowserRouter>
      <ScrollManager />
      <Suspense fallback={<div className="page-loading">{t("loading")}</div>}>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="stay/:id" element={<Stay />} />
            <Route path="book" element={<Booking />} />
            <Route path="*" element={<NotFound />} />
          </Route>
          <Route path="admin/*" element={<Admin />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <LanguageProvider>
      <AppProvider>
        <App />
      </AppProvider>
    </LanguageProvider>
  </StrictMode>,
);
