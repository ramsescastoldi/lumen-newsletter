# Lumen Newsletter — Posto em Dia

Geração automatizada da newsletter semanal **Posto em Dia** do Lumen Posto Club.

## Como funciona

1. **Sexta 17:30 BRT** — n8n dispara `workflow_dispatch` neste repo (cron de backup roda direto via GitHub Actions).
2. **GitHub Actions** roda `scripts/gerar-newsletter.mjs`:
   - Chama Claude API (sonnet 4.6) com web_search.
   - Coleta dados (Brent, WTI, USD/BRL, ANP, CEPEA, Abicom, notícias).
   - Monta `editions/semana<N>/source.html`.
   - Renderiza 2 PDFs com Playwright: Mobile (120×220mm) e A4.
   - Comita os arquivos no repo.
3. **Webhook n8n** — workflow Actions chama `N8N_NEWSLETTER_URL` com URLs dos PDFs.
4. **n8n** envia os 2 PDFs para o WhatsApp do Ramsés via Evolution e pede aprovação.
5. **Ramsés responde** OK/Enviar/Aprovado → n8n posta os PDFs no grupo pago do Lumen Posto Club.

## Estrutura

```
assets/template_mobile.html         Template HTML com placeholders
references/                         Princípios editoriais, formatos, fontes (contexto pro Claude)
scripts/gerar-newsletter.mjs        Orquestrador (Claude API → HTML → PDFs)
scripts/render_pdfs.py              Playwright headless → 2 PDFs
.github/workflows/gerar-newsletter.yml   Cron sexta 17:30 BRT
editions/semana<N>/                 Saídas commitadas: source.html + 2 PDFs + meta.json
```

## Secrets necessários

- `ANTHROPIC_API_KEY` — Claude API
- `N8N_NEWSLETTER_URL` — webhook do n8n (`https://n8n.srv1662375.hstgr.cloud/webhook/newsletter-pronta`)

## Rodar manualmente

Pelo GitHub UI: aba Actions → "Gerar Newsletter Posto em Dia" → Run workflow.

## Edição

Cada execução determina a edição pelo número da semana ISO da sexta-feira da rodada.
