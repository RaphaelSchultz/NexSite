import { updateMarketingConsent, type MarketingPixelConsent } from "../lib/marketing-pixels";
import {
  annualMonthlyEquivalent,
  annualTotal,
  cityFromNotaGuardCoverage,
  cityFromPublicCoverage,
  cityIsAvailable,
  createAccountUrl,
  fallbackCoverage,
  findCity,
  parseCsvSimulation,
  searchCities,
  waitlistCity,
  type Billing,
  type CityCoverage,
  type CompanyKind,
  type NotaGuardCoverageCity,
  type PublicCoverageCity,
} from "./commerce";

const cookieKey = "nexnotas_tracking_consent";
const allCookies: MarketingPixelConsent = { analytics: true, marketing: true, experience: true };
const noCookies: MarketingPixelConsent = { analytics: false, marketing: false, experience: false };
const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" })[char] || char);
}

type Frame = { el: HTMLIFrameElement; k: number; ready: Promise<void> };

export function initLanding(root: HTMLElement) {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ac = new AbortController();
  const signal = ac.signal;
  let disposed = false;
  const observers: Array<{ disconnect: () => void }> = [];
  const $ = <T extends Element = HTMLElement>(selector: string, parent: ParentNode = root) => parent.querySelector<T>(selector);
  const $$ = <T extends Element = HTMLElement>(selector: string, parent: ParentNode = root) => Array.from(parent.querySelectorAll<T>(selector));

  const docEl = document.documentElement;
  const mqDark = window.matchMedia("(prefers-color-scheme: dark)");
  const narrow = window.matchMedia("(max-width: 560px)");

  function applyTheme(pref: string, save = false) {
    const theme = pref === "system" ? (mqDark.matches ? "dark" : "light") : pref;
    docEl.setAttribute("data-pref", pref);
    docEl.setAttribute("data-theme", theme);
    docEl.classList.toggle("dark", theme === "dark");
    docEl.style.colorScheme = theme;
    if (save) {
      try { localStorage.setItem("nxl-theme", pref); } catch { /* preferência local opcional */ }
    }
    const order = ["light", "dark", "system"];
    $$("[data-pref]").forEach((button) => button.setAttribute("aria-pressed", button.dataset.pref === pref ? "true" : "false"));
    const knob = $(".theme .knob");
    if (knob) knob.style.transform = `translateX(${order.indexOf(pref) * 32}px)`;
  }

  $$(".theme [data-pref], .theme-l [data-pref]").forEach((button) => {
    button.addEventListener("click", () => {
      let pref = button.dataset.pref || "system";
      const order = ["light", "dark", "system"];
      if (button.closest(".theme") && narrow.matches && button.getAttribute("aria-pressed") === "true") {
        pref = order[(order.indexOf(pref) + 1) % 3] || "system";
      }
      applyTheme(pref, true);
    }, { signal });
  });
  const onSystemTheme = () => { if (docEl.getAttribute("data-pref") === "system") applyTheme("system"); };
  if (mqDark.addEventListener) mqDark.addEventListener("change", onSystemTheme);
  else mqDark.addListener(onSystemTheme);
  applyTheme(docEl.getAttribute("data-pref") || "system");

  const burger = $(".nav-burger");
  const panel = $("#nav-panel");
  function setMenu(open: boolean) {
    if (!burger || !panel) return;
    panel.hidden = !open;
    panel.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", open ? "true" : "false");
    burger.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
  }
  burger?.addEventListener("click", () => setMenu(panel?.hidden !== false), { signal });
  panel?.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setMenu(false), { signal }));

  const nav = $("#nav");
  const sticky = $("#sticky");
  const onScroll = () => {
    nav?.classList.toggle("scrolled", window.scrollY > 12);
    const nearEnd = window.innerHeight + window.scrollY >= document.body.scrollHeight - 400;
    sticky?.classList.toggle("show", window.scrollY > 700 && !nearEnd);
  };
  window.addEventListener("scroll", onScroll, { passive: true, signal });
  onScroll();

  const typed = $("#typed");
  const words = ["em um clique", "direto do CSV", "sem retrabalho"];
  if (!reduce && typed) {
    let wordIndex = 0;
    let count = words[0].length;
    let deleting = true;
    const tick = () => {
      if (disposed) return;
      const word = words[wordIndex] || "";
      if (deleting) {
        count -= 1;
        typed.textContent = word.slice(0, count);
        if (count === 0) {
          deleting = false;
          wordIndex = (wordIndex + 1) % words.length;
        }
        window.setTimeout(tick, 50);
      } else {
        count += 1;
        typed.textContent = word.slice(0, count);
        if (count === word.length) {
          deleting = true;
          window.setTimeout(tick, 2400);
        } else window.setTimeout(tick, 80);
      }
    };
    window.setTimeout(tick, 2400);
  }

  function formatCount(value: number, decimals: number, comma: boolean, thousand: boolean) {
    if (decimals) {
      const text = value.toFixed(decimals);
      return comma ? text.replace(".", ",") : text;
    }
    const rounded = Math.round(value);
    return thousand ? rounded.toLocaleString("pt-BR") : String(rounded);
  }
  function countUp(node: HTMLElement) {
    if (node.dataset.done) return;
    node.dataset.done = "1";
    const target = Number(node.dataset.count);
    const suffix = node.dataset.suffix || "";
    const decimals = Number(node.dataset.dec || 0);
    const comma = "comma" in node.dataset;
    const thousand = "thousand" in node.dataset;
    if (reduce || !Number.isFinite(target)) {
      node.textContent = formatCount(target, decimals, comma, thousand) + suffix;
      return;
    }
    const start = performance.now();
    const step = (now: number) => {
      if (disposed) return;
      const progress = Math.min((now - start) / 1500, 1);
      const eased = 1 - (1 - progress) ** 3;
      node.textContent = formatCount(target * eased, decimals, comma, thousand) + (progress === 1 ? suffix : "");
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  const reveal = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const target = entry.target as HTMLElement;
      target.classList.add("in");
      if (target.matches("[data-count]")) countUp(target);
      $$("[data-count]", target).forEach(countUp);
      reveal.unobserve(target);
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
  observers.push(reveal);
  $$(".rv, .float, .kpi, .steps, [data-count]").forEach((node) => reveal.observe(node));

  const scrub = $("#scrub");
  if (scrub && !scrub.querySelector(".w")) {
    const parts: Node[] = [];
    Array.from(scrub.childNodes).forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        (node.textContent || "").split(/(\s+)/).forEach((word) => {
          if (word.trim()) {
            const span = document.createElement("span");
            span.className = "w";
            span.textContent = word;
            parts.push(span);
          } else if (word) parts.push(document.createTextNode(word));
        });
      } else if (node instanceof HTMLElement) {
        node.classList.add("w");
        parts.push(node);
      }
    });
    scrub.replaceChildren(...parts);
    const wordsInStatement = $$(".w", scrub);
    const paint = () => {
      const rect = scrub.getBoundingClientRect();
      const progress = reduce ? 1 : Math.min(Math.max((window.innerHeight * 0.85 - rect.top) / (rect.height + window.innerHeight * 0.3), 0), 1);
      const visible = Math.round(progress * wordsInStatement.length);
      wordsInStatement.forEach((word, index) => word.classList.toggle("on", index < visible));
    };
    window.addEventListener("scroll", paint, { passive: true, signal });
    paint();
  }

  let billing: Billing = "monthly";
  function paintBilling() {
    const annual = Boolean($("#bill button.on")?.dataset.b === "a");
    billing = annual ? "annual" : "monthly";
    $$(".plan").forEach((plan) => {
      const price = $(".n", plan);
      const day = $(".day", plan);
      if (!price) return;
      const monthly = Number(price.dataset.m || "0");
      if (day && !day.dataset.monthly) day.dataset.monthly = day.textContent || "";
      price.textContent = annual ? annualMonthlyEquivalent(monthly) : String(monthly);
      if (day) day.textContent = annual && monthly ? `R$ ${annualTotal(monthly)} no ano` : day.dataset.monthly || "";
    });
    paintCalculator();
  }
  $$("#bill button").forEach((button) => {
    button.addEventListener("click", () => {
      $$("#bill button").forEach((item) => item.classList.toggle("on", item === button));
      paintBilling();
    }, { signal });
  });

  const notes = $<HTMLInputElement>("#cN");
  const minutes = $<HTMLInputElement>("#cM");
  const hour = $<HTMLInputElement>("#cH");
  function paintRange(range: HTMLInputElement) {
    range.style.setProperty("--p", `${((Number(range.value) - Number(range.min)) / (Number(range.max) - Number(range.min))) * 100}%`);
  }
  function paintCalculator() {
    if (!notes || !minutes || !hour) return;
    [notes, minutes, hour].forEach(paintRange);
    const count = Number(notes.value);
    const minuteValue = Number(minutes.value);
    const hourValue = Number(hour.value);
    const hours = count * minuteValue / 60;
    const value = hours * hourValue;
    const plan: [string, number] = count <= 50 ? ["Grátis", 0] : count <= 800 ? ["Basic", 57] : count <= 4000 ? ["Profissional", 97] : count <= 8000 ? ["Afiliado Expert", 147] : ["Top Afiliado", 227];
    const price = plan[1] ?? 0;
    const shown = billing === "annual" && price ? annualMonthlyEquivalent(price) : String(price);
    const out = $("#cOut");
    const val = $("#cVal");
    const vs = $("#cVs");
    const notesOut = $("#cNo");
    const minutesOut = $("#cMo");
    const hourOut = $("#cHo");
    if (notesOut) notesOut.textContent = count.toLocaleString("pt-BR");
    if (minutesOut) minutesOut.textContent = `${String(minuteValue).replace(".", ",")} min`;
    if (hourOut) hourOut.textContent = `R$ ${hourValue}`;
    if (out) out.textContent = `${hours >= 10 ? Math.round(hours).toLocaleString("pt-BR") : hours.toFixed(1).replace(".", ",")} h`;
    if (val) val.textContent = `≈ ${currency.format(Math.round(value))} do seu tempo por mês`;
    if (vs) {
      const ratio = price ? (value / (billing === "annual" ? price * 10 / 12 : price)).toFixed(1).replace(".", ",") : "";
      vs.innerHTML = price
        ? `Plano indicado: <strong>${plan[0]}</strong> · R$ ${shown}/mês${billing === "annual" ? ` (R$ ${annualTotal(price)} no ano)` : ""}. Seu tempo vale <strong>${ratio}x</strong> o preço do plano.`
        : `Plano indicado: <strong>${plan[0]}</strong> · grátis para sempre.`;
    }
  }
  [notes, minutes, hour].forEach((range) => range?.addEventListener("input", paintCalculator, { signal }));
  paintBilling();

  let catalog = fallbackCoverage.slice();
  let publicCity: CityCoverage | null = findCity("São Paulo", "SP", catalog) ?? null;
  const cityInput = $<HTMLInputElement>("#cc");
  const cityList = $("#cc-list");
  const cityStatus = $("#cc-status");
  const porte = $<HTMLSelectElement>("#cp");
  const cityResult = $("#cRes");

  function statusLabel(city: CityCoverage, kind: CompanyKind) {
    if (cityIsAvailable(city, kind) && kind === "mei") return "MEI pode seguir";
    if (city.status === "available") return "Atendida";
    if (city.status === "mei_only") return "Somente MEI";
    return "Lista de espera";
  }

  function paintCityResult() {
    if (!cityResult || !porte) return;
    const kind: CompanyKind = porte.value === "mei" ? "mei" : "empresa";
    if (!publicCity) {
      cityResult.className = "res w";
      cityResult.innerHTML = "<span><b>Selecione um município da lista.</b><br>A busca usa a cobertura conhecida antes da contratação.</span>";
      return;
    }
    const available = cityIsAvailable(publicCity, kind);
    cityResult.className = `res ${available ? "ok" : "bad"}`;
    const detail = available
      ? (kind === "mei" ? "Para MEI, a emissão pode seguir pelo padrão nacional." : "Disponível pela NFS-e Nacional. Você pode emitir hoje.")
      : publicCity.note;
    cityResult.innerHTML = `<span><b>${escapeHtml(publicCity.city)} / ${escapeHtml(publicCity.uf)} · ${kind === "mei" ? "MEI" : "ME / EPP / LTDA"}</b><br>${escapeHtml(detail)}</span>`;
  }

  function renderCityList() {
    if (!cityInput || !cityList) return;
    const matches = searchCities(cityInput.value, catalog);
    cityList.innerHTML = matches.map((city) => {
      const selected = publicCity?.city === city.city && publicCity.uf === city.uf;
      const kind: CompanyKind = porte?.value === "empresa" ? "empresa" : "mei";
      return `<button type="button" role="option" aria-selected="${selected ? "true" : "false"}" data-city="${escapeHtml(city.city)}" data-uf="${escapeHtml(city.uf)}"><span>${escapeHtml(city.city)} / ${escapeHtml(city.uf)}</span><span class="tag ${cityIsAvailable(city, kind) ? "ok" : "wait"}">${statusLabel(city, kind)}</span></button>`;
    }).join("") || `<p class="city-status">Nenhuma cidade encontrada. No próximo passo dá para registrar o interesse.</p>`;
    cityInput.setAttribute("aria-expanded", matches.length ? "true" : "false");
  }

  cityList?.addEventListener("click", (event) => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>("button[data-city]");
    if (!button || !cityInput) return;
    publicCity = findCity(button.dataset.city || "", button.dataset.uf, catalog) ?? waitlistCity(button.dataset.city || "", button.dataset.uf);
    cityInput.value = `${publicCity.city} / ${publicCity.uf}`;
    if (cityList) cityList.innerHTML = "";
    cityInput.setAttribute("aria-expanded", "false");
    paintCityResult();
  }, { signal });
  cityInput?.addEventListener("input", () => {
    publicCity = null;
    renderCityList();
    paintCityResult();
  }, { signal });
  porte?.addEventListener("change", () => { renderCityList(); paintCityResult(); }, { signal });
  if (cityInput && publicCity) cityInput.value = `${publicCity.city} / ${publicCity.uf}`;
  paintCityResult();

  function rememberCity(city: CityCoverage) {
    publicCity = findCity(city.city, city.uf, catalog) ?? city;
    if (cityInput) cityInput.value = `${publicCity.city} / ${publicCity.uf}`;
    paintCityResult();
  }

  const loadCoverage = () => fetch("https://api.nexnotas.com.br/api/v1/public/cobertura")
    .then((response) => response.ok ? response.json() as Promise<PublicCoverageCity[]> : Promise.reject(new Error("cobertura")))
    .catch(() => fetch("https://notaguard.com.br/guias/municipios-habilitados-nfse-nacional/dados")
      .then((response) => response.ok ? response.json() as Promise<{ municipios?: NotaGuardCoverageCity[] }> : Promise.reject(new Error("notaguard"))));

  loadCoverage().then((items) => {
    if (disposed) return;
    const cities = Array.isArray(items) ? items.map(cityFromPublicCoverage) : items.municipios?.map(cityFromNotaGuardCoverage);
    if (!cities?.length) throw new Error("vazia");
    catalog = cities;
    if (cityStatus) cityStatus.textContent = "Cobertura atualizada.";
    if (publicCity) rememberCity(publicCity);
  }).catch(() => {
    if (cityStatus) cityStatus.textContent = "Não foi possível atualizar a lista ao vivo. A busca usa a referência local.";
  });

  fetch("https://ipwho.is/?fields=success,city,region_code,country_code")
    .then((response) => response.ok ? response.json() as Promise<{ success?: boolean; city?: string; region_code?: string; country_code?: string }> : null)
    .then((data) => {
      if (disposed || !data?.success || data.country_code !== "BR" || !data.city) return;
      rememberCity(findCity(data.city, data.region_code, catalog) ?? waitlistCity(data.city, data.region_code));
    })
    .catch(() => undefined);

  const gate = $("#gate");
  const gateBody = $("#gate-body");
  const gateTitle = $("#gate-title");
  const gateLead = $("#gate-lead");
  let gatePlan = "gratis";
  let gateKind: CompanyKind | null = null;
  let gateCity: CityCoverage | null = null;
  let gateStep: 1 | 2 | 3 = 1;
  let gateReturn: HTMLElement | null = null;
  const planNames: Record<string, string> = { gratis: "Grátis", basic: "Basic", profissional: "Profissional", "afiliado-expert": "Afiliado Expert", "top-afiliado": "Top Afiliado" };

  function closeGate() {
    if (gate) gate.hidden = true;
    document.body.style.overflow = "";
    gateReturn?.focus();
  }
  function openGate(planId: string, opener: HTMLElement | null) {
    gatePlan = planNames[planId] ? planId : "gratis";
    gateKind = null;
    gateCity = publicCity;
    gateStep = 1;
    gateReturn = opener;
    if (gate) gate.hidden = false;
    document.body.style.overflow = "hidden";
    renderGate();
  }
  function renderGate() {
    if (!gateBody || !gateTitle) return;
    const name = planNames[gatePlan] || "Grátis";
    gateTitle.textContent = `Contratação do ${name}`;
    if (gateLead) gateLead.textContent = "Antes de criar a conta, confirme o porte do CNPJ e a cidade de emissão.";
    const steps = ["Porte", "Município", "Conta"].map((label, index) => `<span class="${index + 1 <= gateStep ? "on" : ""}">${String(index + 1).padStart(2, "0")} ${label}</span>`).join("");
    if (gateStep === 1) {
      gateBody.innerHTML = `<div class="gate-steps">${steps}</div><div class="kind-grid"><button type="button" data-kind="mei"><b>Sou MEI</b><span>A emissão pode seguir pelo padrão nacional.</span></button><button type="button" data-kind="empresa"><b>Não sou MEI</b><span>ME, EPP ou LTDA dependem da cobertura municipal.</span></button></div>`;
    } else if (gateStep === 2 && gateKind) {
      const matches = searchCities(gateCity ? "" : "", catalog).slice(0, 8);
      const current = gateCity ? escapeHtml(`${gateCity.city} / ${gateCity.uf}`) : "";
      gateBody.innerHTML = `<div class="gate-steps">${steps}</div><label for="gate-city">Município de emissão</label><input id="gate-city" type="search" placeholder="Digite o nome da sua cidade" value="${current}" aria-controls="gate-list"><div id="gate-list" class="city-list" role="listbox">${matches.map((city) => `<button type="button" data-city="${escapeHtml(city.city)}" data-uf="${escapeHtml(city.uf)}">${escapeHtml(city.city)} / ${escapeHtml(city.uf)}</button>`).join("")}</div><div class="gate-actions"><button type="button" class="btn btn-ghost" data-gate="back">Voltar</button><button type="button" class="btn btn-ghost" data-gate="geo">Usar minha localização</button><button type="button" class="btn btn-primary" data-gate="next" ${gateCity ? "" : "disabled"}>Continuar</button></div>`;
    } else if (gateKind && gateCity) {
      const available = cityIsAvailable(gateCity, gateKind);
      const note = escapeHtml(available ? (gateKind === "mei" ? "Para MEI, a emissão pode seguir pelo padrão nacional." : gateCity.note) : gateCity.note);
      gateBody.innerHTML = `<div class="gate-steps">${steps}</div><div class="gate-note"><b>${escapeHtml(gateCity.city)} / ${escapeHtml(gateCity.uf)}</b><span>${note}</span></div><div class="gate-actions"><button type="button" class="btn btn-ghost" data-gate="back">Voltar</button>${available ? `<a class="btn btn-primary" id="gate-go" href="${escapeHtml(createAccountUrl(gatePlan, billing, gateKind, gateCity))}">Criar conta</a>` : `<button type="button" class="btn btn-primary" data-gate="wait">Entrar na lista de espera</button>`}</div><p id="gate-wait" role="status"></p>`;
    }
    $("#gate-close")?.focus();
  }

  gate?.addEventListener("click", (event) => {
    if (event.target === gate) closeGate();
    const target = event.target as HTMLElement;
    const kind = target.closest<HTMLElement>("[data-kind]")?.dataset.kind;
    if (kind === "mei" || kind === "empresa") {
      gateKind = kind;
      gateStep = 2;
      renderGate();
      return;
    }
    const picked = target.closest<HTMLElement>("#gate-list [data-city]");
    if (picked) {
      gateCity = findCity(picked.dataset.city || "", picked.dataset.uf, catalog) ?? waitlistCity(picked.dataset.city || "", picked.dataset.uf);
      const field = $<HTMLInputElement>("#gate-city");
      if (field) field.value = `${gateCity.city} / ${gateCity.uf}`;
      const next = $<HTMLButtonElement>("[data-gate=next]");
      if (next) next.disabled = false;
      return;
    }
    const action = target.closest<HTMLElement>("[data-gate]")?.dataset.gate;
    if (action === "back") {
      gateStep = gateStep === 3 ? 2 : 1;
      if (gateStep === 1) gateKind = null;
      renderGate();
    } else if (action === "next" && gateCity) {
      gateStep = 3;
      renderGate();
    } else if (action === "geo") {
      navigator.geolocation?.getCurrentPosition((position) => {
        fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}&localityLanguage=pt`)
          .then((response) => response.ok ? response.json() as Promise<{ city?: string; locality?: string; principalSubdivisionCode?: string }> : null)
          .then((data) => {
            const rawCity = data?.city || data?.locality;
            const uf = data?.principalSubdivisionCode?.replace("BR-", "");
            if (!rawCity) return;
            gateCity = findCity(rawCity, uf, catalog) ?? waitlistCity(rawCity, uf);
            renderGate();
          })
          .catch(() => undefined);
      });
    } else if (action === "wait" && gateCity && gateKind) {
      const current = JSON.parse(localStorage.getItem("nexnotas_waitlist") || "[]") as unknown[];
      localStorage.setItem("nexnotas_waitlist", JSON.stringify([...current, { plan: planNames[gatePlan], kind: gateKind, city: gateCity.city, uf: gateCity.uf, createdAt: new Date().toISOString() }]));
      const status = $("#gate-wait");
      if (status) status.textContent = `${gateCity.city} / ${gateCity.uf} entrou na lista de espera.`;
    }
  }, { signal });
  gate?.addEventListener("input", (event) => {
    const field = event.target;
    if (!(field instanceof HTMLInputElement) || field.id !== "gate-city") return;
    gateCity = null;
    const list = $("#gate-list");
    const next = $<HTMLButtonElement>("[data-gate=next]");
    if (next) next.disabled = true;
    const matches = searchCities(field.value, catalog);
    if (!list) return;
    if (!matches.length && field.value.trim().length > 2) {
      list.innerHTML = `<button type="button" data-city="${escapeHtml(field.value.trim())}" data-uf="">Usar “${escapeHtml(field.value.trim())}” e registrar na lista se preciso</button>`;
      return;
    }
    list.innerHTML = matches.map((city) => `<button type="button" data-city="${escapeHtml(city.city)}" data-uf="${escapeHtml(city.uf)}">${escapeHtml(city.city)} / ${escapeHtml(city.uf)}</button>`).join("");
  }, { signal });
  $("#gate-close")?.addEventListener("click", closeGate, { signal });
  $("#cookie-dialog-close")?.addEventListener("click", () => { const dialog = $("#cookie-dialog"); if (dialog) dialog.hidden = true; }, { signal });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeGate();
      const dialog = $("#cookie-dialog");
      if (dialog) dialog.hidden = true;
      setMenu(false);
    }
  }, { signal });
  root.addEventListener("click", (event) => {
    const link = (event.target as HTMLElement).closest<HTMLAnchorElement>("a[data-plan]");
    if (!link) return;
    event.preventDefault();
    openGate(link.dataset.plan || "gratis", link);
  }, { signal });

  const csvInput = $<HTMLInputElement>("#csv-file");
  const simDrop = $("#sim-drop");
  const simError = $("#sim-error");
  const simProgress = $("#sim-progress");
  const simResult = $("#sim-result");
  const simFile = $("#sim-file");
  function showSimError(message: string) {
    if (!simError) return;
    simError.hidden = false;
    simError.textContent = message;
    if (simResult) simResult.hidden = true;
    if (simProgress) simProgress.hidden = true;
  }
  function readCsv(file: File) {
    if (simError) simError.hidden = true;
    if (!file.name.toLowerCase().endsWith(".csv") && file.type && !file.type.includes("csv") && !file.type.startsWith("text/")) {
      showSimError("Envie o relatório em .csv.");
      return;
    }
    if (file.size > 8_000_000) {
      showSimError("O arquivo passa de 8 MB. Exporte de novo o Relatório Mensal.");
      return;
    }
    if (simFile) simFile.textContent = file.name;
    if (simProgress) simProgress.hidden = false;
    const reader = new FileReader();
    reader.onload = () => {
      const result = parseCsvSimulation(String(reader.result || ""), file.name);
      if (simProgress) simProgress.hidden = true;
      if (!result.count) {
        showSimError("Não encontramos lojas nesse CSV. Use o Relatório Mensal da Shopee, com as colunas de loja e comissão.");
        return;
      }
      if (simDrop) simDrop.hidden = true;
      if (simResult) simResult.hidden = false;
      const title = $("#sim-title");
      if (title) title.textContent = `${result.count.toLocaleString("pt-BR")} notas, a partir de ${file.name}`;
      const stats = $("#sim-stats");
      if (stats) {
        stats.innerHTML = [
          ["Notas", result.count.toLocaleString("pt-BR")],
          ["Pedidos no CSV", result.orders.toLocaleString("pt-BR")],
          ["Valor encontrado", currency.format(result.total)],
        ].map(([label, value]) => `<div><span>${label}</span><b>${value}</b></div>`).join("");
      }
      const table = $("#sim-table");
      if (table) {
        table.innerHTML = `<header><span>ID da loja</span><span>Nome da loja</span><span>Pedidos</span><span>Valor</span></header>${result.rows.map((row) => `<div class="sim-row"><span>${escapeHtml(row.shopId)}</span><strong>${escapeHtml(row.client)}</strong><span>${row.orders}</span><span>${currency.format(row.value)}</span></div>`).join("")}<p class="city-status">Prévia local. ${Math.max(result.count - result.rows.length, 0).toLocaleString("pt-BR")} lojas adicionais ficam de fora desta amostra. ${result.duplicates.toLocaleString("pt-BR")} linhas repetidas foram agrupadas.</p>`;
      }
    };
    reader.onerror = () => showSimError("Não foi possível ler o arquivo neste navegador.");
    reader.readAsText(file, "utf-8");
  }
  csvInput?.addEventListener("change", () => { const file = csvInput.files?.[0]; if (file) readCsv(file); }, { signal });
  simDrop?.addEventListener("dragover", (event) => event.preventDefault(), { signal });
  simDrop?.addEventListener("drop", (event) => {
    event.preventDefault();
    const file = event.dataTransfer?.files?.[0];
    if (file) readCsv(file);
  }, { signal });

  function readCookies(): MarketingPixelConsent | null {
    const saved = localStorage.getItem(cookieKey);
    if (!saved) return null;
    if (saved === "accepted") return allCookies;
    if (saved === "rejected") return noCookies;
    try {
      const parsed = JSON.parse(saved) as Partial<MarketingPixelConsent>;
      return { analytics: Boolean(parsed.analytics), marketing: Boolean(parsed.marketing), experience: Boolean(parsed.experience) };
    } catch {
      return null;
    }
  }
  function saveCookies(preferences: MarketingPixelConsent) {
    localStorage.setItem(cookieKey, JSON.stringify(preferences));
    updateMarketingConsent(preferences);
    const banner = $("#cookie");
    const dialog = $("#cookie-dialog");
    if (banner) banner.hidden = true;
    if (dialog) dialog.hidden = true;
  }
  const savedCookies = readCookies();
  if (savedCookies) updateMarketingConsent(savedCookies);
  else {
    const banner = $("#cookie");
    if (banner) banner.hidden = false;
  }
  $("#cookie-accept")?.addEventListener("click", () => saveCookies(allCookies), { signal });
  $("#cookie-reject")?.addEventListener("click", () => saveCookies(noCookies), { signal });
  $("#cookie-settings")?.addEventListener("click", () => {
    const dialog = $("#cookie-dialog");
    const current = readCookies() ?? allCookies;
    const analytics = $<HTMLInputElement>("#pref-analytics");
    const experience = $<HTMLInputElement>("#pref-experience");
    const marketing = $<HTMLInputElement>("#pref-marketing");
    if (analytics) analytics.checked = current.analytics;
    if (experience) experience.checked = current.experience;
    if (marketing) marketing.checked = current.marketing;
    if (dialog) dialog.hidden = false;
  }, { signal });
  $("#cookie-open")?.addEventListener("click", () => $("#cookie-settings")?.click(), { signal });
  $("#cookie-save")?.addEventListener("click", () => saveCookies({
    analytics: $<HTMLInputElement>("#pref-analytics")?.checked ?? false,
    experience: $<HTMLInputElement>("#pref-experience")?.checked ?? false,
    marketing: $<HTMLInputElement>("#pref-marketing")?.checked ?? false,
  }), { signal });

  const faqButtons = $$(".qa button");
  faqButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const item = button.parentElement;
      if (!item) return;
      const open = item.classList.contains("open");
      $$(".qa").forEach((entry) => {
        entry.classList.remove("open");
        $("button", entry)?.setAttribute("aria-expanded", "false");
      });
      if (!open) {
        item.classList.add("open");
        button.setAttribute("aria-expanded", "true");
      }
    }, { signal });
  });

  const dots = $$(".dots a");
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      dots.forEach((dot) => dot.classList.toggle("on", dot.dataset.spy === entry.target.id));
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  observers.push(spy);
  dots.forEach((dot) => {
    const section = root.querySelector(`#${dot.dataset.spy}`);
    if (section) spy.observe(section);
  });

  const schema = document.createElement("script");
  schema.type = "application/ld+json";
  schema.text = JSON.stringify({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: "Nex Notas",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        url: "https://nexnotas.com.br/",
        description: "Emissão de NFS-e em lote para afiliados da Shopee, com prévia, bloqueio de duplicidade e envio por e-mail.",
        offers: $$(".plan").map((plan) => ({
          "@type": "Offer",
          name: $(".name", plan)?.textContent?.trim(),
          price: $(".n", plan)?.dataset.m || "0",
          priceCurrency: "BRL",
        })),
      },
      {
        "@type": "FAQPage",
        mainEntity: $$(".qa").map((item) => ({
          "@type": "Question",
          name: Array.from($("button", item)?.childNodes || []).filter((node) => node.nodeType === Node.TEXT_NODE).map((node) => node.textContent || "").join("").trim(),
          acceptedAnswer: { "@type": "Answer", text: $("p", item)?.textContent?.trim() || "" },
        })),
      },
    ],
  });
  document.head.appendChild(schema);

  mountDemo();

  function mountDemo() {
    const box = $("#demoBox");
    if (!box) return;
    const vpD = $("#vpDesk");
    const vpM = $("#vpMob");
    const chapsEl = $("#chaps");
    const hint = $("#demoHint");
    if (!vpD || !vpM || !chapsEl || !hint) return;
    const stage = box;
    const deskView = vpD;
    const mobView = vpM;
    const chapterHost = chapsEl;
    const hintEl = hint;
    const curD = $(".cursor", deskView);
    const touch = $(".touch", mobView);
    const push = $(".push", vpM);
    let dev: "desk" | "mob" = "desk";
    let runId = 0;
    let visible = false;
    let free = false;
    let chap = 0;
    const frames: Partial<Record<"desk" | "mob", Frame>> = {};
    const chapters = {
      desk: [
        { t: "Visão do mês", d: "Notas emitidas, valor, pendentes e rejeitadas na primeira tela." },
        { t: "Importar e emitir o lote", d: "Do CSV da Shopee a 598 notas, com duplicadas puladas." },
        { t: "Rejeição com motivo", d: "Filtre as rejeitadas, veja o motivo e reprocesse." },
        { t: "Lotes sem duplicidade", d: "Histórico por competência, com PDF e XML de tudo." },
        { t: "Nota avulsa com espelho", d: "Qualquer tomador, com prévia ao vivo." },
        { t: "Plano e certificado", d: "Uso do mês, plano ideal e aviso antes do A1 vencer." },
      ],
      mob: [
        { t: "Tudo que importa, sem rolar", d: "Notas, valor, plano, pendentes e o lote na primeira tela." },
        { t: "Emita do celular", d: "Escolha o relatório, confira a prévia e emita 598 notas." },
        { t: "Rejeitou? Resolva na hora", d: "O motivo da SEFIN em português e o botão de reprocessar." },
        { t: "Mande a nota para o vendedor", d: "DANFSe, XML e compartilhar por WhatsApp ou e-mail." },
        { t: "Nota avulsa em um toque", d: "Tomador preenchido e emissão em um toque." },
        { t: "Menu do seu jeito", d: "O dock mostra as telas que você mais usa." },
      ],
    };

    function renderChaps() {
      chapterHost.innerHTML = chapters[dev].map((chapter, index) => `<button type="button" class="chap" role="tab" aria-selected="${index === chap}" data-i="${index}"><span class="n">${index + 1}</span><span><b>${chapter.t}</b><small>${chapter.d}</small></span><i class="prog"></i></button>`).join("");
      $$(".chap", chapterHost).forEach((button) => button.addEventListener("click", () => { setFree(false); void start(Number(button.dataset.i)); }));
    }
    function setChap(index: number) {
      chap = index;
      $$(".chap", chapterHost).forEach((button, key) => {
        button.setAttribute("aria-selected", key === index ? "true" : "false");
        const prog = $(".prog", button);
        if (prog) prog.style.width = "0";
      });
    }
    function prog(progress: number) {
      const button = $$(".chap", chapterHost)[chap];
      const bar = button ? $(".prog", button) : null;
      if (bar) bar.style.width = `${Math.min(100, progress * 100)}%`;
    }
    function fit(device: "desk" | "mob") {
      const frame = frames[device];
      if (!frame) return;
      const viewport = device === "desk" ? deskView : mobView;
      const width = device === "desk" ? 1440 : 390;
      const scale = viewport.clientWidth / width;
      frame.el.style.transform = `scale(${scale})`;
      frame.k = scale;
    }
    async function load(device: "desk" | "mob") {
      const existing = frames[device];
      if (existing) return existing.ready;
      const viewport = device === "desk" ? deskView : mobView;
      const el = document.createElement("iframe");
      const frame: Frame = { el, k: 1, ready: Promise.resolve() };
      el.title = device === "desk" ? "Demonstração da Nex Notas no computador" : "Demonstração do app Nex Notas no celular";
      el.tabIndex = -1;
      el.width = device === "desk" ? "1440" : "390";
      el.height = device === "desk" ? "860" : "844";
      el.style.width = `${el.width}px`;
      el.style.height = `${el.height}px`;
      const response = await fetch(device === "desk" ? "/landing/demo-desk.html" : "/landing/demo-mob.html");
      let html = await response.text();
      const theme = docEl.getAttribute("data-theme") || "light";
      try {
        localStorage.setItem("nx-theme", theme);
        localStorage.setItem("nx-theme-m", theme);
        localStorage.removeItem("nx-dock");
      } catch { /* demonstração segue sem preferência salva */ }
      html = device === "mob"
        ? html.replace("</head>", "<style>:root{--sat:50px!important;--sab:20px!important}.toast:not(.show){opacity:0!important;visibility:hidden!important}</style></head>")
        : html.replace("</head>", "<style>html{scrollbar-width:thin}</style></head>");
      frame.ready = new Promise((resolve) => {
        el.addEventListener("load", () => {
          window.setTimeout(() => { viewport.classList.add("ready"); syncTheme(); hookUser(device); resolve(); }, device === "desk" ? 700 : 400);
        });
      });
      frames[device] = frame;
      viewport.insertBefore(el, viewport.firstChild);
      el.srcdoc = html;
      fit(device);
      return frame.ready;
    }
    function demoWindow(device: "desk" | "mob") {
      return frames[device]?.el.contentWindow ?? null;
    }
    function demoDocument(device: "desk" | "mob") {
      return frames[device]?.el.contentDocument ?? null;
    }
    function syncTheme() {
      const theme = docEl.getAttribute("data-theme");
      const desk = demoDocument("desk");
      const button = desk?.querySelector<HTMLElement>(`#themeSeg [data-pref="${theme}"]`);
      if (button && desk?.documentElement.getAttribute("data-theme") !== theme) button.click();
      const mobile = demoDocument("mob");
      if (mobile && theme) {
        mobile.documentElement.setAttribute("data-theme", theme);
        mobile.documentElement.setAttribute("data-pref", theme);
      }
    }
    const themeObserver = new MutationObserver(syncTheme);
    themeObserver.observe(docEl, { attributes: true, attributeFilter: ["data-theme"] });
    observers.push(themeObserver);
    function hookUser(device: "desk" | "mob") {
      demoDocument(device)?.addEventListener("pointerdown", (event) => {
        if (event.isTrusted && !free) setFree(true);
      }, true);
    }
    function setFree(on: boolean) {
      free = on;
      stage.classList.toggle("free", on);
      if (on) {
        runId += 1;
        hintEl.innerHTML = '<span>Você está no controle — navegue à vontade.</span><button type="button" id="resume">Retomar tour guiado</button>';
        $("#resume")?.addEventListener("click", () => { setFree(false); void start(chap); });
      } else hintEl.innerHTML = "<span>Clique em qualquer lugar da demo para explorar por conta própria.</span>";
    }
    $$(".shield", stage).forEach((shield) => shield.addEventListener("click", () => setFree(true), { signal }));

    async function runChapter(id: number, device: "desk" | "mob", index: number) {
      const win = () => demoWindow(device);
      const doc = () => demoDocument(device);
      const sleep = (ms: number) => new Promise<void>((resolve, reject) => {
        const started = Date.now();
        const wait = () => {
          if (disposed || id !== runId) { reject(new Error("stop")); return; }
          if (!visible || document.hidden) { window.setTimeout(wait, 300); return; }
          if (Date.now() - started >= ms) resolve();
          else window.setTimeout(wait, Math.min(120, ms));
        };
        wait();
      });
      const query = (selector: string) => {
        const documentNode = doc();
        if (!documentNode) return null;
        const all = Array.from(documentNode.querySelectorAll<HTMLElement>(selector));
        const limit = device === "desk" ? 1440 : 390;
        for (let cursor = all.length - 1; cursor >= 0; cursor -= 1) {
          const rect = all[cursor].getBoundingClientRect();
          if (rect.width && rect.height && rect.left > -5 && rect.left < limit) return all[cursor];
        }
        return null;
      };
      const text = (value: string) => {
        const documentNode = doc();
        if (!documentNode) return null;
        const walker = documentNode.createTreeWalker(documentNode.body, NodeFilter.SHOW_TEXT);
        let node = walker.nextNode();
        const limit = device === "desk" ? 1440 : 390;
        while (node) {
          if ((node.nodeValue || "").includes(value) && node.parentElement) {
            const element = node.parentElement;
            const rect = element.getBoundingClientRect();
            if (rect.width && rect.height && rect.left > -5 && rect.left < limit && getComputedStyle(element).visibility !== "hidden") return element;
          }
          node = walker.nextNode();
        }
        return null;
      };
      const point = (element: HTMLElement) => {
        const rect = element.getBoundingClientRect();
        const scale = frames[device]?.k || 1;
        return { x: (rect.left + rect.width * 0.4) * scale, y: (rect.top + rect.height * 0.5) * scale };
      };
      const move = async (element: HTMLElement | null) => {
        if (!element || !curD) return;
        const current = win();
        const rect = element.getBoundingClientRect();
        if (device === "desk" && current && (rect.top < 60 || rect.bottom > 820)) {
          current.scrollTo({ top: Math.max(0, current.scrollY + rect.top - 300), behavior: reduce ? "auto" : "smooth" });
          await sleep(reduce ? 0 : 700);
        }
        const position = point(element);
        curD.style.left = `${position.x}px`;
        curD.style.top = `${position.y}px`;
        await sleep(reduce ? 0 : 500);
      };
      const tap = async (element: HTMLElement | null) => {
        if (!element) return;
        if (device === "desk") {
          await move(element);
          curD?.classList.remove("click");
          void curD?.offsetWidth;
          curD?.classList.add("click");
        } else if (touch) {
          const position = point(element);
          touch.classList.add("on");
          touch.style.left = `${position.x}px`;
          touch.style.top = `${position.y}px`;
          await sleep(reduce ? 0 : 250);
        }
        if (id !== runId) throw new Error("stop");
        element.click();
        await sleep(reduce ? 0 : 400);
      };
      const sequences: Array<Array<() => Promise<void>>> = device === "desk"
        ? [
            [async () => { await tap(query('.side a[href="#/inicio"]')); await move(text("Notas emitidas por competência")); }],
            [async () => { await tap(query('.side a[href="#/importar"]')); await tap(text("Usar relatório de exemplo")); await tap(text("Continuar com 598 notas")); }],
            [async () => { await tap(query('.side a[href="#/notas"]')); await tap(query('[data-f="err"]')); await tap(query("tr[data-note] .nm")); }],
            [async () => { await tap(query('.side a[href="#/lotes"]')); await move(text("Duplicadas evitadas")); }],
            [async () => { await tap(query('.side a[href="#/nova"]')); await tap(query('[data-tom="shopee"]')); }],
            [async () => { await tap(query('.side a[href="#/assinatura"]')); await tap(query('.side a[href="#/certificado"]')); }],
          ]
        : [
            [async () => { await tap(query('#dock a[data-k="inicio"]')); }],
            [async () => { await tap(query('#dock a[data-k="importar"]')); await tap(query('[data-imp="2"]')); }],
            [async () => { await tap(query('#dock a[data-k="notas"]')); await tap(query('[data-fs="err"]')); }],
            [async () => { await tap(query('[data-go="notas/2"]')); }],
            [async () => { await tap(query('#dock a[data-k="inicio"]')); await tap(query('[data-sheet="avulsa"]')); }],
            [async () => { await tap(query('[data-go="ajustes"]')); }],
          ];
      for (const action of sequences[index] || []) await action();
      prog(1);
    }

    async function start(index: number) {
      const id = ++runId;
      setChap(index);
      try { await load(dev); } catch { hintEl.textContent = "Não foi possível abrir a demonstração agora."; return; }
      if (free || disposed) return;
      try {
        prog(0.08);
        await runChapter(id, dev, index);
        await new Promise((resolve) => window.setTimeout(resolve, reduce ? 0 : 700));
        if (id === runId && !free && !disposed) void start((index + 1) % chapters[dev].length);
      } catch {
        if (disposed || free) return;
      }
    }

    const toggles = $$<HTMLButtonElement>(".dev-tog button");
    const knob = $(".dev-tog .knob");
    function placeKnob() {
      const active = toggles.find((button) => button.dataset.dev === dev);
      if (!active || !knob) return;
      knob.style.width = `${active.offsetWidth}px`;
      knob.style.transform = `translateX(${active.offsetLeft - 4}px)`;
    }
    function setDev(device: "desk" | "mob", go: boolean) {
      dev = device;
      stage.setAttribute("data-dev", device);
      toggles.forEach((button) => button.setAttribute("aria-selected", button.dataset.dev === device ? "true" : "false"));
      placeKnob();
      renderChaps();
      setFree(false);
      requestAnimationFrame(() => { fit("desk"); fit("mob"); });
      if (go) void start(0);
      else runId += 1;
    }
    toggles.forEach((button) => button.addEventListener("click", () => setDev(button.dataset.dev === "mob" ? "mob" : "desk", true), { signal }));
    setDev(window.innerWidth <= 820 ? "mob" : "desk", false);
    window.addEventListener("resize", () => { fit("desk"); fit("mob"); placeKnob(); }, { signal });
    let started = false;
    const seen = new IntersectionObserver((entries) => {
      visible = Boolean(entries[0]?.isIntersecting);
      if (visible && !started) {
        started = true;
        void start(chap);
      }
    }, { threshold: 0.25 });
    observers.push(seen);
    seen.observe(stage);
  }

  return () => {
    disposed = true;
    ac.abort();
    observers.forEach((observer) => observer.disconnect());
    schema.remove();
    document.body.style.overflow = "";
    if (mqDark.removeEventListener) mqDark.removeEventListener("change", onSystemTheme);
    else mqDark.removeListener(onSystemTheme);
  };
}
