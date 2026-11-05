export type CompanyKind = "mei" | "empresa";
export type Billing = "monthly" | "annual";
export type CoverageStatus = "available" | "mei_only" | "waitlist";

export type CityCoverage = {
  city: string;
  uf: string;
  ibge?: string;
  status: CoverageStatus;
  note: string;
};

export type PublicCoverageCity = {
  codibge: string;
  cidade: string;
  UF: string;
  atende: boolean;
};

export type NotaGuardCoverageCity = {
  ibge: number | string;
  nome: string;
  uf: string;
  emissorNacional: boolean;
};

export type SimulationResult = {
  source: string;
  count: number;
  orders: number;
  total: number;
  valid: number;
  review: number;
  duplicates: number;
  average: number;
  rows: Array<{ shopId: string; client: string; orders: number; value: number; status: string }>;
};

export const fallbackCoverage: CityCoverage[] = [
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

export function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

export function normalizeSearch(value: string) {
  return normalize(value).replace(/[^a-z0-9]+/g, " ").trim();
}

export function cityKey(city: string, uf: string) {
  return `${normalize(city)}-${uf.toUpperCase()}`;
}

export function annualMonthlyEquivalent(monthly: number) {
  if (!monthly) return "0";
  return (monthly * 10 / 12).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function annualTotal(monthly: number) {
  return (monthly * 10).toLocaleString("pt-BR", { maximumFractionDigits: 0 });
}

export function createAccountUrl(planId: string, billing: Billing, kind: CompanyKind, city: CityCoverage) {
  const params = new URLSearchParams({
    plano: planId,
    periodo: billing === "annual" ? "anual" : "mensal",
    porte: kind,
    cidade: city.city,
    uf: city.uf,
  });
  if (city.ibge) params.set("municipio", city.ibge);
  return `https://app.nexnotas.com.br/criar-conta?${params.toString()}`;
}

export function cityIsAvailable(city: CityCoverage | null, kind: CompanyKind) {
  if (!city) return false;
  if (kind === "mei") return true;
  return city.status === "available";
}

export function cityFromPublicCoverage(item: PublicCoverageCity): CityCoverage {
  return {
    city: item.cidade,
    uf: item.UF,
    ibge: item.codibge,
    status: item.atende ? "available" : "waitlist",
    note: item.atende ? "Cidade disponível para contratação." : "Ainda não atendemos esta cidade.",
  };
}

export function cityFromNotaGuardCoverage(item: NotaGuardCoverageCity): CityCoverage {
  return {
    city: item.nome,
    uf: item.uf,
    ibge: String(item.ibge),
    status: item.emissorNacional ? "available" : "waitlist",
    note: item.emissorNacional ? "Cidade disponível para contratação." : "Ainda não atendemos esta cidade.",
  };
}

export function findCity(city: string, uf?: string, catalog: CityCoverage[] = fallbackCoverage) {
  const normalizedCity = normalizeSearch(city);
  const normalizedUf = uf ? normalizeSearch(uf) : "";
  return catalog.find((item) => normalizeSearch(item.city) === normalizedCity && (!normalizedUf || normalizeSearch(item.uf) === normalizedUf));
}

export function waitlistCity(city: string, uf = ""): CityCoverage {
  return {
    city: city.trim() || "Sua cidade",
    uf: uf.trim().toUpperCase() || "BR",
    status: "waitlist",
    note: "Ainda não liberamos esta cidade. Você pode deixar o interesse registrado para priorizarmos sua região.",
  };
}

export function searchCities(query: string, catalog: CityCoverage[]) {
  const terms = normalizeSearch(query).split(/\s+/).filter(Boolean);
  if (!terms.length) return catalog.slice(0, 8);
  return catalog.filter((item) => {
    const searchable = normalizeSearch(`${item.city} ${item.uf} ${item.ibge ?? ""}`);
    return terms.every((term) => searchable.includes(term));
  }).slice(0, 8);
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

export function parseCsvSimulation(text: string, source: string): SimulationResult {
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
  return {
    source,
    count: parsed.length,
    orders: rows.length,
    total,
    valid: parsed.filter((row) => row.status === "Pronta").length,
    review,
    duplicates: Math.max(rows.length - parsed.length, 0),
    average: parsed.length ? total / parsed.length : 0,
    rows: parsed.slice(0, 4),
  };
}
