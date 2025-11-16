import { LearningPath, LearningStep } from '../../learning.service';

const steps: LearningStep[] = [
  {
    type: 'article',
    title: 'Fluxo de Dados e Expressões',
    description: 'Aprenda como os dados fluem entre os nós e como usar expressões para acessar informações de passos anteriores.',
    path: '/learning/article/n8n-data-flow',
    icon: 'double_arrow',
  },
  {
    type: 'tool',
    title: 'Prática: Simulador de Expressão n8n',
    description: 'Teste e depure expressões do n8n em um ambiente seguro antes de usá-las em seus workflows.',
    path: '/tools/n8n-expression-simulator',
    icon: 'construction',
  },
  {
    type: 'article',
    title: 'Manipulando Dados com o Nó "Set"',
    description: 'Descubra como criar, modificar e remover dados que passam pelo seu workflow usando o versátil nó Set.',
    path: '/learning/article/n8n-set-node',
    icon: 'functions',
  },
  {
    type: 'article',
    title: 'Tomando Decisões com o Nó "IF"',
    description: 'Aprenda a criar ramificações e lógicas condicionais em seus workflows, executando diferentes ações com base nos dados.',
    path: '/learning/article/n8n-if-node',
    icon: 'call_split',
  },
  {
    type: 'article',
    title: 'Trabalhando com Listas: O Loop Automático',
    description: 'Entenda como o n8n processa listas de itens automaticamente e como lidar com múltiplos registros de uma vez.',
    path: '/learning/article/n8n-looping',
    icon: 'loop',
  },
  {
    type: 'article',
    title: 'Conectando ao Mundo: O Nó "HTTP Request"',
    description: 'Aprenda a buscar dados de APIs externas ou enviar informações para outros sistemas usando o nó HTTP Request.',
    path: '/learning/article/n8n-http-request',
    icon: 'http',
  },
  {
    type: 'tool',
    title: 'Prática: Cliente REST',
    description: 'Use o Cliente REST para entender melhor como as requisições HTTP funcionam antes de automatizá-las no n8n.',
    path: '/tools/cliente-rest',
    icon: 'construction',
  },
  {
    type: 'article',
    title: 'Segurança em Primeiro Lugar: Usando Credenciais',
    description: 'Descubra a maneira correta e segura de armazenar e usar chaves de API e outros segredos em seus workflows.',
    path: '/learning/article/n8n-credentials',
    icon: 'vpn_key',
  },
];


export const n8nBasicoPath: LearningPath = {
  slug: 'n8n-basico',
  title: 'n8n Básico',
  description: 'Crie workflows com lógica condicional, manipule dados e integre com APIs externas de forma segura.',
  level: 'Básico',
  steps: steps,
};
