# Enso

Hábitos com calma, sem culpa. PWA pessoal, offline-first, feito com Next.js, Tailwind e Motion.

> **Enso** (円相) é o círculo zen traçado em um único gesto, deixado levemente aberto: a imperfeição é parte do desenho. É a ideia do app, hábitos sem culpa, e é o ícone dele. O nome fica em `src/lib/brand.ts`.

## O que já tem (Fase 1)

- **Interações nativas de hábito**
  - **Contar e acumular**, com quatro visuais à escolha (e uma miniatura ao vivo no formulário): **copo** (onda que enche, com bolhas), **livro** aberto (a pilha de páginas lidas engrossa e uma página vira a cada toque), **anel** que se fecha e **contas** que se acendem. Todos marcam o nível mínimo.
  - **Marcar** (respirar, movimento…): selo que "carimba", com nível **mínimo** e **ideal**
- **Mini-hábitos com níveis**: fazer o mínimo já conta
- **Modo dia difícil** (ícone de folha): reduz o dia ao essencial
- **Frases contextuais** por momento do dia, em quatro tons (gentil, estoico, direto, leve) e frase de identidade por hábito
- **Sons de feedback** sintetizados no próprio navegador (sem arquivos, sem licença)
- **Som ambiente** (ícone de ondas no topo): mixer com chuva, vento, ondas e um piano generativo (notas de uma escala pentatônica com reverb), quatro predefinições, volume por camada e timer para desligar sozinho com fade. Tudo gerado no aparelho, offline; os volumes ficam salvos e o som nunca começa sozinho
- **Celebração** zen quando o dia é completado
- **Tema claro suave e escuro sofisticado**, seguindo o sistema ou escolhido nos ajustes
- **Histórico dos últimos 7 dias**, navegável
- **Check-in de humor e energia** (cinco rostos e três níveis, um toque cada); recolhe num resumo e dá para editar ou limpar. Em dia pesado (humor ≤ 2 ou energia baixa) as frases ficam mais acolhedoras e o app oferece deixar só o essencial
- **Retrospectiva semanal** (segunda a domingo): dias mantidos, anéis por dia, média e comparação com a semana anterior, melhor dia, hábito mais feito, humor médio e a frase de identidade com os "votos" da semana. Um convite aparece de domingo a terça, uma vez por semana; também há um atalho nas estatísticas
- **Jardim vivo**: cada hábito vira uma planta (flor, broto ou arbusto) que cresce com os dias feitos, de semente a frondosa. Nada morre: sem fazer por 3 dias a planta só "descansa" e volta a crescer quando você volta. Céu muda com a hora (amanhecer, dia, entardecer, noite com vaga-lumes) e borboletas visitam quando a sequência passa de 3, 7 e 14 dias
- **Backup em JSON** nos ajustes
- **Estatísticas** (ícone de gráfico no topo), tudo calculado localmente:
  - Dias seguidos, melhor sequência e conclusão dos últimos 30 dias
  - Mapa de calor das últimas 18 semanas
  - Seu dia da semana mais forte
  - Sequência, melhor marca e taxa por hábito
  - **Taxa de recuperação**: quão rápido você volta depois de um dia em branco
  - **Humor e energia**: gráfico dos últimos 14 dias e o que muda no seu ritmo (só com dados suficientes)
  - **Padrões** entre hábitos ("nos dias em que você faz A, faz B em X% das vezes"), só com dados suficientes
- **PWA instalável** e funcional offline; dados ficam no aparelho (IndexedDB)

## Rodar localmente

```bash
npm install
npm run dev        # http://localhost:3000
```

Produção local (o service worker só roda em produção):

```bash
npm run build && npm start
```

## Publicar (GitHub + Vercel)

```bash
git remote add origin https://github.com/PhBros16/habito-habito.git
git push -u origin main
```

Depois, em [vercel.com/new](https://vercel.com/new): importe o repositório. Nenhuma variável de ambiente é necessária. Cada `git push` na `main` publica sozinho.

**Instalar no celular:** abra a URL no navegador e use "Adicionar à tela inicial" (iOS: Compartilhar → Adicionar à Tela de Início).

> O app só guarda dados localmente (IndexedDB), então quem abrir a URL pública vê um app limpo, sem os seus dados.

## Estrutura

```
src/
  app/            layout, manifest (PWA), página
  components/     telas, sheets, celebração, semana, check-in, retrospectiva
    habits/       StampCheck · NumericHabit · HabitCard
      visuals/    Glass · Book · Ring · Beads
  lib/
    types.ts      modelo de dados e níveis (mínimo/ideal)
    stats.ts      sequências, mapa de calor, recuperação e padrões
    checkin.ts    rótulos e regra de "dia pesado"
    garden.ts     estágios, crescimento e descanso das plantas
    db.ts         IndexedDB (v2: hábitos, registros, ajustes, check-ins)
    store.tsx     estado global + persistência
    phrases.ts    frases por momento e tom
    sound.ts      sons de feedback com Web Audio
    ambient.ts    mixer de som ambiente (chuva, vento, ondas, piano)
    templates.ts  hábitos prontos
public/
  sw.js           service worker (offline)
scripts/
  make-icons.mjs  gera os ícones do PWA
```

## Próximas fases

- **Fase 2 (resta):** rotinas com horários, notificações, empilhamento de hábitos
- **Fase 3:** retrospectiva anual, pausas planejadas, diário de uma linha
