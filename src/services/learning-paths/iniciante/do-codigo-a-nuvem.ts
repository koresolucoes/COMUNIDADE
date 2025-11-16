import { LearningPath, LearningStep } from '../../learning.service';

const steps: LearningStep[] = [
  {
    type: 'article',
    title: 'Seu Primeiro Servidor: "Hello World" com Node.js',
    description: 'Escreva suas primeiras linhas de código de backend usando Node.js e Express para criar um servidor web simples.',
    path: '/learning/article/hello-world-nodejs',
    icon: 'web',
  },
  {
    type: 'article',
    title: 'O que é um Banco de Dados?',
    description: 'Entenda a diferença entre bancos de dados SQL (como PostgreSQL) e NoSQL e quando usar cada um.',
    path: '/learning/article/o-que-e-banco-de-dados',
    icon: 'database',
  },
  {
    type: 'article',
    title: 'Conectando sua Aplicação a um Banco de Dados',
    description: 'Aprenda os conceitos para fazer sua aplicação Node.js se comunicar com um banco de dados PostgreSQL.',
    path: '/learning/article/conectando-app-banco-dados',
    icon: 'sync',
  },
  {
    type: 'article',
    title: 'Construindo sua Primeira API REST (CRUD)',
    description: 'Crie os endpoints básicos para Criar, Ler, Atualizar e Deletar (CRUD) dados em seu banco através da sua API.',
    path: '/learning/article/construindo-primeira-api-rest',
    icon: 'api',
  },
  {
    type: 'article',
    title: 'Autenticação: O que é um JWT?',
    description: 'Entenda como os JSON Web Tokens (JWT) são usados para proteger APIs e garantir que apenas usuários autorizados acessem os dados.',
    path: '/learning/article/o-que-e-jwt',
    icon: 'vpn_key',
  },
  {
    type: 'tool',
    title: 'Prática: Inspecionando Tokens JWT',
    description: 'Use nosso decodificador para ver as informações (payload) contidas dentro de um token JWT.',
    path: '/tools/jwt-decoder',
    icon: 'construction',
  },
  {
    type: 'article',
    title: 'Dockerizando sua Aplicação Node.js',
    description: 'Crie um `Dockerfile` para empacotar sua aplicação Node.js, preparando-a para a publicação.',
    path: '/learning/article/dockerizando-app-nodejs',
    icon: 'build',
  },
  {
    type: 'article',
    title: 'O que é uma VPS? Seu Servidor na Nuvem',
    description: 'Entenda o que é um Servidor Virtual Privado (VPS) e por que ele é um passo fundamental para colocar suas aplicações online.',
    path: '/learning/article/o-que-e-vps',
    icon: 'dns',
  },
  {
    type: 'article',
    title: 'Publicando sua Aplicação Docker em uma VPS',
    description: 'Um guia com os passos essenciais para copiar sua aplicação Docker para uma VPS e colocá-la no ar.',
    path: '/learning/article/publicando-app-vps',
    icon: 'cloud_upload',
  },
];

export const doCodigoANuvemPath: LearningPath = {
  slug: 'do-codigo-a-nuvem',
  title: '3. Do Código à Nuvem: Seu Primeiro Projeto',
  description: 'Junte todos os conceitos: crie uma API simples com banco de dados, coloque-a em um contêiner Docker e publique na web.',
  level: 'Fundamentos',
  steps: steps,
};
