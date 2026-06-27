# Princípios Editoriais — Posto em Dia

## 1. Modelo editorial

É um JORNAL SEMANAL completo, não um boletim de indicadores. Estrutura fixa:

1. **Indicadores Financeiros** — 7 blocos de cotações fechadas (Petróleo, Moedas, Bolsas, Juros & Inflação, ANP, CEPEA, Abicom)
2. **5 Manchetes da Semana** — as 5 notícias mais relevantes (com filtro "afeta dono de posto"), com numeração de capa
3. **Mercado de Combustíveis** — matéria longa de análise setorial
4. **Política · Quente** — uma matéria sobre conflito político/regulatório atual com impacto direto
5. **Economia · Brasil** — leitura da semana sobre Selic, IPCA, Focus, câmbio, atividade
6. **Economia · Internacional** — Fed, China, OPEP+, geopolítica, commodities
7. **Varejo** — análise sobre varejo brasileiro, conveniência, hábitos de consumo
8. **Automotivo** — carros, EVs, híbridos, infraestrutura, caminhões, tendências

Cada matéria longa tem ~3 parágrafos (3-5 linhas cada). Tom de jornalismo econômico premium — Valor Econômico, FT, NYT Business.

## 2. Tom e voz

- **Copy-ready**: prontos pra publicar. Sem necessidade de revisão palavra por palavra.
- **Operacional**: implicação prática pro dono de posto em cada matéria.
- **Densidade jornalística**: números, datas, fontes oficiais citadas, nomes próprios.
- **Sem condescendência**: leitor é dono de posto há anos. Linguagem técnica do setor sem explicar o óbvio.
- **Sem preamble**: "Claro!", "Vou fazer isso", "Como podemos ver" — banidos.
- **Imperativo quando há ação**: "Trave compras", "Renegocie", "Monitore".

## 3. Regras invioláveis dos dados

### Nunca fabricar valores

Se um indicador não estiver disponível, use `direction: "pending"` + `value: "a confirmar"` + cite o motivo no `source`.

### Sempre citar fonte e data

- ❌ "O Brent subiu nesta semana"
- ✅ "O Brent saltou 2,41% em 12/mai, segundo ICE/Investing — fechamento US$ 103,73"

### Hierarquia de fontes

1. **Fonte primária oficial**: ANP, CEPEA/ESALQ, Banco Central, B3, MME, IBGE, Câmara, Senado, FOMC
2. **Associações setoriais**: Abicom, Fecombustíveis, UNICA, Plural, Fenabrave, ABEIFA
3. **Veículos especializados**: Brasil Postos, ClubPetro, Petróleo Hoje, NovaCana, Times Brasil
4. **Imprensa econômica**: Reuters, Bloomberg, Valor, Folha, Estadão, CNBC, FT
5. **Aggregators**: usar com ressalva, verificar a fonte primária citada

## 4. Direção dos indicadores (perspectiva operacional)

A cor não é "subiu/desceu" — é "bom/ruim pro posto":

| Indicador | Subiu = | Desceu = |
|---|---|---|
| Brent / WTI | `up` (vermelho — pressiona defasagem) | `down` (verde) |
| USD/BRL, EUR/BRL | `up` (vermelho — dólar caro) | `down` (verde) |
| Bolsas (IBOV, S&P, Nasdaq) | `down` (verde, neutro pro posto) | `up` (vermelho — aversão a risco) |
| Selic / Fed / juros | `up` (vermelho — crédito caro) | `down` (verde) |
| IPCA / inflação | `up` (vermelho) | `down` (verde) |
| ANP bomba | `up` (vermelho — margem espremida) | `down` (verde) |
| CEPEA usina | `up` (vermelho — etanol caro) | `down` (verde — janela de compra) |
| Defasagem Abicom | `up` (vermelho — risco repasse) | `down` (verde — paridade saudável) |

Quando estável, use `neutral`. Quando pendente, `pending`.

## 5. Manchetes

- Numeradas de 1 a 5
- Headline forte (uma frase com dado concreto)
- Resumo de 2-3 linhas (~60-90 palavras), com fato + por que importa pro posto
- Mix temático: pode misturar política, economia, geopolítica, setor — filtro é "afeta o dono de posto"

## 6. Matérias longas

- Estrutura: `headline` + `deck` (italic, linha-fina) + `body` (3 parágrafos)
- Cada parágrafo: 3-5 linhas (~180-280 palavras por matéria)
- Use `<strong>...</strong>` pra destacar números e nomes chave (vai aparecer em azul petróleo no PDF)
- Sem subtítulos dentro do body — fluxo contínuo
- Último parágrafo termina com implicação operacional pro dono de posto

## 7. Política · Quente

A seção de política é INCISIVA — busca um conflito, uma disputa, um movimento controverso da semana com efeito direto no setor. Não é resumo neutro. Tem ângulo, tem lados, tem consequência.

Exemplos de bons temas: ADIs no STF, vetos presidenciais, MP que pode caducar, projeto polêmico no Congresso, disputa federativa sobre ICMS, conflito Lula × governadores.

## 8. O que NÃO entra

- Análise política partidária ("o governo X é melhor que o Y")
- Especulação sem dado ("o Brent pode ir a US$ 150")
- Conteúdo motivacional ("siga seus sonhos")
- Self-help empresarial
- Fofoca corporativa sem implicação operacional
- Autopromoção excessiva do Lumen

## 9. Comprimento total

Newsletter completa: ~10.000-13.000 caracteres no HTML útil (sem CSS). Cada matéria longa: ~1.500-2.000 caracteres.

## 10. Critério de seleção de notícias (prioridade decrescente)

### Prioridade 1 — Notícia desta semana
Qualquer notícia publicada dentro do período da edição (domingo a sexta) que tenha impacto direto no setor de combustíveis, ou macro com efeito nos postos em até 60 dias. Marque `carryover: false`, `opiniao: null`.

### Prioridade 2 — Fallback: semana anterior com update
Se não houver notícia diferente da semana anterior para um tema:
1. Busque se o fato anterior foi resolvido, atualizado ou piorou
2. Escreva o body com o que há de novo (mesmo que seja "situação persiste")
3. Preencha `opiniao` com 1-2 frases incisivas da perspectiva do Ramsés — **OBRIGATÓRIO no fallback**
4. Marque `carryover: true`

### Indicadores (ANP / Abicom / CEPEA)
Se não publicaram esta semana, use dado da semana anterior e marque `source` com `"(semana anterior — confirmar)"`.

### O que NÃO usar mesmo como fallback
- Notícia sem nenhuma relação com combustíveis, macro ou varejo de posto
- Fato totalmente resolvido sem desdobramento relevante
