import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Building2,
  CalendarDays,
  Check,
  ChevronDown,
  CircleCheck,
  FileCheck2,
  Landmark,
  LoaderCircle,
  MapPin,
  RefreshCw,
  Search,
  ShieldCheck,
  Store,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { openCookiePreferences } from "../components/cookie-consent";

type Regime = "geral" | "mei";

type Municipality = {
  codigoIbge: string;
  nome: string;
  uf: string;
  meiDisponivel: boolean;
  regimeGeralDisponivel: boolean;
  inscricaoMunicipal: {
    mei: string;
    regimeGeral: string;
  };
  nfseNacional: {
    ambienteNacional: boolean;
    emissorNacional: boolean;
    man: boolean;
  };
  operacoesDisponiveis: string[];
};

type CoverageResponse = {
  meta: {
    atualizadoEm: string;
    dataReferenciaNacional: string;
    totalMunicipios: number;
    totalAtendidos: number;
    totalMeiDisponivel: number;
    totalRegimeGeralDisponivel: number;
    fonteNacional: string;
  };
  municipios: Municipality[];
};

const stateNames: Record<string, string> = {
  AC: "Acre", AL: "Alagoas", AP: "Amapá", AM: "Amazonas", BA: "Bahia", CE: "Ceará",
  DF: "Distrito Federal", ES: "Espírito Santo", GO: "Goiás", MA: "Maranhão", MT: "Mato Grosso",
  MS: "Mato Grosso do Sul", MG: "Minas Gerais", PA: "Pará", PB: "Paraíba", PR: "Paraná",
  PE: "Pernambuco", PI: "Piauí", RJ: "Rio de Janeiro", RN: "Rio Grande do Norte",
  RS: "Rio Grande do Sul", RO: "Rondônia", RR: "Roraima", SC: "Santa Catarina",
  SP: "São Paulo", SE: "Sergipe", TO: "Tocantins",
};

const collator = new Intl.Collator("pt-BR", { sensitivity: "base" });
const numberFormatter = new Intl.NumberFormat("pt-BR");
const apiUrl = ["localhost", "127.0.0.1"].includes(window.location.hostname)
  ? "https://app.nexnotas.com.br/api/v1/referencias/municipios-atendidos?limite=6000"
  : "/api/municipios-atendidos";

function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function isAvailable(municipality: Municipality, regime: Regime) {
  return regime === "mei" ? municipality.meiDisponivel : municipality.regimeGeralDisponivel;
}

function formatReferenceDate(value?: string) {
  if (!value) return "—";
  const [year, month, day] = value.slice(0, 10).split("-").map(Number);
  return new Intl.DateTimeFormat("pt-BR").format(new Date(year, month - 1, day));
}

export function MunicipalitiesPage() {
  const [data, setData] = useState<CoverageResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [regime, setRegime] = useState<Regime>("geral");
  const [query, setQuery] = useState("");
  const [uf, setUf] = useState("");
  const [openStates, setOpenStates] = useState<Set<string>>(new Set());

  useLayoutEffect(() => {
    const root = document.documentElement;
    root.classList.remove("dark");
    root.style.colorScheme = "light";
    document.body.classList.add("nex-sales-body");
    document.body.style.backgroundColor = "#ffffff";
    return () => {
      document.body.classList.remove("nex-sales-body");
      document.body.style.backgroundColor = "";
    };
  }, []);

  useEffect(() => {
    const previousTitle = document.title;
    const description = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const previousDescription = description?.content;
    document.title = "Municípios atendidos | Nex Notas";
    if (description) description.content = "Consulte os municípios atendidos pela Nex Notas para emissão de NFS-e por MEI e empresas do regime geral.";
    return () => {
      document.title = previousTitle;
      if (description && previousDescription) description.content = previousDescription;
    };
  }, []);

  const loadCoverage = () => {
    setLoading(true);
    setError(false);
    fetch(apiUrl, { headers: { Accept: "application/json" } })
      .then((response) => {
        if (!response.ok) throw new Error("Não foi possível carregar a cobertura.");
        return response.json() as Promise<CoverageResponse>;
      })
      .then((response) => setData(response))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(loadCoverage, []);

  const availableMunicipalities = useMemo(() => {
    if (!data) return [];
    return data.municipios
      .filter((municipality) => isAvailable(municipality, regime))
      .sort((a, b) => collator.compare(a.nome, b.nome));
  }, [data, regime]);

  const filteredMunicipalities = useMemo(() => {
    const normalizedQuery = normalize(query.trim());
    return availableMunicipalities.filter((municipality) => {
      if (uf && municipality.uf !== uf) return false;
      if (!normalizedQuery) return true;
      return normalize(`${municipality.nome} ${municipality.uf} ${municipality.codigoIbge}`).includes(normalizedQuery);
    });
  }, [availableMunicipalities, query, uf]);

  const groupedMunicipalities = useMemo(() => {
    const groups = new Map<string, Municipality[]>();
    for (const municipality of filteredMunicipalities) {
      const current = groups.get(municipality.uf) ?? [];
      current.push(municipality);
      groups.set(municipality.uf, current);
    }
    return [...groups.entries()].sort(([a], [b]) => collator.compare(stateNames[a] ?? a, stateNames[b] ?? b));
  }, [filteredMunicipalities]);

  const searching = Boolean(query.trim());
  const searchResults = searching ? filteredMunicipalities.slice(0, 120) : [];
  const totalForRegime = regime === "mei"
    ? data?.meta.totalMeiDisponivel ?? 0
    : data?.meta.totalRegimeGeralDisponivel ?? 0;

  const toggleState = (state: string) => {
    setOpenStates((current) => {
      const next = new Set(current);
      if (next.has(state)) next.delete(state);
      else next.add(state);
      return next;
    });
  };

  return (
    <div className="nex-sales min-h-screen bg-white text-[#061747]">
      <header className="sticky top-0 z-40 border-b border-[#eef0f4] bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[70px] max-w-6xl items-center justify-between gap-7 px-5">
          <a href="/" className="block w-[150px]" aria-label="Nex Notas — início">
            <img src="/logo-text-roxo.png" alt="Nex Notas" className="block h-auto w-full" />
          </a>
          <nav className="hidden items-center gap-7 text-[13px] font-medium text-[#596579] lg:flex">
            <a href="/#como-funciona" className="transition hover:text-[#4f56f6]">Como funciona</a>
            <a href="/#produto" className="transition hover:text-[#4f56f6]">Produto</a>
            <a href="/#beneficios" className="transition hover:text-[#4f56f6]">Benefícios</a>
            <a href="/#planos" className="transition hover:text-[#4f56f6]">Preços</a>
            <a href="/#faq" className="transition hover:text-[#4f56f6]">FAQ</a>
            <a href="/municipios" className="font-semibold text-[#4f56f6]">Cidades</a>
            <a href="/ajuda" className="transition hover:text-[#4f56f6]">Ajuda</a>
          </nav>
          <div className="flex items-center gap-2">
            <a href="https://app.nexnotas.com.br/entrar"><Button variant="ghost" className="hidden text-[#344054] sm:inline-flex">Entrar</Button></a>
            <a href="https://app.nexnotas.com.br/criar-conta"><Button className="rounded-[10px] bg-[#4f56f6] hover:bg-[#454cf0]">Começar grátis</Button></a>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden border-b border-[#e9ecf7] bg-[#f8f9ff] px-5 pb-14 pt-16 sm:pb-16 sm:pt-20">
          <div className="pointer-events-none absolute left-1/2 top-[-340px] h-[620px] w-[920px] -translate-x-1/2 rounded-full bg-[#e8eaff] blur-3xl" />
          <div className="relative mx-auto max-w-5xl text-center">
            <span className="inline-flex h-[30px] items-center rounded-full border border-[#dfe3ff] bg-white px-3 text-[11.5px] font-semibold text-[#5159e8]">
              <MapPin className="mr-2 h-3.5 w-3.5" /> Cobertura Nex Notas
            </span>
            <h1 className="mx-auto mt-5 max-w-4xl font-heading text-4xl font-semibold leading-[1.12] tracking-tight text-[#061747] sm:text-5xl lg:text-[58px]">
              Encontre as cidades que <span className="text-[#4f56f6]">atendemos.</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-[16px] leading-8 text-[#667085] sm:text-[17px]">
              Consulte onde a emissão de NFS-e pela Nex Notas está disponível para MEI e empresas do regime geral.
            </p>

            <div className="mx-auto mt-10 grid max-w-4xl gap-3 text-left sm:grid-cols-3">
              <MetricCard icon={Store} label="Disponível para MEI" value={data ? numberFormatter.format(data.meta.totalMeiDisponivel) : "—"} detail="municípios" />
              <MetricCard icon={Building2} label="Regime geral" value={data ? numberFormatter.format(data.meta.totalRegimeGeralDisponivel) : "—"} detail="municípios" />
              <MetricCard icon={CalendarDays} label="Dados atualizados" value={formatReferenceDate(data?.meta.dataReferenciaNacional)} detail="referência nacional" detailBelow />
            </div>
          </div>
        </section>

        <section className="bg-white px-5 py-14 sm:py-16">
          <div className="mx-auto max-w-6xl">
            <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[.08em] text-[#5961e9]">Consulta de cobertura</p>
                <h2 className="mt-2 font-heading text-3xl font-semibold tracking-tight text-[#061747]">Busque seu município</h2>
                <p className="mt-2 max-w-xl text-sm leading-7 text-[#667085]">Escolha o tipo de empresa para ver a disponibilidade correta na sua cidade.</p>
              </div>
              <div className="inline-flex w-full rounded-[12px] border border-[#e1e5ef] bg-[#f7f8fc] p-1 sm:w-auto" aria-label="Tipo de empresa">
                <RegimeButton active={regime === "geral"} onClick={() => setRegime("geral")} icon={Building2}>Empresas</RegimeButton>
                <RegimeButton active={regime === "mei"} onClick={() => setRegime("mei")} icon={Store}>MEI</RegimeButton>
              </div>
            </div>

            <div className="rounded-[18px] border border-[#e2e6f0] bg-white p-4 shadow-[0_18px_50px_rgba(6,23,71,.055)] sm:p-5">
              <div className="grid gap-3 md:grid-cols-[1fr_230px]">
                <label className="relative block">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8a94a7]" />
                  <input
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Busque por cidade, UF ou código IBGE"
                    className="h-12 w-full rounded-[10px] border border-[#dfe3ec] bg-white pl-11 pr-4 text-sm text-[#26324b] outline-none transition placeholder:text-[#98a2b3] focus:border-[#7379f8] focus:ring-4 focus:ring-[#4f56f6]/10"
                  />
                </label>
                <select
                  value={uf}
                  onChange={(event) => {
                    const nextUf = event.target.value;
                    setUf(nextUf);
                    if (nextUf) setOpenStates(new Set([nextUf]));
                  }}
                  className="h-12 rounded-[10px] border border-[#dfe3ec] bg-white px-4 text-sm text-[#344054] outline-none transition focus:border-[#7379f8] focus:ring-4 focus:ring-[#4f56f6]/10"
                >
                  <option value="">Todos os estados</option>
                  {Object.entries(stateNames).sort(([, a], [, b]) => collator.compare(a, b)).map(([state, name]) => (
                    <option key={state} value={state}>{name} ({state})</option>
                  ))}
                </select>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#eef0f5] pt-4 text-sm">
                <div className="flex items-center gap-2 text-[#667085]">
                  <CircleCheck className="h-4 w-4 text-[#4f56f6]" />
                  <span><strong className="text-[#243150]">{numberFormatter.format(totalForRegime)}</strong> municípios atendidos para {regime === "mei" ? "MEI" : "empresas"}</span>
                </div>
                {data?.meta.fonteNacional ? (
                  <a href={data.meta.fonteNacional} target="_blank" rel="noreferrer" className="text-xs font-semibold text-[#5961e9] hover:underline">Ver referência oficial</a>
                ) : null}
              </div>
            </div>

            {loading ? (
              <div className="grid min-h-[320px] place-items-center text-center">
                <div><LoaderCircle className="mx-auto h-7 w-7 animate-spin text-[#4f56f6]" /><p className="mt-3 text-sm text-[#667085]">Carregando municípios…</p></div>
              </div>
            ) : error ? (
              <div className="mt-8 rounded-[16px] border border-[#f0d9d9] bg-[#fffafa] p-8 text-center">
                <RefreshCw className="mx-auto h-6 w-6 text-[#b54747]" />
                <h3 className="mt-3 font-heading text-lg font-semibold text-[#061747]">Não foi possível carregar a lista agora</h3>
                <p className="mt-2 text-sm text-[#667085]">Tente novamente em alguns instantes.</p>
                <Button variant="outline" className="mt-5" onClick={loadCoverage}>Tentar novamente</Button>
              </div>
            ) : searching ? (
              <div className="mt-8">
                <div className="mb-4 flex items-center justify-between gap-4">
                  <p className="text-sm text-[#667085]"><strong className="text-[#243150]">{numberFormatter.format(filteredMunicipalities.length)}</strong> resultado(s) encontrado(s)</p>
                  {filteredMunicipalities.length > 120 ? <span className="text-xs text-[#98a2b3]">Mostrando os primeiros 120</span> : null}
                </div>
                {searchResults.length ? (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {searchResults.map((municipality) => <MunicipalityCard key={municipality.codigoIbge} municipality={municipality} />)}
                  </div>
                ) : <EmptyState />}
              </div>
            ) : (
              <div className="mt-8 space-y-3">
                {groupedMunicipalities.map(([state, municipalities]) => {
                  const open = openStates.has(state) || Boolean(uf);
                  return (
                    <div key={state} className="overflow-hidden rounded-[14px] border border-[#e2e6f0] bg-white">
                      <button type="button" onClick={() => toggleState(state)} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-[#fafbff]" aria-expanded={open}>
                        <span className="flex items-center gap-3">
                          <span className="grid h-9 w-9 place-items-center rounded-[10px] bg-[#eef0ff] text-xs font-bold text-[#4f56f6]">{state}</span>
                          <span><strong className="block text-sm text-[#243150]">{stateNames[state]}</strong><small className="mt-0.5 block text-xs text-[#8a94a7]">{numberFormatter.format(municipalities.length)} {municipalities.length === 1 ? "município" : "municípios"}</small></span>
                        </span>
                        <ChevronDown className={`h-4 w-4 text-[#7d8798] transition ${open ? "rotate-180" : ""}`} />
                      </button>
                      {open ? (
                        <div className="grid gap-2 border-t border-[#eef0f5] bg-[#fbfcff] p-4 sm:grid-cols-2 lg:grid-cols-3">
                          {municipalities.map((municipality) => <MunicipalityCard key={municipality.codigoIbge} municipality={municipality} compact />)}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
                {!groupedMunicipalities.length ? <EmptyState /> : null}
              </div>
            )}
          </div>
        </section>

        <section className="border-y border-[#e9ecf5] bg-[#f8f9ff] px-5 py-16">
          <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[.8fr_1.2fr] lg:items-start">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[.08em] text-[#5961e9]">Entenda a cobertura</p>
              <h2 className="mt-3 font-heading text-3xl font-semibold leading-tight tracking-tight text-[#061747]">A disponibilidade muda conforme o regime da empresa.</h2>
              <p className="mt-4 text-sm leading-7 text-[#667085]">O MEI utiliza o Emissor Nacional. Para empresas do regime geral, a integração também depende do sistema adotado por cada prefeitura.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <InfoCard icon={Store} title="MEI" text="Cobertura pelo ambiente nacional, com certificado digital A1 para emissão pela Nex Notas." />
              <InfoCard icon={Landmark} title="Regime geral" text="Disponível onde o Emissor Nacional ou a integração municipal já está habilitada na plataforma." />
              <InfoCard icon={FileCheck2} title="Dados oficiais" text="A lista combina a referência nacional de adesão com as integrações disponíveis na Nex Notas." />
              <InfoCard icon={ShieldCheck} title="Verificação atualizada" text="Os dados são atualizados periodicamente para refletir novas adesões e integrações." />
            </div>
          </div>
        </section>

        <section className="bg-white px-5 py-20">
          <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-7 rounded-[18px] bg-[#4f56f6] p-8 text-center text-white sm:p-12 lg:flex-row lg:text-left">
            <div>
              <span className="inline-flex rounded-full bg-white/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[.08em] text-white">Incluso a partir do Afiliado Expert</span>
              <h2 className="mt-4 font-heading text-3xl font-semibold leading-tight text-white">Não encontrou sua cidade? Nós homologamos para você.</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[#eef0ff]">Nos planos Afiliado Expert e Top Afiliado, nossa equipe homologa a integração com a prefeitura para empresas do regime geral, sem custo adicional.</p>
            </div>
            <a href="https://app.nexnotas.com.br/criar-conta" className="shrink-0"><Button size="lg" className="gap-2 rounded-[10px] bg-white text-[#4f56f6] hover:bg-[#f5f6ff]">Criar conta <ArrowRight className="h-4 w-4" /></Button></a>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#ebedf2] bg-white py-10">
        <div className="mx-auto flex max-w-6xl flex-col justify-between gap-7 px-5 sm:flex-row sm:items-start">
          <div><a href="/" className="block w-[145px]"><img src="/logo-text-roxo.png" alt="Nex Notas" className="h-auto w-full" /></a><p className="mt-4 max-w-[320px] text-sm leading-7 text-[#748094]">NFS-e em lote com uma operação mais simples, organizada e segura.</p></div>
          <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-[#667085]">
            <a href="/" className="hover:text-[#4f56f6]">Início</a>
            <a href="/#planos" className="hover:text-[#4f56f6]">Preços</a>
            <a href="/ajuda" className="hover:text-[#4f56f6]">Ajuda</a>
            <a href="/privacidade" className="hover:text-[#4f56f6]">Privacidade</a>
            <a href="/termos" className="hover:text-[#4f56f6]">Termos</a>
          </div>
        </div>
        <div className="mx-auto mt-8 flex max-w-6xl flex-wrap items-center justify-between gap-3 border-t border-[#ebedf2] px-5 pt-5 text-xs text-[#929aaa]">
          <span>© 2026 Nex Notas. Todos os direitos reservados.</span>
          <button type="button" className="font-semibold text-[#4f56f6] hover:underline" onClick={openCookiePreferences}>Preferências de cookies</button>
        </div>
      </footer>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, detail, detailBelow = false }: { icon: typeof Store; label: string; value: string; detail: string; detailBelow?: boolean }) {
  return <div className="rounded-[16px] border border-[#e0e4f4] bg-white p-5 shadow-[0_12px_32px_rgba(6,23,71,.045)]"><div className="flex items-center gap-2 text-xs font-semibold text-[#667085]"><Icon className="h-4 w-4 text-[#5961e9]" />{label}</div><div className={`mt-3 ${detailBelow ? "flex flex-col items-start gap-1" : "flex items-baseline gap-2"}`}><strong className="font-heading text-2xl font-semibold text-[#061747]">{value}</strong><span className="whitespace-nowrap text-xs text-[#98a2b3]">{detail}</span></div></div>;
}

function RegimeButton({ active, onClick, icon: Icon, children }: { active: boolean; onClick: () => void; icon: typeof Store; children: string }) {
  return <button type="button" onClick={onClick} className={`flex flex-1 items-center justify-center gap-2 rounded-[8px] px-5 py-2.5 text-sm font-semibold transition sm:flex-none ${active ? "bg-white text-[#4f56f6] shadow-sm" : "text-[#667085] hover:text-[#344054]"}`}><Icon className="h-4 w-4" />{children}</button>;
}

function MunicipalityCard({ municipality, compact = false }: { municipality: Municipality; compact?: boolean }) {
  return (
    <article className={`rounded-[11px] border border-[#e5e8f1] bg-white ${compact ? "p-3.5" : "p-4"}`}>
      <div className="flex items-start justify-between gap-3"><div><h3 className="font-semibold text-[#243150]">{municipality.nome}</h3><p className="mt-1 text-xs text-[#8a94a7]">{municipality.uf} · IBGE {municipality.codigoIbge}</p></div><span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#edf9f2] px-2 py-1 text-[10px] font-bold text-[#287a4d]"><Check className="h-3 w-3" /> Disponível</span></div>
      {!compact ? <p className="mt-4 text-xs font-medium text-[#667085]">{municipality.nfseNacional.emissorNacional ? "Emissor Nacional" : "Cobertura confirmada pela Nex Notas"}</p> : null}
    </article>
  );
}

function InfoCard({ icon: Icon, title, text }: { icon: typeof Store; title: string; text: string }) {
  return <article className="rounded-[16px] border border-[#e1e5ef] bg-white p-5"><span className="grid h-10 w-10 place-items-center rounded-[11px] bg-[#eef0ff] text-[#4f56f6]"><Icon className="h-5 w-5" /></span><h3 className="mt-4 font-heading text-base font-semibold text-[#061747]">{title}</h3><p className="mt-2 text-sm leading-6 text-[#667085]">{text}</p></article>;
}

function EmptyState() {
  return <div className="rounded-[16px] border border-dashed border-[#d9deeb] bg-[#fbfcff] px-6 py-14 text-center"><Search className="mx-auto h-6 w-6 text-[#98a2b3]" /><h3 className="mt-3 font-heading text-base font-semibold text-[#243150]">Nenhum município encontrado</h3><p className="mt-2 text-sm text-[#7a8496]">Confira a grafia ou tente outro estado e tipo de empresa.</p></div>;
}
