import { LearningPath, LearningStep } from '../../learning.service';

const steps: LearningStep[] = [
  {
    type: 'article',
    title: 'Escalando o n8n: Queue Mode vs. Standalone',
    description: 'Entenda as arquiteturas de execução do n8n e descubra quando e por que migrar para o modo de fila para alta performance e escalabilidade.',
    path: '/learning/article/n8n-scaling-queue-mode',
    icon: 'account_tree',
  },
  {
    type: 'article',
    title: 'Sub-Workflows vs. Nó Code: Organizando Lógica Complexa',
    description: 'Aprenda quando modularizar sua lógica com o nó Execute Workflow e quando usar o poder do JavaScript no nó Code para manter seus workflows limpos e eficientes.',
    path: '/learning/article/n8n-subworkflows-vs-code',
    icon: 'call_split',
  },
  {
    type: 'article',
    title: 'Gerenciamento de Estado: A Variável Global ($workflow.staticData)',
    description: 'Descubra como manter dados persistentes durante uma execução de workflow para contadores, agregações e compartilhamento de informações entre branches.',
    path: '/learning/article/n8n-static-data',
    icon: 'memory',
  }
];

export const n8nAvancadoPath: LearningPath = {
  slug: 'n8n-avancado',
  title: 'n8n Avançado',
  description: 'Domine o n8n com tópicos como criação de nós customizados, escalabilidade e otimização de workflows.',
  level: 'Avançado',
  steps: steps,
};
