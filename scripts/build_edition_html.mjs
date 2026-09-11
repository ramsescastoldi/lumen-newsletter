#!/usr/bin/env node
/**
 * build_edition_html.mjs — monta source.html a partir de um data.json já pronto
 * (conteúdo editorial escrito manualmente, sem chamada à API Anthropic).
 *
 * Uso:
 *   node scripts/build_edition_html.mjs <edicao> <caminho_data.json> <pasta_saida>
 */
import fs from "node:fs";
import path from "node:path";

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
  const carryoverHtml = art.carryover
    ? `    <div class="carryover-badge">Continuação · Semana anterior</div>\n`
    : "";
  const opiniaoHtml = art.opiniao
    ? `\n    <div class="article-opiniao"><span class="opiniao-label">Análise do editor</span><p>${escapeHtmlKeepBasic(art.opiniao)}</p></div>`
    : "";
  return `  <div class="article">
${carryoverHtml}    <div class="article-headline">${escapeHtmlKeepBasic(art.headline)}</div>
    <div class="article-deck">${escapeHtmlKeepBasic(art.deck)}</div>
    <div class="article-body">
${body}
    </div>${opiniaoHtml}
  </div>`;
}

const [edicao, dataPath, editionDir] = process.argv.slice(2);
if (!edicao || !dataPath || !editionDir) {
  console.error("Uso: node scripts/build_edition_html.mjs <edicao> <data.json> <pasta_saida>");
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));

for (const sec of ["mercado", "politica", "economiaBrasil", "economiaInternacional", "varejo", "automotivo"]) {
  if (!data[sec]?.headline || !Array.isArray(data[sec]?.body)) {
    throw new Error(`Matéria ausente ou inválida: ${sec}`);
  }
}
if (!Array.isArray(data.manchetes) || data.manchetes.length !== 5) {
  throw new Error(`manchetes: esperado 5 itens, recebido ${data.manchetes?.length}`);
}

const template = fs.readFileSync("assets/template_mobile.html", "utf8");
const html = template
  .replaceAll("{{EDICAO}}", String(edicao))
  .replaceAll("{{PERIODO}}", data.periodo)
  .replace("{{INDICADORES}}", renderIndicadores(data.indicadores))
  .replace("{{MANCHETES}}", renderManchetes(data.manchetes))
  .replace("{{MERCADO}}", renderArticle(data.mercado))
  .replace("{{POLITICA}}", renderArticle(data.politica))
  .replace("{{ECONOMIA_BRASIL}}", renderArticle(data.economiaBrasil))
  .replace("{{ECONOMIA_INTERNACIONAL}}", renderArticle(data.economiaInternacional))
  .replace("{{VAREJO}}", renderArticle(data.varejo))
  .replace("{{AUTOMOTIVO}}", renderArticle(data.automotivo))
  .replace("{{FONTES}}", escapeHtml(data.fontes || ""));

fs.mkdirSync(editionDir, { recursive: true });
const htmlPath = path.join(editionDir, "source.html");
fs.writeFileSync(htmlPath, html);
console.log(`✓ HTML salvo: ${htmlPath}`);
