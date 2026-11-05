import { useLayoutEffect, useRef } from "react";
import markup from "../landing/markup.html?raw";
import { initLanding } from "../landing/init";
import "../landing/landing.css";

function isInteriorPath(pathname: string) {
  return pathname === "/ajuda" || pathname.startsWith("/ajuda/") || pathname === "/indicacoes" || pathname === "/programa-de-afiliados";
}

export function SalesPage() {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;
    document.body.classList.add("nxl-page");
    const cleanup = initLanding(root);
    return () => {
      cleanup();
      document.body.classList.remove("nxl-page");
      queueMicrotask(() => {
        if (!isInteriorPath(window.location.pathname)) return;
        document.documentElement.classList.remove("dark");
        document.documentElement.setAttribute("data-theme", "light");
        document.documentElement.setAttribute("data-pref", "light");
        document.documentElement.style.colorScheme = "light";
      });
    };
  }, []);

  return <div ref={ref} dangerouslySetInnerHTML={{ __html: markup }} />;
}
