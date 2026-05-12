# Formato dos 5 Cards Editoriais

Cada card segue **exatamente** esta estrutura HTML, sem variação. Substitua apenas o conteúdo entre tags.

## Anatomia do card

```html
<div class="card [COR]">
  <span class="card-tag tag-[COR]">[EMOJI] [URGÊNCIA]</span>
  <div class="card-title">[NÚMERO]. [TÍTULO FORTE]</div>

  <div class="card-block">
    <span class="block-label">O que aconteceu</span>
    <p>[Fato objetivo da semana com números, datas e fontes]</p>
  </div>

  <div class="card-block">
    <span class="block-label">Por que importa</span>
    <p>[Impacto direto para o posto / revendedor]</p>
  </div>

  <div class="card-block">
    <span class="block-label">Ação da semana</span>
    <p>[O que o revendedor deve concretamente fazer]</p>
  </div>
</div>
```

## Mapeamento de cor x classe x tag

| Urgência | Classe da `<div>` | Classe da tag | Texto da tag |
|---|---|---|---|
| Ação imediata (vermelho) | `card red` | `card-tag tag-red` | `🔴 Ação Imediata` |
| Atenção (amarelo) | `card yellow` | `card-tag tag-yellow` | `🟡 Atenção` |
| Oportunidade (verde) | `card green` | `card-tag tag-green` | `🟢 Oportunidade` |
| Informativo (azul) | `card blue` | `card-tag tag-blue` | `🔵 Informativo` |

## Regras de conteúdo

### Título do card

- Começa SEMPRE com numeração (`1.`, `2.`, `3.`, `4.`, `5.`)
- Frase forte, ativa, com dado concreto se possível
- Exemplos bons:
  - `1. Brent dispara para US$ 102 com ataques no Estreito de Ormuz`
  - `2. Defasagem Petrobras chega a 41% na gasolina e 31% no diesel`
  - `3. Subsídio do diesel ampliado: R$ 1,20/L importado + R$ 0,80/L produzido no Brasil`
- Exemplos ruins:
  - ❌ `Sobre o petróleo` (vago, sem dado)
  - ❌ `Análise da semana no setor de combustíveis` (genérico)

### "O que aconteceu" (3 a 5 linhas)

Fato bruto. Inclua:
- Números específicos (preço, %, quantidades)
- Data específica (não "esta semana", mas "em 17/04" ou "no fechamento de 22/04")
- Fonte oficial citada (ANP, Abicom, CEPEA, MP número, etc.)

### "Por que importa" (3 a 5 linhas)

Conexão direta com a operação do posto. Não é análise filosófica nem opinião. Responde: "como isso me afeta como dono de posto?"

### "Ação da semana" (3 a 6 linhas, frequentemente com itens numerados embutidos)

Ação concreta e mensurável. Verbos no imperativo: "Confirme", "Acelere", "Renegocie", "Faça", "Pergunte por escrito".

Exemplo de boa ação:
> Pergunte por escrito à sua distribuidora: (1) ela aderiu ao Regime Emergencial? (2) qual o valor exato do subsídio repassado por litro na nota? (3) está cumprindo divulgação semanal de margens à ANP? Guarde tudo.

Exemplo de ação ruim:
> ❌ "Fique atento ao mercado." (vago, sem ação verificável)
> ❌ "Considere fazer ajustes na sua estratégia." (não é ação)

## Exemplo completo (Edição 16, Card 1)

```html
<div class="card red">
  <span class="card-tag tag-red">🔴 Ação Imediata</span>
  <div class="card-title">1. Brent dispara para US$ 102 com ataques no Estreito de Ormuz</div>

  <div class="card-block">
    <span class="block-label">O que aconteceu</span>
    <p>O barril do Brent saltou 3,59% em 22/04 e tocou US$ 102, após relatos de ataques a navios cargueiros e bloqueio do Estreito de Ormuz. O Irã apreendeu dois cargueiros que tentavam atravessar o estreito, e Trump prorrogou o cessar-fogo, mas o tráfego no canal segue praticamente parado. WTI subiu 4,13%, fechando a US$ 93,37.</p>
  </div>

  <div class="card-block">
    <span class="block-label">Por que importa</span>
    <p>Cerca de 20% do petróleo mundial passa por Ormuz. Se o Brent se firmar acima de US$ 100, a defasagem da Petrobras (já em 31% diesel / 41% gasolina) explode e força reajuste. Distribuidoras independentes — Acelen/Mataripe, importadores — já repassaram a alta. Postos abastecidos por Petrobras ainda têm preço travado, mas a janela está fechando.</p>
  </div>

  <div class="card-block">
    <span class="block-label">Ação da semana</span>
    <p>Acelere as compras programadas dos próximos 15 dias enquanto o preço Petrobras está represado. Se você é bandeira branca abastecido por importador, esse hedge não funciona — o repasse de preço já chegou. Reveja sua política de margem: travar preço-bomba sem cobertura de estoque é receita para sangrar.</p>
  </div>
</div>
```

## Distribuição típica de cores em uma edição

Em uma semana de mercado quente (como a Edição 16), espere 3 cards vermelhos, 1 amarelo, 1 verde. Em semana calma, 1-2 vermelhos, 2 amarelos, 1-2 verdes/azuis. Evite todas as 5 da mesma cor (perde valor de codificação).
