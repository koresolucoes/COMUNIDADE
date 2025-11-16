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
  },
  {
    type: 'article',
    title: 'Controle de Versão para Workflows com Git',
    description: 'Aprenda a usar o Git para salvar o histórico de alterações dos seus workflows, colaborar em equipe e reverter para versões anteriores com segurança.',
    path: '/learning/article/n8n-git-versioning',
    icon: 'history',
  },
  {
    type: 'article',
    title: 'CI/CD para Workflows n8n: Automatizando a Implantação',
    description: 'Leve seu controle de versão para o próximo nível. Aprenda a configurar um pipeline de CI/CD para testar e implantar automaticamente seus workflows n8n a partir do Git.',
    path: '/learning/article/n8n-cicd',
    icon: 'rocket_launch',
  },
  {
    type: 'article',
    title: 'Estendendo a Plataforma: Criando Seus Próprios Nós',
    description: 'O passo final para o domínio: aprenda a desenvolver seus próprios nós para integrar com APIs customizadas ou encapsular lógicas de negócio complexas.',
    path: '/learning/article/n8n-custom-nodes',
    icon: 'extension',
  },
];

export const n8nAvancadoPath: LearningPath = {
  slug: 'n8n-avancado',
  title: 'n8n Avançado',
  description: 'Domine o n8n com tópicos como criação de nós customizados, escalabilidade e otimização de workflows.',
  level: 'Avançado',
  steps: steps,
};