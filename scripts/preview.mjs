#!/usr/bin/env node
/**
 * preview.mjs — gera um HTML de preview do template com dados FAKE realistas.
 * Não usa Claude API. Apenas pra validar o visual antes de codar a integração real.
 *
 * Uso:
 *   node scripts/preview.mjs
 *
 * Saída:
 *   editions/preview/preview.html
 */

import fs from "node:fs";
import path from "node:path";

const FAKE_DATA = {
  edicao: 20,
  periodo: "10 a 16 / Mai / 2026",

  indicadores: [
    {
      title: "Petróleo & Energia",
      items: [
        { name: "Brent (USD/barril)", value: "US$ 103,73", variation: "+2,41%", direction: "up", source: "ICE / Investing" },
        { name: "WTI (USD/barril)", value: "US$ 97,43", variation: "+2,11%", direction: "up", source: "NYMEX" },
      ],
    },
    {
      title: "Moedas",
      items: [
        { name: "USD / BRL", value: "R$ 4,8877", variation: "-0,12%", direction: "down", source: "Banco Central" },
        { name: "EUR / BRL", value: "R$ 5,7530", variation: "-0,17%", direction: "down", source: "Banco Central" },
        { name: "DXY (Dólar Index)", value: "97,9", variation: "estável", direction: "neutral", source: "ICE" },
        { name: "Bitcoin", value: "US$ 80.817", variation: "+0,03%", direction: "neutral", source: "Coinbase" },
      ],
    },
    {
      title: "Bolsas",
      items: [
        { name: "Ibovespa", value: "181.909 pts", variation: "-1,19%", direction: "down", source: "B3" },
        { name: "S&P 500", value: "7.412,87", variation: "+0,19%", direction: "up", source: "NYSE" },
        { name: "Nasdaq", value: "26.274,12", variation: "+0,10%", direction: "up", source: "Nasdaq" },
        { name: "Dow Jones", value: "49.704,34", variation: "+0,19%", direction: "up", source: "NYSE" },
      ],
    },
    {
      title: "Juros & Inflação",
      items: [
        { name: "Selic", value: "14,50% a.a.", variation: "-0,25 p.p. (29/abr)", direction: "down", source: "Copom" },
        { name: "Fed Funds", value: "3,50–3,75%", variation: "mantido", direction: "neutral", source: "FOMC" },
        { name: "IPCA-15 (abr)", value: "0,89%", variation: "12m: 4,37%", direction: "up", source: "IBGE" },
        { name: "Focus IPCA 2026", value: "4,91%", variation: "9ª alta consecutiva", direction: "up", source: "BCB / Focus" },
      ],
    },
    {
      title: "Preço na Bomba (ANP)",
      items: [
        { name: "Gasolina C", value: "R$ 6,67/L", variation: "ref. 26/abr–01/mai", direction: "neutral", source: "ANP" },
        { name: "Etanol Hidratado", value: "R$ 4,56/L", variation: "ref. 26/abr–01/mai", direction: "neutral", source: "ANP" },
        { name: "Diesel S-10", value: "a confirmar", variation: null, direction: "pending", source: "ANP — síntese 04–08/mai pendente" },
        { name: "Diesel comum", value: "R$ 7,10/L", variation: "ref. 26/abr–01/mai", direction: "neutral", source: "ANP" },
        { name: "GLP P-13", value: "R$ 114,88", variation: "ref. 26/abr–01/mai", direction: "neutral", source: "ANP" },
      ],
    },
    {
      title: "Usina (CEPEA/ESALQ)",
      items: [
        { name: "Etanol Hidratado SP", value: "R$ 2,5920/L", variation: "-7,01% sem.", direction: "down", source: "CEPEA" },
        { name: "Etanol Anidro SP", value: "R$ 2,9575/L", variation: "-7,43% sem.", direction: "down", source: "CEPEA" },
      ],
    },
    {
      title: "Defasagem Petrobras (Abicom)",
      items: [
        { name: "Diesel", value: "52%", variation: "potencial R$ 1,87/L", direction: "up", source: "Abicom — janela fechada 112d" },
        { name: "Gasolina", value: "88%", variation: "potencial R$ 2,22/L", direction: "up", source: "Abicom — janela fechada 69d" },
      ],
    },
  ],

  manchetes: [
    {
      numero: 1,
      headline: "Brent dispara para US$ 103 e Petrobras enfrenta defasagem de 88% na gasolina",
      resumo: "Petróleo sobe 2,41% nesta terça com Trump declarando que cessar-fogo com o Irã está em \"massive life support\". Estreito de Hormuz segue fechado. Defasagem Petrobras na gasolina atinge nível recorde de 88% — potencial repasse de R$ 2,22/L.",
    },
    {
      numero: 2,
      headline: "Receita Federal e ANP miram 8 mil postos em operação contra adulteração",
      resumo: "Força-tarefa começou segunda (12/Mai) em 14 estados. Foco em metanol em gasolina e mistura abaixo do mandato no diesel. Em MT, fiscalização cruza notas fiscais com bombeio reportado — desvios acima de 3% disparam auditoria automática.",
    },
    {
      numero: 3,
      headline: "Etanol hidratado cai 7% na usina e abre janela inversa — paridade pode mudar em horas",
      resumo: "CEPEA registrou anidro abaixo de R$ 3,00 pela 1ª vez desde ago/2023. Distribuidoras postergam reposição. Se Petrobras reajustar gasolina após teleconferência, etanol vira competitivo imediatamente nos postos do Centro-Oeste.",
    },
    {
      numero: 4,
      headline: "SUV híbrido supera carro a combustão pela 1ª vez no Brasil (Fenabrave abril)",
      resumo: "Híbridos com 18,2% de share vs. 17,9% de combustão pura em SUVs. BYD Song Plus lidera; Toyota Corolla Cross Hybrid Flex avança. Impacto direto no mix de combustíveis dos próximos 5 anos — etanol cresce, gasolina retrocede.",
    },
    {
      numero: 5,
      headline: "Selic mantida em 14,50% — Focus eleva IPCA 2026 para 4,91% na 9ª alta seguida",
      resumo: "Copom unânime em 29/abr cortou 0,25 p.p. Focus de 11/mai elevou IPCA 2026 distanciando do teto da meta (4,5%). Crédito pra reforma de posto e leasing de frota fica mais previsível, mas custo segue alto.",
    },
  ],

  mercado: {
    headline: "Defasagem em 88% e teleconferência da Petrobras hoje: três cenários pra próxima semana",
    deck: "Com Brent acima de US$ 103, gasolina sem reajuste há 105 dias e janela de importação fechada há 69+ dias, qualquer sinalização hoje vira gatilho operacional imediato para os postos.",
    body: [
      "A combinação de fatores na semana é a mais explosiva desde a crise de Hormuz de 2024: <strong>Brent a US$ 103,73 (+2,41%)</strong>, dólar firme em R$ 4,88, Estreito de Hormuz efetivamente fechado pelo Irã, e defasagem Petrobras no nível mais alto do ano — <strong>88% na gasolina e 52% no diesel</strong>, segundo Abicom de 12/mai.",
      "A teleconferência da Petrobras está marcada pra hoje (14h BRT). O mercado precifica três cenários: (1) reajuste imediato de R$ 0,40-0,60/L na gasolina e R$ 0,30-0,40/L no diesel, levando margens das refinarias independentes a colapsarem temporariamente; (2) anúncio de revisão gradual em 30 dias, mantendo defasagem por mais 2-3 semanas; (3) silêncio estratégico, preservando a política atual e abrindo espaço pra importadores capturarem mercado.",
      "Pra revendedor: se você está bandeira branca abastecido por importador, <strong>trave compras agora</strong> — o repasse de importação já chegou. Pra bandeiras Petrobras, monitore o comunicado pós-call. Acelen/Mataripe já anunciou redução pontual de R$ 0,12/L no diesel ontem (12/mai), antecipando movimento.",
    ],
  },

  politica: {
    headline: "Lula sinaliza vetar projeto que blinda Petrobras de defasagem — governadores reagem",
    deck: "PL 1.292/26 aprovado na Câmara obriga Petrobras a manter preços abaixo da paridade. Planalto recua após pressão do BNDES e mercado. Lewandowski é nome cogitado para mediar.",
    body: [
      "O <strong>PL 1.292/26</strong>, aprovado na Câmara na quinta (08/mai) por 312 a 167 votos, virou o assunto mais sensível do governo Lula nesta semana. O texto, de autoria do deputado Carlos Sampaio (PSDB-SP) e relatado pelo PT, obriga a Petrobras a manter os preços do diesel e da gasolina <strong>até 30% abaixo da paridade de importação</strong>, na prática transformando a estatal em instrumento de política anti-inflacionária permanente.",
      "Nesta terça (12/mai), o presidente Lula deu sinais de que pode vetar o projeto após reunião com Aloizio Mercadante (BNDES) e Magda Chambriard (Petrobras). A pressão é dupla: o mercado financeiro precificou queda de 4,8% nas ações da PETR4 desde a aprovação, e os <strong>governadores do Centro-Oeste e Sul</strong> — incluindo Mauro Mendes (MT) — protestam que a medida vai sufocar as estatais que pagam dividendos a fundos estaduais.",
      "Pra revendedor, a leitura é cirúrgica: se Lula sancionar, defasagem fica permanente e o repasse de altas do Brent some — boa pra margem de quem é bandeira Petrobras, ruim pra quem é bandeira branca (importador some). Se vetar, mantém o status atual com defasagem oscilando livremente. O <strong>STF já recebeu duas ADIs preventivas</strong> contra o projeto, ajuizadas pela ABICOM e pela CNI. Próximos 30 dias definem o rumo de 2026 inteiro.",
    ],
  },

  economiaBrasil: {
    headline: "Focus eleva IPCA pelo 9º mês e Selic 11,25% em 2027 — o ciclo de corte virou miragem",
    deck: "Boletim de 11/mai mostra inflação descolando da meta, expectativas piorando e mercado precificando juros altos por mais tempo. Reflexo direto no custo de crédito pra reforma e leasing.",
    body: [
      "O Boletim Focus de 11/mai trouxe a <strong>9ª alta consecutiva</strong> na projeção de IPCA para 2026, agora em 4,91% — acima do teto da meta contínua de 4,5%. Mais grave: a projeção de Selic para o fim de 2027 subiu de 11,00% para 11,25%, oficializando que o mercado não acredita mais num ciclo agressivo de corte de juros. A combinação de inflação resistente, dólar volátil e gastos públicos crescentes ancorou as expectativas.",
      "O IPCA-15 de abril (0,89%) já mostrava a deterioração: combustíveis e alimentos pressionando, com transmissão direta do petróleo internacional. Estudo Daycoval citado pelo Banco Central aponta que <strong>petróleo respondeu por ~60% da inflação do 1T26</strong> — 0,82 p.p. dos 1,4% acumulados no trimestre. Com Brent em US$ 103+ e Hormuz fechado, a tendência é piora no 2T.",
      "Pra revendedor: o crédito para reforma de posto, troca de bombas e expansão de loja segue caro — taxas entre 19% e 24% a.a. em linhas com garantia. Leasing de frota saiu da janela favorável. <strong>Recomendação prática</strong>: se você está com projeto na gaveta há mais de 6 meses, reavalie viabilidade com a hipótese de Selic terminar 2027 ainda acima de 11%. O cenário de juros baixos voltou a ser miragem.",
    ],
  },

  economiaInternacional: {
    headline: "Fed dividido, Hormuz em jogo e Wall Street em recordes: o paradoxo americano",
    deck: "S&P 500 e Nasdaq renovam máximas históricas enquanto Brent dispara e Fed reluta em cortar. Payroll forte de abril (+115k) elimina chance de corte em 2026 — semana decisiva com CPI hoje.",
    body: [
      "O paradoxo de Wall Street nesta semana é o que mais chama atenção: <strong>S&P 500 e Nasdaq renovaram recordes históricos de fechamento</strong> na segunda (11/mai), com semicondutores (Micron, Nvidia, Tesla +3%) e IA puxando o movimento. Simultaneamente, o Brent dispara a US$ 103, o Estreito de Hormuz segue efetivamente fechado pelo Irã, e o Fed manteve juros em 3,50–3,75% por dissensão interna de 8 a 4 — a maior divisão desde 1992.",
      "O payroll de abril surpreendeu fortemente: <strong>+115 mil vagas vs. +62k esperados</strong>, desemprego em 4,3%. Isso eliminou a chance de corte de juros em 2026 e empurrou o yield do Treasury 10y para a faixa 4,40–4,45%. O CPI americano sai hoje (12/mai) e é o gatilho da semana — qualquer surpresa altista derruba bolsas e força reprecificação global. <strong>Kevin Warsh assume o Fed em 15/mai</strong> — sua linha mais hawkish já está precificada.",
      "Pra revendedor brasileiro, a leitura é indireta mas relevante: enquanto Wall Street estiver em recorde, o apetite por risco emergente segue, dólar não dispara e a paridade de combustíveis fica gerenciável. Se o CPI surpreender hoje (acima de 0,3% m/m), o cenário muda em horas — dólar a R$ 5+ volta ao radar, defasagem Petrobras explode, e a janela de reajuste se reabre. Acompanhe os dois números: <strong>CPI EUA e Brent fechamento de hoje.</strong>",
    ],
  },

  varejo: {
    headline: "Conveniência puxa lucro: postos com loja crescem 18% no 1º quadrimestre",
    deck: "Pesquisa Fecombustíveis aponta que rede com loja tem ticket médio 2,3× maior que postos só de bombeamento. Café e padaria lideram tráfego; conveniência vira centro de margem.",
    body: [
      "A pesquisa Fecombustíveis sobre desempenho do varejo de combustíveis no <strong>1º quadrimestre de 2026</strong> traz um dado que muda a equação da gestão: postos com loja de conveniência integrada cresceram 18% em receita total, contra 4% dos postos só de bombeamento. Margem operacional dessas redes está em 11% vs. 4% da média.",
      "O ticket médio é o indicador mais elucidativo. Cliente de posto-bomba gasta em média R$ 87 por visita (apenas combustível). Cliente de posto-com-loja gasta <strong>R$ 198</strong> — combustível + 1,8 itens de loja. Café e padaria são as categorias com maior atratividade de tráfego; cigarro e gelo, maiores margens absolutas.",
      "Pra postos médios (4-8 bombas), o investimento de R$ 280-400 mil em loja de 60 m² tem payback médio de 22 meses pelos dados da pesquisa. Em MT, com tráfego de turismo no Pantanal e Chapada dos Guimarães, o payback observado é mais curto: 16-19 meses, segundo dados de associados Fecombustíveis estaduais.",
    ],
  },

  automotivo: {
    headline: "Híbrido flex vai dominar 2027: o que isso significa pra demanda de etanol",
    deck: "Toyota Corolla Cross Hybrid Flex e BYD com etanol nos planos — projeção é que híbridos representem 35% das vendas em 2027. Mix de combustíveis no posto muda permanentemente.",
    body: [
      "A consolidação do <strong>híbrido flex</strong> como padrão brasileiro está acontecendo mais rápido que o esperado. Em abril, SUVs híbridos ultrapassaram pela primeira vez SUVs a combustão pura em vendas (Fenabrave). O Corolla Cross Hybrid Flex liderou o segmento C-SUV, e a BYD anunciou que vai homologar etanol no Song Plus a partir do segundo semestre.",
      "Pra revendedor de combustível, a leitura é otimista de curto prazo e desafiadora no médio. Um híbrido flex consome 35-45% menos combustível por km que um carro a combustão equivalente — mas continua dependente da bomba de etanol. Em 2027-2030, a demanda projetada de gasolina cai 18% no Brasil, enquanto a demanda de <strong>etanol cresce 12%</strong> no mesmo período (cenário base ABEIFA).",
      "Pro posto, três implicações práticas: (1) repensar mix de tanques (mais espaço pra etanol), (2) investir em manutenção das bombas de etanol — uso vai aumentar e exigir aferição mais frequente, (3) começar a estudar instalação de recarga elétrica nível 3 — não pelo plug-in puro, mas porque híbridos plug-in vão precisar de recarga pública em rotas longas como BR-070 e BR-163.",
    ],
  },

  fontes: "ANP, CEPEA/ESALQ, Abicom, ICE/Investing, Banco Central, Fenabrave, Fecombustíveis, Ministério da Fazenda, Copom/BCB, B3, Reuters, Brasil Postos, Times Brasil (CNBC), NovaCana, ABEIFA",
};

function escapeHtml(s) {
  if (s == null) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeHtmlKeepBasic(s) {
  if (s == null) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/<(?!\/?(strong|em|b|i)\b)/g, "&lt;")
    .replace(/"/g, "&quot;");
}

function renderIndicador(item) {
  if (item.direction === "pending") {
    return `        <div class="indic">
          <div class="indic-name">${escapeHtml(item.name)}</div>
          <div class="indic-row">
            <div class="indic-var pending">a confirmar</div>
          </div>
          <div class="indic-source">${escapeHtml(item.source)}</div>
        </div>`;
  }
  const varCls = item.direction === "up" ? "up"
              : item.direction === "down" ? "down"
              : "neutral";
  const varStr = item.variation
    ? `<div class="indic-var ${varCls}">${escapeHtml(item.variation)}</div>`
    : "";
  return `        <div class="indic">
          <div class="indic-name">${escapeHtml(item.name)}</div>
          <div class="indic-row">
            <div class="indic-value">${escapeHtml(item.value)}</div>
            ${varStr}
          </div>
          <div class="indic-source">${escapeHtml(item.source)}</div>
        </div>`;
}

function renderIndicadores(blocks) {
  return blocks.map((block) => {
    const items = block.items.map(renderIndicador).join("\n");
    return `    <div class="indic-block">
      <div class="indic-block-title">${escapeHtml(block.title)}</div>
      <div class="indic-grid">
${items}
      </div>
    </div>`;
  }).join("\n");
}

function renderManchetes(arr) {
  return arr.map((m) => `    <div class="manchete">
      <div class="manchete-num">${m.numero}</div>
      <div class="manchete-body">
        <div class="manchete-title">${escapeHtmlKeepBasic(m.headline)}</div>
        <div class="manchete-summary">${escapeHtmlKeepBasic(m.resumo)}</div>
      </div>
    </div>`).join("\n");
}

function renderArticle(art) {
  const body = art.body.map((p) => `      <p>${escapeHtmlKeepBasic(p)}</p>`).join("\n");
  return `  <div class="article">
    <div class="article-headline">${escapeHtmlKeepBasic(art.headline)}</div>
    <div class="article-deck">${escapeHtmlKeepBasic(art.deck)}</div>
    <div class="article-body">
${body}
    </div>
  </div>`;
}

function buildHtml(data) {
  const template = fs.readFileSync("assets/template_mobile.html", "utf8");
  return template
    .replaceAll("{{EDICAO}}", String(data.edicao))
    .replaceAll("{{PERIODO}}", data.periodo)
    .replace("{{INDICADORES}}", renderIndicadores(data.indicadores))
    .replace("{{MANCHETES}}", renderManchetes(data.manchetes))
    .replace("{{MERCADO}}", renderArticle(data.mercado))
    .replace("{{POLITICA}}", renderArticle(data.politica))
    .replace("{{ECONOMIA_BRASIL}}", renderArticle(data.economiaBrasil))
    .replace("{{ECONOMIA_INTERNACIONAL}}", renderArticle(data.economiaInternacional))
    .replace("{{VAREJO}}", renderArticle(data.varejo))
    .replace("{{AUTOMOTIVO}}", renderArticle(data.automotivo))
    .replace("{{FONTES}}", escapeHtml(data.fontes));
}

const outDir = "editions/preview";
fs.mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, "preview.html");
fs.writeFileSync(outPath, buildHtml(FAKE_DATA));
console.log(`Preview salvo: ${path.resolve(outPath)}`);
