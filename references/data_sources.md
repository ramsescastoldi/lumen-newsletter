# Fontes de Dados — Como Buscar

Guia operacional para coleta dos indicadores e contexto editorial. Sempre buscar em paralelo (web_search múltiplo) para acelerar.

## 1. Petróleo internacional (Brent + WTI)

**Frequência**: diária

**Buscas recomendadas**:
```
Brent crude oil price today [DD month YYYY]
WTI crude oil price today
```

**Fontes confiáveis**:
- TradingEconomics (`tradingeconomics.com/commodity/brent-crude-oil`)
- Investing.com (`investing.com/commodities/brent-oil`)
- Reuters / Bloomberg
- Fortune (`fortune.com/article/price-of-oil-...`)

**O que extrair**: preço de fechamento, variação % vs. dia anterior, contexto da movimentação (geopolítica, OPEP+, EIA stocks).

## 2. Câmbio USD/BRL

**Frequência**: diária

**Buscas recomendadas**:
```
dólar real hoje cotação [DD mês YYYY]
USD BRL exchange rate today
```

**Fontes confiáveis**:
- Banco Central do Brasil (`bcb.gov.br`) — cotação oficial PTAX
- Investing.com BR (`br.investing.com/currencies/usd-brl`)

**O que extrair**: cotação fechamento, tendência (estável/alta/queda).

## 3. ANP — Síntese Semanal de Preços

**Frequência**: semanal (publicada nas quartas/quintas, referente à semana anterior)

**URL padrão (template)**:
```
https://www.gov.br/anp/pt-br/assuntos/precos-e-defesa-da-concorrencia/precos/arq-sintese-semanal/2026/sintese-precos-NN.pdf
```

Onde `NN` é o número da semana com 2 dígitos (ex: `sintese-precos-15.pdf`, `sintese-precos-16.pdf`).

**Como descobrir o número da semana**:
- Conte semanas do ano a partir de janeiro
- Ou busque: `"ANP síntese semanal preços combustíveis semana [N] 2026"`

**O que extrair**:
- Gasolina C comum — preço médio Brasil (R$/L)
- Etanol Hidratado — preço médio Brasil (R$/L)
- Diesel B S-10 — preço médio Brasil (R$/L)
- GLP P-13 — preço médio Brasil (R$/13kg)
- Variação % vs. semana anterior

**Atenção**: a ANP ocasionalmente atrasa publicação por problema técnico. Se a síntese da semana corrente não está disponível, marque indicadores como `pending` e cite o motivo na nota de fonte.

**Página índice**: `https://www.gov.br/anp/pt-br/assuntos/precos-e-defesa-da-concorrencia/precos/sintese-semanal-do-comportamento-dos-precos-dos-combustiveis`

## 4. CEPEA/ESALQ — Etanol Produtor

**Frequência**: semanal (boletim publicado às terças-quintas)

**Buscas recomendadas**:
```
CEPEA ESALQ etanol hidratado anidro preço [mês] 2026
ETANOL CEPEA semana [DD] [mês] 2026
```

**Fontes confiáveis**:
- Cepea direto: `cepea.esalq.usp.br/br/indicador/etanol.aspx`
- Cepea diárias: `cepea.esalq.usp.br/br/diarias-de-mercado/etanol-cepea-...`
- NovaCana (`novacana.com/noticias`) — agregador setorial confiável
- UDOP (`udop.com.br`) — associação canavieira

**O que extrair**:
- Indicador semanal hidratado SP (R$/L, líquido de ICMS e PIS/Cofins)
- Indicador semanal anidro SP (R$/L, líquido de impostos)
- Variação % vs. semana anterior
- Contexto: estoques, safra, demanda, relação com gasolina (E/G)

**Importante**: O preço CEPEA é "produtor" (saída da usina, sem impostos). NÃO confundir com preço de bomba (que é o da ANP).

## 5. Abicom — Defasagem Petrobras

**Frequência**: semanal (geralmente segunda ou terça, com fechamento da sexta anterior)

**Buscas recomendadas**:
```
Abicom defasagem Petrobras diesel gasolina [mês] 2026
defasagem combustíveis paridade importação [data]
```

**Fontes confiáveis**:
- Abicom direto: `abicom.com.br`
- Brasil Postos (`brasilpostos.com.br`) — costuma publicar primeiro
- Times Brasil (CNBC) — entrevistas com Sergio Araujo (presidente da Abicom)
- Revista Oeste, Seu Dinheiro, ClickPetróleoeGás

**O que extrair**:
- Defasagem do diesel (% e R$/L)
- Defasagem da gasolina (% e R$/L)
- Quantos dias de janelas fechadas para importação
- Comentário sobre risco de desabastecimento (especialmente em meses de safra)

## 6. Notícias setoriais (5 a 8 manchetes da semana)

**Buscas recomendadas**:
```
combustíveis Brasil [mês] 2026 notícias
ANP fiscalização postos [mês] 2026
MP subsídio diesel 2026
Petrobras reajuste gasolina diesel [mês] 2026
CNPE biocombustíveis E30 B15 2026
```

**Fontes confiáveis para contexto editorial**:
- **Brasil Postos** — referência setorial principal, foco no revendedor
- **ClubPetro** — análises de mercado para postos
- **Petróleo Hoje** — notícias técnicas
- **Times Brasil (CNBC)** — entrevistas com lideranças setoriais
- **Agência Câmara, Agência Senado, Agência Gov** — fonte primária de MPs e decretos
- **Ministério da Justiça (gov.br/mj)** — balanços de fiscalização (Procon, ANP)
- **Ministério da Fazenda (gov.br/fazenda)** — anúncios sobre subsídios e reformas
- **MME (gov.br/mme)** — política energética

## 7. Datas de referência para 2026

| Semana | Início | Fim |
|---|---|---|
| 1 | 28/12/2025 | 03/01/2026 |
| 2 | 04/01/2026 | 10/01/2026 |
| ... | ... | ... |
| 16 | 12/04/2026 | 18/04/2026 |
| 17 | 19/04/2026 | 25/04/2026 |
| 18 | 26/04/2026 | 02/05/2026 |

Para descobrir a semana de qualquer data: `(número do dia do ano) / 7`, arredondado para cima.

## 8. Padrão de busca — boas práticas

- **Buscas curtas**: 4-6 palavras-chave (não frases longas)
- **Inclua o ano**: as buscas atuais devem incluir "2026" para evitar resultados antigos
- **Combine instituição + produto + período**: ex: "ANP síntese gasolina semana 16 2026"
- **Nunca use aspas** a menos que precise de termo exato
- **Para datas**: prefira "[mês] 2026" a "[DD/MM/2026]" — funciona melhor

## 9. Quando os dados conflitam

- Defasagem Petrobras pode variar entre fontes (Abicom vs. StoneX vs. Petrobras direto). Use **Abicom** como fonte primária do clube.
- Brent pode variar entre Investing, TradingEconomics, Reuters em alguns centavos. Use a fonte com timestamp mais recente.
- Etanol CEPEA tem variantes: indicador semanal SP, mensal SP, semanal MT/PE/GO. Use **semanal SP** como referência padrão (representa ~60% do mercado).
