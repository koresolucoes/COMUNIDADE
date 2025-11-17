import { LearningPath, LearningStep } from '../../learning.service';

const steps: LearningStep[] = [
  {
    type: 'article',
    title: 'De Swarm para Kubernetes: Uma Introdução',
    description: 'Entenda por que o Kubernetes (K8s) se tornou o padrão para orquestração e quais problemas ele resolve.',
    path: '/learning/article/intro-kubernetes',
    icon: 'hub',
  },
  {
    type: 'article',
    title: 'Principais Conceitos do K8s: Pods, Services e Deployments',
    description: 'Aprenda sobre os blocos de construção fundamentais do Kubernetes e como eles se comparam aos conceitos do Docker Swarm.',
    path: '/learning/article/principais-conceitos-k8s',
    icon: 'category',
  },
  {
    type: 'article',
    title: 'O que é GitOps? Seu Repositório como Fonte da Verdade',
    description: 'Descubra a abordagem GitOps, onde o estado desejado da sua infraestrutura é versionado no Git e sincronizado automaticamente.',
    path: '/learning/article/o-que-e-gitops',
    icon: 'sync',
  },
  {
    type: 'article',
    title: 'Ferramentas de GitOps: ArgoCD e Flux',
    description: 'Conheça as duas principais ferramentas que implementam o fluxo GitOps para Kubernetes.',
    path: '/learning/article/ferramentas-gitops',
    icon: 'construction',
  },
   {
    type: 'article',
    title: 'Segurança de Contêineres (DevSecOps)',
    description: 'Aprenda as melhores práticas para construir imagens Docker seguras e escanear por vulnerabilidades.',
    path: '/learning/article/seguranca-containers',
    icon: 'security',
  },
   {
    type: 'article',
    title: 'Segurança no Pipeline de CI/CD',
    description: 'Incorpore práticas de segurança (DevSecOps) diretamente no seu pipeline para detectar problemas antes do deploy.',
    path: '/learning/article/seguranca-ci-cd',
    icon: 'lock',
  },
];

export const devopsAvancadoPath: LearningPath = {
  slug: 'devops-avancado',
  title: '2. DevOps Avançado: Kubernetes, GitOps e Segurança',
  description: 'Mergulhe em orquestração em larga escala com Kubernetes, automatize deploys com GitOps e incorpore segurança em seu pipeline.',
  level: 'Avançado',
  steps: steps,
};
