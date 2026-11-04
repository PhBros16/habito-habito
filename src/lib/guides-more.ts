import type { Guide } from "./guides";

/** Guias adicionais. Textos originais do Enso, baseados nas fontes citadas em cada guia. */
export const MORE_GUIDES: Guide[] = [
  {
    id: "habitos-na-pratica",
    category: "Hábitos e motivação",
    title: "Como um hábito se forma, de verdade",
    subtitle: "Tamanho, gatilho, tempo e o que fazer quando você falha.",
    minutes: 5,
    evidence: "moderada",
    tldr: "Hábito é repetição num mesmo contexto até o comportamento sair quase sozinho. Leva semanas ou meses, varia muito de pessoa para pessoa, e um dia perdido não desfaz nada.",
    science: [
      {
        heading: "Quanto tempo leva",
        text: "Lally e colegas (2010) acompanharam 96 pessoas por 12 semanas, enquanto tentavam criar um hábito simples (como beber água ou caminhar após o almoço). O tempo até o comportamento ficar automático variou de 18 a 254 dias, com mediana de 66. Não existe prazo mágico de 21 dias.",
      },
      {
        heading: "Falhar um dia não estraga",
        text: "No mesmo estudo, perder uma ocasião isolada não prejudicou de forma relevante o processo. O que pesa é abandonar de vez. Por isso o Enso trata uma falta como pausa, e a volta como o gesto importante.",
      },
      {
        heading: "Decidir antes ajuda a agir",
        text: "Num conjunto de 94 estudos, Gollwitzer e Sheeran (2006) viram que planos do tipo “se (situação), então (ação)” aumentam de modo médio a grande a chance de a pessoa fazer o que pretendia. O plano transfere a decisão para o gatilho: você não precisa lembrar, a situação lembra.",
      },
      {
        heading: "Contexto repetido, automatismo",
        text: "Wood e Neal (2007) descrevem o hábito como uma associação aprendida entre um contexto e uma resposta. Quanto mais estável o lugar, a hora e o que vem antes, mais rápido o comportamento se automatiza. Por isso cada hábito pode ter uma âncora.",
      },
    ],
    myth: {
      claim: "“Em 21 dias você cria qualquer hábito.”",
      truth: "O número vem da observação de um cirurgião plástico nos anos 1960, não de pesquisa sobre hábitos. Os dados mostram uma faixa enorme: de pouco mais de duas semanas a mais de oito meses, conforme a pessoa e a dificuldade do comportamento.",
    },
    steps: [
      { title: "Comece pequeno demais para falhar", text: "Defina a versão mínima: um minuto, uma página, um copo. O mínimo é o que você faz até num dia ruim." },
      { title: "Escolha uma âncora", text: "Complete: “Depois de [algo que já faço], eu [hábito mínimo]”. Quanto mais fixo o gatilho, melhor." },
      { title: "Comemore na hora", text: "Reconheça o feito por um instante, com um sorriso ou um “consegui”. A emoção positiva ajuda a associar o hábito a algo bom." },
      { title: "Deixe a meta crescer sozinha", text: "Se o mínimo ficou fácil por duas semanas, aumente um pouco. Se ficou pesado, diminua. O tamanho certo é o que você mantém." },
      { title: "Planeje o retorno", text: "Decida agora o que fará depois de uma falta: voltar no dia seguinte, no mínimo. Sem punição e sem “compensar”." },
    ],
    limits: [
      "O estudo de Lally é de um grupo pequeno, com comportamentos simples. Hábitos mais complexos tendem a levar mais tempo.",
      "A ideia de “hábitos minúsculos” popularizada por Fogg tem forte apelo prático, mas menos testes controlados do que os planos se-então.",
    ],
    sources: [
      "Lally, P., van Jaarsveld, C. H. M., Potts, H. W. W., Wardle, J. (2010). How are habits formed: Modelling habit formation in the real world. European Journal of Social Psychology, 40(6), 998–1009.",
      "Gollwitzer, P. M., Sheeran, P. (2006). Implementation intentions and goal achievement: A meta-analysis of effects and processes. Advances in Experimental Social Psychology, 38, 69–119.",
      "Wood, W., Neal, D. T. (2007). A new look at habits and the habit-goal interface. Psychological Review, 114(4), 843–863.",
      "Fogg, B. J. (2019). Tiny Habits: The Small Changes That Change Everything. Houghton Mifflin Harcourt.",
    ],
    enso: "O mínimo e o ideal de cada hábito, a âncora “se-então” e o caminho até o automático (na aba Evolução) vêm daqui.",
    tryHabit: "alongar",
  },
  {
    id: "aprender-fazendo",
    category: "Aprendizado",
    title: "Do aprendiz ao fazedor: aprenda produzindo",
    subtitle: "Por que assistir e ler não bastam, e como equilibrar estudo e prática.",
    minutes: 4,
    evidence: "moderada",
    tldr: "Quem pratica ativamente (resolve, escreve, explica, constrói) aprende mais do que quem só assiste ou relê. Mas o iniciante precisa de exemplos antes de se soltar.",
    science: [
      {
        heading: "Aprendizado ativo funciona",
        text: "Freeman e colegas (2014) reuniram 225 estudos em cursos de ciências, engenharia e matemática. Com métodos ativos (resolver problemas em aula, discutir, responder em grupo), as notas subiram em média cerca de 6% e a reprovação caiu de aproximadamente um terço para um quinto dos alunos, em comparação com aulas só expositivas.",
      },
      {
        heading: "A ilusão de saber",
        text: "Assistir uma aula ou reler um texto dá uma sensação de fluência: “está fácil, eu entendi”. Essa sensação engana. Tentar lembrar ou aplicar o conteúdo é mais difícil na hora, e é justamente isso que fixa o aprendizado (Bjork e Bjork, 2011).",
      },
      {
        heading: "Mas o iniciante precisa de modelo",
        text: "Quem está começando sofre com a carga mental de resolver tudo do zero. Estudos sobre carga cognitiva mostram que exemplos resolvidos ajudam bastante no início, e a prática independente ganha valor conforme o domínio cresce (Sweller e Cooper, 1985).",
      },
    ],
    steps: [
      { title: "Escolha um produto pequeno", text: "Um texto, uma função, uma receita, uma música. Algo que você consiga terminar em uma semana." },
      { title: "Estude o mínimo para começar", text: "Veja um exemplo resolvido ou um tutorial curto. Depois feche e tente fazer sozinho." },
      { title: "Trave de propósito", text: "Quando não souber, tente por alguns minutos antes de olhar a resposta. O esforço é parte do aprendizado." },
      { title: "Explique em voz alta", text: "Conte o que fez a alguém (ou a si mesmo). Onde faltar palavra, falta entendimento." },
      { title: "Termine e mostre", text: "Entregar algo, mesmo imperfeito, traz feedback real. Em seguida escolha o próximo produto, um pouco maior." },
    ],
    limits: [
      "Os dados de Freeman vêm de cursos universitários de ciências e exatas; em outras áreas, o efeito pode diferir.",
      "Produzir sem base nenhuma frustra. A proporção ideal entre estudar e fazer depende do seu nível, e não há uma regra única.",
    ],
    sources: [
      "Freeman, S., et al. (2014). Active learning increases student performance in science, engineering, and mathematics. PNAS, 111(23), 8410–8415.",
      "Bjork, E. L., Bjork, R. A. (2011). Making things hard on yourself, but in a good way: Creating desirable difficulties to enhance learning. Em Psychology and the Real World (pp. 56–64). Worth Publishers.",
      "Sweller, J., Cooper, G. A. (1985). The use of worked examples as a substitute for problem solving in learning algebra. Cognition and Instruction, 2(1), 59–89.",
    ],
    enso: "Transforme o estudo em hábito de “produzir algo”: o modelo Projeto pede um pequeno passo por dia, e o diário registra o que você construiu.",
    tryHabit: "estudo",
  },
  {
    id: "cerebro-preve",
    category: "Atenção e mente",
    title: "Seu cérebro vive de previsões",
    subtitle: "Como a expectativa molda o que você sente, e como testar suas previsões.",
    minutes: 4,
    evidence: "debatida",
    tldr: "O cérebro não só recebe o mundo: ele antecipa. Expectativas influenciam percepção, esforço e humor. Aprender é, em boa parte, corrigir previsões erradas.",
    science: [
      {
        heading: "Aprender é corrigir previsões",
        text: "Neurônios de dopamina respondem mais a recompensas inesperadas do que às esperadas, e “silenciam” quando uma recompensa prevista não vem (Schultz, Dayan e Montague, 1997). Em termos simples: o cérebro aprende com a diferença entre o que previu e o que aconteceu.",
      },
      {
        heading: "Expectativas colorem a experiência",
        text: "Um estudo clássico com camareiras de hotel (Crum e Langer, 2007) sugeriu que quem foi informada de que o trabalho era um bom exercício apresentou melhora em medidas de saúde, sem mudar o que fazia. O estudo é pequeno e discutido, mas combina com um achado robusto em outras áreas: o que esperamos altera o que sentimos, como no efeito placebo.",
      },
      {
        heading: "Erramos ao prever como vamos nos sentir",
        text: "Pesquisas sobre previsão afetiva mostram que costumamos superestimar a intensidade e a duração das emoções futuras, tanto das boas quanto das ruins (Wilson e Gilbert, 2005). Muita coisa que parece insuportável de antemão é mais leve na prática.",
      },
    ],
    myth: {
      claim: "“O cérebro cria a realidade; o que você pensa se torna verdade.”",
      truth: "As expectativas influenciam a experiência, mas não mudam os fatos. A teoria da previsão é uma grande hipótese de trabalho, ainda debatida, e não prova que pensar positivo resolve tudo.",
    },
    steps: [
      { title: "Escreva sua previsão", text: "Antes de um hábito difícil: “Vou achar isso de 0 a 10 de chato / cansativo”." },
      { title: "Faça a versão mínima", text: "Dois ou cinco minutos bastam para testar." },
      { title: "Compare com o resultado", text: "Como foi de verdade? Anote a nota real ao lado da prevista." },
      { title: "Repare nos padrões", text: "Se você costuma prever pior do que é, use essa evidência: “Das últimas cinco vezes, foi mais leve do que eu esperava”." },
    ],
    limits: [
      "A ideia de “cérebro preditivo” é um modelo teórico influente, não uma lei comprovada. Use-a como lente, não como verdade.",
      "O experimento das camareiras é pequeno e não foi bem replicado. Trate-o como ilustração, não como prova.",
    ],
    sources: [
      "Schultz, W., Dayan, P., Montague, P. R. (1997). A neural substrate of prediction and reward. Science, 275(5306), 1593–1599.",
      "Crum, A. J., Langer, E. J. (2007). Mind-set matters: Exercise and the placebo effect. Psychological Science, 18(2), 165–171.",
      "Wilson, T. D., Gilbert, D. T. (2005). Affective forecasting: Knowing what to want. Current Directions in Psychological Science, 14(3), 131–134.",
      "Clark, A. (2013). Whatever next? Predictive brains, situated agents, and the future of cognitive science. Behavioral and Brain Sciences, 36(3), 181–204.",
    ],
    enso: "Antes de um hábito difícil, anote no diário como você acha que vai ser. Depois do hábito, compare.",
  },
  {
    id: "pensar-melhor",
    category: "Decisões e mentalidade",
    title: "Pensar melhor: vieses e como reduzi-los",
    subtitle: "Pequenos truques para decidir com menos autoengano.",
    minutes: 5,
    evidence: "moderada",
    tldr: "Todos temos atalhos mentais que falham de modo previsível. Treino e alguns hábitos simples (considerar o contrário, olhar números de base, registrar previsões) reduzem esses erros.",
    science: [
      {
        heading: "Dá para treinar",
        text: "Morewedge e colegas (2015) testaram uma única sessão de treino, em jogo ou em vídeo, sobre vieses como o de confirmação. Os participantes erraram menos em testes feitos logo depois, e parte do efeito ainda aparecia cerca de dois meses mais tarde. O jogo funcionou melhor que o vídeo.",
      },
      {
        heading: "Considere o contrário",
        text: "Em um estudo clássico, pessoas que leem evidências sobre um tema polêmico tendem a reforçar a opinião que já tinham. Quando pediram que elas “considerassem o contrário” (imaginar o que diriam se os resultados fossem opostos), o viés diminuiu (Lord, Lepper e Preston, 1984).",
      },
      {
        heading: "Imaginar que deu errado",
        text: "Mitchell, Russo e Pennington (1989) mostraram que imaginar um evento como já ocorrido ajuda a gerar mais e melhores explicações do que perguntar “o que pode acontecer?”. É a base do “pré-mortem”, técnica de projeto em que a equipe imagina o fracasso para achar riscos antes.",
      },
      {
        heading: "Previsões registradas melhoram com o tempo",
        text: "Em torneios de previsão, participantes treinados em raciocínio probabilístico e que registravam estimativas fizeram previsões mais precisas do que os não treinados (Mellers e colegas, 2014).",
      },
    ],
    steps: [
      { title: "Nomeie o viés", text: "Confirmação, ancoragem, excesso de confiança. Dar nome ajuda a notar quando acontece." },
      { title: "Considere o contrário", text: "Antes de decidir, escreva o melhor argumento a favor da opção que você está descartando." },
      { title: "Olhe os números de base", text: "Quantas pessoas em situação parecida conseguiram? Comece por aí, antes de achar que o seu caso é exceção." },
      { title: "Faça o pré-mortem", text: "Imagine que, daqui a seis meses, deu errado. Liste três motivos e proteja-se de um deles." },
      { title: "Registre a previsão", text: "Escreva o que acha que vai acontecer e a confiança (de 0 a 100%). Revise depois e veja se você tende a acertar ou a se achar demais." },
    ],
    limits: [
      "Os estudos são principalmente de laboratório e com testes controlados. A transferência para decisões complexas da vida real é menos clara.",
      "Saber que vieses existem não nos livra deles. O que ajuda é criar um passo concreto antes de decidir.",
    ],
    sources: [
      "Morewedge, C. K., et al. (2015). Debiasing decisions: Improved decision making with a single training intervention. Policy Insights from the Behavioral and Brain Sciences, 2(1), 129–140.",
      "Lord, C. G., Lepper, M. R., Preston, E. (1984). Considering the opposite: A corrective strategy for social judgment. Journal of Personality and Social Psychology, 47(6), 1231–1243.",
      "Mitchell, D. J., Russo, J. E., Pennington, N. (1989). Back to the future: Temporal perspective in the explanation of events. Journal of Behavioral Decision Making, 2(1), 25–38.",
      "Mellers, B., et al. (2014). Psychological strategies for winning a geopolitical forecasting tournament. Psychological Science, 25(5), 1106–1115.",
    ],
    enso: "Use o diário para registrar uma previsão por semana e a confiança que você tem nela.",
    tryHabit: "escrever",
  },
  {
    id: "marshmallow",
    category: "Hábitos e motivação",
    title: "O teste do marshmallow e o que ele realmente mostra",
    subtitle: "Autocontrole, ambiente e confiança: a história é mais interessante que o mito.",
    minutes: 5,
    evidence: "debatida",
    tldr: "Esperar por uma recompensa maior não é só força de vontade. Depende de contexto, confiança no que foi prometido e cultura. E o poder do teste de prever o futuro é bem menor do que se contou.",
    science: [
      {
        heading: "A versão famosa",
        text: "Nos anos 1970, Walter Mischel e colegas ofereceram a crianças pequenas um doce agora ou dois se esperassem. Acompanhamentos posteriores ligaram a espera a melhores resultados na adolescência, o que alimentou a ideia de que o autocontrole infantil define o futuro.",
      },
      {
        heading: "O que a reanálise mostrou",
        text: "Watts, Duncan e Quan (2018) repetiram a pesquisa com uma amostra maior e mais diversa. A associação entre esperar e resultados posteriores foi bem menor que a original e, ao considerar o contexto familiar e a capacidade cognitiva inicial, ficou perto de zero em várias medidas. Ou seja, boa parte do que parecia “autocontrole” refletia o ambiente em que a criança cresceu.",
      },
      {
        heading: "Esperar é uma aposta racional",
        text: "Kidd, Palmeri e Aslin (2013) fizeram um experimento em que as crianças viam o adulto cumprir ou quebrar uma promessa pequena antes do teste. As que viram a promessa ser quebrada esperaram bem menos. Se a recompensa futura parece incerta, pegar o doce agora faz sentido.",
      },
      {
        heading: "Cultura e hábito importam",
        text: "Comparando crianças dos Estados Unidos e do Japão, Yanaoka e colegas (2022) encontraram diferenças na espera e as relacionaram a práticas e hábitos de cada cultura. O autocontrole parece ser, em parte, aprendido e apoiado pelo meio.",
      },
    ],
    myth: {
      claim: "“Quem não resiste ao marshmallow aos 4 anos está condenado a fracassar.”",
      truth: "O teste prevê pouco depois que se considera o ambiente. Autocontrole é uma habilidade que se apoia em contexto, confiança e prática, e pode ser desenvolvida.",
    },
    steps: [
      { title: "Cumpra promessas pequenas consigo", text: "Cada mínimo feito é um voto de confiança: seu cérebro aprende que esperar compensa." },
      { title: "Troque força de vontade por situação", text: "Tire a tentação de vista e aproxime a opção boa. Estratégias de situação costumam funcionar melhor que resistir no braço." },
      { title: "Torne a recompensa futura mais concreta", text: "Escreva ou visualize o que você ganha depois de esperar, com detalhes." },
      { title: "Evite se rotular", text: "“Não tenho disciplina” é uma frase que desanima. Prefira: “Ainda não organizei meu ambiente para isso”." },
    ],
    limits: [
      "A amostra de Watts e colegas é maior que a original, mas ainda é um recorte (crianças de famílias de nível de ensino variado, nos EUA).",
      "Estudos transculturais são recentes e ainda poucos; trate as diferenças como pista, não como regra.",
    ],
    sources: [
      "Watts, T. W., Duncan, G. J., Quan, H. (2018). Revisiting the marshmallow test: A conceptual replication investigating links between early delay of gratification and later outcomes. Psychological Science, 29(7), 1159–1177.",
      "Kidd, C., Palmeri, H., Aslin, R. N. (2013). Rational snacking: Young children's decision-making on the marshmallow task is moderated by beliefs about environmental reliability. Cognition, 126(1), 109–114.",
      "Yanaoka, K., et al. (2022). Cultures crossing: The power of habit in delaying gratification. Psychological Science, 33(7).",
      "Duckworth, A. L., Gendler, T. S., Gross, J. J. (2016). Situational strategies for self-control. Perspectives on Psychological Science, 11(1), 35–55.",
    ],
    enso: "O mínimo diário é a promessa pequena que você cumpre. O jardim cresce com a soma dessas promessas.",
  },
  {
    id: "autodistanciamento",
    category: "Emoções",
    title: "Autodistanciamento: falar consigo como falaria a um amigo",
    subtitle: "Um jeito simples de ficar mais calmo e persistente, do “efeito Batman” à terceira pessoa.",
    minutes: 4,
    evidence: "moderada",
    tldr: "Olhar para si como observador, e não de dentro da emoção, reduz a intensidade e ajuda a agir. Funciona com o próprio nome, com um conselho a um amigo ou imaginando alguém que você admira.",
    science: [
      {
        heading: "Falar consigo pelo nome",
        text: "Kross e colegas (2014) pediram a pessoas que se preparassem para uma fala em público. Quem pensou sobre si em terceira pessoa (“Por que [nome] está nervoso?”) teve menos ansiedade e foi avaliado como melhor do que quem usou “eu”, e depois reviveu o episódio com menos vergonha.",
      },
      {
        heading: "O efeito Batman",
        text: "White e colegas (2017) pediram a crianças de 4 a 6 anos que fizessem uma tarefa chata no computador. As que se imaginavam como um personagem admirado (como o Batman) persistiram mais do que as que pensavam em si mesmas. O afastamento da própria perspectiva ajudou a manter o esforço.",
      },
      {
        heading: "Por que funciona",
        text: "Quando você se vê de fora, a emoção pesa menos e fica mais fácil lembrar de metas e de alternativas. É também por isso que costumamos dar conselhos mais sábios a um amigo do que a nós mesmos: de fora, o problema parece menor (Grossmann e Kross, 2014; Kross e Ayduk, 2017).",
      },
    ],
    steps: [
      { title: "Perceba o aperto", text: "Notou ansiedade, raiva ou desânimo? Pare por dez segundos." },
      { title: "Fale de fora", text: "Pergunte em voz baixa ou por escrito: “[seu nome], o que está acontecendo e o que você pode fazer agora?”" },
      { title: "Imagine o amigo", text: "O que você diria a um amigo nessa mesma situação? Diga isso a si." },
      { title: "Se quiser, escolha um personagem", text: "Para tarefas difíceis ou urgentes, pergunte: “Como [pessoa que admiro] faria o primeiro passo?” Faça só esse passo." },
      { title: "Anote o resultado", text: "No diário, escreva em uma linha se ajudou. Repita o que funcionar." },
    ],
    limits: [
      "Os estudos com crianças são curtos e específicos; não garantem o mesmo efeito em adultos em qualquer situação.",
      "É uma ferramenta de apoio, não um tratamento. Sofrimento intenso e persistente merece conversa com um profissional.",
    ],
    sources: [
      "Kross, E., et al. (2014). Self-talk as a regulatory mechanism: How you do it matters. Journal of Personality and Social Psychology, 106(2), 304–324.",
      "White, R. E., Prager, E. O., Schaefer, C., Kross, E., Duckworth, A. L., Carlson, S. M. (2017). The “Batman effect”: Improving perseverance in young children. Child Development, 88(6).",
      "Grossmann, I., Kross, E. (2014). Exploring Solomon's paradox: Self-distancing eliminates the self-other asymmetry in wise reasoning about close relationships in younger and older adults. Psychological Science, 25(8), 1571–1580.",
      "Kross, E., Ayduk, O. (2017). Self-distancing: Theory, research, and current directions. Advances in Experimental Social Psychology, 55, 81–136.",
    ],
    enso: "No diário, escreva sobre o seu dia em terceira pessoa por uma semana e veja se muda o tom.",
  },
  {
    id: "gratidao",
    category: "Emoções",
    title: "Gratidão que funciona (sem forçar)",
    subtitle: "Um exercício pequeno com efeito real, desde que seja feito com sentido.",
    minutes: 4,
    evidence: "moderada",
    tldr: "Anotar o que deu certo e por quê melhora um pouco o bem-estar e o humor de muita gente. O efeito é modesto, depende de como se pratica e não funciona como obrigação.",
    science: [
      {
        heading: "O que os estudos mostram",
        text: "Em um estudo conhecido, quem listou semanalmente coisas pelas quais era grato relatou mais otimismo e menos queixas de saúde do que quem listou aborrecimentos (Emmons e McCullough, 2003). Em outro, anotar três coisas boas do dia e a causa de cada uma melhorou a felicidade e reduziu sintomas depressivos por até seis meses (Seligman e colegas, 2005).",
      },
      {
        heading: "Efeito pequeno a moderado",
        text: "Revisões que juntam vários estudos encontram efeitos positivos, mas modestos, e que variam bastante entre as pessoas e os formatos (Davis e colegas, 2016). Não é um remédio, mas é barato e simples.",
      },
      {
        heading: "Menos vezes pode render mais",
        text: "Lyubomirsky e colegas (2005) sugeriram que contar bênçãos uma vez por semana trouxe mais benefício do que três vezes por semana: a prática diária pode virar rotina vazia. Variar o conteúdo e escrever com detalhes ajuda.",
      },
    ],
    steps: [
      { title: "Escolha três coisas boas", text: "Pequenas valem: um café quente, uma conversa, um problema resolvido." },
      { title: "Escreva por quê", text: "Uma frase sobre o motivo de ter acontecido. Isso ancora a lembrança." },
      { title: "Seja específico", text: "“Minha irmã me ligou só para saber como eu estava” rende mais do que “família”." },
      { title: "Varie", text: "Procure coisas novas a cada vez, para não virar uma lista automática." },
      { title: "Sem culpa", text: "Dias ruins existem. Gratidão não é negar o que dói; é também notar o que está de pé." },
    ],
    limits: [
      "Em pessoas muito deprimidas, listar bênçãos pode parecer forçado e até piorar o humor. Nesse caso, vá no seu ritmo.",
      "Gratidão não substitui tratamento nem resolve problemas reais. É um complemento.",
    ],
    sources: [
      "Emmons, R. A., McCullough, M. E. (2003). Counting blessings versus burdens: An experimental investigation of gratitude and subjective well-being in daily life. Journal of Personality and Social Psychology, 84(2), 377–389.",
      "Seligman, M. E. P., Steen, T. A., Park, N., Peterson, C. (2005). Positive psychology progress: Empirical validation of interventions. American Psychologist, 60(5), 410–421.",
      "Lyubomirsky, S., Sheldon, K. M., Schkade, D. (2005). Pursuing happiness: The architecture of sustainable change. Review of General Psychology, 9(2), 111–131.",
      "Davis, D. E., et al. (2016). Thankful for the little things: A meta-analysis of gratitude interventions. Journal of Counseling Psychology, 63(1), 20–31.",
    ],
    enso: "O modelo Gratidão cria um hábito semanal ou diário; o diário guarda as listas.",
    tryHabit: "gratidao",
  },
];
