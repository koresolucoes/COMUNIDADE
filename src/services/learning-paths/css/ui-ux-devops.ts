import { LearningPath, LearningStep } from '../../learning.service';

const steps: LearningStep[] = [
  {
    type: 'article',
    title: 'Design de Dashboards: Visualizando Dados com Clareza',
    description: 'Princípios de densidade de informação, escolha de gráficos e layout para dashboards de monitoramento eficazes.',
    path: '/learning/article/design-de-dashboards',
    icon: 'dashboard',
  },
  {
    type: 'article',
    title: 'A UX de Ferramentas Internas: Foco na Eficiência',
    description: 'Como projetar formulários, entradas e fluxos de trabalho para velocidade e clareza em ferramentas para equipes de DevOps.',
    path: '/learning/article/ux-ferramentas-internas',
    icon: 'handyman',
  },
  {
    type: 'article',
    title: 'Criando Status Pages Efetivas',
    description: 'Qual informação é crucial, como exibir a saúde do sistema de forma clara e como construir confiança durante incidentes.',
    path: '/learning/article/status-pages-efetivas',
    icon: 'notifications_active',
  },
  {
    type: 'article',
    title: 'Feedback Visual para Ações Assíncronas',
    description: 'Como usar spinners, barras de progresso e dicas visuais ao lidar com processos de backend demorados em UIs.',
    path: '/learning/article/feedback-visual-assincrono',
    icon: 'hourglass_top',
  },
  {
    type: 'tool',
    title: 'Prática: Criando Animações de Carregamento',
    description: 'Use o gerador de animações para criar spinners e outros indicadores de carregamento para suas ferramentas.',
    path: '/tools/gerador-animacao-css',
    icon: 'construction',
  },
];

export const uiUxDevOpsPath: LearningPath = {
  slug: 'ui-ux-ferramentas-devops',
  title: '3. UI/UX para Ferramentas de DevOps',
  description: 'Aplique princípios de design e usabilidade para construir dashboards de monitoramento e ferramentas internas mais eficazes.',
  level: 'Intermediário',
  steps: steps,
};
