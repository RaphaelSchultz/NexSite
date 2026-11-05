const origin = "https://nexnotas.com.br";

const home = {
  title: "Nex Notas — NFS-e em lote para afiliados Shopee",
  description: "Emita as NFS-e da Comissão Extra da Shopee em lote: uma nota por vendedor, prévia antes de emitir, bloqueio de duplicidade e envio por e-mail.",
  path: "/",
};

function setMeta(name: string, content: string, attribute: "name" | "property" = "name") {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${name}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, name);
    document.head.appendChild(element);
  }
  element.content = content;
}

function setCanonical(path: string) {
  const href = `${origin}${path}`;
  let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!link) {
    link = document.createElement("link");
    link.rel = "canonical";
    document.head.appendChild(link);
  }
  link.href = href;
  setMeta("og:url", href, "property");
}

export function applyDocumentMeta(pathname: string) {
  const help = pathname === "/ajuda" || pathname.startsWith("/ajuda/") || pathname === "/programa-de-afiliados";
  const referrals = pathname === "/indicacoes";
  const page = help
    ? { title: "Ajuda · Nex Notas", description: "Central de ajuda da Nex Notas: certificado A1, importação do relatório Shopee, rejeições e emissão de NFS-e.", path: pathname }
    : referrals
      ? { title: "Indicações · Nex Notas", description: "Programa de indicações da Nex Notas para quem divulga a emissão de NFS-e em lote.", path: pathname }
      : home;

  document.title = page.title;
  setMeta("description", page.description);
  setMeta("robots", "index, follow");
  setMeta("og:title", page.title, "property");
  setMeta("og:description", page.description, "property");
  setMeta("og:type", "website", "property");
  setMeta("og:locale", "pt_BR", "property");
  setMeta("og:image", `${origin}/landing/painel-claro.webp`, "property");
  setMeta("twitter:card", "summary_large_image");
  setMeta("twitter:title", page.title);
  setMeta("twitter:description", page.description);
  setMeta("twitter:image", `${origin}/landing/painel-claro.webp`);
  setCanonical(page.path.startsWith("/") ? page.path : `/${page.path}`);
}
