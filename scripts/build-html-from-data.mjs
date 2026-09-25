#!/usr/bin/env node
// build-html-from-data.mjs — Monta o source.html de uma edição a partir de um
// data.json já escrito manualmente (sem chamar a API Anthropic).
// Uso: node scripts/build-html-from-data.mjs <edicao> "<periodo>"

import fs from "node:fs";
import path from "node:path";

const [, , edicaoArg, periodoArg] = process.argv;
if (!edicaoArg || !periodoArg) {
  console.error('Uso: node scripts/build-html-from-data.mjs <edicao> "<periodo>"');
  process.exit(1);
}
const edicao = edicaoArg;
const periodo = periodoArg;

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

const editionDir = `editions/semana${edicao}`;
const data = JSON.parse(fs.readFileSync(path.join(editionDir, "data.json"), "utf8"));

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

const htmlPath = path.join(editionDir, "source.html");
fs.writeFileSync(htmlPath, html);
console.log(`✓ HTML salvo: ${htmlPath}`);

const meta = {
  edicao: Number(edicao),
  periodo,
  friday: process.env.OVERRIDE_FRIDAY || new Date().toISOString().slice(0, 10),
  generated_at: new Date().toISOString(),
  fontes: data.fontes,
  indicadores_blocks: data.indicadores.length,
  manchetes_count: data.manchetes.length,
  has_pending_data: data.indicadores.some((b) => b.items?.some((i) => i.direction === "pending")),
  generated_by: "manual (Claude, sem chamada à API Anthropic) — gerador antigo scripts/gerar-newsletter.mjs descontinuado",
};
fs.writeFileSync(path.join(editionDir, "meta.json"), JSON.stringify(meta, null, 2));
console.log(`✓ meta.json salvo`);
