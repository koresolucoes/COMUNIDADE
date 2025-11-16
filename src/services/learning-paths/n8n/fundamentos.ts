import { LearningPath, LearningStep } from '../../learning.service';

const steps: LearningStep[] = [
  {
    type: 'article',
    title: 'O que são Webhooks?',
    description: 'Entenda como os webhooks funcionam e por que são a espinha dorsal de muitas automações em tempo real.',
    path: '/blog/o-que-sao-webhooks',
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
    path: '/blog/entendendo-expressoes-cron',
    icon: 'article',
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
