
import { LearningPath, LearningStep } from '../../learning.service';

const steps: LearningStep[] = [
  {
    type: 'article',
    title: 'O que é n8n e Automação "Low-Code"?',
    description: 'Descubra o que é n8n, para que serve e como a abordagem "low-code" acelera a criação de automações complexas.',
    path: '/learning/article/o-que-e-n8n',
    icon: 'question_mark',
  },
  {
    type: 'article',
    title: 'Conhecendo a Interface (O Canvas)',
    description: 'Faça um tour pela interface do n8n: aprenda sobre o Canvas, o painel de nós e os botões essenciais de execução e salvamento.',
    path: '/learning/article/conhecendo-interface-n8n',
    icon: 'visibility',
  },
  {
    type: 'article',
    title: 'O que é um "Nó" (Node)?',
    description: 'Entenda os blocos de construção de qualquer workflow: os Nós. Aprenda a diferença crucial entre um nó de Gatilho e um nó de Ação.',
    path: '/learning/article/o-que-e-no-n8n',
    icon: 'hub',
  },
  {
    type: 'article',
    title: 'Prática: Seu Primeiro Workflow (Simples)',
    description: 'Vamos construir! Crie seu primeiro workflow "Olá, Mundo" para aprender a adicionar, conectar e executar nós na prática.',
    path: '/learning/article/primeiro-workflow-n8n',
    icon: 'play_circle',
  },
  {
    type: 'article',
    title: 'O que são Webhooks?',
    description: 'Entenda como os webhooks funcionam e por que são a espinha dorsal de muitas automações em tempo real.',
    path: '/learning/article/o-que-sao-webhooks',
    icon: 'webhook',
  },
  {
    type: 'tool',
    title: 'Prática: Testador de Webhook',
    description: 'Receba e inspecione payloads de webhooks para entender sua estrutura e dados.',
    path: '/tools/webhook-tester',
    icon: 'construction',
  },
  {
    type: 'article',
    title: 'Entendendo Expressões CRON',
    description: 'Aprenda a agendar workflows para rodar em horários específicos usando a sintaxe CRON.',
    path: '/learning/article/entendendo-expressoes-cron',
    icon: 'schedule',
  },
  {
    type: 'tool',
    title: 'Prática: Gerador de CRON',
    description: 'Crie expressões CRON complexas de forma visual e intuitiva para agendar suas automações.',
    path: '/tools/gerador-cron',
    icon: 'construction',
  },
  {
    type: 'tool',
    title: 'Prática: Simulador de Expressão n8n',
    description: 'Teste e depure expressões do n8n em um ambiente seguro antes de usá-las em seus workflows.',
    path: '/tools/n8n-expression-simulator',
    icon: 'construction',
  },
];

export const n8nFundamentosPath: LearningPath = {
  slug: 'n8n-fundamentos',
  title: 'Fundamentos do n8n',
  description: 'Aprenda os conceitos, componentes e estrutura essenciais para começar a construir suas primeiras automações com n8n.',
  level: 'Fundamentos',
  steps: steps,
};
