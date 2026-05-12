#!/usr/bin/env node
/**
 * gerar-newsletter.mjs
 *
 * Roda no GitHub Actions toda sexta 17:30 BRT. Chama Claude API com web_search,
 * coleta dados de mercado, monta o HTML da edição (estilo jornal) e dispara o
 * render dos 2 PDFs.
 *
 * Estrutura da edição:
 *   - Indicadores Financeiros (7 blocos agrupados)
 *   - As 5 Manchetes da Semana
 *   - Mercado de Combustíveis
 *   - Política (notícia quente)
 *   - Economia Brasil
 *   - Economia Internacional
 *   - Varejo
 *   - Automotivo
 *   - Bloco fixo Verimo + colofon
 */

import Anthropic from "@anthropic-ai/sdk";
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
if (!ANTHROPIC_API_KEY) {
  console.error("ANTHROPIC_API_KEY não definida");
  process.exit(1);
}

const MONTHS_PT = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

function computeEdition(today = new Date()) {
  const friday = new Date(today);
  const dow = friday.getDay();
  if (dow !== 5) {
    friday.setDate(friday.getDate() + (dow <= 5 ? 5 - dow : 12 - dow));
  }
  const t = new Date(Date.UTC(friday.getFullYear(), friday.getMonth(), friday.getDate()));
  const dayNum = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  const isoWeek = Math.ceil(((t - yearStart) / 86400000 + 1) / 7);

  const sunday = new Date(friday);
  sunday.setDate(friday.getDate() - 5);
  const saturday = new Date(friday);
  saturday.setDate(friday.getDate() + 1);

  const sameMonth = sunday.getMonth() === saturday.getMonth();
  const sameYear = sunday.getFullYear() === saturday.getFullYear();
  let periodo;
  if (sameMonth && sameYear) {
    periodo = `${sunday.getDate()} a ${saturday.getDate()} / ${MONTHS_PT[sunday.getMonth()].slice(0, 3)} / ${sunday.getFullYear()}`;
  } else if (sameYear) {
    periodo = `${sunday.getDate()}/${MONTHS_PT[sunday.getMonth()].slice(0, 3)} a ${saturday.getDate()}/${MONTHS_PT[saturday.getMonth()].slice(0, 3)} / ${sunday.getFullYear()}`;
  } else {
    periodo = `${sunday.getDate()}/${MONTHS_PT[sunday.getMonth()].slice(0, 3)}/${sunday.getFullYear()} a ${saturday.getDate()}/${MONTHS_PT[saturday.getMonth()].slice(0, 3)}/${saturday.getFullYear()}`;
  }

  return { edicao: isoWeek, periodo, fridayISO: friday.toISOString().slice(0, 10) };
}

function loadRef(name) {
  return fs.readFileSync(path.join("references", name), "utf8");
}

function buildSystemPrompt() {
  const principles = loadRef("editorial_principles.md");
  const sources = loadRef("data_sources.md");

  return `Você é o redator-chefe da newsletter semanal "Posto em Dia" do Lumen Posto Club. Editor-chefe: Ramsés Castoldi. Público: donos de posto e revendedores de combustíveis no Brasil.

O formato é um JORNAL SEMANAL completo, não um boletim de indicadores. Tom de redação de jornal econômico premium (estilo Valor Econômico, Financial Times, NYT Business). Cada matéria deve ter densidade jornalística, números, fontes citadas e implicação operacional pro dono de posto.

# OBJETIVO

Retorne EXCLUSIVAMENTE um JSON válido conforme o schema abaixo. NÃO escreva texto fora do JSON. NÃO use markdown fences. Apenas o JSON puro.

# SCHEMA DE SAÍDA (estrito)

\`\`\`
{
  "indicadores": [
    {
      "title": "Petróleo & Energia",
      "items": [
        {
          "name": "Brent (USD/barril)",
          "value": "US$ 103,73",          // valor formatado pra exibição
          "variation": "+2,41%",          // formato livre, vai aparecer com seta automática
          "direction": "up",              // "up" | "down" | "neutral" | "pending"
          "source": "ICE / Investing"
        }
      ]
    },
    ... 7 blocos exatamente nesta ordem:
    1. "Petróleo & Energia"           — Brent, WTI
    2. "Moedas"                       — USD/BRL, EUR/BRL, DXY, Bitcoin
    3. "Bolsas"                       — Ibovespa, S&P 500, Nasdaq, Dow Jones
    4. "Juros & Inflação"             — Selic, Fed Funds, IPCA-15, Focus IPCA 2026
    5. "Preço na Bomba (ANP)"         — Gasolina C, Etanol Hidratado, Diesel S-10, Diesel comum, GLP P-13
    6. "Usina (CEPEA/ESALQ)"          — Etanol Hidratado SP, Etanol Anidro SP
    7. "Defasagem Petrobras (Abicom)" — Diesel, Gasolina
  ],

  "manchetes": [
    {
      "numero": 1,
      "headline": "Headline forte em uma frase com dado concreto",
      "resumo": "2-3 linhas de resumo (60-90 palavras), com fato + por que importa pro posto"
    },
    ... exatamente 5 manchetes
  ],

  "mercado": {
    "headline": "Título da matéria de mercado de combustíveis",
    "deck": "Linha-fina italic de 1-2 linhas (entrelinha entre headline e corpo)",
    "body": [
      "Parágrafo 1 (3-5 linhas, com dados, fontes, datas)",
      "Parágrafo 2",
      "Parágrafo 3 com ação operacional"
    ]
  },

  "politica": { headline, deck, body },        // notícia QUENTE sobre política que impacta o setor
  "economiaBrasil": { headline, deck, body },  // economia BR (juros, inflação, câmbio, atividade)
  "economiaInternacional": { headline, deck, body }, // economia global (Fed, China, geopolítica, commodities)
  "varejo": { headline, deck, body },          // varejo brasileiro / convenience / hábitos de consumo
  "automotivo": { headline, deck, body },      // carros, EVs, híbridos, infraestrutura, caminhões

  "fontes": "Lista de fontes consultadas, separadas por vírgula"
}
\`\`\`

# REGRAS DE DIREÇÃO DOS INDICADORES (operacional, ponto de vista do POSTO)

A interpretação não é "subiu/desceu" — é "bom/ruim pro revendedor":

| Indicador | Subiu = | Desceu = |
|---|---|---|
| Brent / WTI | up (vermelho) | down (verde) |
| USD/BRL (dólar mais caro) | up (vermelho) | down (verde) |
| EUR/BRL | up (vermelho) | down (verde) |
| Bolsas (IBOV, S&P, Nasdaq) | down (verde, neutro pra posto) | up (vermelho) — bolsa caindo = aversão a risco = ruim |
| Selic / Fed (juros) | up (vermelho — crédito mais caro) | down (verde) |
| IPCA / inflação | up (vermelho) | down (verde) |
| ANP bomba | up (vermelho — pressão de margem) | down (verde) |
| CEPEA usina | up (vermelho — etanol caro) | down (verde — janela de compra) |
| Abicom defasagem | up (vermelho — risco repasse) | down (verde — paridade saudável) |

Quando não houver variação clara, use "neutral". Quando dado indisponível, use "pending" + value="a confirmar".

# PRINCÍPIOS EDITORIAIS

${principles}

# FONTES DE DADOS

${sources}

# REGRAS FINAIS

1. Use web_search EM PARALELO no início pra coletar TODOS os dados (cotações + notícias).
2. NUNCA fabrique valores. Use direction="pending" + value="a confirmar" se faltar dado.
3. Cada matéria longa tem ~3 parágrafos de 3-5 linhas (~180-280 palavras por matéria).
4. Use <strong>...</strong> para destacar números e nomes chave nos parágrafos das matérias.
5. Tom: jornalismo econômico, sem condescendência, com implicação operacional clara.
6. Manchetes: substantivas, com pelo menos um dado concreto.
7. RETORNE APENAS O JSON. Sem prefácio, sem comentários, sem markdown.`;
}

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
    const items = (block.items || []).map(renderIndicador).join("\n");
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
  if (!art) return "";
  const body = (art.body || []).map((p) => `      <p>${escapeHtmlKeepBasic(p)}</p>`).join("\n");
  return `  <div class="article">
    <div class="article-headline">${escapeHtmlKeepBasic(art.headline)}</div>
    <div class="article-deck">${escapeHtmlKeepBasic(art.deck)}</div>
    <div class="article-body">
${body}
    </div>
  </div>`;
}

function extractJSON(text) {
  let cleaned = text.trim();
  cleaned = cleaned.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "");
  const first = cleaned.indexOf("{");
  const last = cleaned.lastIndexOf("}");
  if (first === -1 || last === -1) throw new Error("JSON não encontrado na resposta");
  return JSON.parse(cleaned.slice(first, last + 1));
}

async function gerar() {
  const { edicao, periodo, fridayISO } = computeEdition();
  console.log(`→ Edição ${edicao} — período: ${periodo} — sexta: ${fridayISO}`);

  const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

  const systemPrompt = buildSystemPrompt();
  const userPrompt = `Produza a Edição ${edicao} do Posto em Dia para o período ${periodo}.

Hoje é ${fridayISO} (sexta-feira). Use web_search EM PARALELO no início pra coletar:

INDICADORES (cotações fechadas mais recentes):
- Brent + WTI (preço + variação % diária)
- USD/BRL + EUR/BRL + DXY + Bitcoin
- Ibovespa + S&P 500 + Nasdaq + Dow Jones (fechamento + var %)
- Selic atual + Fed Funds + IPCA-15 + Focus IPCA 2026 (boletim mais recente)
- ANP síntese semanal de preços (Gasolina C, Etanol Hidratado, Diesel S-10, Diesel comum, GLP P-13)
- CEPEA/ESALQ (Etanol Hidratado SP, Etanol Anidro SP)
- Abicom defasagem Petrobras (Diesel + Gasolina)

NOTÍCIAS DA SEMANA (busque 10-15 manchetes recentes):
- Combustíveis Brasil (MPs, decretos, fiscalização, mercado)
- Política brasileira QUENTE (decisões, conflitos federativos, STF, Congresso) que afetem o setor
- Economia BR (Copom, Focus, atividade, emprego)
- Economia internacional (Fed, China, geopolítica, OPEP+, EIA)
- Varejo BR (Fecombustíveis, redes, conveniência, hábitos)
- Automotivo (Fenabrave, EVs, híbridos, infraestrutura)

DEPOIS produza o JSON conforme o schema:
- 7 blocos de indicadores
- 5 manchetes da semana (mix temático com filtro "afeta o dono de posto")
- 6 matérias longas (mercado, política QUENTE, economia BR, economia internacional, varejo, automotivo)
- fontes

RETORNE APENAS O JSON.`;

  console.log("→ Chamando Claude API (sonnet 4.6 + web_search)...");
  const t0 = Date.now();

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 16000,
    tools: [
      {
        type: "web_search_20250305",
        name: "web_search",
        max_uses: 18,
      },
    ],
    system: [
      {
        type: "text",
        text: systemPrompt,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [{ role: "user", content: userPrompt }],
  });

  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(`→ Resposta recebida em ${elapsed}s`);
  console.log(`  stop_reason: ${response.stop_reason}`);
  console.log(`  input tokens: ${response.usage?.input_tokens} (cached: ${response.usage?.cache_read_input_tokens || 0})`);
  console.log(`  output tokens: ${response.usage?.output_tokens}`);

  let finalText = "";
  for (const block of response.content) {
    if (block.type === "text") finalText += block.text;
  }
  if (!finalText) throw new Error("Resposta sem text block");

  let data;
  try {
    data = extractJSON(finalText);
  } catch (e) {
    fs.writeFileSync("debug-raw-response.txt", finalText);
    console.error("Falha ao parsear JSON. Resposta raw salva em debug-raw-response.txt");
    throw e;
  }

  // Validação básica
  if (!Array.isArray(data.indicadores) || data.indicadores.length < 5) {
    throw new Error(`indicadores: esperado >= 5 blocos, recebido ${data.indicadores?.length}`);
  }
  if (!Array.isArray(data.manchetes) || data.manchetes.length !== 5) {
    throw new Error(`manchetes: esperado 5 itens, recebido ${data.manchetes?.length}`);
  }
  for (const sec of ["mercado", "politica", "economiaBrasil", "economiaInternacional", "varejo", "automotivo"]) {
    if (!data[sec]?.headline || !Array.isArray(data[sec]?.body)) {
      throw new Error(`Matéria ausente ou inválida: ${sec}`);
    }
  }

  // Monta HTML
  const template = fs.readFileSync("assets/template_mobile.html", "utf8");
  const html = template
    .replaceAll("{{EDICAO}}", String(edicao))
    .replaceAll("{{PERIODO}}", periodo)
    .replace("{{INDICADORES}}", renderIndicadores(data.indicadores))
    .replace("{{MANCHETES}}", renderManchetes(data.manchetes))
    .replace("{{MERCADO}}", renderArticle(data.mercado))
    .replace("{{POLITICA}}", renderArticle(data.politica))
    .replace("{{ECONOMIA_BRASIL}}", renderArticle(data.economiaBrasil))
    .replace("{{ECONOMIA_INTERNACIONAL}}", renderArticle(data.economiaInternacional))
    .replace("{{VAREJO}}", renderArticle(data.varejo))
    .replace("{{AUTOMOTIVO}}", renderArticle(data.automotivo))
    .replace("{{FONTES}}", escapeHtml(data.fontes || ""));

  const editionDir = `editions/semana${edicao}`;
  fs.mkdirSync(editionDir, { recursive: true });
  const htmlPath = path.join(editionDir, "source.html");
  fs.writeFileSync(htmlPath, html);
  console.log(`✓ HTML salvo: ${htmlPath}`);

  // Renderiza PDFs
  console.log("→ Renderizando PDFs com Playwright...");
  execSync(`python scripts/render_pdfs.py "${htmlPath}" "${editionDir}" ${edicao}`, { stdio: "inherit" });

  const mobilePath = path.join(editionDir, `PostoEmDia_Semana${edicao}_Mobile.pdf`);
  const a4Path = path.join(editionDir, `PostoEmDia_Semana${edicao}_A4.pdf`);
  if (!fs.existsSync(mobilePath) || !fs.existsSync(a4Path)) {
    throw new Error("PDFs não foram criados");
  }

  // Metadata
  const meta = {
    edicao,
    periodo,
    friday: fridayISO,
    generated_at: new Date().toISOString(),
    fontes: data.fontes,
    indicadores_blocks: data.indicadores.length,
    manchetes_count: data.manchetes.length,
    has_pending_data: data.indicadores.some((b) => b.items?.some((i) => i.direction === "pending")),
    usage: response.usage,
  };
  fs.writeFileSync(path.join(editionDir, "meta.json"), JSON.stringify(meta, null, 2));

  if (process.env.GITHUB_OUTPUT) {
    const out = [
      `edicao=${edicao}`,
      `periodo=${periodo}`,
      `mobile_path=${mobilePath.replace(/\\/g, "/")}`,
      `a4_path=${a4Path.replace(/\\/g, "/")}`,
    ].join("\n") + "\n";
    fs.appendFileSync(process.env.GITHUB_OUTPUT, out);
  }

  console.log(`✓ Edição ${edicao} gerada com sucesso`);
  console.log(`  Mobile: ${mobilePath}`);
  console.log(`  A4:     ${a4Path}`);
}

gerar().catch((err) => {
  console.error("ERRO:", err);
  process.exit(1);
});
