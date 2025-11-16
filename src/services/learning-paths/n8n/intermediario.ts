import { LearningPath, LearningStep } from '../../learning.service';

const steps: LearningStep[] = [
  {
    type: 'article',
    title: 'Juntando Caminhos: O Nó "Merge"',
    description: 'Aprenda a unificar diferentes ramificações do seu workflow, combinando dados que seguiram caminhos separados após um nó IF.',
    path: '/learning/article/n8n-merge-node',
    icon: 'merge_type',
  },
  {
    type: 'article',
    title: 'Processando em Lotes: O Nó "Split in Batches"',
    description: 'Descubra como processar grandes volumes de dados de forma eficiente, dividindo-os em lotes menores para evitar sobrecarregar APIs.',
    path: '/learning/article/n8n-split-in-batches',
    icon: 'view_module',
  },
  {
    type: 'article',
    title: 'Manipulando Arquivos: Dados Binários',
    description: 'Entenda como o n8n lida com arquivos (imagens, PDFs) e como ler, criar e enviar dados binários em seus workflows.',
    path: '/learning/article/n8n-binary-data',
    icon: 'attachment',
  },
  {
    type: 'article',
    title: 'Lógica Avançada: O Poder do Nó "Code"',
    description: 'Vá além das expressões simples. Aprenda a escrever código JavaScript para realizar transformações de dados complexas que outros nós não conseguem.',
    path: '/learning/article/n8n-code-node',
    icon: 'code',
  },
  {
    type: 'article',
    title: 'Workflows Reutilizáveis: O Nó "Execute Workflow"',
    description: 'Crie "sub-workflows" modulares para tarefas repetitivas e chame-os a partir de outros workflows, mantendo seu trabalho organizado e DRY.',
    path: '/learning/article/n8n-subworkflows',
    icon: 'account_tree',
  },
  {
    type: 'article',
    title: 'Construindo Workflows Resilientes: Tratamento de Erros',
    description: 'Aprenda a capturar e tratar erros com o "Error Trigger" e a configuração "Continue on Fail", criando automações que não quebram facilmente.',
    path: '/learning/article/n8n-error-handling',
    icon: 'error_outline',
  },
];

export const n8nIntermediarioPath: LearningPath = {
  slug: 'n8n-intermediario',
  title: 'n8n Intermediário',
  description: 'Explore conceitos avançados como sub-workflows, tratamento de erros e manipulação de dados complexos.',
  level: 'Intermediário',
  steps: steps,
};