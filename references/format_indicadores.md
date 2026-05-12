# Formato dos Cards de Indicadores

Cada indicador é renderizado como um card empilhado (não tabela). Estrutura HTML padrão:

## Card normal (com valor e variação)

```html
<div class="ind-card [up|down|]">
  <div class="ind-name">[NOME DO INDICADOR]</div>
  <div class="ind-row">
    <div class="ind-value">[VALOR]</div>
    <div class="ind-var [up|down|neutral]">[SETA] [VARIAÇÃO]</div>
  </div>
  <div class="ind-source">[FONTE]</div>
</div>
```

## Card pendente (a confirmar)

Use quando o dado não está disponível. NUNCA invente.

```html
<div class="ind-card pending">
  <div class="ind-name">[NOME DO INDICADOR]</div>
  <div class="ind-row">
    <div class="ind-pending-value">a confirmar</div>
  </div>
  <div class="ind-source">[FONTE — motivo da pendência]</div>
</div>
```

## Mapeamento de classes

| Direção | Classe do card | Classe da variação | Cor da borda esquerda |
|---|---|---|---|
| Em alta (ruim para o posto) | `up` | `up` | Vermelho |
| Em queda (bom para o posto) | `down` | `down` | Verde |
| Estável | (sem classe) | `neutral` | Dourado padrão |
| Pendente | `pending` | (n/a) | Amarelo |

**Importante**: a "alta/queda" é interpretada do ponto de vista do impacto no posto. Brent subindo é vermelho (ruim — pressiona defasagem). Etanol produtor caindo é verde (bom — janela de compra). Defasagem aumentando é vermelho.

## Setas

- `▲` = alta
- `▼` = queda
- `≈` = estável

## Indicadores obrigatórios em toda edição

| # | Indicador | Fonte | Classe inicial sugerida |
|---|---|---|---|
| 1 | Brent (USD/barril) | ICE / Investing | depende da semana |
| 2 | WTI (USD/barril) | NYMEX / Trading Eco. | depende da semana |
| 3 | USD / BRL | Banco Central | depende da semana |
| 4 | Gasolina C (média BR) | ANP síntese semanal | normalmente disponível |
| 5 | Etanol Hidratado (bomba) | ANP síntese semanal | normalmente disponível |
| 6 | Diesel B S-10 (bomba) | ANP síntese semanal | normalmente disponível |
| 7 | GLP P-13 (R$/13kg) | ANP síntese semanal | normalmente disponível |
| 8 | Etanol Hidratado produtor | CEPEA / ESALQ-SP | normalmente disponível |
| 9 | Etanol Anidro produtor | CEPEA / ESALQ-SP | normalmente disponível |
| 10 | Defasagem Diesel (Petrobras) | Abicom | depende da semana |
| 11 | Defasagem Gasolina (Petrobras) | Abicom | depende da semana |

## Exemplo completo (Edição 16, indicador Brent)

```html
<div class="ind-card up">
  <div class="ind-name">Brent (USD/barril)</div>
  <div class="ind-row">
    <div class="ind-value">US$ 101,91</div>
    <div class="ind-var up">▲ 3,59%</div>
  </div>
  <div class="ind-source">ICE / Investing</div>
</div>
```

## Para defasagem (Abicom), a "variação" mostra o R$/L em vez de %

```html
<div class="ind-card up">
  <div class="ind-name">Defasagem Diesel (Petrobras)</div>
  <div class="ind-row">
    <div class="ind-value">31%</div>
    <div class="ind-var up">R$ 1,12/L</div>
  </div>
  <div class="ind-source">Abicom — fechamento 17/04</div>
</div>
```

## Nota de fonte (quando há dados pendentes)

Se houver pelo menos um indicador `pending`, inclua imediatamente após o bloco de indicadores:

```html
<div class="source-note">
  ⚠️ ANP adiou a divulgação dos preços de revenda da semana 12–18/04 por problema técnico. Os valores serão consolidados na próxima edição.
</div>
```

Substitua o conteúdo conforme o motivo real da pendência. Se não houver dados pendentes, use `<!-- VAZIO -->` no placeholder `{{NOTA_FONTE}}` do template.
