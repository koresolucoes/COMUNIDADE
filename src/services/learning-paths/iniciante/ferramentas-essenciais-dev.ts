import { LearningPath, LearningStep } from '../../learning.service';

const steps: LearningStep[] = [
  {
    type: 'article',
    title: 'O Terminal: Seu Canivete Suíço',
    description: 'Perca o medo da tela preta. Aprenda comandos básicos para navegar em pastas, criar arquivos e instalar programas.',
    path: '/learning/article/ide-console',
    icon: 'terminal',
  },
  {
    type: 'article',
    title: 'Git & GitHub: Versionando e Colaborando',
    description: 'Entenda por que o Git é essencial. Aprenda a salvar "fotos" do seu código, voltar no tempo e colaborar com outros devs.',
    path: '/learning/article/git-github',
    icon: 'hub',
  },
  {
    type: 'article',
    title: 'O que é uma IDE?',
    description: 'Descubra como um Ambiente de Desenvolvimento Integrado (IDE) como o VS Code pode acelerar seu trabalho com código.',
    path: '/learning/article/o-que-e-ide',
    icon: 'code_blocks',
  },
  {
    type: 'article',
    title: 'Gerenciadores de Pacotes (NPM)',
    description: 'Aprenda como o NPM (Node Package Manager) permite que você use bibliotecas de código feitas pela comunidade.',
    path: '/learning/article/gerenciadores-pacotes-npm',
    icon: 'inventory_2',
  },
  {
    type: 'article',
    title: 'Introdução ao Docker: Isolando Aplicações',
    description: 'Descubra como o Docker empacota aplicações em contêineres, garantindo que elas rodem de forma consistente em qualquer lugar.',
    path: '/learning/article/introducao-docker',
    icon: 'build_circle',
  },
  {
    type: 'tool',
    title: 'Prática: Orquestrando Contêineres',
    description: 'Use nosso construtor visual para criar um arquivo `docker-compose.yml` e definir um ambiente multi-contêiner.',
    path: '/tools/docker-compose-generator',
    icon: 'construction',
  },
  {
    type: 'article',
    title: 'Dados Persistentes: O que são Volumes Docker?',
    description: 'Aprenda a salvar os dados do seu banco de dados ou aplicação mesmo que o contêiner seja destruído, usando volumes.',
    path: '/learning/article/volumes-docker',
    icon: 'storage',
  },
  {
    type: 'article',
    title: 'Redes Docker: Conectando Contêineres',
    description: 'Entenda como contêineres diferentes, como sua aplicação e seu banco de dados, podem se comunicar de forma segura.',
    path: '/learning/article/redes-docker',
    icon: 'lan',
  },
  {
    type: 'article',
    title: 'Regex Básico: Encontrando Padrões em Texto',
    description: 'Uma introdução às Expressões Regulares (Regex) para encontrar, validar e extrair informações de textos.',
    path: '/learning/article/regex-basico',
    icon: 'find_in_page',
  },
  {
    type: 'tool',
    title: 'Prática: Testador de Regex',
    description: 'Valide suas expressões e veja os "matches" e "grupos" em tempo real com nosso testador interativo.',
    path: '/tools/testador-regex',
    icon: 'construction',
  },
];

export const ferramentasEssenciaisDevPath: LearningPath = {
  slug: 'ferramentas-essenciais-dev',
  title: '2. Ferramentas Essenciais do Desenvolvedor',
  description: 'Domine as ferramentas que todo dev usa no dia a dia: terminal, Git, Docker e o ecossistema de pacotes.',
  level: 'Fundamentos',
  steps: steps,
};
