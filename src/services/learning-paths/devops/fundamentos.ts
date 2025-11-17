import { LearningPath, LearningStep } from '../../learning.service';

const steps: LearningStep[] = [
  {
    type: 'article',
    title: 'O que é DevOps? Cultura, Automação e Colaboração',
    description: 'Entenda a filosofia DevOps, que une desenvolvimento e operações para entregar software mais rápido e com mais qualidade.',
    path: '/learning/article/o-que-e-devops',
    icon: 'groups',
  },
  {
    type: 'article',
    title: 'CI/CD na Prática com GitHub Actions',
    description: 'Aprenda a criar um pipeline de Integração e Entrega Contínua para automatizar testes e deploys a cada commit.',
    path: '/learning/article/cicd-github-actions',
    icon: 'rocket_launch',
  },
  {
    type: 'article',
    title: 'Infraestrutura como Código (IaC) com Terraform',
    description: 'Descubra como gerenciar sua infraestrutura na nuvem (servidores, redes) de forma programática e versionada.',
    path: '/learning/article/iac-com-terraform',
    icon: 'cloud_sync',
  },
  {
    type: 'article',
    title: 'Orquestração de Contêineres com Docker Swarm',
    description: 'Aprenda a gerenciar múltiplos contêineres em um cluster de máquinas, garantindo alta disponibilidade e escalabilidade.',
    path: '/learning/article/orquestracao-docker-swarm',
    icon: 'hub',
  },
  {
    type: 'tool',
    title: 'Prática: Criando um Cluster Swarm',
    description: 'Use nosso Construtor de Docker Compose para gerar um arquivo de stack e implantar serviços em modo Swarm.',
    path: '/tools/docker-compose-generator',
    icon: 'construction',
  },
   {
    type: 'article',
    title: 'Monitoramento e Observabilidade',
    description: 'Entenda a importância de monitorar suas aplicações em produção com logs, métricas e tracing para garantir a saúde do sistema.',
    path: '/learning/article/monitoramento-observabilidade',
    icon: 'monitoring',
  },
];

export const devopsFundamentosPath: LearningPath = {
  slug: 'devops-fundamentos',
  title: '1. Fundamentos de DevOps: CI/CD e IaC',
  description: 'Aprenda os conceitos de Integração Contínua, Entrega Contínua e como gerenciar sua infraestrutura de forma programática.',
  level: 'Intermediário',
  steps: steps,
};
