import {
  ArrowRight,
  BadgeCheck,
  CircleDollarSign,
  FileCheck2,
  Megaphone,
  Repeat2,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { openCookiePreferences } from "../components/cookie-consent";

const affiliateUrl = "https://nexnotas.com.br/indicacoes";

const conversionPoints = [
  "Obrigação fiscal recorrente para afiliados Shopee PJ",
  "Público fácil de encontrar em grupos, mentorias e comunidades",
  "Assinatura mensal ou anual com comissão recorrente",
  "Ticket acessível e garantia de 7 dias para o cliente",
];

const rules = [
  "A comissão é de 20% recorrente sobre assinaturas válidas, enquanto o cliente indicado permanecer ativo e adimplente.",
  "O cadastro, o link de divulgação, a atribuição da venda e os pagamentos são gerenciados pela Cakto.",
  "Não faça spam, não prometa resultado financeiro e não use comunicação que pareça oficial da Shopee.",
  "Não prometa isenção de impostos. O Nex Notas organiza a emissão de NFS-e para a Comissão Extra, mas não substitui orientação contábil.",
  "Use uma comunicação clara: o afiliado PJ precisa emitir notas por vendedor, e o Nex Notas reduz o retrabalho desse processo.",
];

export function ReferralsPage() {
  return (
    <div className="min-h-screen bg-[#fbfcff] text-[#061747]">
      <header className="sticky top-0 z-30 border-b border-[#eef0f6] bg-white/92 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between gap-6 px-5">
          <a href="/" aria-label="Voltar para a página inicial da Nex Notas">
            <img src="/logo-text-roxo.png" alt="Nex Notas" className="h-auto w-[145px]" />
          </a>
          <nav className="hidden items-center gap-7 text-sm font-medium text-[#5f6b7e] md:flex">
            <a className="transition hover:text-[#4f56f6]" href="/">Início</a>
            <a className="transition hover:text-[#4f56f6]" href="/#planos">Planos</a>
            <a className="transition hover:text-[#4f56f6]" href="/#faq">FAQ</a>
          </nav>
          <a href="https://app.nexnotas.com.br/entrar">
            <Button variant="ghost" className="rounded-[10px] text-[#344054] hover:bg-[#f7f8ff] hover:text-[#061747]">Entrar</Button>
          </a>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden border-b border-[#eef0f6]">
          <div className="absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(circle_at_50%_0%,rgba(79,86,246,.16),transparent_48%)]" />
          <div className="relative mx-auto grid max-w-6xl gap-12 px-5 py-20 lg:grid-cols-[1.08fr_.92fr] lg:items-center lg:py-24">
            <div className="mx-auto max-w-3xl text-center lg:mx-0 lg:text-left">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#dfe3ff] bg-white px-3 py-1.5 text-xs font-semibold text-[#4f56f6] shadow-[0_10px_28px_rgba(6,23,71,.04)]">
                <Sparkles className="h-3.5 w-3.5" />
                Programa de Afiliados Nex Notas
              </span>
              <h1 className="mt-7 font-heading text-[42px] font-semibold leading-[1.06] tracking-tight text-[#061747] sm:text-[58px] lg:text-[68px]">
                Indique o Nex Notas e ganhe <span className="text-[#4f56f6]">20% recorrente</span>
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-[#667085] lg:mx-0">
                Ajude afiliados Shopee PJ a resolver a emissão de notas da Comissão Extra e receba comissão enquanto o cliente indicado mantiver a assinatura ativa.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
                <a href={affiliateUrl} target="_blank" rel="noreferrer">
                  <Button size="lg" className="gap-2 rounded-[10px] bg-[#4f56f6] px-6 text-white shadow-[0_16px_36px_rgba(79,86,246,.24)] hover:bg-[#454cf0]">
                    Quero me afiliar <ArrowRight className="h-4 w-4" />
                  </Button>
                </a>
                <a href="#regras">
                  <Button size="lg" variant="outline" className="rounded-[10px] border-[#dfe3ea] bg-white text-[#344054] hover:bg-[#f7f8ff]">
                    Ver regras
                  </Button>
                </a>
              </div>
              <p className="mt-5 text-sm leading-6 text-[#7a8496]">
                Cadastro, link de indicação e pagamentos feitos pela Cakto.
              </p>
            </div>

            <div className="relative mx-auto w-full max-w-[470px]">
              <div className="absolute -inset-6 rounded-[32px] bg-[#4f56f6]/10 blur-3xl" />
              <div className="relative overflow-hidden rounded-[24px] border border-[#dfe3ff] bg-white p-5 shadow-[0_30px_80px_rgba(6,23,71,.12)]">
                <div className="rounded-[18px] bg-[#061747] p-5 text-white">
                  <div className="flex items-center justify-between gap-3">
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-[#c9d0ff]">Comissão recorrente</span>
                    <Repeat2 className="h-5 w-5 text-[#aeb6ff]" />
                  </div>
                  <strong className="mt-8 block font-heading text-5xl font-semibold">20%</strong>
                  <p className="mt-3 text-sm leading-6 text-white/72">
                    Sobre assinaturas geradas pelo seu link, conforme as regras da Cakto.
                  </p>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <Metric label="Modelo" value="Mensal ou anual" />
                  <Metric label="Produto" value="SaaS fiscal" />
                  <Metric label="Dor" value="Recorrente" />
                  <Metric label="Garantia" value="7 dias" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-20">
          <div className="mx-auto max-w-6xl px-5">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-xs font-semibold uppercase tracking-[.12em] text-[#5961e9]">Como funciona</p>
              <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight text-[#061747] sm:text-[40px]">Três passos para começar a indicar</h2>
            </div>
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              <StepCard icon={Megaphone} title="Divulgue para afiliados Shopee" text="Fale com quem vende como PJ e precisa emitir notas da Comissão Extra todo mês." />
              <StepCard icon={Users} title="Use seu link da Cakto" text="Cadastre-se no programa, pegue seu link exclusivo e acompanhe as indicações pela plataforma." />
              <StepCard icon={CircleDollarSign} title="Receba de forma recorrente" text="Quando o indicado assina e permanece ativo, você segue participando da recorrência." />
            </div>
          </div>
        </section>

        <section className="bg-[#f6f8ff] py-20">
          <div className="mx-auto grid max-w-6xl gap-10 px-5 lg:grid-cols-[.88fr_1.12fr] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[.12em] text-[#5961e9]">Por que converte</p>
              <h2 className="mt-3 font-heading text-3xl font-semibold leading-tight tracking-tight text-[#061747] sm:text-[42px]">O afiliado Shopee PJ tem uma dor urgente e recorrente.</h2>
              <p className="mt-5 text-base leading-8 text-[#667085]">
                Desde agosto de 2026, a operação com Comissão Extra exige mais organização fiscal. O Nex Notas transforma um relatório grande da Shopee em um lote pronto para revisão e emissão, reduzindo digitação manual e risco de duplicidade.
              </p>
            </div>
            <div className="grid gap-3">
              {conversionPoints.map((point) => (
                <div key={point} className="flex items-start gap-3 rounded-[16px] border border-[#e2e6f3] bg-white p-4 shadow-[0_12px_28px_rgba(6,23,71,.035)]">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[10px] bg-[#eef0ff] text-[#4f56f6]"><BadgeCheck className="h-4 w-4" /></span>
                  <strong className="text-sm leading-6 text-[#243150]">{point}</strong>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="regras" className="bg-white py-20">
          <div className="mx-auto max-w-5xl px-5">
            <div className="rounded-[22px] border border-[#e2e6f3] bg-white p-6 shadow-[0_18px_50px_rgba(6,23,71,.06)] sm:p-8">
              <div className="flex flex-col gap-4 border-b border-[#edf0f6] pb-6 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[.12em] text-[#5961e9]">Regras rápidas</p>
                  <h2 className="mt-2 font-heading text-3xl font-semibold tracking-tight text-[#061747]">Indique com clareza e segurança</h2>
                </div>
                <span className="inline-flex items-center gap-2 rounded-full bg-[#eef0ff] px-3 py-2 text-sm font-semibold text-[#4f56f6]">
                  <ShieldCheck className="h-4 w-4" />
                  20% recorrente
                </span>
              </div>
              <div className="mt-6 grid gap-4">
                {rules.map((rule) => (
                  <div key={rule} className="flex gap-3 text-sm leading-7 text-[#5f6b7e]">
                    <FileCheck2 className="mt-1 h-4 w-4 shrink-0 text-[#4f56f6]" />
                    <span>{rule}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#061747] py-16 text-white">
          <div className="mx-auto flex max-w-5xl flex-col gap-6 px-5 text-center sm:items-center">
            <p className="text-xs font-semibold uppercase tracking-[.12em] text-[#aeb6ff]">Convite aberto</p>
            <h2 className="font-heading text-3xl font-semibold leading-tight sm:text-[42px]">Entre no programa de afiliados da Nex Notas pela Cakto.</h2>
            <p className="max-w-2xl text-base leading-8 text-white/70">
              Pegue seu link, divulgue para o público certo e acompanhe suas comissões recorrentes direto pela plataforma.
            </p>
            <a href={affiliateUrl} target="_blank" rel="noreferrer">
              <Button size="lg" className="gap-2 rounded-[10px] bg-white px-6 text-[#4f56f6] hover:bg-[#f4f5ff]">
                Quero me afiliar <ArrowRight className="h-4 w-4" />
              </Button>
            </a>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#eef0f6] bg-white py-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 text-sm text-[#7a8496] sm:flex-row sm:items-center sm:justify-between">
          <span>© 2026 Nex Notas. Todos os direitos reservados.</span>
          <div className="flex gap-5">
            <a className="hover:text-[#4f56f6]" href="/">Início</a>
            <a className="hover:text-[#4f56f6]" href="/#planos">Planos</a>
            <button type="button" className="hover:text-[#4f56f6]" onClick={openCookiePreferences}>Cookies</button>
            <a className="hover:text-[#4f56f6]" href="https://app.nexnotas.com.br/entrar">Entrar</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function StepCard({ icon: Icon, title, text }: { icon: typeof Megaphone; title: string; text: string }) {
  return (
    <article className="rounded-[20px] border border-[#e2e6f3] bg-white p-6 shadow-[0_12px_30px_rgba(6,23,71,.04)]">
      <span className="grid h-11 w-11 place-items-center rounded-[13px] bg-[#eef0ff] text-[#4f56f6]">
        <Icon className="h-5 w-5" />
      </span>
      <h3 className="mt-5 font-heading text-lg font-semibold text-[#061747]">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-[#667085]">{text}</p>
    </article>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[14px] border border-[#e6e9f4] bg-[#fbfcff] p-4">
      <span className="block text-xs font-semibold uppercase tracking-[.08em] text-[#7a8496]">{label}</span>
      <strong className="mt-2 block text-sm text-[#061747]">{value}</strong>
    </div>
  );
}
