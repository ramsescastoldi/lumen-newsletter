# Fontes de Dados — Como Buscar

Guia operacional pra coleta dos indicadores e contexto editorial. Sempre buscar EM PARALELO no início.

## 1. Petróleo internacional

**Brent + WTI** — preço de fechamento + variação % vs. dia anterior.

Buscas:
```
Brent crude oil price today [DD month YYYY]
WTI crude oil price today
```

Fontes: TradingEconomics, Investing.com, Reuters, Bloomberg, ICE, NYMEX.

Extrair também contexto (geopolítica, OPEP+, EIA stocks, Hormuz, Rússia).

## 2. Moedas

**USD/BRL, EUR/BRL** — cotação fechamento PTAX.

Buscas:
```
dólar real cotação hoje [DD mês YYYY]
USD BRL exchange rate today
EUR BRL hoje
```

Fontes: Banco Central do Brasil (PTAX), Investing.com BR.

**DXY (Dollar Index)** — Buscar `DXY today` ou `dollar index today`. Fonte: ICE.

**Bitcoin** — opcional, mas se for relevante (movimento >2% ou notícia), incluir. Fontes: Coinbase, Investing, Binance.

## 3. Bolsas

**Ibovespa** — fechamento mais recente + var %. Fonte: B3.
**S&P 500, Nasdaq, Dow Jones** — fechamento + var %. Fontes: NYSE, Nasdaq.

Buscas:
```
Ibovespa fechamento hoje
S&P 500 close today
Nasdaq close today
```

Inclua contexto: setores que puxaram alta/queda, notícias corporativas relevantes (Petrobras, Vale, Banco do Brasil em especial).

## 4. Juros & Inflação

**Selic** — taxa atual + última reunião do Copom (data + decisão). Fonte: BCB, ata Copom.
**Fed Funds** — taxa atual + última decisão FOMC. Fonte: Federal Reserve.
**IPCA / IPCA-15** — último número divulgado + acumulado 12 meses. Fonte: IBGE.
**Focus IPCA 2026** — projeção mediana boletim mais recente. Fonte: BCB Focus (geralmente publicado segunda-feira).

Buscas:
```
Selic atual Copom
Focus boletim hoje IPCA 2026
IPCA-15 último resultado IBGE
Federal Reserve interest rate decision
```

## 5. ANP — Síntese Semanal

**Frequência**: semanal (geralmente terças/quartas).

URL padrão:
```
https://www.gov.br/anp/pt-br/assuntos/precos-e-defesa-da-concorrencia/precos/arq-sintese-semanal/2026/sintese-precos-NN.pdf
```

Buscar pelo número da semana mais recente disponível. Página índice:
```
https://www.gov.br/anp/pt-br/assuntos/precos-e-defesa-da-concorrencia/precos/sintese-semanal-do-comportamento-dos-precos-dos-combustiveis
```

Extrair preços médios Brasil de: Gasolina C, Etanol Hidratado, Diesel S-10, Diesel comum, GLP P-13.

Se a síntese da semana corrente não estiver disponível, usar a anterior + marcar pending.

## 6. CEPEA/ESALQ — Etanol Produtor

**Frequência**: semanal (terças-quintas).

Buscas:
```
CEPEA ESALQ etanol hidratado anidro preço [mês] 2026
```

Fontes: cepea.esalq.usp.br, NovaCana, UDOP.

Extrair: indicador semanal hidratado SP (R$/L sem impostos) + indicador semanal anidro SP. Inclua variação % vs. semana anterior.

## 7. Abicom — Defasagem Petrobras

**Frequência**: semanal (geralmente segunda/terça, fechamento da sexta anterior).

Buscas:
```
Abicom defasagem Petrobras diesel gasolina [mês] 2026
defasagem combustíveis paridade importação [data]
```

Fontes: abicom.com.br, Brasil Postos, Times Brasil (entrevistas Sergio Araujo).

Extrair: defasagem diesel (% + R$/L), defasagem gasolina (% + R$/L), dias de janela fechada.

## 8. Notícias setoriais (10-15 manchetes da semana)

Buscas amplas pra alimentar 5 manchetes + 6 matérias:

```
combustíveis Brasil [mês] 2026 notícias
ANP fiscalização postos [mês] 2026
MP subsídio combustíveis 2026
STF ADI combustíveis
Lula Petrobras paridade 2026
CNPE biocombustíveis E30 B15 2026
Petrobras reajuste gasolina diesel [mês] 2026
Fecombustíveis vendas varejo combustíveis 2026
Fenabrave vendas carros elétrico híbrido 2026
```

Fontes específicas por seção:

- **Política**: Agência Câmara, Agência Senado, Agência Gov, STF, Ministério da Fazenda, Ministério de Minas e Energia (MME), Casa Civil.
- **Economia BR**: BCB, IBGE, IPEA, Folha, Estadão, Valor, InfoMoney, Daycoval, XP, Itaú Macro.
- **Economia Internacional**: Reuters, Bloomberg, CNBC, FT, WSJ, Federal Reserve, IMF, OPEC.
- **Varejo**: Fecombustíveis, Plural, ClubPetro, Brasil Postos, Abrasel (conveniência).
- **Automotivo**: Fenabrave, Anfavea, ABEIFA, NovaCana (etanol-veículo), Quatro Rodas, AutoData.
- **Combustíveis (setor)**: Brasil Postos, ClubPetro, Petróleo Hoje, NovaCana, UDOP, Times Brasil.

## 9. Padrão de busca — boas práticas

- **Buscas curtas**: 4-6 palavras-chave (não frases longas)
- **Inclua o ano**: "2026" pra evitar resultados antigos
- **Combine instituição + tema**: "Copom Selic decisão maio 2026"
- **Pra datas**: prefira "[mês] 2026" a "[DD/MM/2026]"

## 10. Quando os dados conflitam

- Defasagem Petrobras: Abicom é a fonte primária do clube (vs. StoneX, Petrobras direto)
- Brent: use a fonte com timestamp mais recente
- Etanol CEPEA: use indicador semanal SP (representa ~60% do mercado nacional)
- Bolsas: B3 oficial pro Ibovespa, NYSE/Nasdaq pras americanas
- Inflação: IBGE pro IPCA, BCB Focus pra projeções
