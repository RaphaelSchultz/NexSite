import { useEffect, useState } from "react";
import { BadgeCheck, BarChart3, Gauge, ShieldCheck, type LucideIcon } from "lucide-react";
import { updateMarketingConsent, type MarketingPixelConsent } from "../lib/marketing-pixels";
import { cn } from "../lib/utils";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";

type CookiePreferences = MarketingPixelConsent;

const cookieStorageKey = "nexnotas_tracking_consent";
const openPreferencesEvent = "nexnotas:open-cookie-preferences";
const allCookiePreferences: CookiePreferences = { analytics: true, marketing: true, experience: true };
const noOptionalCookiePreferences: CookiePreferences = { analytics: false, marketing: false, experience: false };

type StoredCookiePreferences = CookiePreferences & {
  expiresAt?: string;
};

function readCookiePreferences(): CookiePreferences | null {
  const saved = localStorage.getItem(cookieStorageKey);
  if (!saved) return null;
  if (saved === "accepted") return allCookiePreferences;
  if (saved === "rejected") return noOptionalCookiePreferences;

  try {
    const parsed = JSON.parse(saved) as Partial<StoredCookiePreferences>;
    if (parsed.expiresAt && Date.parse(parsed.expiresAt) <= Date.now()) {
      localStorage.removeItem(cookieStorageKey);
      return null;
    }
    if (typeof parsed.analytics !== "boolean" || typeof parsed.marketing !== "boolean" || typeof parsed.experience !== "boolean") return null;
    return {
      analytics: parsed.analytics,
      marketing: parsed.marketing,
      experience: parsed.experience,
    };
  } catch {
    return null;
  }
}

export function openCookiePreferences() {
  window.dispatchEvent(new Event(openPreferencesEvent));
}

export function CookieConsent() {
  const [preferences, setPreferences] = useState<CookiePreferences | null>(() => readCookiePreferences());
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [draft, setDraft] = useState<CookiePreferences>(() => readCookiePreferences() ?? allCookiePreferences);

  useEffect(() => {
    if (preferences) updateMarketingConsent(preferences);
  }, [preferences]);

  useEffect(() => {
    const openSettings = () => {
      setDraft(preferences ?? allCookiePreferences);
      setSettingsOpen(true);
    };
    window.addEventListener(openPreferencesEvent, openSettings);
    return () => window.removeEventListener(openPreferencesEvent, openSettings);
  }, [preferences]);

  useEffect(() => {
    const syncPreferences = (event: StorageEvent) => {
      if (event.key !== cookieStorageKey) return;
      const next = readCookiePreferences();
      setPreferences(next);
      setDraft(next ?? allCookiePreferences);
    };
    window.addEventListener("storage", syncPreferences);
    return () => window.removeEventListener("storage", syncPreferences);
  }, []);

  const savePreferences = (next: CookiePreferences) => {
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    localStorage.setItem(cookieStorageKey, JSON.stringify({ ...next, expiresAt: expiresAt.toISOString() }));
    setPreferences(next);
    setDraft(next);
    setSettingsOpen(false);
  };

  const openSettings = () => {
    setDraft(preferences ?? allCookiePreferences);
    setSettingsOpen(true);
  };

  return (
    <>
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
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
              checked={draft.analytics}
              onChange={(analytics) => setDraft((current) => ({ ...current, analytics }))}
            />
            <CookiePreferenceRow
              icon={Gauge}
              title="Cookies de experiência"
              description="Ajudam a identificar travamentos, cliques e pontos de fricção para melhorar a experiência da página."
              details="Tecnologia: Microsoft Clarity. Dados: interações, mapas de calor e gravações de sessão sem campos sensíveis."
              checked={draft.experience}
              onChange={(experience) => setDraft((current) => ({ ...current, experience }))}
            />
            <CookiePreferenceRow
              icon={BadgeCheck}
              title="Cookies de marketing"
              description="Permitem medir campanhas, otimizar anúncios e entender quais canais geram contratação."
              details="Tecnologias: Meta Pixel, Google Ads e, futuramente, TikTok Pixel. Finalidade: conversões, remarketing e otimização de mídia."
              checked={draft.marketing}
              onChange={(marketing) => setDraft((current) => ({ ...current, marketing }))}
            />

            <div className="rounded-[14px] bg-white/[.06] p-4 text-sm leading-6 text-[#c2cadf]">
              Você pode alterar suas preferências a qualquer momento no rodapé da página. Dados sensíveis não devem ser enviados para ferramentas de análise e marketing.
            </div>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Button className="rounded-[10px] bg-[#4f56f6] text-white hover:bg-[#454cf0]" onClick={() => savePreferences(allCookiePreferences)}>Aceitar todos</Button>
            <Button variant="outline" className="rounded-[10px] border-white/20 bg-transparent text-white hover:border-white/35 hover:bg-white/10 hover:text-white" onClick={() => savePreferences(draft)}>Salvar preferências</Button>
          </div>
        </DialogContent>
      </Dialog>

      {preferences === null && !settingsOpen ? (
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
              <Button className="min-w-[170px] rounded-[10px] bg-[#4f56f6] text-white hover:bg-[#454cf0]" onClick={() => savePreferences(allCookiePreferences)}>Aceitar todos</Button>
            </div>
            <p className="mt-4 text-[11px] leading-5 text-[#7c879a]">
              Você pode alterar suas preferências em{" "}
              <button type="button" className="font-semibold text-[#4f56f6] underline underline-offset-2 hover:text-[#454cf0]" onClick={openSettings}>Personalizar</button>.
            </p>
          </div>
        </div>
      ) : null}
    </>
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
