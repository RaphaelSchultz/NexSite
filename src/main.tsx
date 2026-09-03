import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { HelpPage } from "./screens/ajuda/help-page";
import { ReferralsPage } from "./screens/referrals-page";
import { SalesPage } from "./screens/sales-page";
import "./index.css";

function ScrollToTop() {
  const { pathname } = useLocation();

  React.useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  return null;
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<SalesPage />} />
        <Route path="/ajuda" element={<HelpPage />} />
        <Route path="/ajuda/erro/:code" element={<HelpPage />} />
        <Route path="/ajuda/:slug" element={<HelpPage />} />
        <Route path="/programa-de-afiliados" element={<HelpPage />} />
        <Route path="/indicacoes" element={<ReferralsPage />} />
        <Route path="*" element={<SalesPage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
);
