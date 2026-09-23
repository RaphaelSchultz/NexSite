import { Link, useLocation, useParams } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Building2,
  Calculator,
  CheckCircle2,
  CircleHelp,
  CreditCard,
  FileCheck2,
  FileSpreadsheet,
  KeyRound,
  Mail,
  MapPinned,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UploadCloud,
  Users,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { useMemo, useState, type CSSProperties } from "react";
import { Button, buttonVariants } from "../../components/ui/button";
import { openCookiePreferences } from "../../components/cookie-consent";
import { Input } from "../../components/ui/input";
import { cn } from "../../lib/utils";

type HelpCategory =
  | "Primeiros passos"
  | "Certificado A1"
  | "Configuração fiscal"
  | "Importação Shopee"
  | "Nota avulsa"
  | "Tomadores"
  | "Emissões"
  | "Cancelamentos"
  | "Planos"
  | "Programa de afiliados"
  | "Erros fiscais";

type HelpGuide = {
  slug: string;
  title: string;
  summary: string;
  category: HelpCategory;
  minutes: number;
  popular?: boolean;
  keywords: string[];
  steps: string[];
  quickFixes: string[];
  relatedErrors?: string[];
  relatedLinks?: string[];
};

type FiscalError = {
  code: string;
  title: string;
  meaning: string;
  action: string;
  keywords: string[];
};

type FiscalErrorDetail = {
  causes: string[];
  steps: string[];
  avoid: string[];
  relatedLinks?: string[];
};

const appUrl = "https://app.nexnotas.com.br/entrar";
const affiliateUrl = "https://nexnotas.com.br/indicacoes";

const categoryIcons: Record<HelpCategory, LucideIcon> = {
  "Primeiros passos": Building2,
  "Certificado A1": KeyRound,
  "Configuração fiscal": MapPinned,
  "Importação Shopee": FileSpreadsheet,
  "Nota avulsa": FileCheck2,
  Tomadores: Users,
  Emissões: BadgeCheck,
  Cancelamentos: RotateCcw,
  Planos: CreditCard,
  "Programa de afiliados": Calculator,
  "Erros fiscais": AlertTriangle,
};

const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

const affiliatePlans = [
  { id: "basic", name: "Basic", price: 57 },
  { id: "profissional", name: "Profissional", price: 97 },
  { id: "afiliado-expert", name: "Afiliado Expert", price: 147 },
  { id: "top-afiliado", name: "Top Afiliado", price: 227 },
];

const guides: HelpGuide[] = [
  {
    slug: "cadastrar-empresa",
    title: "Como cadastrar sua empresa",
    summary: "Prepare o CNPJ, confirme os dados cadastrais e deixe a empresa pronta para configurar a emissão.",
    category: "Primeiros passos",
    minutes: 4,
    popular: true,
    keywords: ["empresa", "cnpj", "brasilapi", "onboarding", "cadastro", "endereco", "municipio"],
    steps: [
      "Entre no app e siga para o cadastro da empresa na configuração inicial ou no menu Empresa.",
      "Informe um CNPJ válido e aguarde a consulta dos dados cadastrais.",
      "Revise razão social, município, UF, CEP, logradouro, número e bairro.",
      "Complete manualmente qualquer campo de endereço que não tenha sido preenchido pela consulta.",
      "Salve a empresa e siga para certificado A1, segurança e plano.",
    ],
    quickFixes: [
      "Se o CNPJ não for encontrado, confirme os 14 dígitos e tente novamente.",
      "Se a consulta ficar indisponível, aguarde alguns minutos; o cadastro pode ser concluído quando a consulta voltar.",
      "Se o endereço estiver incompleto, preencha antes de tentar emitir NFS-e.",
    ],
  },
  {
    slug: "certificado-a1",
    title: "Como enviar ou trocar o certificado A1",
    summary: "Use um arquivo A1 válido para assinar as NFS-e da empresa com segurança.",
    category: "Certificado A1",
    minutes: 5,
    popular: true,
    keywords: ["certificado", "a1", "pfx", "p12", "senha", "vencido", "renovar", "upload"],
    steps: [
      "Acesse Configurações > Certificado ou continue pela etapa do certificado na configuração inicial.",
      "Selecione o arquivo A1 no formato .pfx ou .p12.",
      "Digite a senha do certificado exatamente como foi criada pela certificadora.",
      "Envie o arquivo e aguarde a validação de validade, chave privada e CNPJ.",
      "Quando trocar o A1, o certificado anterior deixa de ser usado nas novas emissões.",
    ],
    quickFixes: [
      "Arquivo maior que 5 MB, A3, PDF ou ZIP não substitui o A1.",
      "Senha incorreta costuma aparecer como falha ao abrir o certificado.",
      "Certificado vencido precisa ser renovado antes de emitir.",
    ],
    relatedErrors: ["CERTIFICADO_A1"],
  },
  {
    slug: "certificado-cnpj-diferente",
    title: "Certificado com CNPJ diferente da empresa",
    summary: "Entenda quando substituir a empresa cadastrada ou criar outra empresa para usar o certificado correto.",
    category: "Certificado A1",
    minutes: 3,
    keywords: ["certificado", "cnpj diferente", "matriz", "filial", "substituir empresa"],
    steps: [
      "Confira se o CNPJ do certificado pertence à matriz, filial ou a outra empresa do grupo.",
      "Se você cadastrou o CNPJ errado, use a opção de substituir a empresa quando o app oferecer essa escolha.",
      "Se deseja emitir por outro CNPJ, crie uma nova empresa conforme o limite do plano.",
      "Confirme a ação com o código de segurança quando solicitado.",
    ],
    quickFixes: [
      "Não force um certificado de outro CNPJ: a prefeitura pode rejeitar a assinatura.",
      "Para matriz e filial, confira também a Inscrição Municipal correta do prestador.",
    ],
    relatedLinks: ["certificado-a1", "cadastrar-empresa"],
  },
  {
    slug: "configurar-emissao-shopee",
    title: "Como configurar a emissão Shopee",
    summary: "Configure serviço, códigos fiscais, NBS e regras tributárias usadas nos lotes da Shopee.",
    category: "Configuração fiscal",
    minutes: 8,
    popular: true,
    keywords: ["shopee", "servico", "17.06", "170601", "nbs", "iss", "aliquota", "retencao"],
    steps: [
      "Abra Configurações e acesse Serviços ou Configuração Shopee.",
      "Use o serviço de publicidade/intermediação conforme orientação contábil, normalmente ligado ao item 17.06.",
      "Preencha o código nacional do serviço, como 170601 quando aplicável.",
      "Informe o NBS com 9 dígitos quando exigido no ambiente nacional.",
      "Revise alíquota de ISS, retenções, local de prestação e município de incidência com seu contador.",
      "Salve e veja se a prontidão fiscal da empresa ficou sem bloqueios.",
    ],
    quickFixes: [
      "Erro de código municipal geralmente não se resolve reenviando a nota; ajuste a configuração primeiro.",
      "O MEI pode ter parte da configuração automática, mas ainda precisa ter empresa, certificado e município prontos.",
      "Para tomador estrangeiro, confira NIF, país e dados de comércio exterior.",
    ],
    relatedErrors: ["E0312", "CONFIG_ALIQUOTA_ISSQN", "DADOS_COMERCIO_EXTERIOR"],
    relatedLinks: ["tributacao-municipal", "configurar-inscricao-municipal-rps"],
  },
  {
    slug: "tributacao-municipal",
    title: "Como descobrir ou corrigir o código de tributação municipal",
    summary: "Resolva rejeições em que a prefeitura exige um código municipal diferente do código nacional.",
    category: "Configuração fiscal",
    minutes: 6,
    popular: true,
    keywords: ["E0312", "codigo tributacao municipal", "ctribmun", "municipio", "prefeitura", "servico"],
    steps: [
      "Abra a nota rejeitada e copie a mensagem completa da prefeitura.",
      "Verifique no portal municipal qual código local corresponde ao serviço usado pela sua empresa.",
      "Atualize o campo de código de tributação municipal na configuração do serviço.",
      "Confirme se o código está habilitado para o CNPJ e para a Inscrição Municipal do prestador.",
      "Reprocesse apenas as notas rejeitadas depois de salvar a correção.",
    ],
    quickFixes: [
      "O código nacional 170601 nem sempre basta; algumas cidades exigem um código local próprio.",
      "Se todos os documentos do lote falharem com o mesmo código, a configuração do serviço provavelmente estará incompleta.",
      "Se apenas alguns falharem, confira os dados do tomador ou as regras por município e tipo de tomador.",
    ],
    relatedErrors: ["E0312"],
    relatedLinks: ["configurar-emissao-shopee", "reprocessar-rejeicoes-sem-duplicar"],
  },
  {
    slug: "configurar-inscricao-municipal-rps",
    title: "Como configurar Inscrição Municipal, série e RPS",
    summary: "Preencha os dados exigidos quando o município usa integração municipal, ACBr ou provedor local.",
    category: "Configuração fiscal",
    minutes: 7,
    keywords: ["inscricao municipal", "im", "rps", "serie", "numero", "provedor", "acbr", "municipal"],
    steps: [
      "Acesse Configurações e abra Município ou Emissão municipal.",
      "Confira o canal identificado para sua cidade: nacional, municipal direto, ACBr ou indisponível.",
      "Quando solicitado, informe Inscrição Municipal exatamente como aparece no portal da prefeitura.",
      "Preencha a série do RPS e o próximo número do RPS se o provedor exigir.",
      "Inclua usuário, senha, token ou chave de autorização apenas quando o canal pedir esses dados.",
      "Salve e rode a verificação de prontidão fiscal antes de emitir em lote.",
    ],
    quickFixes: [
      "Zeros à esquerda na Inscrição Municipal podem ser obrigatórios.",
      "Inscrição Estadual não substitui Inscrição Municipal.",
      "Série ou número já usados podem causar rejeição por duplicidade.",
    ],
    relatedErrors: ["CONFIG_INSCRICAO_MUNICIPAL", "E0014"],
  },
  {
    slug: "importar-relatorio-shopee",
    title: "Como importar o relatório MonthlyReport da Shopee",
    summary: "Envie o CSV original da Shopee, revise a prévia e confirme o lote com segurança.",
    category: "Importação Shopee",
    minutes: 5,
    popular: true,
    keywords: ["shopee", "monthlyreport", "csv", "importar", "relatorio", "lote", "comissao extra"],
    steps: [
      "Baixe o relatório mensal original na Shopee.",
      "Não renomeie, edite ou salve novamente o arquivo antes de enviar.",
      "No Nex Notas, acesse Importar ou Novo CSV Shopee.",
      "Envie o arquivo com nome no padrão MonthlyReport_YYYYMMDDHHMM.csv.",
      "Revise a prévia, valores, tomadores e possíveis duplicidades.",
      "Confirme o lote apenas quando os dados estiverem corretos.",
    ],
    quickFixes: [
      "Arquivo reimportado pode ser reaproveitado ou ter linhas ignoradas por duplicidade.",
      "Linhas válidas viram solicitações fiscais reais depois da confirmação.",
      "Guarde o CSV original para conciliação com seu contador.",
    ],
    relatedLinks: ["csv-shopee-recusado", "reprocessar-rejeicoes-sem-duplicar"],
  },
  {
    slug: "csv-shopee-recusado",
    title: "Meu CSV da Shopee foi recusado",
    summary: "Veja os motivos mais comuns para a validação bloquear o arquivo antes da emissão.",
    category: "Importação Shopee",
    minutes: 4,
    popular: true,
    keywords: ["csv invalido", "cabecalho", "utf-8", "bom", "excel", "monthlyreport", "comissao"],
    steps: [
      "Confira se o nome do arquivo segue o padrão MonthlyReport_YYYYMMDDHHMM.csv.",
      "Confirme que o arquivo veio direto da Shopee e não foi salvo pelo Excel.",
      "Verifique se as colunas originais estão presentes, incluindo CNPJ, CPF, identificação estrangeira, endereço e e-mail.",
      "Baixe uma nova cópia do relatório se a validação acusar cabeçalho, codificação ou formato de valor.",
      "Envie novamente o arquivo original.",
    ],
    quickFixes: [
      "Comissão precisa estar em formato monetário brasileiro, como R$ 1.234,56.",
      "CNPJ do vendedor deve conter 14 dígitos quando preenchido.",
      "Arquivos grandes demais ou fora do layout MonthlyReport não são aceitos.",
    ],
    relatedErrors: ["CSV_INVALIDO"],
    relatedLinks: ["importar-relatorio-shopee"],
  },
  {
    slug: "emitir-nota-avulsa",
    title: "Como emitir uma nota avulsa",
    summary: "Use a emissão manual para Shopee, Amazon, Mercado Livre ou outro tomador quando não houver CSV.",
    category: "Nota avulsa",
    minutes: 5,
    keywords: ["nota avulsa", "amazon", "mercado livre", "shopee", "manual", "tomador"],
    steps: [
      "Acesse a área de Notas e escolha Nova emissão ou Nota avulsa.",
      "Selecione um modelo predefinido quando o tomador for Shopee, Amazon ou Mercado Livre.",
      "Preencha CNPJ, CPF ou identificação estrangeira do tomador.",
      "Informe razão social, endereço, e-mail, valor, serviço, competência fiscal e descrição.",
      "Revise o aviso de competência retroativa quando emitir referente ao mês anterior.",
      "Confirme a emissão.",
    ],
    quickFixes: [
      "Valor zero não gera nota.",
      "Descrição muito longa ou e-mail inválido bloqueiam a criação.",
      "O sistema usa idempotência para evitar duas notas iguais em nova tentativa ou clique duplo.",
    ],
    relatedLinks: ["corrigir-tomadores", "status-das-notas"],
  },
  {
    slug: "status-das-notas",
    title: "O que significa cada status da nota",
    summary: "Entenda quando uma nota está pronta, rejeitada, em confirmação ou cancelada.",
    category: "Emissões",
    minutes: 6,
    popular: true,
    keywords: ["status", "autorizada", "rejeitada", "falha transitoria", "pendente confirmacao", "danfse", "xml"],
    steps: [
      "Aguardando significa que a nota está preparada para entrar na fila.",
      "Enviando ou processando significa que a transmissão está em andamento.",
      "Autorizada significa que a NFS-e foi aceita e os arquivos podem ficar disponíveis.",
      "Rejeitada indica resposta da prefeitura ou ambiente fiscal que precisa de correção.",
      "Falha transitória costuma indicar instabilidade ou tempo limite excedido e pode permitir uma nova tentativa.",
      "Pendente de confirmação exige cuidado: a nota pode ter sido enviada e ainda está sendo conciliada.",
      "Cancelada significa que o cancelamento foi concluído no ambiente fiscal.",
    ],
    quickFixes: [
      "Não reenvie manualmente notas pendentes de confirmação.",
      "Use os detalhes da nota para ver mensagem fiscal, histórico, XML, PDF e e-mails.",
      "Em caso de rejeição, corrija a causa antes de reprocessar.",
    ],
    relatedErrors: ["X126", "CONFIRMACAO_FISCAL_PENDENTE", "E2404"],
    relatedLinks: ["reprocessar-rejeicoes-sem-duplicar"],
  },
  {
    slug: "reprocessar-rejeicoes-sem-duplicar",
    title: "Como reprocessar rejeições sem duplicar notas",
    summary: "Saiba quando reprocessar, quando aguardar conciliação e quando falar com suporte.",
    category: "Emissões",
    minutes: 5,
    popular: true,
    keywords: ["reprocessar", "duplicidade", "rejeitada", "reenviar", "pendente", "confirmacao", "X126"],
    steps: [
      "Abra o lote ou a nota rejeitada.",
      "Leia a mensagem fiscal e a orientação exibida pelo Nex Notas.",
      "Corrija configuração, tomador, certificado ou alíquota conforme o erro.",
      "Reprocesse apenas documentos rejeitados ou com falha transitória.",
      "Aguarde a conciliação quando o status indicar pendência de confirmação.",
    ],
    quickFixes: [
      "Erro de duplicidade pode indicar que a DPS ou RPS já existe no ambiente fiscal.",
      "Quando a prefeitura recebeu a transmissão, mas não devolveu a nota, reenviar pode gerar duplicidade.",
      "Use consulta/conciliação antes de criar outra emissão para o mesmo tomador, competência e valor.",
    ],
    relatedErrors: ["E0014", "X126", "CONFIRMACAO_FISCAL_PENDENTE"],
  },
  {
    slug: "cancelar-notas-lotes",
    title: "Como cancelar notas e lotes",
    summary: "Diferencie cancelamento fiscal de nota autorizada, cancelamento de pendentes e parada de lote.",
    category: "Cancelamentos",
    minutes: 6,
    keywords: ["cancelar", "cancelamento", "lote", "pendentes", "parar emissao", "duplicidade"],
    steps: [
      "Para nota autorizada, abra os detalhes da nota e solicite cancelamento com motivo.",
      "Escolha o motivo adequado: erro na emissão, serviço não prestado, duplicidade ou outro.",
      "Para lote ainda não transmitido, use cancelar pendentes quando quiser remover documentos que não foram enviados.",
      "Use parar emissão para retirar documentos da fila sem mexer nos que já foram enviados.",
      "Acompanhe o status do cancelamento: solicitado, cancelando, pendente, rejeitado ou cancelado.",
    ],
    quickFixes: [
      "Notas já enviadas podem precisar de confirmação da prefeitura antes de qualquer nova ação.",
      "Um cancelamento rejeitado deve ser analisado com base no motivo retornado pelo município.",
    ],
    relatedLinks: ["status-das-notas"],
  },
  {
    slug: "corrigir-tomadores",
    title: "Como corrigir dados de tomadores",
    summary: "Corrija documento, endereço e e-mail de vendedores para liberar emissão ou reenvio.",
    category: "Tomadores",
    minutes: 5,
    keywords: ["tomador", "vendedor", "cnpj", "cpf", "estrangeiro", "cep", "email", "endereco"],
    steps: [
      "Acesse a área de Tomadores para localizar o vendedor pelo nome, documento ou e-mail.",
      "Edite o tipo de documento: CNPJ, CPF ou identificação estrangeira.",
      "Use a busca por CNPJ ou CEP, quando disponível, para preencher os dados automaticamente.",
      "Revise logradouro, número, bairro, município, UF e código IBGE.",
      "Salve a correção e volte ao lote para reprocessar notas afetadas.",
    ],
    quickFixes: [
      "Documento duplicado não pode ser cadastrado duas vezes.",
      "E-mail inválido impede envio automático da nota ao tomador.",
      "Endereço corrigido pode sincronizar com documentos pendentes ou reprocessáveis.",
    ],
    relatedErrors: ["E0190", "E0247", "DADOS_TOMADOR"],
  },
  {
    slug: "limite-do-plano",
    title: "O que fazer ao atingir o limite do plano",
    summary: "Entenda limites mensais de notas, limite de empresas e como continuar emitindo.",
    category: "Planos",
    minutes: 3,
    keywords: ["plano", "limite", "upgrade", "assinatura", "empresa", "notas mes"],
    steps: [
      "Veja o aviso de limite na tela da nota, do lote ou da assinatura.",
      "Confira se o limite atingido é de notas no mês ou de empresas cadastradas.",
      "Se for limite mensal, os documentos podem ficar preparados, mas não são transmitidos.",
      "Escolha um plano com franquia suficiente para seu volume.",
      "Depois de mudar de plano, retome a emissão pelo lote ou pelas notas pendentes.",
    ],
    quickFixes: [
      "Histórico, XML e DANFSe continuam disponíveis mesmo ao atingir o limite.",
      "Planos maiores também podem liberar mais empresas cadastradas.",
    ],
    relatedErrors: ["LIMITE_PLANO"],
  },
  {
    slug: "programa-de-afiliados",
    title: "Programa de afiliados Nex Notas",
    summary: "Entenda a comissão recorrente de 20% e simule quanto você pode receber indicando clientes.",
    category: "Programa de afiliados",
    minutes: 4,
    popular: true,
    keywords: ["afiliados", "indicacao", "indicação", "comissao", "comissão", "cakto", "20%", "recorrente", "calculadora"],
    steps: [
      "Cadastre-se no programa de afiliados da Nex Notas pela Cakto.",
      "Pegue seu link exclusivo de indicação.",
      "Divulgue para afiliados Shopee PJ e empresas que precisam emitir NFS-e em lote.",
      "Quando uma pessoa indicada assinar e permanecer ativa, a comissão recorrente é calculada sobre o plano contratado.",
      "Use a calculadora desta página para simular quantidade de clientes, plano contratado e comissão estimada.",
    ],
    quickFixes: [
      "A comissão base do programa é de 20% sobre assinaturas válidas.",
      "A simulação usa o plano Afiliado Expert como padrão, mas você pode trocar para outros planos.",
      "Cadastro, link de indicação, atribuição da venda e pagamentos são acompanhados pela Cakto.",
    ],
  },
];

const errors: FiscalError[] = [
  {
    code: "E0312",
    title: "Código de tributação municipal exigido",
    meaning: "O município não aceitou o código fiscal enviado ou exige um código local específico.",
    action: "Atualize o código de tributação municipal na configuração do serviço e reprocesse somente as notas rejeitadas.",
    keywords: ["codigo municipal", "tributacao", "servico", "ctribmun"],
  },
  {
    code: "E0190",
    title: "Documento do tomador não localizado",
    meaning: "O ambiente fiscal não encontrou o CNPJ ou CPF do tomador para a competência informada.",
    action: "Revise documento, tipo de pessoa e dados cadastrais do tomador antes de tentar novamente.",
    keywords: ["tomador", "cnpj", "cpf", "competencia"],
  },
  {
    code: "E0247",
    title: "E-mail do tomador inválido",
    meaning: "O e-mail informado para o tomador não passou na validação fiscal ou cadastral.",
    action: "Corrija o e-mail no tomador ou no arquivo de origem e reprocesse a nota.",
    keywords: ["email", "tomador", "envio"],
  },
  {
    code: "E2404",
    title: "NFS-e não localizada na consulta",
    meaning: "A prefeitura não encontrou a nota na consulta feita após a tentativa de emissão.",
    action: "Use as opções de reprocessamento ou consulta no app; se o problema se repetir, aguarde a conciliação ou acione o suporte.",
    keywords: ["consulta", "nfse", "prefeitura", "reprocessar"],
  },
  {
    code: "E0014",
    title: "DPS ou RPS já existente",
    meaning: "O ambiente fiscal identificou uma numeração ou chave que já foi usada.",
    action: "Não crie outra nota manualmente; consulte a emissão existente ou ajuste a série e a numeração, quando aplicável.",
    keywords: ["duplicidade", "dps", "rps", "serie", "numero"],
  },
  {
    code: "E0082",
    title: "Prestador não habilitado",
    meaning: "O CNPJ prestador pode não estar habilitado no município, no emissor nacional ou no canal usado.",
    action: "Revise a empresa, o certificado, o município, a Inscrição Municipal e a habilitação no portal fiscal.",
    keywords: ["prestador", "habilitacao", "municipio", "empresa"],
  },
  {
    code: "X126",
    title: "Emissão enviada sem confirmação final",
    meaning: "A transmissão pode ter chegado ao ambiente fiscal, mas a resposta não trouxe identificação completa da NFS-e.",
    action: "Aguarde a conciliação automática e evite reenviar para não gerar duplicidade.",
    keywords: ["pendente", "confirmacao", "sem identidade", "duplicar"],
  },
  {
    code: "CONFIRMACAO_FISCAL_PENDENTE",
    title: "Nota aguardando reconciliação",
    meaning: "O sistema ainda está tentando confirmar se a prefeitura autorizou, rejeitou ou não recebeu a nota.",
    action: "Não altere nem reenvie; acompanhe o status e procure suporte se o prazo ficar longo.",
    keywords: ["reconciliacao", "pendente", "confirmacao"],
  },
  {
    code: "CERTIFICADO_A1",
    title: "Problema no certificado A1",
    meaning: "O certificado está vencido, com senha incorreta, sem chave privada ou não pertence ao CNPJ esperado.",
    action: "Envie um A1 válido em .pfx ou .p12, confirme a senha e confira o CNPJ do certificado.",
    keywords: ["certificado", "a1", "senha", "vencido", "pfx"],
  },
  {
    code: "CSV_INVALIDO",
    title: "Relatório Shopee fora do layout",
    meaning: "O arquivo não parece ser o MonthlyReport original esperado pelo Nex Notas.",
    action: "Baixe novamente o CSV original da Shopee e envie sem abrir, renomear ou salvar no Excel.",
    keywords: ["csv", "monthlyreport", "cabecalho", "excel", "bom"],
  },
  {
    code: "LIMITE_PLANO",
    title: "Limite do plano atingido",
    meaning: "A empresa atingiu a franquia mensal de notas ou o limite de empresas cadastradas.",
    action: "Mude de plano ou aguarde a renovação do ciclo para realizar novas transmissões.",
    keywords: ["plano", "limite", "upgrade", "assinatura"],
  },
  {
    code: "DADOS_TOMADOR",
    title: "Dados do tomador incompletos",
    meaning: "Documento, endereço, município, CEP ou campos obrigatórios do tomador estão ausentes ou inconsistentes.",
    action: "Corrija o cadastro do tomador e reprocesse os documentos afetados.",
    keywords: ["tomador", "endereco", "cep", "ibge", "municipio"],
  },
  {
    code: "DADOS_COMERCIO_EXTERIOR",
    title: "Dados de tomador estrangeiro incompletos",
    meaning: "A nota envolve exterior e precisa de país, identificação fiscal estrangeira ou informações complementares.",
    action: "Revise NIF, país do tomador e configurações de comércio exterior antes de reprocessar.",
    keywords: ["estrangeiro", "exterior", "nif", "pais"],
  },
  {
    code: "CONFIG_ALIQUOTA_ISSQN",
    title: "Alíquota de ISS ausente ou divergente",
    meaning: "A regra fiscal enviada não corresponde à alíquota esperada para o município, regime ou serviço.",
    action: "Confirme a alíquota com seu contador, salve a configuração fiscal e tente novamente.",
    keywords: ["iss", "aliquota", "retencao", "simples"],
  },
];

const errorDetails: Record<string, FiscalErrorDetail> = {
  E0312: {
    causes: [
      "Código de tributação municipal não preenchido na configuração do serviço.",
      "Código local diferente do código nacional do serviço.",
      "Serviço ainda não habilitado para o CNPJ ou Inscrição Municipal na prefeitura.",
    ],
    steps: [
      "Abra a nota rejeitada e copie a mensagem completa da prefeitura.",
      "Acesse Configurações fiscais do serviço Shopee.",
      "Confirme com a prefeitura ou contador qual código municipal corresponde ao serviço usado.",
      "Preencha o código exatamente como o município exige, mantendo zeros à esquerda quando existirem.",
      "Salve a configuração e reprocesse apenas as notas rejeitadas por esse erro.",
    ],
    avoid: [
      "Não tente resolver reenviando o mesmo lote sem corrigir o código.",
      "Não confunda código nacional do serviço com código municipal da prefeitura.",
    ],
    relatedLinks: ["tributacao-municipal", "configurar-emissao-shopee"],
  },
  E0190: {
    causes: [
      "CNPJ ou CPF do tomador digitado incorretamente.",
      "Tipo do tomador marcado como CNPJ quando deveria ser CPF, ou o contrário.",
      "Cadastro do tomador não localizado para a competência fiscal informada.",
    ],
    steps: [
      "Abra o detalhe da nota ou do lote e identifique o tomador rejeitado.",
      "Confira documento, tipo de pessoa e razão social.",
      "Atualize o cadastro em Tomadores ou corrija o arquivo de origem quando necessário.",
      "Revise a competência fiscal da nota.",
      "Reprocesse a nota depois que os dados estiverem salvos.",
    ],
    avoid: [
      "Não substitua o documento por outro apenas para passar na validação.",
      "Não cadastre o mesmo tomador duas vezes com pequenas variações no documento.",
    ],
    relatedLinks: ["corrigir-tomadores", "emitir-nota-avulsa"],
  },
  E0247: {
    causes: [
      "E-mail do tomador ausente, incompleto ou com formato inválido.",
      "E-mail veio incorreto no CSV da Shopee.",
      "Cadastro do tomador foi importado sem contato válido.",
    ],
    steps: [
      "Abra o cadastro do tomador indicado na rejeição.",
      "Corrija o e-mail usando um endereço válido.",
      "Salve o cadastro antes de voltar ao lote ou à nota.",
      "Reenvie o e-mail fiscal quando a nota já estiver autorizada ou reprocesse quando a rejeição exigir nova emissão.",
    ],
    avoid: [
      "Não use e-mails fictícios para liberar envio fiscal.",
      "Não confunda erro de envio de e-mail com rejeição de emissão da prefeitura.",
    ],
    relatedLinks: ["corrigir-tomadores"],
  },
  E2404: {
    causes: [
      "A prefeitura ainda não retornou a NFS-e na consulta.",
      "A transmissão passou por instabilidade temporária.",
      "A nota pode precisar de nova conciliação antes de qualquer reenvio.",
    ],
    steps: [
      "Abra os detalhes da nota e veja se há uma ação para reprocessar ou consultar.",
      "Execute a ação indicada pelo app apenas uma vez.",
      "Se o status ficar pendente de confirmação, aguarde a reconciliação.",
      "Se o erro se repetir, fale com o suporte e informe o lote, a nota e a mensagem fiscal.",
    ],
    avoid: [
      "Não crie uma nota nova para o mesmo tomador, competência e valor sem confirmar a anterior.",
      "Não cancele o lote inteiro se apenas a consulta de uma nota falhou.",
    ],
    relatedLinks: ["status-das-notas", "reprocessar-rejeicoes-sem-duplicar"],
  },
  E0014: {
    causes: [
      "Série e número RPS ou identificador DPS já foram usados.",
      "A nota foi enviada antes e a resposta não voltou completa.",
      "Uma tentativa anterior ficou pendente de confirmação.",
    ],
    steps: [
      "Pare antes de reenviar a mesma nota.",
      "Abra os detalhes e use a consulta/conciliação quando disponível.",
      "Se a nota já existir, recupere XML/PDF em vez de emitir outra.",
      "Quando usar provedor municipal, revise série RPS e próximo número.",
      "Reprocesse somente depois de confirmar que não há nota autorizada para a mesma operação.",
    ],
    avoid: [
      "Não altere número ou série aleatoriamente para forçar transmissão.",
      "Não importe o mesmo CSV tentando gerar outro lote para a mesma competência.",
    ],
    relatedLinks: ["configurar-inscricao-municipal-rps", "reprocessar-rejeicoes-sem-duplicar"],
  },
  E0082: {
    causes: [
      "Prestador não habilitado no município ou no emissor nacional.",
      "Certificado A1 não pertence ao CNPJ emissor.",
      "Inscrição Municipal ausente ou diferente da cadastrada na prefeitura.",
    ],
    steps: [
      "Abra a empresa no app e confira CNPJ, município e endereço.",
      "Verifique se o certificado A1 pertence ao mesmo CNPJ.",
      "Revise Inscrição Municipal e habilitação no portal da prefeitura ou emissor nacional.",
      "Salve as configurações municipais e rode novamente a verificação de prontidão fiscal.",
      "Reprocesse as notas apenas quando a empresa estiver pronta.",
    ],
    avoid: [
      "Não tente emitir por filial usando certificado ou Inscrição Municipal da matriz sem validar com a prefeitura.",
      "Não avance com lote grande enquanto a prontidão fiscal indicar bloqueio.",
    ],
    relatedLinks: ["cadastrar-empresa", "certificado-a1", "configurar-inscricao-municipal-rps"],
  },
  X126: {
    causes: [
      "A transmissão chegou ao ambiente fiscal, mas retornou sem número, código de verificação ou XML.",
      "A prefeitura demorou a disponibilizar a consulta da NFS-e.",
      "O tempo limite foi excedido ou houve uma resposta incompleta durante a emissão.",
    ],
    steps: [
      "Não reenvie a nota imediatamente.",
      "Acompanhe o status pendente de confirmação nos detalhes da nota.",
      "Aguarde a conciliação automática do Nex Notas.",
      "Se a pendência permanecer, fale com suporte informando lote, tomador, competência e valor.",
    ],
    avoid: [
      "Não crie uma nota avulsa para substituir essa emissão sem confirmar o resultado fiscal.",
      "Não altere dados da nota enquanto ela estiver em conciliação.",
    ],
    relatedLinks: ["status-das-notas", "reprocessar-rejeicoes-sem-duplicar"],
  },
  CONFIRMACAO_FISCAL_PENDENTE: {
    causes: [
      "O Nex Notas está aguardando resposta confiável do ambiente fiscal.",
      "A prefeitura pode ter recebido a nota, mas ainda não confirmou autorização ou rejeição.",
      "O provedor municipal está instável ou lento.",
    ],
    steps: [
      "Abra o detalhe da nota para acompanhar o histórico.",
      "Aguarde a próxima tentativa de conciliação.",
      "Evite qualquer nova emissão igual enquanto o status estiver pendente.",
      "Se precisar fechar o mês, separe esses casos e confirme com suporte antes de repetir.",
    ],
    avoid: [
      "Não use o botão de nova nota para duplicar uma emissão pendente.",
      "Não considere uma nota pendente como rejeitada; são estados diferentes.",
    ],
    relatedLinks: ["status-das-notas", "reprocessar-rejeicoes-sem-duplicar"],
  },
  CERTIFICADO_A1: {
    causes: [
      "O arquivo não é um certificado A1 válido.",
      "A senha do arquivo .pfx ou .p12 está incorreta.",
      "O certificado está vencido, ainda não é válido ou não possui uma chave privada.",
      "O CNPJ do certificado não corresponde à empresa emissora.",
    ],
    steps: [
      "Separe o arquivo A1 original em .pfx ou .p12.",
      "Confirme a senha com a certificadora ou responsável pela emissão.",
      "Envie o certificado novamente no app.",
      "Se o CNPJ for diferente, escolha substituir empresa ou criar outra quando o app oferecer a opção.",
      "Depois de salvar, confira se a prontidão fiscal deixou de apontar bloqueio de certificado.",
    ],
    avoid: [
      "Não envie certificado A3, PDF, ZIP ou arquivo sem chave privada.",
      "Não compartilhe a senha do certificado fora dos canais seguros da empresa.",
    ],
    relatedLinks: ["certificado-a1", "certificado-cnpj-diferente"],
  },
  CSV_INVALIDO: {
    causes: [
      "O arquivo não tem um nome no padrão MonthlyReport_YYYYMMDDHHMM.csv.",
      "O CSV foi aberto e salvo pelo Excel, alterando o cabeçalho, a codificação ou os valores.",
      "As colunas obrigatórias foram removidas ou renomeadas.",
      "A comissão, o CNPJ ou os dados do vendedor estão fora do formato esperado.",
    ],
    steps: [
      "Baixe uma nova cópia do relatório na Shopee.",
      "Não abra nem edite o arquivo antes do envio.",
      "Envie o CSV original no Nex Notas.",
      "Se ainda falhar, leia a linha/campo indicado na validação.",
      "Corrija na origem quando possível ou gere novamente o relatório.",
    ],
    avoid: [
      "Não tente montar manualmente um CSV copiando colunas.",
      "Não renomeie outro relatório para parecer MonthlyReport.",
    ],
    relatedLinks: ["csv-shopee-recusado", "importar-relatorio-shopee"],
  },
  LIMITE_PLANO: {
    causes: [
      "A franquia mensal de notas do plano foi consumida.",
      "A quantidade de empresas cadastradas chegou ao limite do plano.",
      "Os documentos foram preparados, mas a transmissão fiscal foi bloqueada pelo limite.",
    ],
    steps: [
      "Abra a área de Assinatura ou o aviso exibido no lote ou na nota.",
      "Confira se o limite é de notas mensais ou empresas.",
      "Escolha um plano com capacidade suficiente para o mês.",
      "Depois de mudar de plano, volte ao lote ou à nota pendente e retome a emissão.",
    ],
    avoid: [
      "Não apague lotes antigos para tentar liberar limite; o limite considera uso do ciclo.",
      "Não crie outra empresa se o bloqueio for de franquia mensal de notas.",
    ],
    relatedLinks: ["limite-do-plano"],
  },
  DADOS_TOMADOR: {
    causes: [
      "O endereço do tomador está incompleto.",
      "O CEP, o município, a UF ou o código IBGE não correspondem aos dados informados.",
      "O documento fiscal ou o tipo do tomador está inconsistente.",
    ],
    steps: [
      "Abra o cadastro do tomador pelo menu Tomadores.",
      "Revise documento, nome, e-mail e endereço completo.",
      "Use busca de CNPJ ou CEP quando disponível.",
      "Salve e volte ao lote para reprocessar as notas afetadas.",
    ],
    avoid: [
      "Não deixe número, bairro ou município vazios quando a prefeitura exigir endereço completo.",
      "Não misture dados de loja com dados fiscais do tomador.",
    ],
    relatedLinks: ["corrigir-tomadores"],
  },
  DADOS_COMERCIO_EXTERIOR: {
    causes: [
      "O tomador estrangeiro está sem NIF ou identificação fiscal estrangeira.",
      "O país do tomador não foi informado.",
      "A configuração de comércio exterior está incompleta para a regra fiscal usada.",
    ],
    steps: [
      "Confira se o tomador está marcado como estrangeiro.",
      "Preencha o país e a identificação fiscal estrangeira, quando houver.",
      "Revise campos de comércio exterior na configuração fiscal.",
      "Reprocesse depois de salvar os dados corrigidos.",
    ],
    avoid: [
      "Não force CPF ou CNPJ brasileiro para tomador estrangeiro.",
      "Não ignore vendedores estrangeiros importados no relatório da Shopee.",
    ],
    relatedLinks: ["corrigir-tomadores", "configurar-emissao-shopee"],
  },
  CONFIG_ALIQUOTA_ISSQN: {
    causes: [
      "A alíquota de ISS não foi preenchida.",
      "A alíquota configurada diverge do regime tributário ou da regra municipal.",
      "A retenção de ISS foi marcada de forma incorreta para o caso.",
    ],
    steps: [
      "Confirme com seu contador a alíquota aplicável ao serviço.",
      "Abra a configuração fiscal do serviço.",
      "Atualize a alíquota, a retenção e o município de incidência.",
      "Salve e reprocesse apenas documentos rejeitados por essa regra.",
    ],
    avoid: [
      "Não use alíquota de outro município sem validar a regra.",
      "Não altere retenção para tentar passar na prefeitura sem orientação contábil.",
    ],
    relatedLinks: ["configurar-emissao-shopee"],
  },
};

const quickProblems = [
  {
    title: "Não consigo importar o CSV",
    text: "Use o MonthlyReport original da Shopee, sem renomear ou salvar no Excel.",
    icon: FileSpreadsheet,
    guide: "csv-shopee-recusado",
  },
  {
    title: "Certificado não abre",
    text: "Confira se o arquivo é A1 em .pfx/.p12, se a senha está correta e se não venceu.",
    icon: KeyRound,
    guide: "certificado-a1",
  },
  {
    title: "Nota ficou pendente",
    text: "Aguarde a reconciliação quando houver risco de a prefeitura já ter recebido a emissão.",
    icon: RotateCcw,
    guide: "status-das-notas",
  },
  {
    title: "Erro de código municipal",
    text: "Ajuste o código de tributação municipal antes de reprocessar as rejeições.",
    icon: MapPinned,
    guide: "tributacao-municipal",
  },
  {
    title: "Limite atingido",
    text: "Veja se o bloqueio é de notas no mês ou da quantidade de empresas do plano.",
    icon: CreditCard,
    guide: "limite-do-plano",
  },
  {
    title: "Tomador sem e-mail válido",
    text: "Corrija o e-mail no cadastro do tomador para liberar o envio fiscal.",
    icon: Mail,
    guide: "corrigir-tomadores",
  },
];

const categories = Object.keys(categoryIcons) as HelpCategory[];

function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function guideBySlug(slug?: string) {
  return guides.find((guide) => guide.slug === slug);
}

function errorByCode(code?: string) {
  if (!code) return undefined;
  const decoded = decodeURIComponent(code).toUpperCase();
  return errors.find((error) => error.code.toUpperCase() === decoded);
}

function detailForError(error: FiscalError): FiscalErrorDetail {
  return errorDetails[error.code] ?? {
    causes: ["A mensagem fiscal retornou uma validação que precisa ser revisada antes de nova tentativa."],
    steps: [
      "Abra os detalhes da nota no app.",
      "Leia a mensagem fiscal completa.",
      "Corrija o campo ou configuração indicada.",
      "Reprocesse somente depois de salvar a correção.",
    ],
    avoid: ["Não repita a emissão sem entender se a prefeitura já recebeu a nota."],
  };
}

function relatedGuides(guide: HelpGuide) {
  const explicit = guide.relatedLinks?.map((slug) => guideBySlug(slug)).filter(Boolean) as HelpGuide[] | undefined;
  if (explicit?.length) return explicit.slice(0, 3);
  return guides.filter((item) => item.category === guide.category && item.slug !== guide.slug).slice(0, 3);
}

export function HelpPage() {
  const { slug, code } = useParams();
  const { pathname } = useLocation();
  const error = errorByCode(code);
  if (code) return error ? <ErrorPage error={error} /> : <NotFoundError code={code} />;
  if (pathname === "/programa-de-afiliados") return <AffiliateProgramPage />;
  if (slug === "programa-de-afiliados") return <AffiliateProgramPage />;
  const guide = guideBySlug(slug);
  if (slug) return guide ? <GuidePage guide={guide} /> : <NotFoundGuide slug={slug} />;
  return <HelpHub />;
}

function HelpHub() {
  const [query, setQuery] = useState("");
  const search = normalize(query.trim());
  const filteredGuides = useMemo(() => {
    if (!search) return guides.filter((guide) => guide.popular);
    return guides.filter((guide) => normalize([
      guide.title,
      guide.summary,
      guide.category,
      guide.keywords.join(" "),
      guide.relatedErrors?.join(" ") ?? "",
    ].join(" ")).includes(search));
  }, [search]);
  const filteredErrors = useMemo(() => {
    if (!search) return errors.slice(0, 8);
    return errors.filter((error) => normalize([
      error.code,
      error.title,
      error.meaning,
      error.action,
      error.keywords.join(" "),
    ].join(" ")).includes(search));
  }, [search]);
  const hasResults = filteredGuides.length > 0 || filteredErrors.length > 0;

  return (
    <div className="help-page min-h-screen bg-[#fbfcff] text-[#061747]">
      <HelpHeader />
      <main>
        <section className="border-b border-[#edf0f6] bg-white">
          <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 sm:px-5 sm:py-12 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-end xl:gap-8">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase text-[#4f56f6]">Central de Ajuda Nex Notas</p>
              <h1 className="mt-3 max-w-3xl break-words font-heading text-[clamp(2rem,9vw,3rem)] font-semibold leading-tight text-[#061747] sm:text-5xl">
                Guias rápidos para configurar, emitir e resolver erros comuns.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-8 text-[#667085]">
                Encontre instruções para usar o Nex Notas com Shopee, nota avulsa, certificado A1, tomadores, cancelamentos e rejeições fiscais.
              </p>
              <div className="mt-7 max-w-2xl">
                <label className="sr-only" htmlFor="help-search">Buscar na ajuda</label>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#7a8496]" />
                  <Input
                    id="help-search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Busque por E0312, certificado, MonthlyReport, duplicidade, tomador..."
                    className="h-12 rounded-[12px] border-[#dfe4ef] bg-white pl-12 pr-3 text-[15px]"
                  />
                </div>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-[16px] border border-[#cdd2ff] bg-[#f4f5ff] p-5 shadow-[0_18px_42px_rgba(79,86,246,.10)]">
              <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-[#4f56f6]/10 blur-2xl" />
              <Sparkles className="relative h-6 w-6 text-[#4f56f6]" />
              <strong className="relative mt-4 block text-base text-[#172650]">Ganhe indicando o Nex Notas</strong>
              <p className="relative mt-2 text-sm leading-6 text-[#667085]">Participe do programa de afiliados e receba 20% de comissão recorrente sobre assinaturas válidas.</p>
              <Link className={cn(buttonVariants(), "relative mt-4 flex w-full gap-2 rounded-[10px] bg-[#4f56f6] hover:bg-[#454cf0] sm:inline-flex sm:w-auto")} to="/programa-de-afiliados">Simular comissão <ArrowUpRight className="h-4 w-4" /></Link>
            </div>
          </div>
        </section>

        <section className="py-10">
          <div className="mx-auto max-w-6xl px-4 sm:px-5">
            {!search ? (
              <>
                <SectionTitle eyebrow="Atalhos" title="Ajuda rápida por problema" text="Comece pelo sintoma que você está vendo no app." />
                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {quickProblems.map((problem) => <ProblemCard key={problem.title} {...problem} />)}
                </div>

                <SectionTitle className="mt-12" eyebrow="Categorias" title="Escolha um assunto" text="Cada categoria reúne guias e correções frequentes." />
                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                  {categories.map((category) => <CategoryCard key={category} category={category} />)}
                </div>
              </>
            ) : null}

            <div className={cn("grid gap-8 xl:grid-cols-[minmax(0,1fr)_360px]", search ? "mt-2" : "mt-12")}>
              <section className="min-w-0">
                <SectionTitle eyebrow={search ? "Resultado" : "Guias populares"} title={search ? `Busca por "${query}"` : "Guias mais acessados"} text={search ? "Resultados encontrados nos guias e no catálogo de erros." : "Os guias que resolvem a maior parte dos casos de configuração e emissão."} />
                {!hasResults ? <EmptySearch /> : null}
                <div className="mt-6 grid gap-4">
                  {filteredGuides.map((guideItem) => <GuideCard key={guideItem.slug} guide={guideItem} />)}
                </div>
              </section>

              <aside className="min-w-0 xl:sticky xl:top-24 xl:self-start">
                <div className="rounded-[16px] border border-[#e2e6ef] bg-white p-5">
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-[12px] bg-[#fff7ed] text-[#b45309]">
                      <AlertTriangle className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-xs font-bold uppercase text-[#b45309]">Catálogo de erros</p>
                      <h2 className="font-heading text-lg font-semibold text-[#061747]">O que fazer agora</h2>
                    </div>
                  </div>
                  <div className="mt-5 grid gap-3">
                    {filteredErrors.map((error) => <ErrorMini key={error.code} error={error} />)}
                  </div>
                </div>
              </aside>
            </div>

            <div className="mt-12 rounded-[16px] border border-[#dfe4ef] bg-white p-6">
              <ShieldCheck className="h-6 w-6 text-[#4f56f6]" />
              <h2 className="mt-4 font-heading text-xl font-semibold text-[#061747]">Importante</h2>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-[#667085]">
                A Nex Notas ajuda na emissão, organização e acompanhamento das NFS-e. Decisões de enquadramento fiscal, alíquota, retenção e código de serviço devem ser confirmadas com seu contador.
              </p>
            </div>
          </div>
        </section>
      </main>
      <HelpFooter />
    </div>
  );
}

function GuidePage({ guide }: { guide: HelpGuide }) {
  const Icon = categoryIcons[guide.category];
  const related = relatedGuides(guide);
  const guideErrors = errors.filter((error) => guide.relatedErrors?.includes(error.code));

  return (
    <div className="help-page min-h-screen bg-[#fbfcff] text-[#061747]">
      <HelpHeader />
      <main className="border-b border-[#edf0f6]">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-5 sm:py-10">
          <article className="min-w-0">
            <Link to="/ajuda" className="inline-flex items-center gap-2 text-sm font-semibold text-[#4f56f6] hover:underline">
              <ArrowLeft className="h-4 w-4" /> Voltar para ajuda
            </Link>
            <div className="mt-6 rounded-[18px] border border-[#e2e6ef] bg-white p-6 sm:p-8">
              <span className="inline-flex items-center gap-2 rounded-full bg-[#eef0ff] px-3 py-1.5 text-xs font-bold text-[#4f56f6]">
                <Icon className="h-4 w-4" /> {guide.category}
              </span>
              <h1 className="mt-5 break-words font-heading text-[clamp(1.875rem,8vw,2.625rem)] font-semibold leading-tight text-[#061747]">{guide.title}</h1>
              <p className="mt-4 max-w-3xl text-base leading-8 text-[#667085]">{guide.summary}</p>
              <p className="mt-4 text-sm font-semibold text-[#7a8496]">Tempo estimado: {guide.minutes} min</p>
            </div>

            <section className="mt-6 rounded-[18px] border border-[#e2e6ef] bg-white p-6 sm:p-8">
              <h2 className="font-heading text-2xl font-semibold text-[#061747]">Passo a passo</h2>
              <ol className="mt-6 grid gap-4">
                {guide.steps.map((step, index) => (
                  <li key={step} className="grid grid-cols-[36px_minmax(0,1fr)] gap-4">
                    <span className="grid h-9 w-9 place-items-center rounded-[10px] bg-[#4f56f6] text-sm font-bold text-white">{index + 1}</span>
                    <p className="pt-1 text-sm leading-7 text-[#344054]">{step}</p>
                  </li>
                ))}
              </ol>
            </section>

            <section className="mt-6 rounded-[18px] border border-[#e2e6ef] bg-white p-6 sm:p-8">
              <h2 className="font-heading text-2xl font-semibold text-[#061747]">Correções rápidas</h2>
              <div className="mt-5 grid gap-3">
                {guide.quickFixes.map((fix) => (
                  <div key={fix} className="flex gap-3 rounded-[12px] border border-[#e7ebf3] bg-[#fbfcff] p-4">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#16803c]" />
                    <p className="text-sm leading-6 text-[#344054]">{fix}</p>
                  </div>
                ))}
              </div>
            </section>

            {guideErrors.length ? (
              <section className="mt-6 rounded-[18px] border border-[#e2e6ef] bg-white p-6 sm:p-8">
                <h2 className="font-heading text-2xl font-semibold text-[#061747]">Erros relacionados</h2>
                <div className="mt-5 grid gap-4">
                  {guideErrors.map((error) => <ErrorCard key={error.code} error={error} />)}
                </div>
              </section>
            ) : null}
          </article>

          <aside className="min-w-0 xl:sticky xl:top-24 xl:self-start">
            <div className="rounded-[16px] border border-[#e2e6ef] bg-white p-5">
              <h2 className="font-heading text-lg font-semibold text-[#061747]">Abrir no app</h2>
              <p className="mt-2 text-sm leading-6 text-[#667085]">Para executar a ação, entre no painel e abra sua empresa, lote ou nota.</p>
              <Button href={appUrl} className="mt-4 w-full gap-2 rounded-[10px] bg-[#4f56f6] hover:bg-[#454cf0]">Entrar no app <ArrowRight className="h-4 w-4" /></Button>
            </div>
            <div className="mt-4 rounded-[16px] border border-[#e2e6ef] bg-white p-5">
              <h2 className="font-heading text-lg font-semibold text-[#061747]">Guias relacionados</h2>
              <div className="mt-4 grid gap-3">
                {related.map((item) => (
                  <Link key={item.slug} to={`/ajuda/${item.slug}`} className="rounded-[12px] border border-[#e7ebf3] p-4 transition hover:border-[#cdd2ff] hover:bg-[#f7f8ff]">
                    <strong className="block text-sm text-[#172650]">{item.title}</strong>
                    <span className="mt-1 block text-xs leading-5 text-[#667085]">{item.summary}</span>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>
      <HelpFooter />
    </div>
  );
}

function AffiliateProgramPage() {
  const [clients, setClients] = useState(12);
  const [planId, setPlanId] = useState("afiliado-expert");
  const selectedPlan = affiliatePlans.find((plan) => plan.id === planId) ?? affiliatePlans[2];
  const monthlyCommission = selectedPlan.price * 0.2 * clients;
  const sliderProgress = `${((clients - 1) / (100 - 1)) * 100}%`;
  const sliderStyle = { "--range-progress": sliderProgress } as CSSProperties;

  return (
    <div className="help-page min-h-screen bg-[#fbfcff] text-[#061747]">
      <HelpHeader />
      <main className="border-b border-[#edf0f6]">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-5 sm:py-10">
          <article className="min-w-0">
            <Link to="/ajuda" className="inline-flex items-center gap-2 text-sm font-semibold text-[#4f56f6] hover:underline">
              <ArrowLeft className="h-4 w-4" /> Voltar para ajuda
            </Link>

            <section className="mt-6 overflow-hidden rounded-[22px] border border-[#dfe3ff] bg-white">
              <div className="grid gap-0 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,.85fr)]">
                <div className="p-6 sm:p-8">
                  <span className="inline-flex items-center gap-2 rounded-full bg-[#eef0ff] px-3 py-1.5 text-xs font-bold text-[#4f56f6]">
                    <Sparkles className="h-4 w-4" /> Programa de afiliados
                  </span>
              <h1 className="mt-5 break-words font-heading text-[clamp(1.875rem,8vw,2.625rem)] font-semibold leading-tight text-[#061747]">
                    Indique o Nex Notas e simule sua comissão recorrente.
                  </h1>
                  <p className="mt-4 max-w-3xl text-base leading-8 text-[#667085]">
                    O programa paga 20% de comissão sobre assinaturas válidas enquanto o cliente indicado permanecer ativo e adimplente.
                  </p>
                  <div className="mt-6 grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(160px,1.5fr)]">
                    <AffiliateStat label="Comissão" value="20%" text="sobre o plano contratado" />
                    <AffiliateStat label="Base inicial" value="Expert" text="R$ 147 por mês" />
                    <AffiliateStat label="Modelo" value="Recorrente" text="conforme regras da Cakto" />
                  </div>
                </div>
                <div className="border-t border-[#e7ebf7] bg-[#061747] p-6 text-white xl:border-l xl:border-t-0 sm:p-8">
                  <Calculator className="h-7 w-7 text-[#aeb6ff]" />
                  <h2 className="mt-5 font-heading text-2xl font-semibold text-white">Calculadora de comissão</h2>
                  <p className="mt-3 text-sm leading-7 text-white/68">Troque o plano e mova o controle para estimar sua comissão.</p>
                  <div className="mt-7 rounded-[16px] border border-white/10 bg-white/[.06] p-5">
                    <span className="text-xs font-bold uppercase text-white/55">Estimativa mensal</span>
                    <strong className="mt-2 block break-words font-heading text-[clamp(1.8rem,8vw,2.125rem)] font-semibold text-white">{money.format(monthlyCommission)}</strong>
                    <span className="mt-1 block text-xs text-white/58">{clients} cliente{clients === 1 ? "" : "s"} no plano {selectedPlan.name}</span>
                  </div>
                </div>
              </div>
            </section>

            <section className="mt-6 grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <div className="rounded-[16px] border border-[#e2e6ef] bg-white p-5">
                <TrendingUp className="h-6 w-6 text-[#4f56f6]" />
                <h2 className="mt-4 font-heading text-lg font-semibold text-[#061747]">Entrar no programa</h2>
                <p className="mt-2 text-sm leading-6 text-[#667085]">O cadastro, o link de divulgação e os pagamentos são gerenciados pela Cakto.</p>
                <Button href={affiliateUrl} target="_blank" rel="noreferrer" className="mt-4 w-full gap-2 rounded-[10px] bg-[#4f56f6] hover:bg-[#454cf0] sm:inline-flex sm:w-auto">Quero me afiliar <ArrowUpRight className="h-4 w-4" /></Button>
              </div>
              <div className="rounded-[16px] border border-[#e2e6ef] bg-white p-5">
                <h2 className="font-heading text-lg font-semibold text-[#061747]">Resumo da regra</h2>
                <div className="mt-4 grid gap-3 text-sm leading-6 text-[#667085]">
                  <p>Comissão de 20% sobre assinaturas válidas.</p>
                  <p>Modelo recorrente enquanto o cliente indicado permanecer ativo e adimplente.</p>
                  <p>A calculadora é uma estimativa, não um extrato de pagamento.</p>
                </div>
              </div>
            </section>

            <section className="mt-6 rounded-[18px] border border-[#e2e6ef] bg-white p-6 sm:p-8">
              <div className="flex flex-col gap-4">
                <div>
                  <p className="text-xs font-bold uppercase text-[#4f56f6]">Simulador</p>
                  <h2 className="mt-2 font-heading text-2xl font-semibold text-[#061747]">Quanto você pode receber?</h2>
                  <p className="mt-2 max-w-2xl text-sm leading-7 text-[#667085]">A conta considera 20% sobre o valor mensal do plano escolhido.</p>
                </div>
              </div>

              <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
                <AffiliateResult label="Clientes ativos" value={String(clients)} />
                <div className="hidden sm:block">
                  <AffiliateResult label="Comissão por cliente" value={money.format(selectedPlan.price * 0.2)} />
                </div>
                <AffiliateResult label="Comissão mensal" value={money.format(monthlyCommission)} highlight />
              </div>

              <div className="mt-8">
                <label className="text-sm font-bold text-[#172650]" htmlFor="affiliate-clients">
                  Clientes indicados ativos: {clients}
                </label>
                <input
                  id="affiliate-clients"
                  type="range"
                  min="1"
                  max="100"
                  value={clients}
                  style={sliderStyle}
                  onChange={(event) => setClients(Number(event.target.value))}
                  className="affiliate-range mt-4 w-full"
                />
                <div className="mt-3 flex justify-between text-xs font-semibold text-[#8a94a6]">
                  <span>1 cliente</span>
                  <span>100 clientes</span>
                </div>
              </div>

              <div className="mt-8">
                <p className="text-sm font-bold text-[#172650]">Plano comprado pelo indicado</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {affiliatePlans.map((plan) => {
                    const active = plan.id === selectedPlan.id;
                    return (
                      <button
                        key={plan.id}
                        type="button"
                        onClick={() => setPlanId(plan.id)}
                        className={cn(
                          "rounded-[14px] border p-4 text-left transition",
                          active ? "border-[#4f56f6] bg-[#f4f5ff] shadow-[0_12px_28px_rgba(79,86,246,.10)]" : "border-[#e2e6ef] bg-white hover:border-[#cdd2ff] hover:bg-[#fbfcff]",
                        )}
                      >
                        <span className={cn("text-xs font-bold uppercase", active ? "text-[#4f56f6]" : "text-[#7a8496]")}>{plan.name}</span>
                        <strong className="mt-2 block text-lg text-[#061747]">{money.format(plan.price)}/mês</strong>
                        <span className="mt-1 block text-xs text-[#667085]">Comissão: {money.format(plan.price * 0.2)} por cliente</span>
                      </button>
                    );
                  })}
                </div>
              </div>

            </section>

            <section className="mt-6 rounded-[18px] border border-[#e2e6ef] bg-white p-6 sm:p-8">
              <h2 className="font-heading text-2xl font-semibold text-[#061747]">Como funciona</h2>
              <ol className="mt-6 grid gap-4">
                {[
                  "Cadastre-se no programa de afiliados pela Cakto.",
                  "Use seu link exclusivo para indicar o Nex Notas.",
                  "Quando o indicado compra um plano e permanece ativo, a comissão recorrente é calculada.",
                  "Acompanhe atribuição, pagamentos e regras diretamente na Cakto.",
                ].map((step, index) => (
                  <li key={step} className="grid grid-cols-[36px_minmax(0,1fr)] gap-4">
                    <span className="grid h-9 w-9 place-items-center rounded-[10px] bg-[#4f56f6] text-sm font-bold text-white">{index + 1}</span>
                    <p className="pt-1 text-sm leading-7 text-[#344054]">{step}</p>
                  </li>
                ))}
              </ol>
            </section>

            <section className="mt-6 rounded-[18px] border border-[#e2e6ef] bg-white p-6 sm:p-8">
              <h2 className="font-heading text-2xl font-semibold text-[#061747]">Boas práticas de divulgação</h2>
              <div className="mt-5 grid gap-3">
                {[
                  "Explique que o Nex Notas ajuda na emissão e organização de NFS-e, mas não substitui orientação contábil.",
                  "Fale com afiliados Shopee PJ, comunidades, mentorias e empresas que precisam reduzir emissão manual.",
                  "Não prometa resultado financeiro, isenção de impostos ou comunicação oficial da Shopee.",
                ].map((item) => (
                  <div key={item} className="flex gap-3 rounded-[12px] border border-[#e7ebf3] bg-[#fbfcff] p-4">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#16803c]" />
                    <p className="text-sm leading-6 text-[#344054]">{item}</p>
                  </div>
                ))}
              </div>
            </section>
          </article>
        </div>
      </main>
      <HelpFooter />
    </div>
  );
}

function ErrorPage({ error }: { error: FiscalError }) {
  const detail = detailForError(error);
  const related = detail.relatedLinks?.map((slug) => guideBySlug(slug)).filter(Boolean) as HelpGuide[] | undefined;

  return (
    <div className="help-page min-h-screen bg-[#fbfcff] text-[#061747]">
      <HelpHeader />
      <main className="border-b border-[#edf0f6]">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:px-5 sm:py-10 xl:grid-cols-[minmax(0,1fr)_320px] xl:gap-8">
          <article className="min-w-0">
            <Link to="/ajuda" className="inline-flex items-center gap-2 text-sm font-semibold text-[#4f56f6] hover:underline">
              <ArrowLeft className="h-4 w-4" /> Voltar para ajuda
            </Link>
            <div className="mt-6 rounded-[18px] border border-[#f2d7b6] bg-[#fffbf5] p-6 sm:p-8">
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-[#b45309]">
                <AlertTriangle className="h-4 w-4" /> Erro fiscal {error.code}
              </span>
              <h1 className="mt-5 break-words font-heading text-[clamp(1.875rem,8vw,2.625rem)] font-semibold leading-tight text-[#061747]">{error.title}</h1>
              <p className="mt-4 max-w-3xl text-base leading-8 text-[#667085]">{error.meaning}</p>
              <div className="mt-5 rounded-[14px] border border-[#f2d7b6] bg-white p-5">
                <p className="text-xs font-bold uppercase text-[#b45309]">O que fazer agora</p>
                <p className="mt-2 text-sm font-semibold leading-7 text-[#344054]">{error.action}</p>
              </div>
            </div>

            <section className="mt-6 rounded-[18px] border border-[#e2e6ef] bg-white p-6 sm:p-8">
              <h2 className="font-heading text-2xl font-semibold text-[#061747]">Causas prováveis</h2>
              <div className="mt-5 grid gap-3">
                {detail.causes.map((cause) => (
                  <div key={cause} className="flex gap-3 rounded-[12px] border border-[#e7ebf3] bg-[#fbfcff] p-4">
                    <CircleHelp className="mt-0.5 h-5 w-5 shrink-0 text-[#4f56f6]" />
                    <p className="text-sm leading-6 text-[#344054]">{cause}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="mt-6 rounded-[18px] border border-[#e2e6ef] bg-white p-6 sm:p-8">
              <h2 className="font-heading text-2xl font-semibold text-[#061747]">Como resolver</h2>
              <ol className="mt-6 grid gap-4">
                {detail.steps.map((step, index) => (
                  <li key={step} className="grid grid-cols-[36px_minmax(0,1fr)] gap-4">
                    <span className="grid h-9 w-9 place-items-center rounded-[10px] bg-[#4f56f6] text-sm font-bold text-white">{index + 1}</span>
                    <p className="pt-1 text-sm leading-7 text-[#344054]">{step}</p>
                  </li>
                ))}
              </ol>
            </section>

            <section className="mt-6 rounded-[18px] border border-[#e2e6ef] bg-white p-6 sm:p-8">
              <h2 className="font-heading text-2xl font-semibold text-[#061747]">Evite antes de tentar novamente</h2>
              <div className="mt-5 grid gap-3">
                {detail.avoid.map((item) => (
                  <div key={item} className="flex gap-3 rounded-[12px] border border-[#f2d7b6] bg-[#fffbf5] p-4">
                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[#b45309]" />
                    <p className="text-sm leading-6 text-[#344054]">{item}</p>
                  </div>
                ))}
              </div>
            </section>
          </article>

          <aside className="min-w-0 xl:sticky xl:top-24 xl:self-start">
            <div className="rounded-[16px] border border-[#e2e6ef] bg-white p-5">
              <h2 className="font-heading text-lg font-semibold text-[#061747]">Resolver no app</h2>
              <p className="mt-2 text-sm leading-6 text-[#667085]">Abra a nota ou o lote para ver a mensagem completa, corrigir os dados e reprocessar quando for seguro.</p>
              <Button href={appUrl} className="mt-4 w-full gap-2 rounded-[10px] bg-[#4f56f6] hover:bg-[#454cf0]">Acessar minha conta <ArrowUpRight className="h-4 w-4" /></Button>
            </div>
            {related?.length ? (
              <div className="mt-4 rounded-[16px] border border-[#e2e6ef] bg-white p-5">
                <h2 className="font-heading text-lg font-semibold text-[#061747]">Guias relacionados</h2>
                <div className="mt-4 grid gap-3">
                  {related.map((item) => (
                    <Link key={item.slug} to={`/ajuda/${item.slug}`} className="rounded-[12px] border border-[#e7ebf3] p-4 transition hover:border-[#cdd2ff] hover:bg-[#f7f8ff]">
                      <strong className="block text-sm text-[#172650]">{item.title}</strong>
                      <span className="mt-1 block text-xs leading-5 text-[#667085]">{item.summary}</span>
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
          </aside>
        </div>
      </main>
      <HelpFooter />
    </div>
  );
}

function NotFoundError({ code }: { code: string }) {
  return (
    <div className="help-page min-h-screen bg-[#fbfcff] text-[#061747]">
      <HelpHeader />
      <main className="mx-auto max-w-3xl px-5 py-20 text-center">
        <XCircle className="mx-auto h-10 w-10 text-[#b42318]" />
        <h1 className="mt-5 font-heading text-3xl font-semibold text-[#061747]">Erro não encontrado</h1>
        <p className="mt-3 text-sm leading-7 text-[#667085]">Não encontramos uma explicação para {decodeURIComponent(code)}. Use a central de ajuda para buscar pelo código, mensagem ou assunto relacionado.</p>
        <Link className={cn(buttonVariants(), "mt-6 inline-flex gap-2 rounded-[10px] bg-[#4f56f6] hover:bg-[#454cf0]")} to="/ajuda"><ArrowLeft className="h-4 w-4" /> Voltar para ajuda</Link>
      </main>
      <HelpFooter />
    </div>
  );
}

function NotFoundGuide({ slug }: { slug: string }) {
  return (
    <div className="help-page min-h-screen bg-[#fbfcff] text-[#061747]">
      <HelpHeader />
      <main className="mx-auto max-w-3xl px-5 py-20 text-center">
        <XCircle className="mx-auto h-10 w-10 text-[#b42318]" />
        <h1 className="mt-5 font-heading text-3xl font-semibold text-[#061747]">Guia não encontrado</h1>
        <p className="mt-3 text-sm leading-7 text-[#667085]">Não encontramos um guia em /ajuda/{slug}. Use a central de ajuda para buscar por categoria, erro ou palavra-chave.</p>
        <Link className={cn(buttonVariants(), "mt-6 inline-flex gap-2 rounded-[10px] bg-[#4f56f6] hover:bg-[#454cf0]")} to="/ajuda"><ArrowLeft className="h-4 w-4" /> Voltar para ajuda</Link>
      </main>
      <HelpFooter />
    </div>
  );
}

function HelpHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-[#eef0f6] bg-white/95 backdrop-blur-xl">
      <div className="mx-auto flex h-[66px] max-w-6xl items-center justify-between gap-3 px-4 sm:h-[72px] sm:px-5">
        <Link to="/" aria-label="Voltar para a página inicial da Nex Notas">
          <img src="/logo-text-roxo.png" alt="Nex Notas" className="h-auto w-[132px] sm:w-[145px]" />
        </Link>
        <nav className="hidden items-center gap-7 text-sm font-medium text-[#5f6b7e] md:flex">
          <Link className="transition hover:text-[#4f56f6]" to="/">Início</Link>
          <a className="transition hover:text-[#4f56f6]" href="/#planos">Planos</a>
          <Link className="text-[#4f56f6]" to="/ajuda">Ajuda</Link>
        </nav>
        <Button href={appUrl} variant="ghost" className="h-9 rounded-[10px] px-2 text-[#344054] hover:bg-[#f7f8ff] hover:text-[#061747] sm:px-3">Entrar</Button>
      </div>
    </header>
  );
}

function HelpFooter() {
  return (
    <footer className="bg-white py-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 text-center text-sm text-[#7a8496] sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:text-left">
        <span>© 2026 Nex Notas. Todos os direitos reservados.</span>
        <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 sm:justify-end">
          <Link className="hover:text-[#4f56f6]" to="/">Início</Link>
          <a className="hover:text-[#4f56f6]" href="/#planos">Planos</a>
          <button type="button" className="hover:text-[#4f56f6]" onClick={openCookiePreferences}>Cookies</button>
          <a className="hover:text-[#4f56f6]" href="https://status.nexnotas.com.br" target="_blank" rel="noreferrer">Status</a>
          <a className="hover:text-[#4f56f6]" href={appUrl}>Entrar</a>
        </div>
      </div>
    </footer>
  );
}

function SectionTitle({ eyebrow, title, text, className }: { eyebrow: string; title: string; text: string; className?: string }) {
  return (
    <div className={className}>
      <p className="text-xs font-bold uppercase text-[#4f56f6]">{eyebrow}</p>
      <h2 className="mt-2 break-words font-heading text-[clamp(1.5rem,6vw,1.75rem)] font-semibold text-[#061747]">{title}</h2>
      <p className="mt-2 max-w-2xl text-sm leading-7 text-[#667085]">{text}</p>
    </div>
  );
}

function AffiliateStat({ label, value, text }: { label: string; value: string; text: string }) {
  return (
    <div className="min-w-0 rounded-[14px] border border-[#e2e6ef] bg-[#fbfcff] p-4">
      <span className="block whitespace-nowrap text-[11px] font-bold uppercase text-[#7a8496]">{label}</span>
      <strong className="mt-2 block max-w-full whitespace-nowrap font-heading text-[clamp(.95rem,1.35vw,1.12rem)] font-semibold text-[#061747]">{value}</strong>
      <span className="mt-1 block text-xs leading-5 text-[#667085]">{text}</span>
    </div>
  );
}

function AffiliateResult({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={cn("rounded-[14px] border p-4", highlight ? "border-[#baf3d3] bg-[#ecfdf3]" : "border-[#e2e6ef] bg-[#fbfcff]")}>
      <span className={cn("block text-xs font-bold uppercase", highlight ? "text-[#16803c]" : "text-[#7a8496]")}>{label}</span>
      <strong className="mt-2 block max-w-full truncate font-heading text-xl font-semibold text-[#061747]">{value}</strong>
    </div>
  );
}

function ProblemCard({ title, text, icon: Icon, guide }: { title: string; text: string; icon: LucideIcon; guide: string }) {
  return (
    <Link to={`/ajuda/${guide}`} className="min-w-0 rounded-[16px] border border-[#e2e6ef] bg-white p-5 transition hover:-translate-y-0.5 hover:border-[#cdd2ff] hover:shadow-[0_14px_34px_rgba(6,23,71,.06)]">
      <Icon className="h-6 w-6 text-[#4f56f6]" />
      <strong className="mt-4 block text-base text-[#172650]">{title}</strong>
      <span className="mt-2 block text-sm leading-6 text-[#667085]">{text}</span>
    </Link>
  );
}

function CategoryCard({ category }: { category: HelpCategory }) {
  const Icon = categoryIcons[category];
  const count = guides.filter((guide) => guide.category === category).length;
  return (
    <a href={`#${category}`} className="min-w-0 rounded-[14px] border border-[#e2e6ef] bg-white p-4 transition hover:border-[#cdd2ff] hover:bg-[#f7f8ff]">
      <Icon className="h-5 w-5 text-[#4f56f6]" />
      <strong className="mt-3 block text-sm text-[#172650]">{category}</strong>
      <span className="mt-1 block text-xs text-[#7a8496]">{count} guia{count === 1 ? "" : "s"}</span>
    </a>
  );
}

function GuideCard({ guide }: { guide: HelpGuide }) {
  const Icon = categoryIcons[guide.category];
  return (
    <Link id={guide.category} to={`/ajuda/${guide.slug}`} className="min-w-0 rounded-[16px] border border-[#e2e6ef] bg-white p-5 transition hover:border-[#cdd2ff] hover:bg-[#f7f8ff]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <span className="inline-flex items-center gap-2 text-xs font-bold text-[#4f56f6]"><Icon className="h-4 w-4" /> {guide.category}</span>
          <h3 className="mt-2 font-heading text-xl font-semibold text-[#061747]">{guide.title}</h3>
          <p className="mt-2 text-sm leading-7 text-[#667085]">{guide.summary}</p>
        </div>
        <span className="shrink-0 text-sm font-semibold text-[#7a8496]">{guide.minutes} min</span>
      </div>
    </Link>
  );
}

function ErrorMini({ error }: { error: FiscalError }) {
  return (
    <Link to={`/ajuda/erro/${encodeURIComponent(error.code)}`} className="group min-w-0 rounded-[12px] border border-[#e7ebf3] bg-[#fbfcff] p-4 transition hover:border-[#cdd2ff] hover:bg-white">
      <span className="flex items-center justify-between gap-3">
        <strong className="block break-all text-sm text-[#061747]">{error.code}</strong>
        <ArrowUpRight className="h-4 w-4 shrink-0 text-[#8a94a6] transition group-hover:text-[#4f56f6]" />
      </span>
      <span className="mt-1 block text-sm font-semibold text-[#344054]">{error.title}</span>
      <p className="mt-2 text-xs leading-5 text-[#667085]">{error.action}</p>
    </Link>
  );
}

function ErrorCard({ error }: { error: FiscalError }) {
  return (
    <Link to={`/ajuda/erro/${encodeURIComponent(error.code)}`} className="group min-w-0 rounded-[14px] border border-[#f2d7b6] bg-[#fffbf5] p-5 transition hover:border-[#e7b56d]">
      <span className="flex items-center justify-between gap-3">
        <strong className="break-all text-sm text-[#b45309]">{error.code}</strong>
        <ArrowUpRight className="h-4 w-4 shrink-0 text-[#b45309] opacity-70 transition group-hover:opacity-100" />
      </span>
      <h3 className="mt-1 font-heading text-lg font-semibold text-[#061747]">{error.title}</h3>
      <p className="mt-2 text-sm leading-7 text-[#667085]">{error.meaning}</p>
      <p className="mt-3 text-sm font-semibold leading-7 text-[#344054]">{error.action}</p>
    </Link>
  );
}

function EmptySearch() {
  return (
    <div className="mt-6 rounded-[16px] border border-dashed border-[#cdd2ff] bg-white p-8 text-center">
      <CircleHelp className="mx-auto h-8 w-8 text-[#4f56f6]" />
      <h3 className="mt-4 font-heading text-xl font-semibold text-[#061747]">Nada encontrado nessa busca</h3>
      <p className="mx-auto mt-2 max-w-lg text-sm leading-7 text-[#667085]">Tente procurar por termos como E0312, certificado, MonthlyReport, duplicidade, tomador ou limite.</p>
    </div>
  );
}
