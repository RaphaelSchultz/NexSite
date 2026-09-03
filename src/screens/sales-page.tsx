import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Bell,
  Building2,
  Check,
  ChevronDown,
  ChevronLeft,
  Clock3,
  FileArchive,
  FileCheck2,
  FileSpreadsheet,
  Gauge,
  Headphones,
  Layers3,
  LockKeyhole,
  MailCheck,
  MapPin,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Sun,
  UploadCloud,
  Users,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { updateMarketingConsent, type MarketingPixelConsent } from "../lib/marketing-pixels";
import { cn } from "../lib/utils";

type CompanyKind = "mei" | "empresa";
type CoverageStatus = "available" | "mei_only" | "waitlist";
type Billing = "monthly" | "annual";

type CityCoverage = {
  city: string;
  uf: string;
  ibge?: string;
  status: CoverageStatus;
  note: string;
};

type PublicCoverageCity = {
  codibge: string;
  cidade: string;
  UF: string;
  atende: boolean;
};

type NotaGuardCoverageCity = {
  ibge: number | string;
  nome: string;
  uf: string;
  emissorNacional: boolean;
};

type NotaGuardCoverageResponse = {
  municipios?: NotaGuardCoverageCity[];
};

type CookiePreferences = MarketingPixelConsent;

type Plan = {
  id: string;
  name: string;
  price: number;
  invoices: number;
  companies: number;
  description: string;
  featured?: boolean;
  unlimitedInvoices?: boolean;
  support: string;
};

type SimulationResult = {
  source: string;
  count: number;
  orders: number;
  total: number;
  valid: number;
  review: number;
  duplicates: number;
  average: number;
  city: string;
  rows: Array<{ shopId: string; client: string; orders: number; value: number; status: string }>;
};

const plans: Plan[] = [
  {
    id: "gratis",
    name: "Grátis",
    price: 0,
    invoices: 50,
    companies: 1,
    description: "Para testar a emissão em lote com uma operação pequena.",
    support: "Painel com XML e DANFSe",
  },
  {
    id: "basic",
    name: "Basic",
    price: 57,
    invoices: 800,
    companies: 1,
    description: "Para afiliados que precisam emitir com previsibilidade sem sair do essencial.",
    support: "WhatsApp",
  },
  {
    id: "profissional",
    name: "Profissional",
    price: 97,
    invoices: 4000,
    companies: 1,
    description: "Para afiliados que querem tirar a emissão do manual.",
    support: "WhatsApp",
  },
  {
    id: "afiliado-expert",
    name: "Afiliado Expert",
    price: 147,
    invoices: 8000,
    companies: 2,
    description: "Para quem já emite em volume e precisa de mais folga.",
    support: "WhatsApp",
    featured: true,
  },
  {
    id: "top-afiliado",
    name: "Top Afiliado",
    price: 227,
    invoices: 999999,
    companies: 2,
    description: "Para operações grandes que não podem parar no fechamento.",
    support: "WhatsApp",
    unlimitedInvoices: true,
  },
];

const checkoutLinks: Record<Billing, Partial<Record<Plan["id"], string>>> = {
  monthly: {
    basic: "https://pay.nexnotas.com.br/p/BASIC_MONTHLY_V1",
    profissional: "https://pay.nexnotas.com.br/p/PROFESSIONAL_MONTHLY_V1",
    "afiliado-expert": "https://pay.nexnotas.com.br/p/EXPERT_MONTHLY_V1",
    "top-afiliado": "https://pay.nexnotas.com.br/p/TOP_MONTHLY_V1",
  },
  annual: {
    basic: "https://pay.nexnotas.com.br/p/BASIC_ANNUAL_V1",
    profissional: "https://pay.nexnotas.com.br/p/PROFESSIONAL_ANNUAL_V1",
    "afiliado-expert": "https://pay.nexnotas.com.br/p/EXPERT_ANNUAL_V1",
    "top-afiliado": "https://pay.nexnotas.com.br/p/TOP_ANNUAL_V1",
  },
};

function checkoutUrlFor(plan: Plan, billing: Billing) {
  return checkoutLinks[billing][plan.id];
}

const coverage: CityCoverage[] = [
  { city: "Aracruz", uf: "ES", ibge: "3200607", status: "available", note: "Cidade liberada para você começar a emitir em lote." },
  { city: "São Paulo", uf: "SP", ibge: "3550308", status: "available", note: "Cidade liberada para começar com a Nex Notas." },
  { city: "Rio de Janeiro", uf: "RJ", ibge: "3304557", status: "available", note: "Cidade liberada para emissão em lote." },
  { city: "Belo Horizonte", uf: "MG", ibge: "3106200", status: "available", note: "Cidade liberada para iniciar sua operação." },
  { city: "Curitiba", uf: "PR", ibge: "4106902", status: "available", note: "Cidade liberada para emissão e organização das notas." },
  { city: "Porto Alegre", uf: "RS", ibge: "4314902", status: "available", note: "Cidade pronta para transformar relatório em notas." },
  { city: "Florianópolis", uf: "SC", ibge: "4205407", status: "available", note: "Cidade liberada para emissão em lote." },
  { city: "Salvador", uf: "BA", ibge: "2927408", status: "mei_only", note: "Liberado para MEI. Outros portes entram na fila de prioridade." },
  { city: "Vila Velha", uf: "ES", ibge: "3205200", status: "mei_only", note: "Liberado para MEI. Outros portes entram na fila de prioridade." },
  { city: "Fortaleza", uf: "CE", ibge: "2304400", status: "mei_only", note: "Liberado para MEI. Outros portes entram na fila de prioridade." },
  { city: "Recife", uf: "PE", ibge: "2611606", status: "waitlist", note: "Ainda não liberamos sua cidade. Entre na lista para priorizarmos sua região." },
  { city: "Goiânia", uf: "GO", ibge: "5208707", status: "waitlist", note: "Ainda não liberamos sua cidade. Entre na lista para priorizarmos sua região." },
  { city: "Manaus", uf: "AM", ibge: "1302603", status: "waitlist", note: "Sua cidade está na fila de expansão da Nex Notas." },
];

const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const normalizeSearch = (value: string) => normalize(value).replace(/[^a-z0-9]+/g, " ").trim();
const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
const currencyWithCents = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2, maximumFractionDigits: 2 });
const number = new Intl.NumberFormat("pt-BR");
const nationalEmitterCities = new Set(coverage.filter((city) => city.status === "available").map((city) => cityKey(city.city, city.uf)));
const cookieStorageKey = "nexnotas_tracking_consent";
const allCookiePreferences: CookiePreferences = { analytics: true, marketing: true, experience: true };
const noOptionalCookiePreferences: CookiePreferences = { analytics: false, marketing: false, experience: false };

function cityKey(city: string, uf: string) {
  return `${normalize(city)}-${uf.toUpperCase()}`;
}

function readCookiePreferences(): CookiePreferences | null {
  const saved = localStorage.getItem(cookieStorageKey);
  if (!saved) return null;
  if (saved === "accepted") return allCookiePreferences;
  if (saved === "rejected") return noOptionalCookiePreferences;
  try {
    const parsed = JSON.parse(saved) as Partial<CookiePreferences>;
    return {
      analytics: Boolean(parsed.analytics),
      marketing: Boolean(parsed.marketing),
      experience: Boolean(parsed.experience),
    };
  } catch {
    return null;
  }
}

function cityFromCatalog(city: string, uf: string, ibge?: string): CityCoverage {
  const known = coverage.find((item) => cityKey(item.city, item.uf) === cityKey(city, uf));
  if (known) return known;
  const available = nationalEmitterCities.has(cityKey(city, uf));
  return {
    city,
    uf,
    ibge,
    status: available ? "available" : "waitlist",
    note: available ? "Cidade liberada para você começar a emitir em lote." : "Ainda não liberamos esta cidade para empresas fora do MEI.",
  };
}

function cityFromPublicCoverage(item: PublicCoverageCity): CityCoverage {
  return {
    city: item.cidade,
    uf: item.UF,
    ibge: item.codibge,
    status: item.atende ? "available" : "waitlist",
    note: item.atende ? "Cidade disponível para contratação." : "Ainda não atendemos esta cidade.",
  };
}

function cityFromNotaGuardCoverage(item: NotaGuardCoverageCity): CityCoverage {
  return {
    city: item.nome,
    uf: item.uf,
    ibge: String(item.ibge),
    status: item.emissorNacional ? "available" : "waitlist",
    note: item.emissorNacional ? "Cidade disponível para contratação." : "Ainda não atendemos esta cidade.",
  };
}

function findCity(city: string, uf?: string, catalog = coverage) {
  const normalizedCity = normalizeSearch(city);
  const normalizedUf = uf ? normalizeSearch(uf) : "";
  return catalog.find((item) => normalizeSearch(item.city) === normalizedCity && (!normalizedUf || normalizeSearch(item.uf) === normalizedUf));
}

function waitlistCity(city: string, uf = ""): CityCoverage {
  return {
    city: city.trim() || "Sua cidade",
    uf: uf.trim().toUpperCase() || "BR",
    status: "waitlist",
    note: "Ainda não liberamos esta cidade. Você pode deixar o interesse registrado para priorizarmos sua região.",
  };
}

function planPrice(plan: Plan, billing: Billing) {
  return billing === "annual" ? plan.price * 10 : plan.price;
}

function formatPlanPrice(plan: Plan, billing: Billing) {
  const value = planPrice(plan, billing);
  return value.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function formatAnnualEquivalent(plan: Plan) {
  return (plan.price * 10 / 12).toLocaleString("pt-BR", { minimumFractionDigits: plan.price === 0 ? 0 : 2, maximumFractionDigits: 2 });
}

function formatPlanCapacity(plan: Plan) {
  return plan.unlimitedInvoices ? "Notas ilimitadas" : `${number.format(plan.invoices)} notas/mês`;
}

function parseMoney(value: string) {
  const source = value.trim();
  const match = source.match(/(?:R\$\s*)?[-+]?\d{1,3}(?:\.\d{3})*,\d{2}|(?:R\$\s*)?[-+]?\d+,\d{2}|(?:R\$\s*)?[-+]?\d+(?:\.\d{1,2})?/);
  if (!match) return 0;
  const raw = match[0].replace(/[^\d,.-]/g, "");
  const hasBrazilianCents = /,\d{1,2}$/.test(raw);
  const normalized = hasBrazilianCents ? raw.replace(/\./g, "").replace(",", ".") : raw.replace(/,/g, "");
  const parsed = Number(normalized);
  if (!Number.isFinite(parsed) || Math.abs(parsed) > 1000000) return 0;
  return parsed;
}

function parseCsvLine(line: string) {
  const cells: string[] = [];
  let current = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];
    if (char === "\"" && quoted && next === "\"") {
      current += "\"";
      index += 1;
      continue;
    }
    if (char === "\"") {
      quoted = !quoted;
      continue;
    }
    if (char === "," && !quoted) {
      cells.push(current.trim());
      current = "";
      continue;
    }
    current += char;
  }
  cells.push(current.trim());
  return cells;
}

function parseCsvSimulation(text: string, source: string): SimulationResult {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const header = parseCsvLine(lines[0] || "").map((cell) => normalize(cell));
  const rows = lines.slice(header.length ? 1 : 0).map(parseCsvLine);
  const shopIdIndex = header.findIndex((cell) => cell.includes("id da loja"));
  const nameIndex = header.findIndex((cell) => cell.includes("nome da loja"));
  const valueIndex = header.findIndex((cell) => cell.includes("comissao total"));
  const grouped = new Map<string, { shopId: string; client: string; orders: number; value: number; status: string }>();
  let review = 0;
  rows.forEach((cells, index) => {
    const shopId = cells[shopIdIndex] || `LOJA-${index + 1}`;
    const client = cells[nameIndex] || `Loja ${index + 1}`;
    const value = parseMoney(cells[valueIndex] || cells.find((cell) => cell.includes("R$")) || "0");
    if (!value || !client.trim()) review += 1;
    const current = grouped.get(shopId) ?? { shopId, client, orders: 0, value: 0, status: "Pronta" };
    current.orders += 1;
    current.value += value;
    if (!value || !client.trim()) current.status = "Revisar";
    grouped.set(shopId, current);
  });
  const parsed = [...grouped.values()];
  const total = parsed.reduce((sum, row) => sum + row.value, 0);
  const duplicates = Math.max(rows.length - parsed.length, 0);
  const valid = parsed.filter((row) => row.status === "Pronta").length;
  return {
    source,
    count: parsed.length,
    orders: rows.length,
    total,
    valid,
    review,
    duplicates,
    average: parsed.length ? total / parsed.length : 0,
    city: "Cidade confirmada antes de contratar",
    rows: parsed.slice(0, 4),
  };
}

export function SalesPage() {
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [launchNotice, setLaunchNotice] = useState(false);
  const [cookiePreferences, setCookiePreferences] = useState<CookiePreferences | null>(() => readCookiePreferences());
  const [cookieSettingsOpen, setCookieSettingsOpen] = useState(false);
  const [cookieDraft, setCookieDraft] = useState<CookiePreferences>(allCookiePreferences);
  const [kind, setKind] = useState<CompanyKind | null>(null);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [editingCity, setEditingCity] = useState(false);
  const [locating, setLocating] = useState(false);
  const [cityQuery, setCityQuery] = useState("São Paulo");
  const [selectedCity, setSelectedCity] = useState<CityCoverage | null>(coverage[1]);
  const [cityCatalog, setCityCatalog] = useState<CityCoverage[]>(coverage);
  const [billing, setBilling] = useState<Billing>("monthly");
  const [volume, setVolume] = useState(6750);
  const [uploadedFileName, setUploadedFileName] = useState("Nenhum arquivo selecionado");
  const [simulation, setSimulation] = useState<SimulationResult | null>(null);
  const [simulationProcessing, setSimulationProcessing] = useState(false);

  useLayoutEffect(() => {
    const root = document.documentElement;
    const keepLight = () => {
      root.classList.remove("dark");
      root.style.colorScheme = "light";
    };
    keepLight();
    document.body.classList.add("nex-sales-body");
    document.body.style.backgroundColor = "#ffffff";
    const observer = new MutationObserver(keepLight);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => {
      observer.disconnect();
      document.body.classList.remove("nex-sales-body");
      document.body.style.backgroundColor = "";
    };
  }, []);

  useEffect(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>(".sales-reveal"));
    if (!elements.length) return;

    if (!("IntersectionObserver" in window)) {
      elements.forEach((element) => element.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0.16 });

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!cookiePreferences) return;
    updateMarketingConsent(cookiePreferences);
  }, [cookiePreferences]);

  const updateCookiePreferences = (preferences: CookiePreferences) => {
    localStorage.setItem(cookieStorageKey, JSON.stringify(preferences));
    setCookiePreferences(preferences);
    setCookieSettingsOpen(false);
  };

  useEffect(() => {
    let canceled = false;
    const loadNotaGuardFallback = () => fetch("https://notaguard.com.br/guias/municipios-habilitados-nfse-nacional/dados")
      .then((response) => response.ok ? response.json() as Promise<NotaGuardCoverageResponse> : Promise.reject(new Error("Cobertura NotaGuard indisponível")));

    fetch("https://api.nexnotas.com.br/api/v1/public/cobertura")
      .then((response) => response.ok ? response.json() as Promise<PublicCoverageCity[]> : Promise.reject(new Error("Cobertura indisponível")))
      .catch(() => loadNotaGuardFallback())
      .then((items) => {
        if (canceled) return;
        const cities = Array.isArray(items)
          ? items.map(cityFromPublicCoverage)
          : items.municipios?.map(cityFromNotaGuardCoverage);
        if (!cities?.length) return;
        setCityCatalog(cities);
      })
      .catch(() => undefined);
    return () => { canceled = true; };
  }, []);

  useEffect(() => {
    let canceled = false;
    fetch("https://ipwho.is/?fields=success,city,region_code,country_code")
      .then((response) => response.ok ? response.json() as Promise<{ success?: boolean; city?: string; region_code?: string; country_code?: string }> : null)
      .then((data) => {
        if (canceled || !data?.success || data.country_code !== "BR" || !data.city) return;
        const city = findCity(data.city, data.region_code, cityCatalog) ?? waitlistCity(data.city, data.region_code);
        setSelectedCity(city);
        setCityQuery(`${city.city} / ${city.uf}`);
      })
      .catch(() => undefined);
    return () => { canceled = true; };
  }, [cityCatalog]);

  const matchingCities = useMemo(() => {
    const query = normalizeSearch(cityQuery);
    if (!query) return cityCatalog;
    const terms = query.split(/\s+/);
    return cityCatalog
      .filter((item) => {
        const searchable = normalizeSearch(`${item.city} ${item.uf} ${item.ibge ?? ""}`);
        return terms.every((term) => searchable.includes(term));
      });
  }, [cityCatalog, cityQuery]);

  const recommendedPlan = useMemo(() => plans.find((plan) => plan.unlimitedInvoices || volume <= plan.invoices) ?? plans[plans.length - 1], [volume]);
  const volumePercent = Math.min(Math.max((volume - 50) / (20000 - 50) * 100, 0), 100);

  const openGate = (plan: Plan) => {
    setSelectedPlan(plan);
    setKind(null);
    setStep(1);
    setEditingCity(false);
    setCityQuery(selectedCity ? `${selectedCity.city} / ${selectedCity.uf}` : "São Paulo");
  };

  const openCityChanger = () => {
    setSelectedPlan(plans[1]);
    setKind("empresa");
    setStep(2);
    setEditingCity(true);
    setSelectedCity(null);
    setCityQuery("");
  };

  const simulateCsvFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const nextSimulation = parseCsvSimulation(String(reader.result || ""), file.name);
      setSimulationProcessing(true);
      setUploadedFileName(file.name);
      window.setTimeout(() => {
        setSimulation(nextSimulation);
        setSimulationProcessing(false);
      }, 850);
    };
    reader.readAsText(file, "utf-8");
  };

  const useDeviceLocation = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=pt`)
          .then((response) => response.ok ? response.json() as Promise<{ city?: string; locality?: string; principalSubdivisionCode?: string }> : null)
          .then((data) => {
            const rawCity = data?.city || data?.locality;
            const uf = data?.principalSubdivisionCode?.replace("BR-", "");
            if (!rawCity) return;
            const city = findCity(rawCity, uf, cityCatalog) ?? waitlistCity(rawCity, uf);
            setSelectedCity(city);
            setCityQuery(`${city.city} / ${city.uf}`);
            setEditingCity(false);
          })
          .finally(() => setLocating(false));
      },
      () => setLocating(false),
      { timeout: 8000, maximumAge: 300000 },
    );
  };

  return (
    <div className="nex-sales min-h-screen bg-white text-[#061747]">
      <div className="sales-announcement border-b border-[#eef0f5] bg-[#f8f9fd] text-center text-xs text-[#667085]">
        <div className="mx-auto flex min-h-9 max-w-6xl items-center justify-center gap-2 px-5 py-1">
          <span className="rounded-full border border-[#e5e7fb] bg-white px-2.5 py-1 font-semibold text-[#4f56f6]">Novo modelo fiscal da Shopee</span>
          <span>Uma nota por vendedor, todas emitidas em lote. <strong className="font-semibold text-[#344054]">Sem perder horas no emissor.</strong></span>
        </div>
      </div>

      <header className="sales-header sticky top-0 z-40 border-b border-[#eef0f4] bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[70px] max-w-6xl items-center justify-between gap-7 px-5">
          <SalesBrand />
          <nav className="sales-nav hidden items-center gap-7 text-[13px] font-medium text-[#596579] lg:flex">
            <a href="#como-funciona" className="transition hover:text-[#4f56f6]">Como funciona</a>
            <a href="#produto" className="transition hover:text-[#4f56f6]">Produto</a>
            <a href="#beneficios" className="transition hover:text-[#4f56f6]">Benefícios</a>
            <a href="#planos" className="transition hover:text-[#4f56f6]">Preços</a>
            <a href="#faq" className="transition hover:text-[#4f56f6]">FAQ</a>
            <a href="/ajuda" className="transition hover:text-[#4f56f6]">Ajuda</a>
          </nav>
          <div className="flex items-center gap-2">
            <a href="https://app.nexnotas.com.br/entrar"><Button variant="ghost" className="hidden text-[#344054] sm:inline-flex">Entrar</Button></a>
          </div>
        </div>
      </header>

      <main>
        <section id="inicio" className="sales-hero bg-white px-0 py-0">
          <div className="sales-hero-shell relative mx-0 overflow-hidden bg-[#f8f9ff] px-4 pb-12 pt-14 sm:px-8 lg:pb-14 lg:pt-16">
            <div className="sales-hero-glow pointer-events-none absolute z-0 rounded-full bg-[#eef0ff]" />
            <div className="relative z-10 mx-auto flex w-full max-w-[1280px] flex-col items-center text-center">
              <div className="mx-auto max-w-4xl">
                <Eyebrow>NFS-e em lote para afiliados Shopee</Eyebrow>
                <h1 className="mx-auto mt-4 max-w-[960px] font-heading text-4xl font-semibold leading-[1.12] tracking-tight text-[#061747] sm:text-5xl lg:text-[60px]">
                  <span className="block">Emita as notas da</span>
                  <span className="block">Shopee <span className="text-[#4f56f6]">em poucos minutos.</span></span>
                </h1>
                <p className="mx-auto mt-3 max-w-[680px] text-[17px] leading-[1.65] text-[#667085]">
                  Importe o CSV oficial, revise a prévia e gere NFS-e por vendedor sem copiar dados manualmente. PDF, XML, status e histórico ficam organizados em um só lugar.
                </p>
              </div>
              <ProductWindow />
              <div className="sales-hero-actions mt-7 flex flex-wrap justify-center gap-3">
                <a href="#planos"><Button size="lg" className="gap-2 rounded-[10px] bg-[#4f56f6] hover:bg-[#454cf0]">Emitir minhas notas <ArrowRight className="h-4 w-4" /></Button></a>
                <a href="#simulacao"><Button size="lg" variant="outline" className="gap-2 rounded-[10px] border-[#e3e6ed] bg-white text-[#344054] hover:bg-[#f7f8fc]">Simular relatório <FileSpreadsheet className="h-4 w-4" /></Button></a>
              </div>
              <div className="mt-3 flex flex-wrap justify-center gap-2">
                {["Relatório da Shopee", "Emissão em lote", "PDF + XML", "Evita duplicidade", "Histórico por competência"].map((item) => (
                  <span key={item} className="rounded-full border border-[#e8eaf1] bg-white px-3 py-1 text-[11px] font-semibold text-[#667085]">{item}</span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="sales-trust-section sales-reveal bg-white px-5 pb-9 pt-8">
          <div className="sales-trust mx-auto grid max-w-6xl overflow-hidden rounded-[18px] border border-[#eaecf1] bg-white md:grid-cols-4">
            <TrustItem icon={Clock3} title="Notas em minutos" text="troque horas de digitação por lote" />
            <TrustItem icon={ShieldCheck} title="Prévia antes de emitir" text="confira valores e vendedores" />
            <TrustItem icon={RefreshCw} title="Menos retrabalho" text="corrija apenas o que precisa" />
            <TrustItem icon={FileArchive} title="Tudo organizado" text="PDF, XML, status e competência" />
          </div>
        </section>

        <section id="beneficios" className="sales-problem sales-reveal border-y border-[#f0f2f6] bg-[#fbfcfe] py-24">
          <div className="mx-auto grid max-w-6xl gap-16 px-5 lg:grid-cols-2 lg:items-center">
            <div>
              <SectionKicker>A comissão extra mudou a rotina</SectionKicker>
              <h2 className="font-heading text-3xl font-semibold leading-[1.18] tracking-tight text-[#061747] lg:text-[38px]">
                Centenas de notas, sem virar o mês no manual.
              </h2>
              <p className="mt-4 max-w-[670px] text-base leading-[1.75] text-[#667085]">
                A Shopee entrega o relatório. A Nex Notas transforma esse volume em uma rotina de emissão clara, conferida e pronta para escalar.
              </p>
              <div className="mt-8 grid gap-2">
                <Pain n="01" title="Nota por nota não escala" text="O relatório cresce e a digitação vira gargalo no fechamento." />
                <Pain n="02" title="Erros custam tempo" text="Valor, tomador e competência precisam bater antes de emitir." />
                <Pain n="03" title="Histórico dá controle" text="PDF, XML e status ficam prontos para consulta." />
              </div>
            </div>
            <div className="rounded-[14px] border border-[#eaecf2] bg-white p-6">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="font-heading text-lg font-semibold text-[#061747]">Manual x operação organizada</h3>
                <span className="rounded-full border border-[#e5e7fb] bg-[#f7f8ff] px-2.5 py-1 text-[11px] font-semibold text-[#4f56f6]">Sem mudar sua rotina de vendas</span>
              </div>
              <div className="overflow-hidden rounded-[10px] border border-[#e7e9ef]">
                {[
                  ["Dados dos vendedores", "copiar e cadastrar", "importar e revisar"],
                  ["Conferência", "linha por linha", "validação antes do lote"],
                  ["Emissão", "repetitiva", "processamento em lote"],
                  ["Duplicidade", "depende da memória", "alerta por competência"],
                  ["Rejeições", "procurar onde falhou", "motivo e próxima ação"],
                  ["Arquivos", "pastas e downloads", "histórico PDF/XML"],
                ].map(([stepName, manual, nex]) => (
                  <div key={stepName} className="grid grid-cols-[1fr_1fr_1fr] border-b border-[#eef0f4] text-[13px] last:border-b-0">
                    <div className="px-3 py-3 font-medium text-[#344054]">{stepName}</div>
                    <div className="px-3 py-3 text-[#7a8396]">{manual}</div>
                    <div className="px-3 py-3 font-medium text-[#061747]"><Check className="mr-1 inline h-3.5 w-3.5 text-[#16a34a]" />{nex}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="como-funciona" className="sales-steps sales-reveal bg-white py-24">
              <SectionHeading kicker="Como funciona" title="Do CSV ao lote emitido, sem retrabalho" text="Um fluxo simples para importar, revisar e emitir com segurança." center />
          <div className="mx-auto mt-12 grid max-w-5xl gap-5 px-5 md:grid-cols-3">
            <StepCard icon={UploadCloud} n="1" title="Importe o CSV da Shopee" text="Suba o relatório mensal com vendedores, valores e competência." />
            <StepCard icon={FileSpreadsheet} n="2" title="Revise a prévia do lote" text="Veja quantidade de notas, total, duplicidades e linhas que precisam de atenção." />
            <StepCard icon={FileCheck2} n="3" title="Emita e organize tudo" text="Acompanhe as notas autorizadas e mantenha PDF, XML e histórico em um único painel." />
          </div>
          <div className="mt-10 text-center"><a href="#planos"><Button className="rounded-[10px] bg-[#4f56f6] hover:bg-[#454cf0]">Quero emitir em lote <ArrowRight className="ml-2 h-4 w-4" /></Button></a></div>
        </section>

        <section id="produto" className="sales-product sales-reveal border-y border-[#f0f2f6] bg-[#fbfcfe] py-24">
              <SectionHeading kicker="Produto em operação" title="Uma rotina completa para emissão em lote" text="Importação, conferência, documentos e histórico no mesmo painel." center />
          <div className="mx-auto mt-12 grid max-w-5xl gap-5 px-5 lg:grid-cols-2">
            <FeatureSpot />
            <FeatureMini icon={Gauge} title="Controle do volume" text="Acompanhe quantas notas ainda cabem no seu plano." />
            <FeatureMini icon={LockKeyhole} title="Emissão segura" text="Revise dados fiscais antes de avançar." />
            <FeatureMini icon={BarChart3} title="Visão do lote" text="Veja status, valores e pendências em uma tela." />
            <FeatureMini icon={Layers3} title="Pronto para crescer" text="Adicione empresas e aumente o volume quando precisar." />
          </div>
        </section>

        <section id="simulacao" className="sales-upload sales-reveal bg-white py-24">
          <SectionHeading kicker="Simulador de emissão em lote Shopee" title="Simulação de Espelho de Nota Fiscal" text="Arraste seu relatório .csv para ver o espelho da nota fiscal gerada por vendedor único." center />
          <div className="mx-auto mt-10 max-w-5xl px-5">
            <input
              id="csv-simulator-file"
              className="sr-only"
              type="file"
              accept=".csv,text/csv"
              onChange={(event) => {
                const file = event.currentTarget.files?.[0];
                if (file) simulateCsvFile(file);
              }}
            />
            {!simulation ? (
              <div
                className={cn("simulator-dropzone rounded-[24px] border border-dashed border-[#cdd2ff] bg-white p-10 text-center shadow-[0_18px_50px_rgba(6,23,71,.06)]", simulationProcessing && "is-processing")}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  const file = event.dataTransfer.files?.[0];
                  if (file) simulateCsvFile(file);
                }}
              >
                <label htmlFor="csv-simulator-file" className="block cursor-pointer">
                  <div className="mx-auto grid h-16 w-16 place-items-center rounded-[16px] bg-[#f4f5ff] text-[#4f56f6] shadow-[0_10px_25px_rgba(79,86,246,.13)]"><UploadCloud className="h-8 w-8" /></div>
                  <h3 className="mt-6 font-heading text-2xl font-semibold text-[#061747]">Arraste seu arquivo <span className="text-[#4f56f6]">.csv</span> aqui</h3>
                  <p className="mt-3 text-sm leading-6 text-[#667085]">Ou clique para selecionar o relatório da Shopee</p>
                  <strong className="mt-1 block text-sm text-[#344054]">{uploadedFileName}</strong>
                  <span className="mx-auto mt-6 inline-flex items-center gap-2 rounded-[12px] bg-[#f3f6fa] px-4 py-2 text-xs font-bold text-[#344054]"><FileSpreadsheet className="h-4 w-4" />Compatível com relatórios Shopee Brasil</span>
                </label>
                <p className="mt-7 text-xs font-semibold text-[#8a94a6]">O resumo aparece aqui somente depois que o CSV for enviado e processado.</p>
              </div>
            ) : null}
            {simulationProcessing ? (
              <div className="simulator-processing-card mt-8 rounded-[18px] border border-[#dfe6f0] bg-white p-6 text-center shadow-[0_18px_50px_rgba(6,23,71,.08)]">
                <div className="mx-auto h-2 max-w-md overflow-hidden rounded-full bg-[#e9ecff]"><span className="simulator-processing-bar block h-full w-2/3 rounded-full bg-[#4f56f6]" /></div>
                <h3 className="mt-5 font-heading text-xl font-semibold text-[#061747]">Lendo relatório da Shopee...</h3>
                <p className="mt-2 text-sm text-[#667085]">Estamos identificando vendedores únicos, valores e quantidade de notas.</p>
              </div>
            ) : null}
            {simulation ? (
            <div className="simulator-result-card mt-8 rounded-[18px] border border-[#dfe6f0] bg-white p-6 shadow-[0_18px_50px_rgba(6,23,71,.08)]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-[8px] bg-[#f4f5ff] px-2 py-1 text-[10px] font-bold uppercase tracking-[.08em] text-[#4f56f6]">Prévia Nex Notas</span>
                    <span className="rounded-full border border-[#cdd2ff] bg-[#f7f8ff] px-3 py-1 text-[10px] font-bold uppercase tracking-[.08em] text-[#4f56f6]">CSV processado</span>
                  </div>
                  <h3 className="mt-3 font-heading text-xl font-semibold text-[#061747]">Resumo do lote de NFS-e</h3>
                  <p className="mt-1 text-xs text-[#667085]">Prévia de emissão por vendedor único a partir do relatório Shopee.</p>
                </div>
                <label htmlFor="csv-simulator-file" className="cursor-pointer rounded-[10px] border border-[#e3e6ed] bg-[#f8fafc] px-3 py-2 text-xs font-bold text-[#344054]">Testar outro .csv</label>
              </div>
              <div className="mt-5 grid gap-3 border-y border-[#e6ebf2] py-4 text-xs sm:grid-cols-4">
                <SimMeta label="Nº da nota fiscal" value="2026.0731-NFS-e" />
                <SimMeta label="Emissão" value="Lote automatizado" />
                <SimMeta label="Regime fiscal" value="Simples Nacional / ME" />
                <SimMeta label="Arquivo origem" value={simulation.source} accent />
              </div>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div className="rounded-[12px] border border-[#e5e8f0] bg-[#fbfcfe] p-4">
                  <p className="text-[11px] font-bold uppercase tracking-[.08em] text-[#667085]">Prestador dos serviços</p>
                  <h4 className="mt-2 font-heading text-sm font-semibold text-[#061747]">Sua empresa de afiliado digital / CNPJ</h4>
                  <p className="mt-2 text-xs leading-5 text-[#667085]">Serviço: intermediação de negócios e promoção de vendas na internet.</p>
                </div>
                <div className="rounded-[12px] border border-[#e5e8f0] bg-[#fbfcfe] p-4">
                  <p className="text-[11px] font-bold uppercase tracking-[.08em] text-[#667085]">Tomadores dos serviços</p>
                  <h4 className="mt-2 font-heading text-sm font-semibold text-[#061747]">{number.format(simulation.count)} vendedores únicos identificados</h4>
                  <p className="mt-2 text-xs leading-5 text-[#667085]">Uma nota por loja única, organizada a partir do relatório.</p>
                </div>
              </div>
              <div className="mt-5 flex items-center justify-between gap-3">
                <p className="text-[11px] font-bold uppercase tracking-[.08em] text-[#344054]">Discriminativo das notas fiscais em lote</p>
                <span className="text-xs font-bold text-[#667085]">Total: {number.format(simulation.count)} notas fiscais</span>
              </div>
              <div className="simulator-table mt-3 overflow-x-auto rounded-[12px] border border-[#e5e8f0] bg-white">
                <div className="min-w-0 sm:min-w-[680px]">
                  <div className="grid grid-cols-[88px_1fr] bg-[#f3f6fa] px-4 py-3 text-[10px] font-bold uppercase tracking-[.08em] text-[#526073] sm:grid-cols-[110px_1fr_90px_130px]">
                    <span>ID da loja</span>
                    <span>Nome da loja</span>
                    <span className="hidden sm:block">Pedidos</span>
                    <span className="hidden text-right sm:block">Valor da nota</span>
                  </div>
                  {simulation.rows.map((row, index) => (
                    <div key={`${row.client}-${index}`} className="grid grid-cols-[88px_1fr] items-center gap-3 border-b border-[#eef0f4] px-4 py-3 text-xs last:border-b-0 sm:grid-cols-[110px_1fr_90px_130px]">
                      <span className="font-mono text-[#667085]">{row.shopId}</span>
                      <strong className="text-[#344054]">{row.client}<span className="mt-1 block font-sans text-[11px] font-semibold text-[#4f56f6] sm:hidden">{currencyWithCents.format(row.value)}</span></strong>
                      <span className="hidden text-[#667085] sm:block">{row.orders} ped.</span>
                      <span className="hidden min-w-0 truncate text-right font-semibold text-[#4f56f6] sm:block">{currencyWithCents.format(row.value)}</span>
                    </div>
                  ))}
                  <div className="flex flex-wrap items-center justify-between gap-3 bg-[#f7f8ff] px-4 py-3 text-xs font-semibold">
                    <span className="text-[#4f56f6]">+ E mais {Math.max(simulation.count - simulation.rows.length, 0)} lojas únicas mapeadas no relatório...</span>
                    <span className="text-[#16803c]">100% organizado em lote</span>
                  </div>
                </div>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <SimStat label="Notas fiscais necessárias" value={`${number.format(simulation.count)} notas`} text={`Aglutinadas para ${number.format(simulation.orders)} pedidos do CSV.`} />
                <SimStat label="Economia de tempo" value={`${Math.max(Math.ceil(simulation.count * 12 / 60), 1)} horas salvas`} text="Comparado a cerca de 12 minutos por nota digitada manualmente." highlight />
                <SimStat label="Valor bruto total" value={currencyWithCents.format(simulation.total)} text="Soma total das comissões encontradas no relatório." compactValue />
              </div>
              <div className="mt-5 rounded-[14px] bg-[#4f56f6] p-5 text-white shadow-[0_16px_35px_rgba(79,86,246,.22)]">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <span className="rounded-full bg-white/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[.08em]">Emissão oficial em lote Nex Notas</span>
                    <h4 className="mt-3 font-heading text-2xl font-semibold text-white">Emitir todas as {number.format(simulation.count)} notas fiscais em 1 clique</h4>
                    <p className="mt-1 text-sm text-white/85">Envio organizado para emissão, sem digitação manual.</p>
                  </div>
                  <a className="shrink-0" href="#planos"><Button className="rounded-[10px] bg-white text-[#061747] hover:bg-[#f7f8ff]">Emitir lote na Nex Notas <ArrowRight className="ml-2 h-4 w-4" /></Button></a>
                </div>
              </div>
            </div>
            ) : null}
          </div>
        </section>

        <section id="cobertura" className="sales-coverage sales-reveal bg-[#050816] py-24 text-white">
          <div className="mx-auto grid max-w-5xl gap-10 px-5 lg:grid-cols-2 lg:items-center">
            <div className="coverage-check-card rounded-[22px] border border-white/10 bg-white/[.055] p-6 shadow-2xl">
              <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[.12em] text-[#aeb6ff]">Verificação de cobertura</p>
                  <h3 className="mt-2 font-heading text-2xl font-semibold text-white">{selectedCity ? `${selectedCity.city} / ${selectedCity.uf}` : "São Paulo / SP"}</h3>
                </div>
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-[14px] bg-[#4f56f6] text-white">
                  <MapPin className="h-6 w-6" />
                </div>
              </div>
              <div className="mt-5 grid gap-3">
                <div className="rounded-[16px] border border-white/10 bg-[#080c1b] p-4">
                  <div className="flex items-start gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-[#f4f5ff] text-[#4f56f6]"><BadgeCheck className="h-5 w-5" /></span>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[.12em] text-white/55">Status atual</p>
                      <strong className="mt-1 block font-heading text-xl text-white">Disponível para MEI</strong>
                      <p className="mt-2 text-sm leading-6 text-white/65">Para outros portes, a cidade entra na prioridade de expansão antes da contratação.</p>
                    </div>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <CoverageStep icon={Search} title="Cidade" text="confira antes" />
                  <CoverageStep icon={Building2} title="Porte" text="MEI ou empresa" />
                  <CoverageStep icon={ShieldCheck} title="Plano" text="avance seguro" />
                </div>
              </div>
              <div className="mt-5 rounded-[16px] border border-[#4f56f6]/35 bg-[#4f56f6]/10 p-4">
                <p className="text-sm leading-6 text-white/75">Contrate com clareza: cidade atendida segue para o plano; cidade indisponível entra na prioridade.</p>
              </div>
            </div>
            <div>
              <SectionKicker dark>Disponibilidade antes de contratar</SectionKicker>
              <h2 className="font-heading text-3xl font-semibold leading-[1.18] tracking-tight text-white lg:text-[38px]">
                Confira a cidade antes de escolher o plano.
              </h2>
              <p className="mt-4 max-w-[620px] text-base leading-[1.75] text-white/70">
                Antes do pagamento, a Nex Notas confirma se sua operação já pode seguir. Se estiver liberado, você continua para contratar.
              </p>
              <div className="mt-8 grid gap-3 text-sm text-white/78">
                {["MEI segue pelo padrão nacional.", "Empresas passam pela checagem municipal.", "Cidades indisponíveis entram na prioridade."].map((text) => (
                  <div key={text} className="flex items-center gap-3 rounded-[12px] border border-white/10 bg-white/[.045] px-4 py-3">
                    <Check className="h-4 w-4 text-[#aeb6ff]" />
                    <span>{text}</span>
                  </div>
                ))}
              </div>
              <div className="mt-7 flex flex-wrap gap-3">
                <a href="#planos"><Button className="rounded-[10px] bg-[#4f56f6] hover:bg-[#454cf0]">Ver planos</Button></a>
                <button className="inline-flex h-10 items-center gap-2 rounded-[10px] border border-white/15 px-4 text-sm font-semibold text-white" onClick={openCityChanger}><Search className="h-4 w-4" />Trocar cidade</button>
              </div>
            </div>
          </div>
        </section>

        <section id="planos" className="sales-pricing sales-reveal border-y border-[#f0f2f6] bg-[#fbfcfe] py-24">
          <SectionHeading kicker="Planos" title="Comece de graça e cresça quando fizer sentido" text="Escolha o plano pelo seu volume atual e economize 16,7% no anual." center />
          <div className="mt-8 flex items-center justify-center">
            <div className="sales-billing-toggle inline-flex items-center rounded-full border border-[#dfe3ea] bg-white p-1 shadow-[0_10px_26px_rgba(6,23,71,.045)]">
              <button
                className={cn("h-10 rounded-full px-5 text-sm font-medium transition", billing === "monthly" ? "bg-[#061747] text-white shadow-[0_8px_18px_rgba(6,23,71,.16)]" : "text-[#344054] hover:text-[#061747]")}
                onClick={() => setBilling("monthly")}
              >
                Mensal
              </button>
              <button
                className={cn("flex h-10 items-center gap-2 rounded-full px-5 text-sm font-medium transition", billing === "annual" ? "bg-[#061747] text-white shadow-[0_8px_18px_rgba(6,23,71,.16)]" : "text-[#344054] hover:text-[#061747]")}
                onClick={() => setBilling("annual")}
              >
                Anual
                <span className={cn("rounded-full px-2 py-1 text-[10px] font-bold leading-none", billing === "annual" ? "bg-[#4f56f6] text-white" : "bg-[#10b981] text-white")}>16,7% off</span>
              </button>
            </div>
          </div>
          <div className="mx-auto mt-12 flex max-w-[1324px] flex-wrap justify-center gap-4 px-5">
            {plans.map((plan) => <PlanCard key={plan.id} plan={plan} billing={billing} onChoose={() => openGate(plan)} />)}
          </div>
          <div className="mx-auto mt-5 flex max-w-6xl flex-col gap-3 rounded-[10px] border border-[#e6e9ef] bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <strong className="text-sm font-semibold text-[#344054]">Seu volume cresceu?</strong>
              <p className="mt-1 text-sm text-[#748094]">Você mantém o histórico e sobe para a próxima faixa quando precisar emitir mais.</p>
            </div>
          </div>
        </section>

        <section id="simulador" className="sales-calculator sales-reveal bg-white py-24">
          <SectionHeading kicker="Encontre sua faixa" title="Veja o plano recomendado pelo seu volume" text="Ajuste a quantidade de notas e encontre o plano ideal." center />
          <div className="sales-calculator-panel mx-auto mt-12 grid max-w-6xl gap-0 overflow-hidden rounded-[22px] border border-[#dfe3ff] bg-white px-0 shadow-[0_24px_70px_rgba(6,23,71,.08)] lg:grid-cols-[1.35fr_.9fr]">
            <div className="p-7 sm:p-9">
              <div className="sales-calculator-head flex items-start justify-between gap-4">
                <div><h3 className="font-heading text-2xl font-semibold text-[#061747]">Notas fiscais emitidas por mês</h3><p className="mt-2 max-w-md text-sm leading-6 text-[#667085]">Use o volume aproximado do seu relatório Shopee.</p></div>
                <div className="sales-volume-pill rounded-[16px] bg-[#f4f5ff] px-5 py-3 text-center">
                  <span className="block text-[10px] font-bold uppercase tracking-[.1em] text-[#4f56f6]">Volume</span>
                  <strong className="block whitespace-nowrap font-heading text-4xl font-semibold leading-none text-[#061747]">{number.format(volume)}</strong>
                </div>
              </div>
              <div className="sales-range-wrap mt-9">
                <input
                  className="sales-volume-range w-full"
                  type="range"
                  min={50}
                  max={20000}
                  step={50}
                  value={volume}
                  style={{ ["--range-progress" as string]: `${volumePercent}%` }}
                  onChange={(event) => setVolume(Number(event.target.value))}
                />
                <div className="mt-4 grid grid-cols-5 text-xs font-semibold text-[#9299a7]"><span>50</span><span>800</span><span>4.000</span><span>8.000</span><span className="text-right">Ilimitado</span></div>
              </div>
              <div className="mt-7 rounded-[16px] border border-[#dfe3ff] bg-[#fbfcff] p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[11px] bg-[#eef0ff] text-[#4f56f6]"><BadgeCheck className="h-5 w-5" /></span>
                    <div>
                      <span className="block text-xs font-bold text-[#344054]">Plano indicado para sua demanda</span>
                      <p className="mt-1 text-xs text-[#7a8496]">Você pode mudar de faixa quando o volume crescer.</p>
                    </div>
                  </div>
                  <span className="sales-recommended-name rounded-[12px] border border-[#cdd2ff] bg-white px-4 py-2 text-sm font-bold text-[#061747]">{recommendedPlan.name}</span>
                </div>
              </div>
            </div>
            <div className="bg-[#061747] p-7 text-white sm:p-9">
              <span className="text-[11px] font-semibold uppercase tracking-[.1em] text-[#aeb6ff]">Plano recomendado</span>
              <h3 className="mt-3 font-heading text-4xl font-semibold text-white">{recommendedPlan.name}</h3>
              <div className="mt-4 font-heading text-5xl font-semibold tracking-[-.04em] text-white">{currency.format(recommendedPlan.price)} <span className="font-sans text-sm font-medium text-white/60">/mês</span></div>
              <div className="mt-8 grid gap-3">
                <div className="flex justify-between rounded-[12px] bg-white/8 p-3 text-sm"><span className="text-white/65">Notas incluídas</span><strong>{recommendedPlan.unlimitedInvoices ? "Ilimitadas" : number.format(recommendedPlan.invoices)}</strong></div>
                <div className="flex justify-between rounded-[12px] bg-white/8 p-3 text-sm"><span className="text-white/65">Empresas</span><strong>{recommendedPlan.companies}</strong></div>
                <div className="flex justify-between rounded-[12px] bg-white/8 p-3 text-sm"><span className="text-white/65">Suporte</span><strong>{recommendedPlan.support}</strong></div>
              </div>
              <Button className="mt-8 w-full rounded-[10px] bg-white text-[#4f56f6] hover:bg-[#f7f8ff]" onClick={() => openGate(recommendedPlan)}>Conferir disponibilidade e contratar</Button>
            </div>
          </div>
        </section>

        <section className="sales-support sales-reveal bg-[#050816] py-24 text-white">
          <div className="mx-auto max-w-5xl rounded-[18px] border border-white/10 bg-white/5 p-8 sm:p-10">
            <div className="max-w-3xl">
              <SectionKicker dark>Suporte para sair do manual</SectionKicker>
              <h2 className="font-heading text-3xl font-semibold leading-[1.18] tracking-tight text-white lg:text-[38px]">Você não precisa virar especialista fiscal para emitir em escala.</h2>
              <p className="mt-4 max-w-[620px] text-base leading-[1.75] text-white/70">Lote importado, revisão clara, documentos organizados e suporte para seguir sem ficar preso na emissão manual.</p>
              <div className="mt-6 grid gap-3 text-sm text-white/80">
                {["Emita mais notas sem aumentar o trabalho operacional", "Tenha documentos prontos para consulta e conferência", "Cresça com mais empresas e volume quando precisar"].map((text) => <div key={text} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 text-[#8b93ff]" />{text}</div>)}
              </div>
              <div className="mt-8 flex flex-wrap gap-3"><a href="#planos"><Button className="rounded-[10px] bg-[#4f56f6] hover:bg-[#454cf0]">Começar agora</Button></a><a href="#faq"><Button variant="outline" className="rounded-[10px] border-white/15 bg-transparent text-white hover:border-white/25 hover:bg-white/10 hover:text-white">Tirar dúvidas</Button></a></div>
            </div>
          </div>
        </section>

        <section id="faq" className="sales-faq sales-reveal bg-white py-24">
          <div className="mx-auto grid max-w-5xl gap-10 px-5 lg:grid-cols-[360px_1fr]">
            <div>
              <SectionKicker>Perguntas frequentes</SectionKicker>
              <h2 className="font-heading text-3xl font-semibold leading-[1.18] tracking-tight text-[#061747] lg:text-[38px]">Perguntas antes de contratar.</h2>
              <p className="mt-4 text-base leading-[1.75] text-[#667085]">O essencial sobre relatórios, limites, empresas e documentos.</p>
              <div className="mt-8 rounded-[12px] border border-[#eaecf2] bg-[#fbfcfe] p-5">
                <Headphones className="h-5 w-5 text-[#4f56f6]" />
                <strong className="mt-4 block text-sm text-[#344054]">Quer validar seu caso?</strong>
                <p className="mt-1 text-sm text-[#667085]">Confira sua cidade e escolha o plano mais adequado ao seu volume.</p>
              </div>
            </div>
            <div className="rounded-[12px] border border-[#e6e8ee] bg-white">
              {[
                ["A Nex Notas emite a partir do relatório da Shopee?", "Sim. Você importa o relatório mensal, revisa a prévia e transforma cada vendedor em uma NFS-e organizada no mesmo lote."],
                ["Consigo evitar nota duplicada?", "Sim. A prévia destaca possíveis duplicidades antes da emissão para você não pagar com retrabalho depois."],
                ["Preciso emitir uma nota para cada vendedor?", "Para a comissão extra, o novo modelo exige uma NFS-e por vendedor que pagou comissão. A Nex Notas foi criada para tirar esse volume da emissão manual."],
                ["O que acontece quando eu atinjo o limite do plano?", "Seu histórico continua disponível. Para novas emissões, basta evoluir para a próxima faixa."],
                ["Posso usar mais de uma empresa?", "Sim. Os planos Afiliado Expert e Top Afiliado permitem até 2 empresas cadastradas. Grátis, Basic e Profissional permitem 1 empresa cadastrada."],
                ["A Nex Notas substitui meu contador?", "Não. A plataforma ajuda na emissão e organização das notas. As decisões contábeis continuam com você e seu contador."],
              ].map(([q, a]) => (
                <details key={q} className="group border-b border-[#eaecf0] last:border-b-0">
                  <summary className="flex min-h-[60px] cursor-pointer list-none items-center justify-between gap-4 px-5 text-sm font-medium text-[#344054]">
                    {q}<ChevronDown className="h-4 w-4 shrink-0 text-[#788196] transition group-open:rotate-180" />
                  </summary>
                  <p className="px-5 pb-5 text-sm leading-7 text-[#667085]">{a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="sales-final sales-reveal bg-white pb-24">
          <div className="mx-auto flex min-h-[215px] max-w-5xl flex-col justify-between gap-8 overflow-hidden rounded-[16px] bg-[#4f56f6] p-8 text-white sm:p-12 lg:flex-row lg:items-center">
            <div>
              <h2 className="max-w-2xl font-heading text-[32px] font-semibold leading-[1.22] tracking-[-.028em] text-white">Pare de virar o mês preso emitindo nota por nota.</h2>
              <p className="mt-3 max-w-xl text-[15px] leading-[1.65] text-[#f1f3ff]">Suba o relatório da Shopee, confira a prévia e avance para uma emissão em lote organizada. Mais tempo para vender, menos tempo repetindo tarefa fiscal.</p>
            </div>
            <div className="flex shrink-0"><a href="#planos"><Button className="rounded-[10px] bg-white text-[#4f56f6] hover:bg-[#f7f8ff]">Escolher plano</Button></a></div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#ebedf2] bg-white py-12">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 md:grid-cols-4">
          <div><SalesBrand /><p className="mt-4 max-w-[270px] text-sm leading-7 text-[#748094]">NFS-e em lote para afiliados Shopee que querem emitir com menos retrabalho e mais controle.</p></div>
          <FooterCol title="Soluções" items={["Produto", "Recursos", "Preços"]} />
          <FooterCol title="Empresa" items={["Disponibilidade", "Como Funciona", "Calculadora de Economia", "Central de Ajuda"]} />
          <FooterCol title="Legal" items={["Termos de Uso", "Política de Privacidade", "Conformidade LGPD", "Status"]} />
        </div>
        <div className="mx-auto mt-10 flex max-w-6xl flex-wrap justify-between gap-4 border-t border-[#ebedf2] px-5 pt-5 text-xs text-[#929aaa]">
          <span>Lista de municípios habilitados consolidada pela Nex Notas.</span>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              className="font-semibold text-[#4f56f6] underline-offset-2 hover:underline"
              onClick={() => {
                setCookieDraft(cookiePreferences ?? allCookiePreferences);
                setCookieSettingsOpen(true);
              }}
            >
              Preferências de cookies
            </button>
            <span>© 2026 Nex Notas. Todos os direitos reservados.</span>
          </div>
        </div>
      </footer>

      <Dialog open={Boolean(selectedPlan)} onOpenChange={(open) => !open && setSelectedPlan(null)}>
        {selectedPlan ? (
          <DialogContent className="nex-sales-dialog max-w-2xl rounded-[14px] bg-white text-[#061747]">
            <DialogHeader>
              <DialogTitle>Contratação do {selectedPlan.name}</DialogTitle>
              <DialogDescription>Antes de contratar, confirme o porte do CNPJ e a cidade de emissão.</DialogDescription>
            </DialogHeader>
            <div className="mt-4 grid gap-5">
              <StepHeader step={step} />
              {step === 1 ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <KindCard title="Sou MEI" description="Microempreendedor Individual" detail="Emissão pode seguir pelo padrão nacional." onClick={() => { setKind("mei"); setStep(2); }} />
                  <KindCard title="Não sou MEI" description="ME, EPP ou LTDA" detail="A emissão depende da conexão com a prefeitura." onClick={() => { setKind("empresa"); setStep(2); }} />
                </div>
              ) : step === 2 && kind ? (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-[10px] border border-[#e6e9ef] bg-[#fbfcfe] p-3">
                    <div className="flex items-center gap-2 text-sm"><Building2 className="h-4 w-4 text-[#4f56f6]" />{kind === "mei" ? "MEI" : "ME, EPP ou LTDA"}</div>
                    <Button variant="ghost" size="sm" onClick={() => { setKind(null); setStep(1); }}>Trocar</Button>
                  </div>
                  <div>
                    <div className="flex items-center justify-between gap-3">
                      <label className="text-sm font-semibold" htmlFor="city-check">Município de emissão</label>
                      <button className="text-xs font-semibold text-[#4f56f6]" onClick={useDeviceLocation}>{locating ? "Localizando..." : "Usar minha localização"}</button>
                    </div>
                    {editingCity || !selectedCity ? (
                      <>
                        <div className="relative mt-2">
                          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94a3b8]" />
                          <Input id="city-check" className="pl-9" value={cityQuery} placeholder="Digite o nome da sua cidade..." onChange={(event) => { setCityQuery(event.target.value); setSelectedCity(null); }} />
                        </div>
                        <div className="mt-2 max-h-[260px] overflow-y-auto rounded-[10px] border border-[#e6e9ef] bg-white">
                          {matchingCities.length ? matchingCities.map((city) => (
                            <button key={`${city.city}-${city.uf}`} className={cn("flex w-full items-center justify-between gap-3 border-b border-[#eaecf0] px-3 py-3 text-left last:border-b-0 hover:bg-[#fbfcfe]", selectedCity?.city === city.city && selectedCity.uf === city.uf && "bg-[#f4f5ff]")} onClick={() => { setSelectedCity(city); setCityQuery(`${city.city} / ${city.uf}`); setEditingCity(false); }}>
                              <span className="min-w-0"><strong className="block truncate text-sm">{city.city}</strong><span className="text-xs font-semibold text-[#98a2b3]">{city.uf}</span></span>
                              <CoverageBadge city={city} kind={kind} />
                            </button>
                          )) : <div className="p-4 text-sm text-[#667085]">Cidade não encontrada. Você pode entrar na lista de espera.</div>}
                        </div>
                      </>
                    ) : (
                      <div className="mt-2 flex items-center justify-between rounded-[10px] border border-[#e6e9ef] bg-white px-4 py-3">
                        <strong className="text-sm">{selectedCity.city} / {selectedCity.uf}</strong>
                        <Button variant="ghost" size="sm" onClick={() => setEditingCity(true)}>Trocar</Button>
                      </div>
                    )}
                  </div>
                  {selectedCity ? <CoveragePanel kind={kind} selectedCity={selectedCity} compact /> : null}
                  <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
                    <Button variant="outline" className="gap-2" onClick={() => { setKind(null); setStep(1); }}><ChevronLeft className="h-4 w-4" />Voltar</Button>
                    <Button disabled={!selectedCity} onClick={() => setStep(3)}>Continuar</Button>
                  </div>
                </>
              ) : kind ? (
                <>
                  <div className="rounded-[10px] border border-[#e6e9ef] bg-[#fbfcfe] p-4">
                    <p className="text-sm text-[#667085]">Município confirmado</p>
                    <h4 className="mt-1 font-heading text-2xl font-semibold">{selectedCity ? `${selectedCity.city} / ${selectedCity.uf}` : "Cidade não selecionada"}</h4>
                  </div>
                  <dl className="grid gap-3 rounded-[10px] border border-[#e6e9ef] p-4 text-sm">
                    <div className="flex justify-between gap-4"><dt className="text-[#667085]">Plano</dt><dd className="font-semibold">{selectedPlan.name} - {billing === "annual" ? `${currency.format(selectedPlan.price * 10)}/ano` : `${currency.format(selectedPlan.price)}/mês`}</dd></div>
                    <div className="flex justify-between gap-4"><dt className="text-[#667085]">Periodicidade</dt><dd className="font-semibold">{billing === "annual" ? "Anual" : "Mensal"}</dd></div>
                    <div className="flex justify-between gap-4"><dt className="text-[#667085]">Porte</dt><dd className="font-semibold">{kind === "mei" ? "MEI" : "ME / Outros"}</dd></div>
                    <div className="flex justify-between gap-4"><dt className="text-[#667085]">Município</dt><dd className="font-semibold">{selectedCity ? `${selectedCity.city} / ${selectedCity.uf}` : "-"}</dd></div>
                  </dl>
                  <p className="text-sm leading-6 text-[#667085]">Ao continuar, você segue para finalizar a assinatura com segurança.</p>
                  <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
                    <Button variant="outline" className="gap-2" onClick={() => setStep(2)}><ChevronLeft className="h-4 w-4" />Voltar</Button>
                    <CheckoutAction plan={selectedPlan} kind={kind} city={selectedCity} billing={billing} onLaunchNotice={() => setLaunchNotice(true)} />
                  </div>
                </>
              ) : null}
            </div>
          </DialogContent>
        ) : null}
      </Dialog>

      <Dialog open={launchNotice} onOpenChange={setLaunchNotice}>
        <DialogContent className="nex-sales-dialog max-w-md rounded-[14px] bg-white text-[#061747]">
          <DialogHeader>
            <DialogTitle>Estamos preparando seu acesso</DialogTitle>
            <DialogDescription>Em breve será possível criar sua conta e usar a Nex Notas diretamente pelo sistema.</DialogDescription>
          </DialogHeader>
          <div className="mt-5 rounded-[12px] border border-[#dfe3ff] bg-[#f7f8ff] p-4">
            <strong className="block text-sm text-[#061747]">Entre no grupo de lançamento oficial da Nex Notas.</strong>
            <p className="mt-1 text-sm leading-6 text-[#667085]">Lançaremos com desconto especial para quem estiver no grupo. Assim que a contratação for liberada, você recebe o aviso em primeira mão.</p>
          </div>
          <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" className="rounded-[10px] border-[#dfe3ff] text-[#344054] hover:bg-[#f7f8ff]" onClick={() => setLaunchNotice(false)}>Entendi</Button>
            <a href="https://nexnotas.com.br/comunidade" target="_blank" rel="noreferrer">
              <Button className="w-full rounded-[10px] bg-[#4f56f6] hover:bg-[#454cf0] sm:w-auto">Entrar no grupo</Button>
            </a>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={cookieSettingsOpen} onOpenChange={setCookieSettingsOpen}>
        <DialogContent className="nex-sales-dialog max-w-2xl rounded-[16px] bg-[#080d26] p-6 text-white shadow-[0_30px_90px_rgba(6,12,38,.38)]">
          <DialogHeader>
            <DialogTitle className="text-2xl text-white">Configurações de cookies</DialogTitle>
            <DialogDescription className="text-[#b7c0db]">Gerencie suas preferências. Suas escolhas serão salvas por 12 meses.</DialogDescription>
          </DialogHeader>
          <div className="mt-6 grid gap-5">
            <div className="rounded-[14px] border border-white/10 bg-white/[.04] p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] bg-[#eafef3] text-[#118a51]"><ShieldCheck className="h-5 w-5" /></span>
                  <div>
                    <strong className="text-base text-white">Cookies essenciais</strong>
                    <p className="mt-1 max-w-xl text-sm leading-6 text-[#c2cadf]">Necessários para funcionamento, segurança, navegação e preferências básicas do site.</p>
                    <p className="mt-3 rounded-[10px] bg-white/10 px-3 py-2 text-xs leading-5 text-[#cbd3e7]">Exemplos: sessão, segurança, preferências de idioma e proteção contra abuso.</p>
                  </div>
                </div>
                <span className="shrink-0 rounded-full border border-[#78e1ae]/30 bg-[#0e3b2b] px-3 py-1 text-xs font-semibold text-[#9ff0c5]">Sempre ativo</span>
              </div>
            </div>

            <CookiePreferenceRow
              icon={BarChart3}
              title="Cookies analíticos"
              description="Ajudam a entender como as pessoas usam a página para melhorarmos conteúdo, navegação e conversão."
              details="Tecnologias: Google Analytics e PostHog. Dados: páginas visitadas, eventos, tempo de navegação, dispositivo e navegador."
              checked={cookieDraft.analytics}
              onChange={(analytics) => setCookieDraft((current) => ({ ...current, analytics }))}
            />
            <CookiePreferenceRow
              icon={Gauge}
              title="Cookies de experiência"
              description="Ajudam a identificar travamentos, cliques e pontos de fricção para melhorar a experiência da página."
              details="Tecnologia: Microsoft Clarity. Dados: interações, mapas de calor e gravações de sessão sem campos sensíveis."
              checked={cookieDraft.experience}
              onChange={(experience) => setCookieDraft((current) => ({ ...current, experience }))}
            />
            <CookiePreferenceRow
              icon={BadgeCheck}
              title="Cookies de marketing"
              description="Permitem medir campanhas, otimizar anúncios e entender quais canais geram contratação."
              details="Tecnologias: Meta Pixel, Google Ads e, futuramente, TikTok Pixel. Finalidade: conversões, remarketing e otimização de mídia."
              checked={cookieDraft.marketing}
              onChange={(marketing) => setCookieDraft((current) => ({ ...current, marketing }))}
            />

            <div className="rounded-[14px] bg-white/[.06] p-4 text-sm leading-6 text-[#c2cadf]">
              Você pode alterar suas preferências a qualquer momento no rodapé da página. Dados sensíveis não devem ser enviados para ferramentas de análise e marketing.
            </div>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_1fr]">
            <Button className="rounded-[10px] bg-[#4f56f6] text-white hover:bg-[#454cf0]" onClick={() => updateCookiePreferences(allCookiePreferences)}>Aceitar todos</Button>
            <Button variant="outline" className="rounded-[10px] border-white/20 bg-transparent text-white hover:border-white/35 hover:bg-white/10 hover:text-white" onClick={() => updateCookiePreferences(cookieDraft)}>Salvar preferências</Button>
          </div>
        </DialogContent>
      </Dialog>

      {cookiePreferences === null && !cookieSettingsOpen ? (
        <div className="fixed inset-0 z-40 bg-[#061747]/35 backdrop-blur-[2px]">
          <div className="fixed bottom-5 left-1/2 w-[calc(100%-24px)] max-w-3xl -translate-x-1/2 rounded-[18px] border border-white/40 bg-white/90 p-5 text-center shadow-[0_28px_80px_rgba(6,23,71,.24)] backdrop-blur-xl sm:p-6">
            <strong className="inline-flex items-center justify-center gap-2 font-heading text-xl font-semibold text-[#061747]">
              <span className="text-[18px] leading-none" aria-hidden="true">🍪</span>
              Política de cookies
            </strong>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-[#667085]">Usamos cookies para melhorar sua experiência, analisar tráfego e personalizar conteúdo.</p>
            <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-[#667085]">
              Ao continuar usando o Nex Notas, você concorda com nossa{" "}
              <a className="font-semibold text-[#4f56f6] underline-offset-2 hover:underline" href="/privacidade">Política de Privacidade</a>{" "}
              e nossos{" "}
              <a className="font-semibold text-[#4f56f6] underline-offset-2 hover:underline" href="/termos">Termos de Uso</a>.
            </p>
            <div className="mt-5 flex justify-center">
              <Button className="min-w-[170px] rounded-[10px] bg-[#4f56f6] text-white hover:bg-[#454cf0]" onClick={() => updateCookiePreferences(allCookiePreferences)}>Aceitar todos</Button>
            </div>
            <p className="mt-4 text-[11px] leading-5 text-[#7c879a]">
              Você pode alterar suas preferências em{" "}
              <button
                type="button"
                className="font-semibold text-[#4f56f6] underline underline-offset-2 hover:text-[#454cf0]"
                onClick={() => {
                  setCookieDraft(allCookiePreferences);
                  setCookieSettingsOpen(true);
                }}
              >
                Personalizar
              </button>
              .
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function SalesBrand() {
  return (
    <span className="block w-[150px]">
      <img src="/logo-text-roxo.png" alt="Nex Notas" className="block h-auto w-full" />
    </span>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex h-[30px] items-center rounded-full border border-[#e5e7fb] bg-[#f7f8ff] px-3 text-[11.5px] font-semibold text-[#5159e8]"><span className="mr-2 h-1.5 w-1.5 rounded-full bg-[#4f56f6]" />{children}</span>;
}

function SectionKicker({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  return <p className={cn("mb-3 text-[11px] font-semibold uppercase tracking-[.07em]", dark ? "text-[#aeb6ff]" : "text-[#5961e9]")}>{children}</p>;
}

function SectionHeading({ kicker, title, text, center = false }: { kicker: string; title: string; text: string; center?: boolean }) {
  return (
    <div className={cn("mx-auto max-w-3xl px-5", center && "text-center")}>
      <SectionKicker>{kicker}</SectionKicker>
      <h2 className="font-heading text-3xl font-semibold leading-[1.18] tracking-tight text-[#061747] lg:text-[38px]">{title}</h2>
      <p className="mt-4 text-base leading-[1.75] text-[#667085]">{text}</p>
    </div>
  );
}

function CookiePreferenceRow({
  icon: Icon,
  title,
  description,
  details,
  checked,
  onChange,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  details: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="rounded-[14px] border border-white/10 bg-white/[.04] p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] bg-[#eef0ff] text-[#4f56f6]"><Icon className="h-5 w-5" /></span>
          <div className="min-w-0">
            <strong className="text-base text-white">{title}</strong>
            <p className="mt-1 max-w-xl text-sm leading-6 text-[#c2cadf]">{description}</p>
            <p className="mt-3 rounded-[10px] bg-white/10 px-3 py-2 text-xs leading-5 text-[#cbd3e7]">{details}</p>
          </div>
        </div>
        <button
          type="button"
          aria-pressed={checked}
          aria-label={`${checked ? "Desativar" : "Ativar"} ${title}`}
          className={cn(
            "relative mt-1 h-7 w-12 shrink-0 rounded-full border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#aeb6ff]",
            checked ? "border-[#6f75ff] bg-[#4f56f6]" : "border-white/15 bg-white/10",
          )}
          onClick={() => onChange(!checked)}
        >
          <span className={cn("absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition", checked ? "left-6" : "left-1")} />
        </button>
      </div>
    </div>
  );
}

function useAnimatedValue(target: number, duration = 1100) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let frame = 0;
    const start = performance.now();
    const tick = (time: number) => {
      const progress = Math.min((time - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(target * eased);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  return value;
}

function AnimatedValue({ value, format = (next: number) => number.format(Math.round(next)) }: { value: number; format?: (next: number) => string }) {
  return <>{format(useAnimatedValue(value))}</>;
}

function ProductWindow() {
  return (
    <div className="sales-product-window dashboard-preview mt-7 overflow-hidden rounded-[24px] border border-[#dfe4ef] bg-white shadow-[0_24px_70px_rgba(6,23,71,.12)]">
      <div className="grid h-full grid-cols-[172px_1fr] bg-white">
        <aside className="flex min-h-0 flex-col border-r border-[#edf0f5] bg-[#f8f9fd] p-4 text-left">
          <img src="/logo-text-roxo.svg" alt="" className="mb-5 h-7 w-[132px]" />
          <div className="space-y-1.5">
            {[
              [Gauge, "Início", true],
              [FileSpreadsheet, "Notas", false],
              [UploadCloud, "Nova emissão", false],
            ].map(([Icon, label, active]) => {
              const MenuIcon = Icon as LucideIcon;
              return (
                <div key={label as string} className={cn("flex items-center gap-2 rounded-[10px] px-3 py-2.5 text-[12px] font-semibold", active ? "bg-[#eef0ff] text-[#061747]" : "text-[#667085]")}>
                  <MenuIcon className="h-4 w-4" />
                  <span>{label as string}</span>
                </div>
              );
            })}
          </div>
          <span className="mt-7 px-3 text-[10px] font-semibold text-[#7a8496]">Configurações</span>
          <div className="mt-2 space-y-1.5">
            {[
              [Building2, "Empresa"],
              [ShieldCheck, "Conta"],
              [LockKeyhole, "Admin"],
            ].map(([Icon, label]) => {
              const MenuIcon = Icon as LucideIcon;
              return (
                <div key={label as string} className="flex items-center gap-2 rounded-[10px] px-3 py-2.5 text-[12px] font-medium text-[#667085]">
                  <MenuIcon className="h-4 w-4" />
                  <span>{label as string}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-auto flex items-center gap-2 border-t border-[#e7eaf1] pt-4">
            <div className="grid h-8 w-8 place-items-center rounded-[10px] border border-[#dde2ec] bg-white text-[10px] font-bold text-[#4f56f6]">SE</div>
            <div className="min-w-0">
              <strong className="block truncate text-[11px] text-[#172650]">Sua Empresa Ltda.</strong>
              <span className="block truncate text-[10px] text-[#7a8496]">12.345.678/0001-90</span>
            </div>
          </div>
        </aside>
        <div className="min-w-0 overflow-hidden bg-white px-10 py-8">
          <div className="mx-auto max-w-[880px]">
            <div className="mb-5 flex justify-end gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-[10px] border border-[#e7eaf1] bg-white text-[#061747] shadow-[0_10px_28px_rgba(6,23,71,.04)]"><Sun className="h-4 w-4" /></span>
              <span className="grid h-9 w-9 place-items-center rounded-[10px] bg-white text-[#061747]"><Bell className="h-4 w-4" /></span>
              <div className="flex shrink-0 items-center gap-2 rounded-full border border-[#e7eaf1] bg-white px-3 py-2 shadow-[0_10px_28px_rgba(6,23,71,.04)]">
                <div className="grid h-8 w-8 place-items-center rounded-full bg-[#eef0ff] text-[11px] font-bold text-[#4f56f6]">SU</div>
                <div className="hidden text-left sm:block">
                  <strong className="block max-w-[130px] truncate text-xs text-[#172650]">Seu Usuário</strong>
                  <span className="block max-w-[130px] truncate text-[10px] text-[#7a8496]">usuario@suaempresa.com</span>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-[#7a8496]" />
              </div>
            </div>

            <div className="flex items-end justify-between gap-4">
              <div className="min-w-0 text-left">
                <h3 className="font-heading text-[28px] font-semibold leading-tight text-[#061747]">Dashboard</h3>
                <p className="mt-1 max-w-[620px] text-[13px] leading-5 text-[#6d7789]">Visão geral da operação fiscal de Sua Empresa Ltda.</p>
              </div>
              <div className="hidden gap-2 md:flex">
                <span className="rounded-[10px] bg-[#4f56f6] px-4 py-2 text-xs font-bold text-white">+ Nova avulsa</span>
                <span className="rounded-[10px] border border-[#dde2ec] px-4 py-2 text-xs font-bold text-[#172650]">Novo CSV Shopee</span>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
              <div className="text-left">
                <span className="mb-1 block text-[12px] font-semibold text-[#061747]">Competência</span>
                <div className="min-w-[150px] rounded-[10px] border border-[#dde2ec] bg-white px-3 py-2">
                  <strong className="text-xs text-[#172650]">Este ano</strong>
                  <ChevronDown className="ml-8 inline h-3.5 w-3.5 text-[#7a8496]" />
                </div>
              </div>
              <div className="flex gap-2 md:hidden">
                <span className="rounded-[10px] bg-[#4f56f6] px-4 py-2 text-xs font-bold text-white">Nova avulsa</span>
                <span className="rounded-[10px] border border-[#dde2ec] px-4 py-2 text-xs font-bold text-[#172650]">Novo CSV Shopee</span>
              </div>
            </div>

            <div className="dashboard-kpis mt-5 grid grid-cols-4 gap-3">
              <DashboardKpi label="Notas emitidas" value={20788} meta="Total no período selecionado" icon={FileCheck2} />
              <DashboardKpi label="Valor processado" value={84533803.75} meta="36.854 registros importados" money icon={BadgeCheck} />
              <DashboardKpi label="Pendentes" value={0} meta="Precisam de revisão" icon={Clock3} />
              <DashboardKpi label="Falhas" value={0} meta="Disponíveis para reprocessar" icon={ShieldCheck} />
            </div>

            <div className="mt-5 rounded-[14px] border border-[#e2e6ef] bg-white p-4 text-left">
              <div className="mb-2">
                <strong className="block text-sm text-[#172650]">Emissões por competência</strong>
                <span className="text-xs text-[#7a8496]">Este ano</span>
              </div>
              <svg className="dashboard-chart h-[160px] w-full" viewBox="0 0 820 220" role="img" aria-label="Gráfico de emissões por competência">
                <defs>
                  <linearGradient id="dashboardFill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#4f56f6" stopOpacity=".18" />
                    <stop offset="100%" stopColor="#4f56f6" stopOpacity=".02" />
                  </linearGradient>
                </defs>
                {[22, 65, 108, 151, 194].map((y) => <line key={y} x1="0" x2="820" y1={y} y2={y} stroke="#edf0f5" />)}
                <path d="M0 198 L115 198 C150 198 175 196 205 188 C240 178 275 160 325 166 C372 172 410 192 462 190 C520 188 555 186 615 178 C662 171 697 172 730 171 C764 170 780 126 796 78 C808 43 815 24 820 22 L820 198 L0 198 Z" fill="url(#dashboardFill)" />
                <path className="dashboard-chart-line" d="M0 198 L115 198 C150 198 175 196 205 188 C240 178 275 160 325 166 C372 172 410 192 462 190 C520 188 555 186 615 178 C662 171 697 172 730 171 C764 170 780 126 796 78 C808 43 815 24 820 22" fill="none" stroke="#4f56f6" strokeLinecap="round" strokeWidth="3" />
                {[0, 115, 325, 462, 615, 730, 820].map((x, index) => <circle key={x} className="dashboard-chart-dot" cx={x} cy={[198, 198, 166, 190, 178, 171, 22][index]} r="3.8" fill="#fff" stroke="#4f56f6" strokeWidth="2" />)}
              </svg>
            </div>

            <div className="mt-5 overflow-hidden rounded-[14px] border border-[#e2e6ef] bg-white text-left">
              <div className="px-4 py-3">
                <strong className="block text-sm text-[#172650]">Últimas emissões</strong>
                <span className="text-xs text-[#7a8496]">Documentos mais recentes deste ano</span>
              </div>
              <div className="dashboard-table-head grid grid-cols-[1.35fr_1fr_.55fr_.65fr_.75fr_auto] bg-[#f7f8fb] px-4 py-2 text-[9px] font-bold uppercase tracking-[.08em] text-[#7a8496]">
                <span>Vendedor</span><span className="dashboard-company-col">Empresa</span><span>Valor</span><span>NFS-e</span><span>Emissão</span><span>Status</span>
              </div>
              {[
                ["Loja Aurora Digital", "Sua Empresa Ltda.", "R$ 57,75", "26273", "23/08/2026", "Emitida"],
                ["Casa Rio Afiliados", "Sua Empresa Ltda.", "R$ 56,46", "26272", "21/08/2026", "Emitida"],
                ["Bella Online EPP", "Sua Empresa Ltda.", "R$ 9.770,81", "26266", "21/08/2026", "Emitida"],
              ].map(([seller, company, amount, nfse, date, status], index) => (
                <div key={seller} className="dashboard-row grid grid-cols-[1.35fr_1fr_.55fr_.65fr_.75fr_auto] items-center border-t border-[#eef1f6] px-4 py-2.5 text-[11px]" style={{ animationDelay: `${0.42 + index * 0.16}s` }}>
                  <strong className="truncate text-[#172650]">{seller}</strong>
                  <span className="dashboard-company-col truncate text-[#7a8496]">{company}</span>
                  <span className="text-[#172650]">{amount}</span>
                  <span className="text-[#172650]">{nfse}</span>
                  <span className="text-[#172650]">{date}</span>
                  <span className={cn("dashboard-status rounded-full px-2 py-1 text-[10px] font-bold", status === "Emitida" ? "bg-[#ecfdf3] text-[#16803c]" : "bg-[#f4f5ff] text-[#4f56f6]")}>{status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardKpi({ label, value, meta, money = false, icon: Icon = FileSpreadsheet }: { label: string; value: number; meta: string; money?: boolean; icon?: LucideIcon }) {
  return (
    <div className="dashboard-kpi rounded-[14px] border border-[#e2e6ef] bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <span className="block text-[10px] font-bold text-[#061747]">{label}</span>
        <span className="grid h-8 w-8 place-items-center rounded-full border border-[#dde2ec] bg-[#f7f8fb] text-[#667085]"><Icon className="h-4 w-4" /></span>
      </div>
      <strong className={cn("mt-6 block font-heading font-semibold leading-tight text-[#061747]", money ? "text-[22px]" : "text-[24px]")}>
        <AnimatedValue value={value} format={(next) => money ? `R$ ${(next / 1000000).toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} mi` : number.format(Math.round(next))} />
      </strong>
      <span className="mt-2 block text-[10px] text-[#7a8496]">{meta}</span>
    </div>
  );
}

function SimMeta({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return <div><span className="block text-[9px] font-bold uppercase tracking-[.08em] text-[#8a94a6]">{label}</span><strong className={cn("mt-1 block truncate font-mono text-[11px]", accent ? "text-[#4f56f6]" : "text-[#061747]")}>{value}</strong></div>;
}

function SimStat({ label, value, text, highlight = false, compactValue = false }: { label: string; value: string; text: string; highlight?: boolean; compactValue?: boolean }) {
  return (
    <div className={cn("min-w-0 rounded-[14px] border p-4", highlight ? "border-[#baf3d3] bg-[#ecfdf3]" : "border-[#e5e8f0] bg-[#fbfcfe]")}>
      <span className={cn("text-[10px] font-bold uppercase tracking-[.08em]", highlight ? "text-[#16803c]" : "text-[#667085]")}>{label}</span>
      <strong className={cn("mt-2 block min-w-0 font-heading font-semibold text-[#061747]", compactValue ? "break-words text-[clamp(1rem,2.1vw,1.25rem)] leading-tight" : "text-xl")}>{value}</strong>
      <p className="mt-2 text-xs leading-5 text-[#667085]">{text}</p>
    </div>
  );
}

function TrustItem({ icon: Icon, title, text }: { icon: LucideIcon; title: string; text: string }) {
  return <div className="flex gap-3 border-b border-[#eaecf1] p-5 last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0"><Icon className="mt-0.5 h-5 w-5 shrink-0 text-[#4f56f6]" /><div><strong className="block text-sm font-semibold text-[#344054]">{title}</strong><span className="text-xs text-[#7a8496]">{text}</span></div></div>;
}

function Pain({ n, title, text }: { n: string; title: string; text: string }) {
  return <div className="flex gap-3 border-b border-[#e9ebf0] py-4 last:border-b-0"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-[8px] border border-[#e5e8f0] bg-white text-xs font-semibold text-[#4f56f6]">{n}</span><div><strong className="text-[15px] font-semibold text-[#344054]">{title}</strong><p className="mt-1 text-sm leading-6 text-[#727c90]">{text}</p></div></div>;
}

function StepCard({ icon: Icon, n, title, text }: { icon: LucideIcon; n: string; title: string; text: string }) {
  return <div className="relative rounded-[14px] border border-[#eaecf2] bg-white p-8 text-center shadow-[0_10px_28px_rgba(6,23,71,.035)]"><span className="mx-auto grid h-8 w-8 place-items-center rounded-full bg-[#4f56f6] text-sm font-semibold text-white">{n}</span><Icon className="mx-auto mt-6 h-7 w-7 text-[#4f56f6]" /><h3 className="mt-5 font-heading text-lg font-semibold text-[#061747]">{title}</h3><p className="mt-3 text-sm leading-6 text-[#667085]">{text}</p></div>;
}

function FeatureSpot() {
  return <div className="rounded-[14px] border border-[#111827] bg-[#070917] p-7 text-white shadow-[0_18px_50px_rgba(6,23,71,.08)] lg:row-span-2"><span className="rounded-full bg-[#4f56f6]/20 px-3 py-1 text-[11px] font-semibold text-[#aeb6ff]">Importação Shopee</span><h3 className="mt-7 font-heading text-2xl font-semibold text-white">Escolha um lote e veja tudo pronto para emissão</h3><p className="mt-3 max-w-xl text-sm leading-7 text-white/70">A Nex Notas transforma o arquivo em uma lista clara: notas prontas, possíveis duplicidades e pontos de atenção antes de emitir.</p><div className="mt-8 rounded-[12px] border border-white/10 bg-white/5 p-4"><div className="mb-3 flex justify-between text-xs"><span>relatorio_shopee_agosto_2026.csv</span><span className="text-[#86efac]">pronto</span></div><div className="h-2 rounded-full bg-white/10"><span className="block h-full w-[82%] rounded-full bg-[#4f56f6]" /></div></div></div>;
}

function FeatureMini({ icon: Icon, title, text }: { icon: LucideIcon; title: string; text: string }) {
  return <div className="rounded-[14px] border border-[#eaecf2] bg-white p-6"><Icon className="h-6 w-6 text-[#4f56f6]" /><h3 className="mt-5 font-heading text-lg font-semibold text-[#061747]">{title}</h3><p className="mt-2 text-sm leading-6 text-[#667085]">{text}</p></div>;
}

function PlanCard({ plan, billing, onChoose }: { plan: Plan; billing: Billing; onChoose: () => void }) {
  const isFree = plan.price === 0;
  const rows = planFeatureRows(plan);
  return (
    <article className={cn("relative flex min-h-[660px] w-[248px] flex-col rounded-[18px] border bg-white p-6 transition-shadow hover:shadow-[0_18px_44px_rgba(6,23,71,.075)]", plan.featured ? "border-[#4f56f6] shadow-[0_18px_44px_rgba(79,86,246,.12)]" : "border-[#eaecf2]")}>
      {plan.featured ? <span className="absolute -top-3 left-4 rounded-full bg-[#4f56f6] px-3 py-1 text-[10px] font-semibold text-white">Melhor escolha</span> : null}
      <h3 className="font-heading text-[16.5px] font-semibold text-[#1c2a4a]">{plan.name}</h3>
      <p className="mt-2 min-h-12 text-[13px] leading-5 text-[#7a8496]">{plan.description}</p>
      <div className="mt-5 whitespace-nowrap font-heading text-[34px] font-semibold tracking-[-.04em] text-[#14234a]">
        R$ {isFree ? "0" : formatPlanPrice(plan, billing)} <span className="font-sans text-[12px] font-medium tracking-normal text-[#717c8f]">/{isFree ? "mês" : billing === "annual" ? "ano" : "mês"}</span>
      </div>
      <p className="mt-1 min-h-10 text-[11.5px] leading-5 text-[#8b94a4]">
        {billing === "annual" ? (isFree ? "sem cobrança e sem cartão" : `equivale a R$ ${formatAnnualEquivalent(plan)}/mês`) : (isFree ? "para começar sem cartão" : "cobrança mensal")}
      </p>
      <ul className="mt-6 grid flex-1 border-y border-[#eaecf2]">
        {rows.map((row) => <PlanFeatureRow key={row.label} {...row} />)}
      </ul>
      <Button variant={plan.featured ? "default" : "outline"} className={cn("mt-6 w-full rounded-[10px]", plan.featured ? "bg-[#4f56f6] hover:bg-[#454cf0]" : "border-[#e3e6ed] bg-white text-[#344054] hover:bg-[#f7f8fc]")} onClick={onChoose}>{isFree ? "Começar grátis" : "Começar agora"}</Button>
    </article>
  );
}

type PlanFeatureRowProps = {
  label: string;
  value?: string;
  available: boolean;
};

function planFeatureRows(plan: Plan): PlanFeatureRowProps[] {
  const paid = plan.price > 0;
  return [
    { label: "Notas por mês", value: plan.unlimitedInvoices ? "Ilimitadas" : number.format(plan.invoices), available: true },
    { label: "Empresas cadastradas", value: number.format(plan.companies), available: true },
    { label: "Notas avulsas e lotes Shopee", available: true },
    { label: "XML e DANFSe", available: true },
    { label: "Envio por e-mail por vendedor", available: paid },
    { label: "Emissão em lote", available: true },
    { label: "Suporte via WhatsApp", available: true },
  ];
}

function PlanFeatureRow({ label, value, available }: PlanFeatureRowProps) {
  const Icon = available ? Check : XCircle;
  return (
    <li className="grid min-h-12 grid-cols-[20px_minmax(0,1fr)_auto] items-center gap-3 border-b border-[#eaecf2] py-3 last:border-b-0">
      <span className={cn("grid h-5 w-5 place-items-center rounded-full", available ? "text-[#16a34a]" : "text-[#8a94a8]")}>
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0 text-[12.5px] leading-5 text-[#263454]">{label}</span>
      {value ? <strong className="max-w-[92px] text-right text-[12px] font-semibold leading-5 text-[#14234a]">{value}</strong> : null}
    </li>
  );
}

function Reco({ label, value }: { label: string; value: string }) {
  return <div className="rounded-[9px] border border-[#eaecf2] bg-white p-3"><span className="block text-[10px] text-[#8a92a4]">{label}</span><strong className="text-xs text-[#344054]">{value}</strong></div>;
}

const footerLinks: Record<string, string> = {
  Produto: "/#produto",
  Recursos: "/#beneficios",
  Preços: "/#planos",
  "Como funciona": "/#como-funciona",
  "Como Funciona": "/#produto",
  "Calculadora de Economia": "/#simulador",
  "Central de Ajuda": "/ajuda",
  FAQ: "/#faq",
  Ajuda: "/ajuda",
  Disponibilidade: "/#cobertura",
  "Termos de Uso": "/termos",
  "Política de Privacidade": "/privacidade",
  "Conformidade LGPD": "/lgpd",
  Status: "https://status.nexnotas.com.br",
};

function FooterCol({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h4 className="mb-4 text-xs font-semibold text-[#475467]">{title}</h4>
      <div className="grid gap-2 text-sm text-[#737d8f]">
        {items.map((item) => {
          const href = footerLinks[item];
          if (!href) return null;
          const external = href.startsWith("http");
          return (
            <a key={item} href={href} className="hover:text-[#4f56f6]" target={external ? "_blank" : undefined} rel={external ? "noreferrer" : undefined}>
              {item}
            </a>
          );
        })}
      </div>
    </div>
  );
}

function StepHeader({ step }: { step: 1 | 2 | 3 }) {
  return <div className="grid grid-cols-3 gap-2 text-xs font-bold">{["Porte", "Município", "Pagamento"].map((label, index) => <div key={label} className={cn("rounded-full border px-3 py-2 text-center", index + 1 <= step ? "border-[#4f56f6] bg-[#f4f5ff] text-[#4f56f6]" : "border-[#e6e9ef] text-[#667085]")}>{String(index + 1).padStart(2, "0")} {label}</div>)}</div>;
}

function KindCard({ title, description, detail, onClick }: { title: string; description: string; detail: string; onClick: () => void }) {
  return <button className="rounded-[10px] border border-[#e6e9ef] p-5 text-left transition hover:border-[#4f56f6] hover:bg-[#f7f8ff]" onClick={onClick}><Building2 className="h-5 w-5 text-[#4f56f6]" /><strong className="mt-4 block font-heading text-lg">{title}</strong><span className="mt-1 block text-sm font-semibold text-[#344054]">{description}</span><span className="mt-2 block text-sm leading-6 text-[#667085]">{detail}</span><span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[#4f56f6]">Selecionar <ArrowRight className="h-4 w-4" /></span></button>;
}

function cityIsAvailable(city: CityCoverage | null, kind: CompanyKind) {
  if (!city) return false;
  if (kind === "mei") return true;
  return city.status === "available";
}

function cityMessage(city: CityCoverage | null, kind: CompanyKind) {
  if (!city) return "Digite e selecione o município para continuar.";
  if (kind === "mei") return "Para MEI, a emissão pode seguir pelo padrão nacional.";
  return city.note;
}

function CoverageBadge({ city, kind }: { city: CityCoverage; kind: CompanyKind }) {
  const available = cityIsAvailable(city, kind);
  if (available) return <span className="rounded-full bg-[#ecfdf3] px-2 py-1 text-[11px] font-bold text-[#16803c]">Atendido</span>;
  if (city.status === "mei_only") return <span className="rounded-full bg-[#f4f5ff] px-2 py-1 text-[11px] font-bold text-[#4f56f6]">Somente MEI</span>;
  return <span className="rounded-full bg-[#f1f5f9] px-2 py-1 text-[11px] font-bold text-[#526073]">Lista de espera</span>;
}

function CoveragePanel({ kind, selectedCity, compact, dark = false }: { kind: CompanyKind; selectedCity: CityCoverage | null; compact: boolean; dark?: boolean }) {
  const available = cityIsAvailable(selectedCity, kind);
  const Icon = available ? BadgeCheck : XCircle;
  return (
    <div className={cn("rounded-[12px] border shadow-[0_10px_28px_rgba(6,23,71,.035)]", compact ? "p-4" : "p-5", dark ? "border-white/10 bg-white/[.06] text-white shadow-none" : "border-[#eaecf2] bg-white text-[#061747]")}>
      <div className="flex items-start gap-3">
        <div className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-[10px]", available ? "bg-[#ecfdf3] text-[#16803c]" : "bg-[#f4f5ff] text-[#4f56f6]")}><Icon className="h-5 w-5" /></div>
        <div>
          <p className={cn("text-xs font-bold uppercase tracking-[0.12em]", dark ? "text-white/55" : "text-[#667085]")}>{available ? "Disponível" : "Indisponível agora"}</p>
          <h3 className={cn("mt-1 font-heading text-xl font-semibold", dark ? "text-white" : "text-[#061747]")}>{selectedCity ? `${selectedCity.city} / ${selectedCity.uf}` : "Selecione uma cidade"}</h3>
          <p className={cn("mt-2 text-sm leading-6", dark ? "text-white/70" : "text-[#667085]")}>{cityMessage(selectedCity, kind)}</p>
        </div>
      </div>
    </div>
  );
}

function CoverageStep({ icon: Icon, title, text }: { icon: LucideIcon; title: string; text: string }) {
  return (
    <div className="rounded-[14px] border border-white/10 bg-white/[.045] p-4">
      <Icon className="h-5 w-5 text-[#aeb6ff]" />
      <strong className="mt-3 block text-sm font-semibold text-white">{title}</strong>
      <span className="mt-1 block text-xs text-white/55">{text}</span>
    </div>
  );
}

function CheckoutAction({ plan, kind, city, billing, onLaunchNotice }: { plan: Plan; kind: CompanyKind; city: CityCoverage | null; billing: Billing; onLaunchNotice: () => void }) {
  const [joinedWaitlist, setJoinedWaitlist] = useState(false);
  const available = cityIsAvailable(city, kind);
  const checkoutUrl = checkoutUrlFor(plan, billing);
  if (!city) return <Button disabled>Selecione uma cidade</Button>;
  if (!available) {
    if (joinedWaitlist) {
      return (
        <div className="rounded-[10px] border border-[#cdd2ff] bg-[#f4f5ff] px-4 py-3 text-right">
          <strong className="block text-sm text-[#061747]">Cidade registrada na lista de espera.</strong>
          <span className="mt-1 block text-xs text-[#667085]">Vamos priorizar {city.city} / {city.uf} na expansão.</span>
        </div>
      );
    }
    return (
      <Button
        variant="outline"
        className="gap-2"
        onClick={() => {
          const lead = {
            plan: plan.name,
            kind,
            city: city.city,
            uf: city.uf,
            createdAt: new Date().toISOString(),
          };
          const current = JSON.parse(localStorage.getItem("nexnotas_waitlist") || "[]");
          localStorage.setItem("nexnotas_waitlist", JSON.stringify([...current, lead]));
          setJoinedWaitlist(true);
        }}
      >
        Entrar na lista de espera <ArrowRight className="h-4 w-4" />
      </Button>
    );
  }
  return (
    <Button
      className="gap-2"
      onClick={() => {
        if (checkoutUrl) {
          window.location.href = checkoutUrl;
          return;
        }
        onLaunchNotice();
      }}
    >
      {plan.price === 0 ? "Criar conta" : "Ir para o pagamento"} <ArrowRight className="h-4 w-4" />
    </Button>
  );
}
