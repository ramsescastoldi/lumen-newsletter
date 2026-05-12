#!/usr/bin/env node
/**
 * gerar-newsletter.mjs
 *
 * Roda no GitHub Actions toda sexta 17:30 BRT. Chama Claude API com web_search,
 * coleta dados de mercado, monta o HTML da edição e dispara o render dos 2 PDFs.
 *
 * Saída:
 *   editions/semana<N>/source.html
 *   editions/semana<N>/PostoEmDia_Semana<N>_Mobile.pdf
 *   editions/semana<N>/PostoEmDia_Semana<N>_A4.pdf
 *   editions/semana<N>/meta.json     (edicao, periodo, fontes, timestamps)
 *
 * Exporta para GITHUB_OUTPUT: edicao, periodo, mobile_path, a4_path
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
  // Edição = número da semana ISO da sexta-feira da edição.
  // Período = domingo (semana atual) a sábado (semana atual), no estilo "10 a 16 / Mai / 2026".
  const friday = new Date(today);
  const dow = friday.getDay(); // 0=Dom, 5=Sex
  if (dow !== 5) {
    const diff = (5 - dow + 7) % 7 || 7;
    friday.setDate(friday.getDate() + (dow <= 5 ? 5 - dow : 12 - dow));
  }

  // ISO week da sexta
  const t = new Date(Date.UTC(friday.getFullYear(), friday.getMonth(), friday.getDate()));
  const dayNum = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  const isoWeek = Math.ceil(((t - yearStart) / 86400000 + 1) / 7);

  // Período: domingo a sábado dessa semana (estilo dashboard newsletter)
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
  const cards = loadRef("format_cards.md");
  const indicadores = loadRef("format_indicadores.md");
  const sources = loadRef("data_sources.md");

  return `Você é o redator editorial da newsletter semanal "Posto em Dia" do Lumen Posto Club. Editor-chefe: Ramsés Castoldi. Público: donos de posto e revendedores de combustíveis no Brasil.

Sua tarefa é produzir UMA edição da newsletter retornando EXCLUSIVAMENTE um JSON válido conforme o schema abaixo. NÃO escreva texto fora do JSON. NÃO use markdown fences. Retorne o JSON puro.

# SCHEMA DE SAÍDA (estrito)

\`\`\`
{
  "indicadores": [
    {
      "name": "Brent (USD/barril)",
      "value": "US$ 102,15",          // valor formatado para exibição
      "variation": "▲ 3,59%",          // com seta ▲/▼/≈, ou null se pending
      "direction": "up",                // "up" | "down" | "neutral" | "pending"
      "source": "ICE / Investing"
    },
    ... 11 indicadores na ordem do format_indicadores.md
  ],
  "nota_fonte": null,                  // string com aviso de pendência, ou null
  "cards": [
    {
      "cor": "red",                    // "red" | "yellow" | "green" | "blue"
      "tag_text": "🔴 Ação Imediata",
      "numero": 1,
      "titulo": "Título forte com dado concreto",
      "aconteceu": "Texto do 'O que aconteceu' (3-5 linhas, fato + número + data + fonte)",
      "importa": "Texto do 'Por que importa' (3-5 linhas, conexão direta com operação do posto)",
      "acao": "Texto da 'Ação da semana' (3-6 linhas, verbos no imperativo)"
    },
    ... exatamente 5 cards
  ],
  "acoes": [
    "Item da seção 'O Que Fazer Hoje' (com tags <strong> dentro se quiser destacar)",
    ... 4 a 6 itens
  ],
  "fontes": "ANP, CEPEA/ESALQ, Abicom, ICE/Investing, Banco Central, Câmara, MME"
}
\`\`\`

# PRINCÍPIOS EDITORIAIS (não-negociáveis)

${principles}

# FORMATO DOS CARDS EDITORIAIS

${cards}

# FORMATO DOS INDICADORES

${indicadores}

# FONTES DE DADOS

${sources}

# REGRAS FINAIS

1. Use web_search EM PARALELO no início para coletar todos os dados.
2. NUNCA fabrique valores. Use direction="pending" e value="a confirmar" se faltar dado.
3. Cada card deve seguir estrutura "O que aconteceu / Por que importa / Ação da semana" — sem desvios.
4. Tag emoji + texto: "🔴 Ação Imediata", "🟡 Atenção", "🟢 Oportunidade", "🔵 Informativo".
5. Os 11 indicadores na ordem: Brent, WTI, USD/BRL, Gasolina C, Etanol Hidratado bomba, Diesel B S-10, GLP P-13, Etanol Hidratado produtor, Etanol Anidro produtor, Defasagem Diesel, Defasagem Gasolina.
6. RETORNE APENAS JSON. Sem prefácio, sem comentários, sem markdown.`;
}

function renderIndicadores(arr) {
  return arr.map((ind) => {
    if (ind.direction === "pending") {
      return `  <div class="ind-card pending">
    <div class="ind-name">${escapeHtml(ind.name)}</div>
    <div class="ind-row">
      <div class="ind-pending-value">a confirmar</div>
    </div>
    <div class="ind-source">${escapeHtml(ind.source)}</div>
  </div>`;
    }
    const cardCls = ind.direction === "up" ? " up" : ind.direction === "down" ? " down" : "";
    const varCls = ind.direction === "up" ? "up" : ind.direction === "down" ? "down" : "neutral";
    return `  <div class="ind-card${cardCls}">
    <div class="ind-name">${escapeHtml(ind.name)}</div>
    <div class="ind-row">
      <div class="ind-value">${escapeHtml(ind.value)}</div>
      <div class="ind-var ${varCls}">${escapeHtml(ind.variation || "")}</div>
    </div>
    <div class="ind-source">${escapeHtml(ind.source)}</div>
  </div>`;
  }).join("\n");
}

function renderCards(arr) {
  return arr.map((card) => `  <div class="card ${card.cor}">
    <span class="card-tag tag-${card.cor}">${escapeHtml(card.tag_text)}</span>
    <div class="card-title">${card.numero}. ${escapeHtml(card.titulo)}</div>

    <div class="card-block">
      <span class="block-label">O que aconteceu</span>
      <p>${escapeHtmlKeepBasic(card.aconteceu)}</p>
    </div>

    <div class="card-block">
      <span class="block-label">Por que importa</span>
      <p>${escapeHtmlKeepBasic(card.importa)}</p>
    </div>

    <div class="card-block">
      <span class="block-label">Ação da semana</span>
      <p>${escapeHtmlKeepBasic(card.acao)}</p>
    </div>
  </div>`).join("\n");
}

function renderAcoes(arr) {
  return arr.map((item) => `    <li>${escapeHtmlKeepBasic(item)}</li>`).join("\n");
}

function escapeHtml(s) {
  if (s == null) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Para textos editoriais: permite <strong> e <em> mas escapa o resto.
function escapeHtmlKeepBasic(s) {
  if (s == null) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/<(?!\/?(strong|em|b|i)\b)/g, "&lt;")
    .replace(/"/g, "&quot;");
}

function extractJSON(text) {
  // Remove possíveis fences ```json e ```
  let cleaned = text.trim();
  cleaned = cleaned.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "");
  // Pega substring entre o primeiro '{' e o último '}'
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
  const userPrompt = `Produza a Edição ${edicao} do Posto em Dia para o período: ${periodo}.

Hoje é ${fridayISO} (sexta-feira). Colete dados frescos usando web_search EM PARALELO logo no início:

1. Brent + WTI hoje + variação % diária
2. USD/BRL hoje (fechamento PTAX se disponível)
3. ANP — síntese semanal de preços mais recente (gasolina C, etanol hidratado, diesel B S-10, GLP P-13)
4. CEPEA/ESALQ — etanol hidratado e anidro produtor SP da semana
5. Abicom — defasagem Petrobras diesel/gasolina
6. 5-8 notícias setoriais relevantes da semana (MPs, decretos, fiscalização, mercado)

Depois selecione os 5 movimentos mais importantes da semana e produza o JSON conforme o schema. Retorne APENAS o JSON.`;

  console.log("→ Chamando Claude API (sonnet 4.6 + web_search)...");
  const t0 = Date.now();

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 16000,
    tools: [
      {
        type: "web_search_20250305",
        name: "web_search",
        max_uses: 15,
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

  // Extrai texto final
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
  if (!Array.isArray(data.indicadores) || data.indicadores.length === 0) {
    throw new Error("indicadores ausente ou vazio");
  }
  if (!Array.isArray(data.cards) || data.cards.length !== 5) {
    throw new Error(`cards deve ter exatamente 5 itens (recebido: ${data.cards?.length})`);
  }

  // Monta HTML final
  const template = fs.readFileSync("assets/template_mobile.html", "utf8");
  const notaFonteHtml = data.nota_fonte
    ? `<div class="source-note">⚠️ ${escapeHtmlKeepBasic(data.nota_fonte)}</div>`
    : "<!-- VAZIO -->";

  const html = template
    .replaceAll("{{EDICAO}}", String(edicao))
    .replaceAll("{{PERIODO}}", periodo)
    .replace("{{INDICADORES}}", renderIndicadores(data.indicadores))
    .replace("{{NOTA_FONTE}}", notaFonteHtml)
    .replace("{{CARDS}}", renderCards(data.cards))
    .replace("{{ACOES_HOJE}}", renderAcoes(data.acoes || []))
    .replace("{{FONTES}}", escapeHtml(data.fontes || ""));

  // Salva arquivos
  const editionDir = `editions/semana${edicao}`;
  fs.mkdirSync(editionDir, { recursive: true });
  const htmlPath = path.join(editionDir, "source.html");
  fs.writeFileSync(htmlPath, html);
  console.log(`✓ HTML salvo: ${htmlPath}`);

  // Renderiza PDFs (chama o script Python existente)
  console.log("→ Renderizando PDFs com Playwright...");
  execSync(`python scripts/render_pdfs.py "${htmlPath}" "${editionDir}" ${edicao}`, { stdio: "inherit" });

  const mobilePath = path.join(editionDir, `PostoEmDia_Semana${edicao}_Mobile.pdf`);
  const a4Path = path.join(editionDir, `PostoEmDia_Semana${edicao}_A4.pdf`);
  if (!fs.existsSync(mobilePath) || !fs.existsSync(a4Path)) {
    throw new Error("PDFs não foram criados");
  }

  // Metadata pra rastreio
  const meta = {
    edicao,
    periodo,
    friday: fridayISO,
    generated_at: new Date().toISOString(),
    fontes: data.fontes,
    indicadores_count: data.indicadores.length,
    cards_count: data.cards.length,
    acoes_count: data.acoes?.length || 0,
    has_pending_data: data.indicadores.some((i) => i.direction === "pending"),
    usage: response.usage,
  };
  fs.writeFileSync(path.join(editionDir, "meta.json"), JSON.stringify(meta, null, 2));

  // Outputs pro GitHub Actions
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
