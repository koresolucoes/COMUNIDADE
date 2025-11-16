import { LearningPath, LearningStep } from '../../learning.service';

const steps: LearningStep[] = [
  {
    type: 'tool',
    title: 'Criando Fundos Atraentes: Gerador de Gradiente',
    description: 'Dê vida aos seus backgrounds com gradientes lineares e radiais customizáveis.',
    path: '/tools/gerador-gradiente-css',
    icon: 'palette',
  },
  {
    type: 'tool',
    title: 'Profundidade e Hierarquia: Gerador de Box Shadow',
    description: 'Use sombras em múltiplas camadas para criar uma sensação de profundidade e destacar elementos.',
    path: '/tools/gerador-box-shadow',
    icon: 'palette',
  },
  {
    type: 'tool',
    title: 'Layouts Criativos: Gerador de Clip-Path',
    description: 'Quebre a monotonia dos retângulos e crie formas únicas para seus elementos e imagens.',
    path: '/tools/gerador-clip-path',
    icon: 'palette',
  },
  {
    type: 'tool',
    title: 'Organização Estrutural: Construtor de Grid CSS',
    description: 'Projete layouts complexos e responsivos com o poder do CSS Grid.',
    path: '/tools/construtor-grid-css',
    icon: 'palette',
  },
  {
    type: 'tool',
    title: 'Toques Finais: Gerador de Animação CSS',
    description: 'Adicione micro-interações e animações para uma experiência de usuário mais fluida e agradável.',
    path: '/tools/gerador-animacao-css',
    icon: 'palette',
  },
];

export const cssFundamentosUiPath: LearningPath = {
  slug: 'css-fundamentos-ui',
  title: 'Fundamentos de UI com CSS',
  description: 'Domine as ferramentas essenciais para criar UIs atraentes e funcionais para suas automações e dashboards.',
  level: 'Fundamentos',
  steps: steps,
};
