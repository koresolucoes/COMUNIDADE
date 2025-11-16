import { LearningPath, LearningStep } from '../../learning.service';

const steps: LearningStep[] = [
  {
    type: 'article',
    title: 'O que é Programação?',
    description: 'Descubra o que significa "escrever código" e como os computadores entendem as instruções que damos a eles.',
    path: '/learning/article/o-que-e-programacao',
    icon: 'question_mark',
  },
  {
    type: 'article',
    title: 'Lógica de Programação: Variáveis, Condicionais e Loops',
    description: 'Aprenda os três pilares da lógica: como armazenar informações (variáveis), tomar decisões (condicionais) e repetir tarefas (loops).',
    path: '/learning/article/logica-de-programacao',
    icon: 'psychology',
  },
  {
    type: 'article',
    title: 'Tipos de Dados Essenciais',
    description: 'Entenda os blocos de construção da informação: textos (strings), números (integers/floats) e valores verdadeiros/falsos (booleanos).',
    path: '/learning/article/tipos-de-dados',
    icon: 'data_object',
  },
  {
    type: 'article',
    title: 'Introdução ao Pseudocódigo',
    description: 'Aprenda a planejar e escrever a lógica de um programa em uma linguagem simples e legível antes de partir para o código real.',
    path: '/learning/article/introducao-pseudocódigo',
    icon: 'edit_note',
  },
  {
    type: 'article',
    title: 'Como a Internet Funciona?',
    description: 'Uma visão geral de como clientes (seu navegador) e servidores se comunicam para exibir websites e aplicações.',
    path: '/learning/article/como-internet-funciona',
    icon: 'public',
  },
  {
    type: 'article',
    title: 'A Linguagem da Web: HTTP e APIs',
    description: 'Entenda como a web se comunica através de requisições HTTP e o que são APIs (Interfaces de Programação de Aplicativos).',
    path: '/learning/article/http-apis',
    icon: 'http',
  },
  {
    type: 'tool',
    title: 'Prática: Sua Primeira Requisição HTTP',
    description: 'Use nosso Cliente REST para fazer requisições a uma API pública e ver a resposta em tempo real.',
    path: '/tools/cliente-rest',
    icon: 'construction',
  },
  {
    type: 'article',
    title: 'Entendendo JSON: A Estrutura de Dados da Web',
    description: 'Aprenda a ler e entender o formato JSON, a maneira mais comum de trocar dados entre sistemas na internet.',
    path: '/learning/article/entendendo-json',
    icon: 'data_usage',
  },
  {
    type: 'tool',
    title: 'Prática: Validando e Entendendo JSON',
    description: 'Use o Formatador de JSON para visualizar a estrutura de dados e garantir que seu formato está correto.',
    path: '/tools/formatador-json',
    icon: 'construction',
  },
  {
    type: 'article',
    title: 'O que são Webhooks? A Web em Tempo Real',
    description: 'Aprenda como os webhooks permitem que sistemas notifiquem uns aos outros sobre eventos, a base da automação moderna.',
    path: '/learning/article/o-que-sao-webhooks',
    icon: 'webhook',
  },
  {
    type: 'tool',
    title: 'Prática: Capturando seu Primeiro Webhook',
    description: 'Use nossa URL de teste para capturar e inspecionar os dados enviados por um sistema externo.',
    path: '/tools/webhook-tester',
    icon: 'construction',
  },
];

export const fundamentosDevPath: LearningPath = {
  slug: 'fundamentos-logica-web',
  title: '1. Fundamentos da Lógica e da Web',
  description:
    'O ponto de partida. Entenda o que é código, como pensar de forma lógica e os conceitos básicos que movem a internet.',
  level: 'Fundamentos',
  steps: steps,
};
