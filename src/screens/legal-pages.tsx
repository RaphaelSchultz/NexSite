import { ArrowLeft, FileText, Scale, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { openCookiePreferences } from "../components/cookie-consent";

type LegalSection = {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
};

type LegalPageContent = {
  eyebrow: string;
  title: string;
  subtitle: string;
  updatedAt: string;
  icon: typeof FileText;
  sections: LegalSection[];
};

const updatedAt = "Setembro de 2026";

const pages = {
  termos: {
    eyebrow: "Termos legais",
    title: "Termos de Uso",
    subtitle: "Regras para acessar e utilizar a plataforma Nex Notas.",
    updatedAt,
    icon: Scale,
    sections: [
      {
        title: "Aceitação dos Termos",
        paragraphs: [
          "Estes Termos de Uso regulam o acesso e a utilização da plataforma Nex Notas, incluindo sites, sistemas, funcionalidades, painéis, fluxos de onboarding, importação de arquivos, emissão fiscal, integrações, suporte e demais serviços relacionados.",
          "Ao acessar, criar uma conta, contratar um plano, realizar onboarding, importar arquivos, cadastrar empresas, configurar certificados digitais ou utilizar qualquer funcionalidade do Nex Notas, o usuário declara que leu, compreendeu e concorda com estes Termos de Uso e com a Política de Privacidade.",
          "Caso não concorde com estes Termos, o usuário não deve utilizar a plataforma.",
        ],
      },
      {
        title: "Sobre o Serviço",
        paragraphs: [
          "O Nex Notas é uma plataforma SaaS voltada à organização, preparação, importação, conferência e emissão de documentos fiscais, especialmente NFS-e, incluindo recursos ligados a relatórios de vendas e comissões, notas avulsas, tomadores, empresas, certificados digitais, arquivos fiscais, XML, DANFSe, histórico de emissões, cancelamentos e envio de documentos fiscais por e-mail.",
          "A plataforma pode alterar, aprimorar, suspender ou descontinuar funcionalidades, integrações ou fluxos, buscando preservar a continuidade do serviço e comunicar alterações relevantes quando necessário.",
        ],
        bullets: [
          "Cadastro de usuários, contas, empresas e membros de equipe.",
          "Onboarding fiscal da empresa e gestão de configurações fiscais.",
          "Upload, validação e uso operacional de certificado digital A1.",
          "Importação de relatórios, cadastro de tomadores e preparação de dados fiscais.",
          "Emissão, consulta, download, cancelamento e envio de NFS-e, XML e DANFSe.",
          "Painéis de uso, limites, planos, assinatura, segurança, auditoria e suporte.",
        ],
      },
      {
        title: "Conta do Usuário",
        paragraphs: [
          "Para utilizar a plataforma, o usuário deve criar uma conta com informações verdadeiras, completas e atualizadas. O usuário é responsável por manter a confidencialidade de suas credenciais, senhas, fatores de autenticação, dispositivos confiáveis e demais mecanismos de acesso.",
          "O usuário concorda em não compartilhar sua conta com terceiros não autorizados e em comunicar imediatamente qualquer suspeita de acesso indevido pelo e-mail contato@nexnotas.com.br.",
          "O Nex Notas poderá exigir autenticação adicional, confirmação por e-mail, MFA, códigos temporários, validação antifraude ou outros mecanismos de segurança para proteger a conta, a operação fiscal e os dados tratados.",
        ],
      },
      {
        title: "Responsabilidades do Usuário",
        paragraphs: [
          "O usuário é responsável pela veracidade, licitude e conferência dos dados inseridos ou importados na plataforma. O Nex Notas auxilia na automação e organização operacional, mas não substitui contador, advogado, consultor tributário ou orientação oficial de órgãos públicos.",
        ],
        bullets: [
          "Informar dados verdadeiros de cadastro, empresa, tomadores e documentos fiscais.",
          "Conferir os dados antes da emissão de qualquer documento fiscal.",
          "Garantir autorização para usar certificados digitais, dados de empresas e dados de tomadores.",
          "Validar obrigações fiscais, tributárias, contábeis e municipais aplicáveis à operação.",
          "Manter certificado digital válido, protegido e atualizado.",
          "Não emitir documentos falsos, fraudulentos, simulados ou juridicamente indevidos.",
          "Não importar dados desnecessários, sensíveis ou sem finalidade fiscal legítima.",
          "Não tentar burlar limites, autenticação, validações ou mecanismos de segurança.",
        ],
      },
      {
        title: "Responsabilidades das Partes",
        paragraphs: [
          "O Nex Notas é responsável por manter a plataforma, os recursos contratados, os controles de segurança sob sua gestão e o tratamento de dados que realizar como controlador ou operador, nos limites da lei e destes Termos.",
          "O usuário, a conta contratante e a empresa cadastrada são responsáveis pelas informações, arquivos, instruções, credenciais, permissões, certificados, configurações fiscais, decisões de emissão e obrigações legais, fiscais, contábeis e tributárias que estejam sob sua esfera de controle.",
          "O Nex Notas não se responsabiliza por prejuízos decorrentes de dados incorretos, incompletos ou desatualizados fornecidos pelo usuário; uso de certificado sem autorização; emissão solicitada em desacordo com a operação real; classificação fiscal, regime tributário, alíquota, retenção, CNAE, município ou natureza de serviço informados incorretamente; falhas de conexão, indisponibilidade ou rejeições de órgãos públicos, prefeituras, SEFIN, provedores municipais, gateways, serviços de e-mail, serviços de pagamento ou demais terceiros; nem por decisões fiscais ou contábeis tomadas sem orientação profissional.",
          "Essa divisão não exclui responsabilidades que não possam ser afastadas pela legislação aplicável. Caso exista falha comprovadamente atribuível ao Nex Notas, a responsabilidade será analisada conforme a participação de cada parte, o nexo causal, os limites legais e as condições contratadas.",
        ],
      },
      {
        title: "Certificado Digital e Emissão Fiscal",
        paragraphs: [
          "Quando o usuário envia um certificado digital A1, declara que possui autorização legítima para utilizá-lo em nome da empresa correspondente. O certificado e sua senha são utilizados para viabilizar funcionalidades fiscais, incluindo assinatura, transmissão, consulta, cancelamento ou processamento de documentos fiscais.",
          "O usuário reconhece que falhas em dados fiscais, configuração municipal, certificado vencido, indisponibilidade de prefeituras, ambiente nacional, provedores municipais, SEFIN, APIs públicas ou serviços de terceiros podem impedir, atrasar ou rejeitar a emissão.",
          "O Nex Notas poderá armazenar arquivos fiscais, XML, DANFSe, protocolos, respostas fiscais, eventos de auditoria e registros técnicos necessários para funcionamento, rastreabilidade, segurança, suporte e cumprimento de obrigações legais.",
        ],
      },
      {
        title: "Planos, Pagamentos e Limites",
        paragraphs: [
          "O Nex Notas pode oferecer planos gratuitos, pagos, promocionais, de teste, cortesia ou personalizados. Cada plano pode conter limites de uso, como quantidade de notas, empresas, usuários, importações, envios, funcionalidades ou recursos disponíveis.",
          "Ao contratar um plano pago, o usuário concorda com preço, periodicidade, recorrência, regras de cobrança, eventual renovação automática, condições de cancelamento e limites contratados.",
          "Pagamentos podem ser processados por provedores autorizados. Dados necessários à cobrança, confirmação antifraude, emissão de recibos, gestão de assinatura e conciliação financeira podem ser compartilhados conforme a Política de Privacidade.",
          "Inadimplência, suspeita de fraude, abuso de uso ou descumprimento destes Termos pode levar à suspensão parcial ou total do acesso.",
        ],
      },
      {
        title: "Uso Permitido e Proibido",
        paragraphs: ["É proibido utilizar o Nex Notas para finalidades ilícitas, abusivas ou incompatíveis com a prestação do serviço."],
        bullets: [
          "Praticar fraude fiscal, contábil, documental ou financeira.",
          "Emitir notas sem lastro, autorização ou correspondência com operação real.",
          "Usar dados pessoais, empresariais ou fiscais de terceiros sem autorização.",
          "Enviar arquivos maliciosos, vírus, scripts ou conteúdo prejudicial.",
          "Tentar acessar contas, dados, APIs, infraestrutura ou áreas administrativas sem permissão.",
          "Realizar engenharia reversa, scraping abusivo, exploração de falhas ou sobrecarga da plataforma.",
          "Violar direitos de terceiros, legislação aplicável, normas fiscais ou políticas de provedores integrados.",
        ],
      },
      {
        title: "Propriedade Intelectual",
        paragraphs: [
          "A marca Nex Notas, software, código, design, telas, fluxos, textos, materiais, integrações, bancos de dados, modelos operacionais e demais elementos da plataforma pertencem ao Nex Notas ou a seus licenciantes.",
          "O usuário recebe apenas uma licença limitada, revogável, não exclusiva e intransferível para usar a plataforma durante a vigência de sua conta ou contratação.",
          "Os dados fiscais, empresariais e operacionais inseridos pelo usuário permanecem vinculados ao usuário ou à empresa correspondente. O usuário autoriza o Nex Notas a processar tais dados exclusivamente para prestar os serviços, manter a plataforma, cumprir obrigações legais, oferecer suporte e proteger a operação.",
        ],
      },
      {
        title: "Disponibilidade, Manutenção e Terceiros",
        paragraphs: [
          "O Nex Notas buscará manter a plataforma disponível e segura, mas não garante funcionamento ininterrupto, livre de falhas ou imune a indisponibilidades externas.",
          "A plataforma depende de serviços de infraestrutura, provedores fiscais, serviços públicos, sistemas municipais, provedores de pagamento, provedores de e-mail, ferramentas de autenticação, APIs e serviços de terceiros. Falhas nesses serviços podem afetar funcionalidades da plataforma.",
        ],
      },
      {
        title: "Privacidade e Proteção de Dados",
        paragraphs: [
          "O tratamento de dados pessoais pelo Nex Notas é descrito na Política de Privacidade e na página de LGPD. Ao utilizar a plataforma, o usuário declara estar ciente de que dados pessoais, técnicos, fiscais, empresariais, de segurança, autenticação, pagamento e uso poderão ser tratados conforme as finalidades informadas.",
        ],
      },
      {
        title: "Suspensão e Encerramento",
        paragraphs: [
          "O Nex Notas poderá suspender ou encerrar contas em caso de violação destes Termos, uso indevido, fraude, risco fiscal, risco de segurança, inadimplência, ordem legal, solicitação de autoridade competente ou necessidade de proteção da plataforma e de terceiros.",
          "O usuário pode solicitar cancelamento da conta ou encerramento da assinatura pelos canais disponíveis na plataforma ou pelo e-mail contato@nexnotas.com.br.",
        ],
      },
      {
        title: "Limitação de Responsabilidade",
        paragraphs: [
          "Na máxima extensão permitida pela legislação aplicável, o Nex Notas não será responsável por prejuízos decorrentes de informações incorretas fornecidas pelo usuário, decisões fiscais ou contábeis tomadas sem orientação profissional, indisponibilidade de terceiros, falhas de prefeituras ou serviços públicos, mau uso da plataforma, compartilhamento indevido de credenciais, certificado digital inválido, rejeições fiscais ou obrigações legais do próprio usuário.",
          "Nenhuma disposição destes Termos limita ou exclui responsabilidade por condutas que, por lei, não possam ser limitadas ou excluídas. A plataforma não assume responsabilidade por resultado fiscal específico, deferimento por prefeitura, aceitação por sistema público, disponibilidade contínua de terceiros ou correção de dados que não tenham sido fornecidos, validados ou definidos pelo Nex Notas.",
        ],
      },
      {
        title: "Alterações dos Termos",
        paragraphs: [
          "Estes Termos podem ser atualizados periodicamente. Alterações relevantes poderão ser comunicadas pela plataforma, site, e-mail ou outro canal adequado. O uso contínuo da plataforma após a atualização representa concordância com a nova versão.",
        ],
      },
      {
        title: "Contato",
        paragraphs: ["Para dúvidas sobre estes Termos de Uso, fale conosco pelo e-mail contato@nexnotas.com.br."],
      },
    ],
  },
  privacidade: {
    eyebrow: "Privacidade",
    title: "Política de Privacidade",
    subtitle: "Como o Nex Notas coleta, usa, armazena, compartilha e protege dados pessoais.",
    updatedAt,
    icon: ShieldCheck,
    sections: [
      {
        title: "Introdução",
        paragraphs: [
          "Esta Política de Privacidade explica como o Nex Notas coleta, utiliza, armazena, compartilha e protege dados pessoais no uso do site, da plataforma, do onboarding, dos fluxos de cadastro, autenticação, importação, emissão fiscal, pagamento, suporte e demais serviços relacionados.",
          "Esta Política foi elaborada considerando a Lei Geral de Proteção de Dados Pessoais, Lei nº 13.709/2018, conhecida como LGPD.",
          "Ao utilizar o Nex Notas, o usuário declara estar ciente das práticas descritas nesta Política.",
        ],
      },
      {
        title: "Dados de Cadastro e Conta",
        paragraphs: ["Podemos tratar dados necessários para identificação, criação, administração e segurança da conta."],
        bullets: [
          "Nome, e-mail, senha criptografada ou hash de senha.",
          "Status de verificação de e-mail, preferências de conta e dados de membros.",
          "Permissões, papéis, conta ativa, plano, limites e histórico de uso.",
          "Registros de criação, acesso, atualização e uso da conta.",
        ],
      },
      {
        title: "Dados de Autenticação e Segurança",
        paragraphs: ["Para proteger a conta e a plataforma, podemos tratar dados técnicos e registros de segurança."],
        bullets: [
          "Endereço IP, hash de IP, user agent e hash de user agent.",
          "País, região, cidade aproximada, data e hora de acesso.",
          "Tentativas de login, falhas, bloqueios, códigos de autenticação e MFA/TOTP.",
          "Registro de dispositivos confiáveis, cookies de sessão, logs de auditoria e eventos administrativos.",
        ],
      },
      {
        title: "Dados de Empresa e Onboarding",
        paragraphs: ["Durante o onboarding e o uso fiscal, podemos coletar dados empresariais, cadastrais e operacionais."],
        bullets: [
          "CNPJ, razão social, nome fantasia, e-mail e telefone da empresa.",
          "Endereço, CEP, cidade, UF, código IBGE, CNAE, porte e regime fiscal.",
          "Situação cadastral, natureza jurídica e dados retornados por consultas cadastrais.",
          "Configurações fiscais, municipais, operacionais e preferências de envio fiscal.",
        ],
      },
      {
        title: "Certificado Digital A1",
        paragraphs: [
          "Quando necessário para emissão fiscal, o usuário pode enviar certificado digital A1 e senha. Esses dados são utilizados para validar, armazenar de forma protegida e operar funcionalidades fiscais vinculadas à empresa cadastrada.",
          "O Nex Notas pode armazenar o certificado de forma criptografada, metadados técnicos, validade, CNPJ associado, fingerprint e informações necessárias para operação fiscal. A senha do certificado também pode ser protegida separadamente.",
        ],
      },
      {
        title: "Tomadores, Vendedores e Destinatários",
        paragraphs: ["Para emissão fiscal, importação e envio de documentos, podemos tratar dados de terceiros informados ou importados pelo cliente."],
        bullets: [
          "Nome, razão social, CPF, CNPJ ou identificação fiscal estrangeira.",
          "E-mail, endereço, CEP, cidade, UF, país e inscrição estadual, quando aplicável.",
          "Nome de loja, identificador de loja, dados originais importados e histórico de documentos fiscais.",
        ],
      },
      {
        title: "Importações e Documentos Fiscais",
        paragraphs: ["Podemos tratar arquivos, dados normalizados e registros necessários à emissão, consulta, armazenamento e rastreabilidade fiscal."],
        bullets: [
          "Arquivos CSV ou outros arquivos enviados pelo usuário.",
          "Nome do arquivo, tamanho, hash, data de importação, erros, validações e duplicidades.",
          "Dados de NFS-e, DPS, RPS, XML, DANFSe, protocolos e respostas fiscais.",
          "Histórico de emissão, cancelamento, rejeição, reprocessamento e tentativas fiscais.",
        ],
      },
      {
        title: "Pagamento, Plano e Assinatura",
        paragraphs: [
          "Em fluxos de contratação e cobrança, podemos tratar dados necessários para pagamento, antifraude, aceite legal, gestão de assinatura, faturas e conciliação.",
          "Dados completos de cartão, quando aplicável, devem ser processados diretamente por provedores de pagamento autorizados, não sendo objetivo do Nex Notas armazenar número completo de cartão.",
        ],
        bullets: [
          "Nome, e-mail, telefone, documento informado ou mascarado.",
          "Plano, oferta, cupom, afiliado, origem, UTM e aceite legal.",
          "IP ou hash de IP, fingerprint antifraude, status de assinatura, fatura e pagamento.",
          "IDs de provedores de pagamento e eventos de webhook financeiros.",
        ],
      },
      {
        title: "Cookies e Navegação",
        paragraphs: [
          "No site e na plataforma, podemos usar cookies e tecnologias similares para funcionamento, segurança, sessão, autenticação, preferências, analytics, marketing e melhoria de experiência.",
          "Cookies necessários são essenciais para a plataforma funcionar. Cookies opcionais, como analytics, marketing e experiência, devem respeitar as preferências do usuário quando aplicável.",
        ],
        bullets: [
          "Cookies necessários para sessão, segurança e autenticação.",
          "Preferências de cookies, tema ou empresa ativa.",
          "Páginas acessadas, eventos de navegação e interações.",
          "Localização aproximada por IP e localização precisa por navegador somente quando o usuário autorizar expressamente.",
        ],
      },
      {
        title: "Finalidades do Tratamento",
        paragraphs: ["Os dados são tratados para prestar, proteger, melhorar e administrar a plataforma."],
        bullets: [
          "Criar e administrar contas, autenticar usuários e prevenir fraude.",
          "Realizar onboarding fiscal, validar empresas, certificados e configurações.",
          "Importar, processar, emitir, consultar, cancelar e armazenar documentos fiscais.",
          "Enviar XML, DANFSe e comunicações transacionais.",
          "Gerenciar planos, pagamentos, assinaturas, limites e suporte.",
          "Cumprir obrigações legais, fiscais, regulatórias e contratuais.",
          "Manter logs de auditoria, segurança e atender solicitações de titulares e autoridades.",
        ],
      },
      {
        title: "Bases Legais",
        paragraphs: ["Dependendo do caso, o Nex Notas pode tratar dados pessoais com base em execução de contrato, cumprimento de obrigação legal ou regulatória, exercício regular de direitos, legítimo interesse, consentimento, proteção do crédito ou prevenção a fraude."],
      },
      {
        title: "Compartilhamento de Dados",
        paragraphs: [
          "O Nex Notas não vende dados pessoais. Dados podem ser compartilhados com terceiros necessários à prestação do serviço, segurança, cobrança, suporte, emissão fiscal, cumprimento legal ou defesa de direitos.",
          "Isso pode incluir provedores de infraestrutura, autenticação, segurança, e-mail transacional, pagamento, APIs cadastrais, sistemas fiscais, prefeituras, ambiente nacional de NFS-e, provedores municipais, suporte, auditoria, contabilidade, jurídico, tecnologia e autoridades públicas quando aplicável.",
        ],
      },
      {
        title: "Responsabilidades no Tratamento",
        paragraphs: [
          "O Nex Notas é responsável por tratar dados pessoais de acordo com as finalidades informadas, adotar medidas de segurança proporcionais ao serviço, controlar acessos sob sua gestão, manter registros necessários e atender solicitações de titulares dentro dos limites técnicos, legais e contratuais aplicáveis.",
          "O cliente é responsável por garantir que possui base legal, autorização e legitimidade para inserir, importar ou instruir o tratamento de dados de empresas, tomadores, vendedores, destinatários, membros de equipe e demais terceiros na plataforma. Também cabe ao cliente conferir a necessidade, exatidão, atualização e pertinência dos dados enviados.",
          "Quando o Nex Notas tratar dados em nome do cliente para importação, emissão fiscal, armazenamento de documentos, envio de XML ou DANFSe e suporte operacional, o cliente permanece responsável pelas instruções dadas, pela origem lícita dos dados e pela adequação fiscal da operação.",
          "O Nex Notas não se responsabiliza por danos causados exclusivamente por informação incorreta, excessiva ou ilícita enviada pelo cliente; instrução incompatível com a lei; uso não autorizado de certificado; compartilhamento indevido de credenciais; ação de usuário autorizado da conta; ou falha de terceiros e órgãos públicos fora de sua esfera de controle. Essa previsão não afasta responsabilidades legais do Nex Notas quando houver violação atribuível à própria plataforma.",
        ],
      },
      {
        title: "Armazenamento e Segurança",
        paragraphs: [
          "O Nex Notas adota medidas técnicas e organizacionais para proteger dados pessoais, incluindo criptografia, controles de acesso, logs, segregação de ambientes, proteção de credenciais, autenticação multifator, armazenamento privado de arquivos fiscais e uso de hashes quando adequado.",
          "Apesar das medidas de segurança, nenhum sistema é totalmente imune a incidentes. Em caso de incidente relevante envolvendo dados pessoais, o Nex Notas adotará as medidas cabíveis, incluindo avaliação, mitigação, comunicação quando aplicável e cooperação com autoridades competentes.",
        ],
      },
      {
        title: "Retenção e Eliminação",
        paragraphs: [
          "Os dados serão mantidos pelo período necessário para cumprir as finalidades descritas nesta Política, obrigações legais, fiscais, contábeis, contratuais, regulatórias, prevenção a fraude, auditoria, suporte e exercício regular de direitos.",
          "Quando não forem mais necessários, os dados poderão ser eliminados, anonimizados ou bloqueados, conforme aplicável.",
        ],
      },
      {
        title: "Direitos dos Titulares",
        paragraphs: ["Nos termos da LGPD, o titular pode solicitar confirmação de tratamento, acesso, correção, anonimização, bloqueio, eliminação, portabilidade, informações sobre compartilhamento, revogação de consentimento, revisão de decisões automatizadas quando aplicável e demais direitos previstos em lei. Solicitações podem ser feitas pelo e-mail dados@nexnotas.com.br."],
      },
      {
        title: "Crianças e Adolescentes",
        paragraphs: ["O Nex Notas não é direcionado a crianças ou adolescentes. A plataforma é voltada a usuários capazes de contratar ou representar empresas e operações fiscais. Caso seja identificado tratamento indevido de dados de menores, medidas de eliminação ou regularização poderão ser adotadas."],
      },
      {
        title: "Transferência Internacional",
        paragraphs: ["Alguns fornecedores de infraestrutura, e-mail, autenticação, segurança, analytics ou pagamento podem tratar dados fora do Brasil. Quando isso ocorrer, o Nex Notas adotará medidas compatíveis com a LGPD e buscará trabalhar com fornecedores que ofereçam padrões adequados de proteção."],
      },
      {
        title: "Alterações e Contato",
        paragraphs: [
          "Esta Política poderá ser atualizada periodicamente. Mudanças relevantes poderão ser comunicadas pelo site, plataforma, e-mail ou outro canal apropriado.",
          "Para dúvidas sobre privacidade e proteção de dados, fale conosco pelos e-mails contato@nexnotas.com.br e dados@nexnotas.com.br.",
        ],
      },
    ],
  },
  lgpd: {
    eyebrow: "Conformidade LGPD",
    title: "LGPD e Proteção de Dados",
    subtitle: "Como o Nex Notas aplica transparência, segurança e responsabilidade no tratamento de dados.",
    updatedAt,
    icon: ShieldCheck,
    sections: [
      {
        title: "Nosso Compromisso",
        paragraphs: [
          "O Nex Notas trata a proteção de dados pessoais como parte essencial da operação da plataforma. Por lidar com dados de usuários, empresas, tomadores, documentos fiscais, certificados digitais, registros de autenticação, pagamentos e arquivos de importação, adotamos práticas voltadas à transparência, segurança, necessidade, rastreabilidade e conformidade com a LGPD.",
          "Esta página resume, de forma objetiva, como aplicamos princípios de proteção de dados no Nex Notas.",
        ],
      },
      {
        title: "Papel do Nex Notas",
        paragraphs: [
          "Dependendo do contexto, o Nex Notas pode atuar como controlador ou operador de dados pessoais.",
          "Em geral, o Nex Notas poderá atuar como controlador dos dados necessários para cadastro, autenticação, cobrança, segurança, suporte, analytics, relacionamento com usuários e administração da plataforma.",
          "Em determinadas operações fiscais realizadas em nome do usuário ou da empresa cadastrada, o Nex Notas poderá atuar como operador, tratando dados conforme instruções do cliente para viabilizar importações, emissão fiscal, armazenamento de arquivos, envio de documentos e suporte operacional.",
        ],
      },
      {
        title: "Divisão de Responsabilidades",
        paragraphs: [
          "Como controlador, o Nex Notas define finalidades e meios de tratamento ligados à conta, segurança, cobrança, suporte, comunicações, melhoria da plataforma e administração do serviço, respondendo pelos tratamentos que realizar nessa condição.",
          "Como operador, o Nex Notas executa tratamentos em nome do cliente para finalidades como importação de relatórios, preparação de dados fiscais, emissão de NFS-e, armazenamento de documentos, envio de arquivos fiscais e suporte operacional. Nesses casos, o cliente é responsável pelas instruções, pela origem lícita dos dados, pela base legal aplicável e pela conferência das informações antes da emissão.",
          "O Nex Notas não responde por fatos exclusivamente atribuíveis ao cliente, a usuários autorizados, a dados fornecidos de forma incorreta ou ilícita, a certificados usados sem autorização, a escolhas fiscais ou contábeis do cliente, nem por indisponibilidades, rejeições, exigências ou decisões de órgãos públicos, prefeituras, provedores fiscais, instituições financeiras, serviços de e-mail, ferramentas de autenticação ou demais terceiros fora de seu controle.",
          "A limitação acima não afasta responsabilidades legais quando houver falha, tratamento irregular, deficiência de segurança ou violação atribuível ao Nex Notas. A análise de responsabilidade deve considerar a função exercida no tratamento, a participação de cada parte, o nexo causal, as medidas de segurança adotadas e as exceções previstas em lei.",
        ],
      },
      {
        title: "Princípios Aplicados",
        paragraphs: ["O Nex Notas busca observar os princípios da LGPD no desenho e na operação da plataforma."],
        bullets: [
          "Finalidade, adequação e necessidade no uso dos dados.",
          "Livre acesso, qualidade dos dados e transparência.",
          "Segurança, prevenção e redução de riscos de incidentes.",
          "Não discriminação, responsabilização e prestação de contas.",
        ],
      },
      {
        title: "Dados Tratados",
        paragraphs: ["A plataforma pode tratar dados de usuários, membros de conta, empresas emitentes, tomadores, vendedores, certificados digitais A1, arquivos importados, documentos fiscais, XML, DANFSe, protocolos, sessões, IPs, logs, eventos de segurança, pagamentos, assinaturas, aceites legais e comunicações transacionais ou fiscais."],
      },
      {
        title: "Segurança da Informação",
        paragraphs: ["Entre as medidas adotadas ou recomendadas na operação do Nex Notas estão controles técnicos e administrativos para reduzir risco, proteger acessos e preservar rastreabilidade."],
        bullets: [
          "Uso de HTTPS/TLS, cookies de sessão protegidos e autenticação multifator.",
          "Rate limit, bloqueios de segurança, registro de tentativas suspeitas e logs de auditoria.",
          "Hash de determinados identificadores técnicos e criptografia de certificado digital e senha.",
          "Buckets privados para arquivos fiscais e controles administrativos com autenticação reforçada.",
          "Separação de permissões por conta, empresa e papel de usuário.",
        ],
      },
      {
        title: "Certificados Digitais e Dados Fiscais",
        paragraphs: [
          "O certificado digital A1 é um ativo sensível para a operação fiscal. Seu uso deve ocorrer apenas quando autorizado pelo titular ou representante legítimo da empresa.",
          "O Nex Notas pode utilizar o certificado para validar dados, assinar documentos, transmitir informações fiscais, consultar status, baixar documentos, cancelar notas e executar rotinas necessárias à prestação do serviço.",
          "O usuário deve manter controle sobre quem tem autorização para cadastrar, substituir ou remover certificados.",
        ],
      },
      {
        title: "Cookies e Consentimento",
        paragraphs: [
          "O Nex Notas utiliza cookies necessários para funcionamento, autenticação e segurança. Cookies opcionais de analytics, marketing ou experiência devem respeitar as escolhas do usuário.",
          "O usuário deve poder aceitar, recusar ou personalizar cookies opcionais quando aplicável. A plataforma deve evitar enviar dados sensíveis ou fiscais para ferramentas de análise, marketing ou gravação de sessão.",
        ],
      },
      {
        title: "Direitos dos Titulares",
        paragraphs: ["Titulares de dados podem entrar em contato para exercer direitos previstos na LGPD, como confirmação de tratamento, acesso, correção, eliminação, anonimização, bloqueio, informação sobre compartilhamento e revogação de consentimento. O canal para solicitações é dados@nexnotas.com.br."],
      },
      {
        title: "Resposta a Solicitações",
        paragraphs: [
          "Ao receber uma solicitação, o Nex Notas poderá validar a identidade do solicitante antes de fornecer informações ou realizar alterações, especialmente quando houver risco de exposição de dados fiscais, empresariais, financeiros ou de terceiros.",
          "Alguns dados podem não ser eliminados imediatamente quando houver obrigação legal, fiscal, regulatória, necessidade de auditoria, prevenção a fraude ou exercício regular de direitos.",
        ],
      },
      {
        title: "Incidentes de Segurança",
        paragraphs: ["Em caso de suspeita ou confirmação de incidente envolvendo dados pessoais, o Nex Notas deverá avaliar o risco, conter o incidente, preservar evidências, adotar medidas corretivas e comunicar titulares e/ou autoridades competentes quando exigido pela legislação aplicável."],
      },
      {
        title: "Boas Práticas para Usuários",
        paragraphs: ["Recomendamos que os usuários ativem autenticação em dois fatores, não compartilhem senhas, usem e-mails corporativos confiáveis, revisem permissões de equipe, removam usuários sem necessidade de acesso, confiram dados antes de emitir documentos fiscais, evitem importar informações desnecessárias, mantenham certificados digitais protegidos e informem rapidamente qualquer suspeita de uso indevido."],
      },
      {
        title: "Contato LGPD",
        paragraphs: ["Para dúvidas, solicitações ou comunicações relacionadas à proteção de dados, fale conosco pelos e-mails contato@nexnotas.com.br e dados@nexnotas.com.br."],
      },
    ],
  },
} satisfies Record<string, LegalPageContent>;

function LegalPage({ page }: { page: LegalPageContent }) {
  const Icon = page.icon;

  return (
    <div className="min-h-screen bg-[#fbfcfe] text-[#061747]">
      <header className="border-b border-[#ebedf2] bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
          <Link to="/" className="inline-flex items-center gap-3">
            <img className="h-7 w-auto" src="/logo-text-roxo.svg" alt="Nex Notas" />
            <span className="hidden items-center gap-2 text-sm font-semibold text-[#4f56f6] sm:inline-flex">
              <ArrowLeft className="h-4 w-4" />
              Voltar ao site
            </span>
          </Link>
          <Link to="/ajuda" className="text-sm font-semibold text-[#667085] transition hover:text-[#4f56f6]">Central de Ajuda</Link>
        </div>
      </header>

      <main>
        <section className="border-b border-[#ebedf2] bg-white py-16">
          <div className="mx-auto max-w-6xl px-5">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-end">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-[#dfe3ff] bg-[#f4f5ff] px-3 py-1 text-xs font-bold text-[#4f56f6]">
                  <Icon className="h-4 w-4" />
                  {page.eyebrow}
                </span>
                <h1 className="mt-5 font-heading text-4xl font-semibold tracking-normal text-[#061747] sm:text-5xl">{page.title}</h1>
                <p className="mt-4 max-w-3xl text-base leading-7 text-[#667085]">{page.subtitle}</p>
              </div>
              <div className="rounded-[8px] border border-[#e6e9ef] bg-[#fbfcfe] p-4 text-sm leading-6 text-[#667085]">
                <strong className="block text-[#344054]">Última atualização</strong>
                {page.updatedAt}
                <span className="mt-3 block text-xs leading-5 text-[#8a94a8]">Minuta operacional sujeita a revisão jurídica.</span>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="mx-auto grid max-w-6xl gap-8 px-5 lg:grid-cols-[260px_minmax(0,1fr)]">
            <aside className="lg:sticky lg:top-6 lg:self-start">
              <nav className="rounded-[8px] border border-[#e6e9ef] bg-white p-4">
                <strong className="text-xs font-bold uppercase text-[#667085]">Nesta página</strong>
                <div className="mt-3 grid gap-2">
                  {page.sections.map((section) => (
                    <a key={section.title} href={`#${sectionId(section.title)}`} className="text-sm leading-5 text-[#667085] transition hover:text-[#4f56f6]">
                      {section.title}
                    </a>
                  ))}
                </div>
              </nav>
            </aside>

            <article className="rounded-[8px] border border-[#e6e9ef] bg-white p-6 shadow-[0_18px_48px_rgba(6,23,71,.04)] sm:p-8">
              <div className="space-y-10">
                {page.sections.map((section, index) => (
                  <section key={section.title} id={sectionId(section.title)} className="scroll-mt-6">
                    <div className="flex items-start gap-3">
                      <span className="mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-[8px] bg-[#f4f5ff] text-xs font-bold text-[#4f56f6]">{index + 1}</span>
                      <div className="min-w-0">
                        <h2 className="font-heading text-2xl font-semibold tracking-normal text-[#061747]">{section.title}</h2>
                        {section.paragraphs?.map((paragraph) => (
                          <p key={paragraph} className="mt-4 text-sm leading-7 text-[#5d667c]">{paragraph}</p>
                        ))}
                        {section.bullets ? (
                          <ul className="mt-4 grid gap-3 text-sm leading-6 text-[#5d667c]">
                            {section.bullets.map((item) => (
                              <li key={item} className="flex gap-3">
                                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#4f56f6]" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        ) : null}
                      </div>
                    </div>
                  </section>
                ))}
              </div>

              <div className="mt-12 rounded-[8px] border border-[#dfe3ff] bg-[#f4f5ff] p-5">
                <h2 className="font-heading text-xl font-semibold text-[#061747]">Precisa falar com a Nex Notas?</h2>
                <p className="mt-2 text-sm leading-6 text-[#667085]">Para dúvidas sobre privacidade, termos ou proteção de dados, use os canais contato@nexnotas.com.br e dados@nexnotas.com.br.</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <a href="mailto:contato@nexnotas.com.br"><Button className="rounded-[10px] bg-[#4f56f6] hover:bg-[#454cf0]">Falar com atendimento</Button></a>
                  <Link to="/ajuda"><Button variant="outline" className="rounded-[10px] border-[#dfe3ff] bg-white text-[#344054] hover:bg-[#f7f8ff]">Ver ajuda</Button></Link>
                </div>
              </div>
            </article>
          </div>
        </section>
      </main>
      <footer className="border-t border-[#ebedf2] bg-white py-6">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 text-xs text-[#8a94a8]">
          <span>© 2026 Nex Notas. Todos os direitos reservados.</span>
          <button type="button" className="font-semibold text-[#4f56f6] hover:underline" onClick={openCookiePreferences}>Preferências de cookies</button>
        </div>
      </footer>
    </div>
  );
}

function sectionId(title: string) {
  return title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function TermsPage() {
  return <LegalPage page={pages.termos} />;
}

export function PrivacyPage() {
  return <LegalPage page={pages.privacidade} />;
}

export function LgpdPage() {
  return <LegalPage page={pages.lgpd} />;
}
