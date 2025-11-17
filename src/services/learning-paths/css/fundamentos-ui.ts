import { LearningPath, LearningStep } from '../../learning.service';

const steps: LearningStep[] = [
  {
    type: 'article',
    title: 'A Hierarquia Visual: Guiando o Olhar do Usuário',
    description: 'Aprenda a usar tamanho, cor e espaço para criar interfaces claras e fáceis de entender.',
    path: '/learning/article/hierarquia-visual',
    icon: 'visibility',
  },
  {
    type: 'article',
    title: 'O Poder das Cores e do Contraste',
    description: 'Descubra como escolher uma paleta de cores simples e garantir a acessibilidade do seu design.',
    path: '/learning/article/cores-e-contraste',
    icon: 'palette',
  },
  {
    type: 'article',
    title: 'Tipografia que Funciona',
    description: 'Escolha fontes legíveis e defina tamanhos e espaçamentos para uma leitura confortável.',
    path: '/learning/article/tipografia-funcional',
    icon: 'text_fields',
  },
  {
    type: 'article',
    title: 'A Mágica do Espaçamento: Layouts com Grid e Flexbox',
    description: 'Entenda os conceitos básicos por trás dos sistemas de layout mais poderosos do CSS.',
    path: '/learning/article/layouts-com-grid-flexbox',
    icon: 'grid_on',
  },
  {
    type: 'tool',
    title: 'Prática: Construtor de Grid CSS',
    description: 'Projete layouts complexos e responsivos com o poder do CSS Grid de forma visual.',
    path: '/tools/construtor-grid-css',
    icon: 'construction',
  },
  {
    type: 'article',
    title: 'Profundidade e Elevação com Sombras',
    description: 'Aprenda como o uso sutil de sombras pode criar camadas e destacar elementos importantes.',
    path: '/learning/article/profundidade-com-sombras',
    icon: 'layers',
  },
  {
    type: 'tool',
    title: 'Prática: Gerador de Box Shadow',
    description: 'Crie sombras em múltiplas camadas para criar uma sensação de profundidade e hierarquia.',
    path: '/tools/gerador-box-shadow',
    icon: 'construction',
  },
];

export const designVisualDevsPath: LearningPath = {
  slug: 'fundamentos-design-visual-devs',
  title: '1. Fundamentos do Design Visual para Devs',
  description: 'Aprenda os princípios essenciais de design para criar UIs limpas e profissionais, mesmo sem ser um designer.',
  level: 'Fundamentos',
  steps: steps,
};