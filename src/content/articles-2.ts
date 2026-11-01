import type { Article } from "./types";

export const ARTICLES_2: Article[] = [
  {
    id: "o-que-e-memoria",
    title: "O que são e onde ficam as memórias",
    category: "memoria",
    minutes: 3,
    hook: "Você já teve certeza de que lembrava de algo e depois descobriu que estava errado? Isso não é defeito raro: é o jeito normal de a memória funcionar.",
    tldr: "Memória não é um arquivo único guardado num ponto do cérebro. São vários sistemas, e cada lembrança é refeita toda vez que você a evoca.",
    science: [
      {
        heading: "Não existe uma memória só",
        text: "Os pesquisadores costumam separar tipos. A memória de trabalho segura poucas informações por alguns segundos, como um número de telefone que você repete até discar. A memória episódica guarda eventos da sua vida (o aniversário de ontem). A semântica guarda fatos e significados (a capital da França). A procedural guarda habilidades que você faz sem pensar, como andar de bicicleta. Esses sistemas se apoiam em redes cerebrais diferentes, e uma pessoa pode perder um sem perder os outros.",
      },
      {
        heading: "Consolidação: lembrar leva tempo para firmar",
        text: "Uma experiência nova começa frágil. Consolidar é o processo, que continua depois do evento (inclusive durante o sono), pelo qual ela se estabiliza. O hipocampo, uma estrutura funda no lobo temporal, tem papel importante em formar memórias de fatos e eventos novos. Com o tempo, muita coisa passa a depender mais de áreas do córtex, a camada externa do cérebro. Mas dizer que a memória \"fica no hipocampo\" ou \"fica no córtex\" é simplificação: ela é distribuída por redes, e os detalhes ainda são debatidos.",
      },
      {
        heading: "Lembrar é reconstruir",
        text: "Ao evocar um episódio, o cérebro remonta a cena a partir de pedaços, e o que você sabe hoje e o que lhe perguntam influenciam o resultado. Num experimento clássico, Loftus e Palmer mostraram filmes de colisões e perguntaram a velocidade dos carros usando verbos diferentes (como \"bateram\" ou \"se chocaram\"). A escolha da palavra mudou as estimativas. Daí vêm as falsas memórias: lembranças vívidas, e convictas, de algo que não aconteceu como se recorda. Schacter descreve esse tipo de falha como parte do custo de um sistema que, no geral, funciona bem.",
      },
    ],
    myth: {
      claim: "Memórias são como vídeos gravados: quanto mais nítida e confiante a lembrança, mais precisa ela é.",
      reality: "Confiança e nitidez não garantem exatidão. A evocação reconstrói a cena, e é possível lembrar com toda a certeza de um detalhe falso.",
    },
    practice: [
      { title: "Anote o que importa", text: "Para decisões ou combinados importantes, registre na hora. O registro vence a lembrança, que muda com o tempo." },
      { title: "Desconfie de relatos muito \"redondos\"", text: "Se duas pessoas lembram de um episódio de modo diferente, é comum que ambas estejam sendo sinceras. Pergunte antes de acusar." },
      { title: "Dê tempo à consolidação", text: "O que você quer reter precisa de revisões e de sono entre elas. Estudar tudo numa noite só deixa a memória frágil." },
      { title: "Use a memória procedural a seu favor", text: "Hábitos viram automáticos com repetição. Por isso o mínimo diário, feito sempre, pesa mais do que um esforço grande e raro." },
    ],
    evidence: "moderada",
    evidenceNote: "A divisão em sistemas de memória e a natureza reconstrutiva da lembrança são bem aceitas. Onde cada tipo \"mora\" e como a consolidação acontece em detalhe seguem em discussão. O estudo de Loftus e Palmer é clássico, mas os efeitos de sugestão variam conforme o contexto.",
    sources: [
      { cite: "Squire, L. R. (2004). Memory systems of the brain: a brief history and current perspective. Neurobiology of Learning and Memory.", url: "https://pubmed.ncbi.nlm.nih.gov/15464402/" },
      { cite: "Loftus, E. F., & Palmer, J. C. (1974). Reconstruction of automobile destruction: an example of the interaction between language and memory. Journal of Verbal Learning and Verbal Behavior, 13(5), 585-589.", url: "https://doi.org/10.1016/S0022-5371(74)80011-3" },
      { cite: "Schacter, D. L. (1999). The seven sins of memory: insights from psychology and cognitive neuroscience. American Psychologist.", url: "https://sites.harvard.edu/schacter-memory/files/2022/09/schacter1999.pdf" },
      { cite: "Rasch, B., & Born, J. (2013). About sleep's role in memory. Physiological Reviews, 93(2), 681-766.", url: "https://doi.org/10.1152/physrev.00032.2012" },
    ],
    enso: "Use o diário do app para anotar o que quer lembrar do dia: escrever na hora é mais confiável do que contar com a memória depois.",
  },
  {
    id: "melhorar-a-memoria",
    title: "Como melhorar a memória",
    category: "memoria",
    minutes: 4,
    hook: "A maioria das pessoas estuda relendo e grifando. É confortável, dá sensação de progresso e rende menos do que parece.",
    tldr: "Testar-se, espaçar as revisões e dormir bem funcionam melhor do que reler e marcar texto.",
    science: [
      {
        heading: "Testar-se ensina",
        text: "Tentar lembrar algo sem olhar a resposta fortalece a memória, e não apenas mede o que você sabe. É o chamado efeito de teste. Em um estudo de Roediger e Karpicke (2006), estudantes leram textos e depois ou fizeram testes de evocação ou releram o material. Cinco minutos depois, reler deu resultado melhor. Dois dias e uma semana depois, quem tinha se testado lembrava bem mais, mesmo se sentindo menos confiante. A sensação de saber enganava.",
      },
      {
        heading: "Espaçar vence amontoar",
        text: "Distribuir as revisões ao longo dos dias costuma render mais retenção do que concentrá-las num bloco. Uma meta-análise de Cepeda e colegas (2006), reunindo centenas de comparações, mostrou que o intervalo ideal entre revisões cresce conforme o tempo que você precisa guardar a informação: para lembrar daqui a semanas, vale deixar passar mais tempo entre as revisões.",
      },
      {
        heading: "O papel do sono",
        text: "Dormir depois de aprender ajuda a consolidar o que foi estudado. A revisão de Rasch e Born (2013) reúne evidências de que o sono contribui para estabilizar memórias. Isso não faz do sono um truque milagroso, e as medidas variam entre estudos, mas cortar o sono para estudar mais costuma sair caro.",
      },
      {
        heading: "O que rende pouco",
        text: "Na revisão de Dunlosky e colegas (2013), que avaliou dez técnicas, prática de testes e prática distribuída receberam nota de utilidade alta. Reler e grifar ficaram entre as de utilidade baixa: não melhoram o desempenho de forma consistente. Isso não quer dizer que nunca ajudem, só que há opções melhores para o mesmo tempo.",
      },
    ],
    myth: {
      claim: "Reler várias vezes e grifar o texto é a melhor maneira de fixar o conteúdo.",
      reality: "Dá familiaridade, que parece conhecimento, mas costuma render menos em testes tardios do que se testar e espaçar.",
    },
    practice: [
      { title: "Feche o material e puxe da memória", text: "Depois de estudar, escreva ou diga o que lembra, sem consultar. Só então confira e corrija." },
      { title: "Marque revisões em dias diferentes", text: "Revise no dia seguinte, depois alguns dias depois, depois uma semana depois. Pequenas sessões bastam." },
      { title: "Troque o grifo por perguntas", text: "Transforme cada trecho importante numa pergunta e responda de cabeça na próxima sessão." },
      { title: "Proteja o sono antes de uma prova", text: "Prefira uma revisão curta e dormir a virar a noite relendo." },
    ],
    evidence: "forte",
    evidenceNote: "Efeito de teste e espaçamento têm muitos estudos e meta-análises, sobretudo em laboratório e em sala de aula. Para tarefas complexas e para o quanto o sono ajuda em cada caso, o tamanho do efeito varia.",
    sources: [
      { cite: "Roediger, H. L., & Karpicke, J. D. (2006). Test-enhanced learning: taking memory tests improves long-term retention. Psychological Science, 17(3), 249-255.", url: "https://pubmed.ncbi.nlm.nih.gov/16507066/" },
      { cite: "Cepeda, N. J., Pashler, H., Vul, E., Wixted, J. T., & Rohrer, D. (2006). Distributed practice in verbal recall tasks: a review and quantitative synthesis. Psychological Bulletin, 132(3), 354-380.", url: "https://pubmed.ncbi.nlm.nih.gov/16719566/" },
      { cite: "Dunlosky, J., Rawson, K. A., Marsh, E. J., Nathan, M. J., & Willingham, D. T. (2013). Improving students' learning with effective learning techniques. Psychological Science in the Public Interest, 14(1), 4-58.", url: "https://doi.org/10.1177/1529100612453266" },
      { cite: "Rasch, B., & Born, J. (2013). About sleep's role in memory. Physiological Reviews, 93(2), 681-766.", url: "https://doi.org/10.1152/physrev.00032.2012" },
    ],
    enso: "Crie um hábito de revisão com mínimo de cinco minutos (só se testar) e use uma âncora \"se-então\": se eu terminar o jantar, então faço minha revisão.",
  },
  {
    id: "neurociencia-do-aprendizado",
    title: "A neurociência do aprendizado",
    category: "memoria",
    minutes: 4,
    hook: "Aprender bem muitas vezes parece mais difícil do que aprender mal. Esse esforço extra, quando é do tipo certo, é justamente o que faz a coisa ficar.",
    tldr: "Participar ativamente, praticar com alguma dificuldade e receber retorno rápido ajudam mais do que absorver passivamente, e \"estilos de aprendizagem\" não têm respaldo.",
    science: [
      {
        heading: "Aprender ativamente",
        text: "Resolver problemas, explicar com as próprias palavras e discutir engajam mais do que só ouvir. Uma meta-análise de Freeman e colegas (2014) comparou aulas expositivas com aulas com aprendizado ativo em ciências, engenharia e matemática, e encontrou desempenho melhor com métodos ativos. Esses estudos não eram todos experimentos aleatorizados, e há variação entre disciplinas, então é um indicativo forte, mas não uma garantia.",
      },
      {
        heading: "Dificuldades desejáveis e intercalação",
        text: "Algumas dificuldades ajudam a longo prazo: espaçar a prática, testar-se e misturar tipos de problema em vez de treinar um tipo por vez (a intercalação). Na revisão de Dunlosky e colegas (2013), a intercalação ficou como utilidade moderada: promissora, com menos evidência do que testes e espaçamento. O ponto é que a dificuldade precisa ser possível de superar. Se está acima do seu nível, ela só frustra.",
      },
      {
        heading: "Feedback e atenção",
        text: "Saber rápido se você acertou permite corrigir um erro antes de ele se fixar. E sem atenção, quase nada é codificado: aprender com o celular apitando ao lado costuma sair pela metade. Ter um bloco curto de foco, sem interrupções, vale mais do que horas dispersas.",
      },
      {
        heading: "O que a revisão de 2008 disse sobre estilos",
        text: "Pashler, McDaniel, Rohrer e Bjork analisaram a literatura sobre \"estilos de aprendizagem\" (a ideia de que cada pessoa aprende melhor em um formato, como visual ou auditivo). Para a ideia valer, o ensino adaptado ao estilo teria de dar resultados melhores para quem tem aquele estilo, e piores para os outros, em estudos bem desenhados. Eles concluíram que não havia evidência adequada para justificar usar testes de estilos na educação em geral. Ressalvaram que muitas versões nunca foram testadas direito, então não estão \"provadas falsas\", apenas sem apoio.",
      },
    ],
    myth: {
      claim: "Cada pessoa tem um estilo de aprendizagem (visual, auditivo, cinestésico) e aprende melhor quando o conteúdo vem nesse formato.",
      reality: "Ter preferências é normal, mas a revisão de 2008 não achou evidência que justifique adaptar o ensino ao \"estilo\". O formato deve combinar com o conteúdo: mapa para geografia, áudio para pronúncia.",
    },
    practice: [
      { title: "Explique em voz alta", text: "Depois de estudar, explique o tema como se ensinasse a um amigo. Onde travar, está a lacuna." },
      { title: "Misture os exercícios", text: "Em vez de dez problemas do mesmo tipo seguidos, alterne tipos. Parece pior na hora, e costuma render mais depois." },
      { title: "Busque correção cedo", text: "Confira o gabarito logo após tentar, e anote o que errou." },
      { title: "Proteja um bloco de foco", text: "Vinte a trinta minutos sem notificações, com o celular longe." },
    ],
    evidence: "mista",
    evidenceNote: "Aprendizado ativo, feedback e espaçamento têm bom apoio. Intercalação e \"dificuldades desejáveis\" em geral são promissoras, mas dependem do conteúdo e do nível do aluno. A falta de evidência para estilos de aprendizagem é consenso entre revisões.",
    sources: [
      { cite: "Pashler, H., McDaniel, M., Rohrer, D., & Bjork, R. (2008). Learning styles: concepts and evidence. Psychological Science in the Public Interest, 9(3), 105-119.", url: "https://doi.org/10.1111/j.1539-6053.2009.01038.x" },
      { cite: "Dunlosky, J., Rawson, K. A., Marsh, E. J., Nathan, M. J., & Willingham, D. T. (2013). Improving students' learning with effective learning techniques. Psychological Science in the Public Interest, 14(1), 4-58.", url: "https://doi.org/10.1177/1529100612453266" },
      { cite: "Freeman, S., et al. (2014). Active learning increases student performance in science, engineering, and mathematics. Proceedings of the National Academy of Sciences.", url: "https://doi.org/10.1073/pnas.1319030111" },
    ],
    enso: "Use o \"dia difícil\" para reduzir o estudo ao mínimo (uma pergunta respondida de cabeça) e mantenha o hábito vivo sem se esgotar.",
  },
  {
    id: "gostar-de-estudar",
    title: "Como aprender a gostar de estudar",
    category: "habitos",
    minutes: 3,
    hook: "Ninguém nasce gostando de estudar, e muita gente perdeu o gosto por ter estudado só por obrigação. Dá para reconstruir, aos poucos.",
    tldr: "O gosto pelo estudo cresce com curiosidade, sensação de escolha, de progresso e de pertencimento, e não com mais força de vontade.",
    science: [
      {
        heading: "Curiosidade puxa o aprendizado",
        text: "Kidd e Hayden (2015) revisam pesquisas sobre curiosidade, o impulso de buscar informação, e a descrevem como algo que motiva o aprendizado e influencia decisões. Eles também notam que ainda falta uma definição consensual e que muito do mecanismo é pouco entendido. Na prática: começar por uma pergunta que você realmente quer responder tende a ser melhor do que começar pelo capítulo 1.",
      },
      {
        heading: "Três necessidades básicas",
        text: "A teoria da autodeterminação, de Ryan e Deci, propõe que a motivação própria floresce quando três necessidades são atendidas: autonomia (sentir que a escolha é sua), competência (sentir que está progredindo) e pertencimento (estar ligado a outras pessoas). Quando o estudo vem só de pressão externa, a motivação tende a cair. É uma teoria muito citada e testada, em educação, trabalho e saúde, mas seus conceitos são amplos e o efeito depende do contexto.",
      },
      {
        heading: "Objetivo de domínio",
        text: "Quem estuda para dominar o assunto (\"quero entender isto\") costuma lidar melhor com erros do que quem estuda só para parecer bom ou tirar nota. Erro vira informação, não ameaça. Essa distinção aparece na literatura de motivação, mas os resultados variam entre contextos.",
      },
      {
        heading: "Começar pequeno e concreto",
        text: "Metas vagas (\"estudar mais\") pesam. Metas concretas e pequenas (\"ler duas páginas e escrever uma pergunta\") geram progresso visível, e perceber progresso alimenta a competência. O gosto muitas vezes vem depois de começar, não antes.",
      },
    ],
    practice: [
      { title: "Comece por uma pergunta sua", text: "Escreva o que você gostaria de entender sobre o tema. Estude para respondê-la." },
      { title: "Defina um mínimo ridículo", text: "Cinco minutos ou uma página. Se você fizer mais, ótimo; se não, o hábito se mantém." },
      { title: "Escolha onde e quando", text: "Decida o horário, o lugar e o formato. Ter escolha aumenta a sensação de autonomia." },
      { title: "Estude com alguém", text: "Um grupo, um amigo ou apenas contar a outra pessoa o que aprendeu cria pertencimento." },
      { title: "Registre o que avançou", text: "Ao fim da sessão, escreva uma coisa que você agora sabe e não sabia." },
    ],
    evidence: "moderada",
    evidenceNote: "A teoria da autodeterminação tem muito apoio, mas é ampla e parte dos resultados vem de questionários. A pesquisa sobre curiosidade é ativa e ainda sem definições fechadas. Os passos práticos são consistentes com a teoria, não prometem resultado.",
    sources: [
      { cite: "Ryan, R. M., & Deci, E. L. (2000). Self-determination theory and the facilitation of intrinsic motivation, social development, and well-being. American Psychologist, 55(1), 68-78.", url: "https://pubmed.ncbi.nlm.nih.gov/11392867/" },
      { cite: "Kidd, C., & Hayden, B. Y. (2015). The psychology and neuroscience of curiosity. Neuron, 88(3), 449-460.", url: "https://doi.org/10.1016/j.neuron.2015.09.010" },
    ],
    enso: "Defina no app um mínimo de estudo bem pequeno e, no diário, anote uma coisa que você aprendeu: ver o progresso escrito alimenta a sensação de competência.",
  },
  {
    id: "neuroplasticidade",
    title: "Como o cérebro muda com a experiência",
    category: "memoria",
    minutes: 4,
    hook: "\"O cérebro se remodela a vida inteira\" virou frase de efeito. Há verdade nela, e também muito exagero.",
    tldr: "O cérebro adulto muda com a prática, mas em geral de forma gradual, específica e variável entre pessoas, sem atalhos mágicos.",
    science: [
      {
        heading: "O que é neuroplasticidade",
        text: "É a capacidade do sistema nervoso de mudar com a experiência: conexões entre neurônios se fortalecem ou enfraquecem, e redes se reorganizam. Isso é o que permite aprender qualquer coisa. Não significa que o cérebro \"se reprograma\" por completo nem que qualquer treino muda tudo.",
      },
      {
        heading: "Estudos clássicos",
        text: "Maguire e colegas (2000) compararam 16 taxistas de Londres com controles. A parte posterior do hipocampo era maior nos taxistas e crescia junto com o tempo de profissão. Depois, Woollett e Maguire (2011) acompanharam candidatos durante cerca de quatro anos de preparação para a licença: quem passou mostrou aumento nessa região; quem não passou, não. Draganski e colegas (2004) escanearam pessoas que aprenderam a fazer malabarismo e viram mudanças de curta duração em regiões ligadas ao movimento visual.",
      },
      {
        heading: "Ressalvas importantes",
        text: "Esses estudos têm limites: amostras pequenas, só homens no caso dos taxistas, e um exame de imagem que mostra volume, não o que mudou nas células. Os próprios autores admitem que quem passou pode ter tido uma predisposição prévia, que não foi medida. Uma revisão crítica de Thomas e Baker (2013) analisou o conjunto de evidências de mudanças estruturais com treino em adultos e apontou problemas metodológicos que pedem cautela.",
      },
      {
        heading: "Prática, repetição e diferenças",
        text: "O padrão geral é consistente: o que você pratica repetidamente tende a ser o que muda. As mudanças são específicas à tarefa, e a velocidade e o tamanho variam entre pessoas e idades. Ainda assim, não dá para prometer quanto, nem em quanto tempo.",
      },
    ],
    myth: {
      claim: "Você usa só 10% do cérebro e pode \"destravar\" o resto com um método certo.",
      reality: "Isso é um mito. O cérebro inteiro é usado, e a plasticidade é gradual, ligada a prática específica, sem fórmula que acelere tudo.",
    },
    practice: [
      { title: "Escolha uma habilidade específica", text: "Mudança vem do que se treina. Treinar \"o cérebro\" em geral rende menos do que praticar algo concreto." },
      { title: "Pratique com frequência, em sessões curtas", text: "Poucos minutos todo dia costumam servir mais do que uma maratona rara." },
      { title: "Aumente a dificuldade aos poucos", text: "Quando ficar fácil demais, suba um degrau." },
      { title: "Tenha paciência com seu ritmo", text: "Comparar-se com outros não ajuda: a variação entre pessoas é grande e normal." },
    ],
    evidence: "moderada",
    evidenceNote: "Que o cérebro adulto muda com a experiência é sólido. O tamanho, a duração e o significado das mudanças medidas por imagem são debatidos, e muitos estudos têm amostras pequenas.",
    sources: [
      { cite: "Maguire, E. A., Gadian, D. G., Johnsrude, I. S., Good, C. D., Ashburner, J., Frackowiak, R. S. J., & Frith, C. D. (2000). Navigation-related structural change in the hippocampi of taxi drivers. PNAS, 97(8), 4398-4403.", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC18253" },
      { cite: "Woollett, K., & Maguire, E. A. (2011). Acquiring \"the Knowledge\" of London's layout drives structural brain changes. Current Biology, 21, 2109-2114.", url: "https://www.fil.ion.ucl.ac.uk/Maguire/WoollettMaguireCBDec2011.pdf" },
      { cite: "Draganski, B., Gaser, C., Busch, V., Schuierer, G., Bogdahn, U., & May, A. (2004). Changes in grey matter induced by training. Nature, 427, 311-312.", url: "https://www.nature.com/articles/427311a" },
      { cite: "Thomas, C., & Baker, C. I. (2013). Teaching an adult brain new tricks: a critical review of evidence for training-dependent structural plasticity in humans. NeuroImage.", url: "https://pubmed.ncbi.nlm.nih.gov/22484409/" },
    ],
    enso: "Escolha uma habilidade, defina o mínimo diário e deixe o jardim registrar a constância: é a repetição ao longo das semanas que conta.",
  },
  {
    id: "cerebro-preve-o-mundo",
    title: "O cérebro tenta prever o mundo",
    category: "mente",
    minutes: 4,
    hook: "Você já \"viu\" uma palavra errada num texto sem notar o erro? O cérebro preenche o que espera ver, em vez de registrar tudo como vem.",
    tldr: "Uma teoria influente diz que o cérebro está sempre prevendo o que vai sentir e se ajustando quando erra, mas ela segue em debate.",
    science: [
      {
        heading: "A ideia central",
        text: "No processamento preditivo (ou \"cérebro preditivo\"), perceber não é só receber sinais dos sentidos. O cérebro gera palpites sobre o que deve estar acontecendo e os compara com o que chega. A diferença entre palpite e realidade é o erro de previsão, e ele serve para atualizar o modelo. Clark (2013) apresenta essa visão como um possível guia unificador para entender percepção, ação e atenção. Friston (2010) propõe uma formulação matemática mais geral, o princípio da energia livre.",
      },
      {
        heading: "Expectativa molda o que você percebe",
        text: "Sob essa ótica, a expectativa pesa muito na percepção. Ler o texto com erro sem notar, ouvir palavras claras no meio de ruído por já saber o que esperar, ou sentir mais dor quando se espera dor são exemplos citados. Ainda assim, cada fenômeno tem explicações próprias e a pesquisa varia de caso a caso.",
      },
      {
        heading: "Hábitos e emoções como previsões",
        text: "Faz sentido ver um hábito como uma previsão aprendida: no contexto X, costuma vir a ação Y e o resultado Z. Algumas propostas teóricas tratam também as emoções como previsões do corpo sobre o que está acontecendo e o que fazer. Isso é uma hipótese interessante, não um fato estabelecido. Serve de lente para pensar, não de explicação final.",
      },
      {
        heading: "Não é consenso",
        text: "É um arcabouço teórico influente, não uma verdade fechada. Críticos, como Litwin e Miłkowski (2020), argumentam que a teoria é apresentada como unificada sem que haja um conjunto bem testado de previsões que a distinga de alternativas. Muitos defensores concordam que partes dela ainda precisam de teste. Trate-a como uma boa hipótese de trabalho.",
      },
    ],
    myth: {
      claim: "O que você percebe é um retrato fiel e direto da realidade.",
      reality: "A percepção é construída em parte pelo que o cérebro espera. Em geral funciona bem, mas explica por que duas pessoas podem ver a mesma situação de modos diferentes.",
    },
    practice: [
      { title: "Questione a primeira leitura", text: "Quando se irritar com uma mensagem ou situação, pergunte: o que eu esperava? Posso estar lendo o que previ." },
      { title: "Crie previsões melhores com experiências novas", text: "Testar de fato (como ir à academia num dia ruim) atualiza a expectativa de \"vai ser horrível\"." },
      { title: "Use o contexto a seu favor", text: "Se o ambiente prevê o hábito, deixe o ambiente pronto: roupa separada, livro na mesa." },
      { title: "Anote a previsão e o resultado", text: "Escreva o que achou que sentiria e o que sentiu. A diferença ensina." },
    ],
    evidence: "mista",
    evidenceNote: "Há apoio em estudos de percepção e de neurociência computacional, e a ideia é muito influente. Mas ela é um arcabouço teórico amplo, com discussão aberta sobre o quanto é testável e o quanto explica além do que outras teorias já explicam.",
    sources: [
      { cite: "Clark, A. (2013). Whatever next? Predictive brains, situated agents, and the future of cognitive science. Behavioral and Brain Sciences, 36(3), 181-204.", url: "https://doi.org/10.1017/S0140525X12000477" },
      { cite: "Friston, K. (2010). The free-energy principle: a unified brain theory? Nature Reviews Neuroscience, 11, 127-138.", url: "https://www.nature.com/articles/nrn2787" },
      { cite: "Litwin, P., & Miłkowski, M. (2020). Unification by fiat: arrested development of predictive processing. Cognitive Science.", url: "https://philarchive.org/rec/LITUBF" },
    ],
    enso: "No check-in de humor, anote junto o que você esperava do dia: comparar a expectativa com o que aconteceu mostra onde suas previsões erram.",
  },
];
