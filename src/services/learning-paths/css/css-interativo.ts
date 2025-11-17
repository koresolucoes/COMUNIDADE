import { LearningPath, LearningStep } from '../../learning.service';

const steps: LearningStep[] = [
  {
    type: 'article',
    title: 'A Primeira Impressão: Criando Fundos Impactantes',
    description: 'Aprenda a teoria por trás dos gradientes e como usá-los para criar backgrounds modernos.',
    path: '/learning/article/fundos-impactantes-gradientes',
    icon: 'gradient',
  },
  {
    type: 'tool',
    title: 'Prática: Gerador de Gradiente CSS',
    description: 'Dê vida aos seus backgrounds com gradientes lineares e radiais customizáveis.',
    path: '/tools/gerador-gradiente-css',
    icon: 'construction',
  },
  {
    type: 'article',
    title: 'Além dos Retângulos: Formas com Clip-Path',
    description: 'Descubra como a propriedade `clip-path` pode ser usada para criar layouts e galerias de imagens criativas.',
    path: '/learning/article/formas-com-clip-path',
    icon: 'crop',
  },
  {
    type: 'tool',
    title: 'Prática: Gerador de Clip-Path',
    description: 'Quebre a monotonia dos retângulos e crie formas únicas para seus elementos e imagens.',
    path: '/tools/gerador-clip-path',
    icon: 'construction',
  },
  {
    type: 'article',
    title: 'Efeitos Visuais com a Propriedade Filter',
    description: 'Aprenda a aplicar efeitos como desfoque, sépia e escala de cinza para manipular a aparência de imagens e elementos.',
    path: '/learning/article/efeitos-com-filtros',
    icon: 'filter_b_and_w',
  },
  {
    type: 'tool',
    title: 'Prática: Gerador de Filtros CSS',
    description: 'Aplique e combine filtros (blur, brilho, contraste, etc.) em uma imagem de exemplo.',
    path: '/tools/gerador-filtros-css',
    icon: 'construction',
  },
  {
    type: 'article',
    title: 'Dando Vida à Interface: Animações e Transições Sutis',
    description: 'Entenda a diferença entre `transition` e `animation` e como usá-las para criar micro-interações que melhoram a UX.',
    path: '/learning/article/animacoes-e-transicoes',
    icon: 'animation',
  },
  {
    type: 'tool',
    title: 'Prática: Gerador de Animação CSS',
    description: 'Adicione micro-interações e animações para uma experiência de usuário mais fluida e agradável.',
    path: '/tools/gerador-animacao-css',
    icon: 'construction',
  },
];

export const cssInterativoPath: LearningPath = {
  slug: 'css-interativo-moderno',
  title: '2. CSS Interativo e Moderno',
  description: 'Aprenda a usar gradientes, animações, filtros e formas para criar interfaces mais dinâmicas e visualmente atraentes.',
  level: 'Intermediário',
  steps: steps,
};
