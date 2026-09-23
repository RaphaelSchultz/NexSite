import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { CookieConsent } from "./components/cookie-consent";
import "./index.css";

const HelpPage = React.lazy(() => import("./screens/ajuda/help-page").then((module) => ({ default: module.HelpPage })));
const LegalPages = {
  Lgpd: React.lazy(() => import("./screens/legal-pages").then((module) => ({ default: module.LgpdPage }))),
  Privacy: React.lazy(() => import("./screens/legal-pages").then((module) => ({ default: module.PrivacyPage }))),
  Terms: React.lazy(() => import("./screens/legal-pages").then((module) => ({ default: module.TermsPage }))),
};
const MunicipalitiesPage = React.lazy(() => import("./screens/municipalities-page").then((module) => ({ default: module.MunicipalitiesPage })));
const ReferralsPage = React.lazy(() => import("./screens/referrals-page").then((module) => ({ default: module.ReferralsPage })));
const SalesPage = React.lazy(() => import("./screens/sales-page").then((module) => ({ default: module.SalesPage })));

function ScrollToTop() {
  const { pathname } = useLocation();

  React.useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  return null;
}

function RouteFallback() {
  return (
    <div className="grid min-h-screen place-items-center bg-white text-sm font-medium text-[#667085]" role="status">
      Carregando página…
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ScrollToTop />
      <React.Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<SalesPage />} />
          <Route path="/ajuda" element={<HelpPage />} />
          <Route path="/ajuda/erro/:code" element={<HelpPage />} />
          <Route path="/ajuda/:slug" element={<HelpPage />} />
          <Route path="/programa-de-afiliados" element={<HelpPage />} />
          <Route path="/indicacoes" element={<ReferralsPage />} />
          <Route path="/municipios" element={<MunicipalitiesPage />} />
          <Route path="/privacidade" element={<LegalPages.Privacy />} />
          <Route path="/termos" element={<LegalPages.Terms />} />
          <Route path="/lgpd" element={<LegalPages.Lgpd />} />
          <Route path="*" element={<SalesPage />} />
        </Routes>
      </React.Suspense>
      <CookieConsent />
    </BrowserRouter>
  </React.StrictMode>,
);
