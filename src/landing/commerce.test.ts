import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  annualMonthlyEquivalent,
  annualTotal,
  cityIsAvailable,
  createAccountUrl,
  fallbackCoverage,
  findCity,
  parseCsvSimulation,
} from "./commerce.ts";

test("anual cobra 10 meses e mostra o equivalente mensal com centavos", () => {
  assert.equal(annualTotal(57), "570");
  assert.equal(annualMonthlyEquivalent(57), "47,50");
  assert.equal(annualMonthlyEquivalent(97), "80,83");
  assert.equal(annualMonthlyEquivalent(147), "122,50");
  assert.equal(annualMonthlyEquivalent(227), "189,17");
});

test("contratacao continua em criar-conta com plano, periodo, porte e cidade", () => {
  const city = findCity("São Paulo", "SP", fallbackCoverage);
  assert.ok(city);
  const url = new URL(createAccountUrl("basic", "annual", "empresa", city));
  assert.equal(url.origin + url.pathname, "https://app.nexnotas.com.br/criar-conta");
  assert.equal(url.searchParams.get("plano"), "basic");
  assert.equal(url.searchParams.get("periodo"), "anual");
  assert.equal(url.searchParams.get("porte"), "empresa");
  assert.equal(url.searchParams.get("cidade"), "São Paulo");
  assert.equal(url.searchParams.get("uf"), "SP");
  assert.equal(url.searchParams.get("municipio"), "3550308");
});

test("MEI segue em cidade nao liberada e empresa fica na espera", () => {
  const recife = findCity("Recife", "PE", fallbackCoverage);
  assert.ok(recife);
  assert.equal(cityIsAvailable(recife, "mei"), true);
  assert.equal(cityIsAvailable(recife, "empresa"), false);
  const saoPaulo = findCity("São Paulo", "SP", fallbackCoverage);
  assert.equal(cityIsAvailable(saoPaulo ?? null, "empresa"), true);
});

test("simulador agrupa uma nota por loja", () => {
  const csv = [
    "ID da Loja,Nome da Loja,Comissão Total",
    "1,Loja A,\"R$ 10,00\"",
    "1,Loja A,\"R$ 5,50\"",
    "2,Loja B,\"R$ 3,00\"",
  ].join("\n");
  const result = parseCsvSimulation(csv, "relatorio.csv");
  assert.equal(result.count, 2);
  assert.equal(result.orders, 3);
  assert.equal(result.duplicates, 1);
  assert.equal(result.total, 18.5);
});

test("a landing nao aponta para rotas inexistentes nem para a propriedade compartilhada", () => {
  const markup = readFileSync(new URL("./markup.html", import.meta.url), "utf8");
  const index = readFileSync(new URL("../../index.html", import.meta.url), "utf8");
  for (const forbidden of ["app.nexnotas.com.br/cadastro", "app.nexnotas.com.br/signup", "G-6MTV9JCWFH", 'href="#"', "Tela real da prévia", "+23 mil", "Homologação municipal inclusa", "incluem a homologação", "Mercado Livre", "Amazon", "Ebazar"]) {
    assert.equal(markup.includes(forbidden), false, forbidden);
    assert.equal(index.includes(forbidden), false, forbidden);
  }
  assert.match(index, /GTM-PZWRXGKJ/);
  assert.match(markup, /data-plan="afiliado-expert"/);
  assert.match(markup, /id="simulacao"/);
  assert.match(markup, /https:\/\/app\.nexnotas\.com\.br\/entrar/);
  assert.match(markup, /href="\/ajuda"/);
  assert.equal(index.includes("G-SLN4TQHE5R"), false);
});
