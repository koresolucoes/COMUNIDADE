import { Injectable, signal } from '@angular/core';

export interface LearningStep {
  type: 'tool' | 'article' | 'video';
  title: string;
  description: string;
  path: string;
  icon: string;
}

export interface LearningPath {
  slug: string;
  title: string;
  description: string;
  category: 'Iniciante' | 'Intermediário' | 'Avançado';
  area: 'n8n' | 'CSS' | 'DevOps';
  steps: LearningStep[];
}

@Injectable({
  providedIn: 'root'
})
export class LearningService {

  private readonly paths = signal<LearningPath[]>([
    {
      slug: 'iniciante-em-n8n',
      title: 'Iniciante em n8n',
      description: 'Aprenda os conceitos fundamentais para começar a construir suas primeiras automações com n8n.',
      category: 'Iniciante',
      area: 'n8n',
      steps: [
        {
          type: 'article',
          title: 'O que são Webhooks?',
          description: 'Entenda como os webhooks funcionam e por que são a espinha dorsal de muitas automações em tempo real.',
          path: '/blog/o-que-sao-webhooks', // Assuming a blog post exists
          icon: 'webhook'
        },
        {
          type: 'tool',
          title: 'Prática: Testador de Webhook',
          description: 'Receba e inspecione payloads de webhooks para entender sua estrutura e dados.',
          path: '/tools/webhook-tester',
          icon: 'construction'
        },
        {
          type: 'article',
          title: 'Entendendo Expressões CRON',
          description: 'Aprenda a agendar workflows para rodar em horários específicos usando a sintaxe CRON.',
          path: '/blog/entendendo-expressoes-cron', // Assuming a blog post exists
          icon: 'article'
        },
        {
          type: 'tool',
          title: 'Prática: Gerador de CRON',
          description: 'Crie expressões CRON complexas de forma visual e intuitiva para agendar suas automações.',
          path: '/tools/gerador-cron',
          icon: 'construction'
        },
        {
          type: 'tool',
          title: 'Prática: Simulador de Expressão n8n',
          description: 'Teste e depure expressões do n8n em um ambiente seguro antes de usá-las em seus workflows.',
          path: '/tools/n8n-expression-simulator',
          icon: 'construction'
        }
      ]
    },
    {
      slug: 'dominando-css-para-ui',
      title: 'Dominando CSS para UI de Automação',
      description: 'Aprenda a criar interfaces visualmente atraentes para seus dashboards e ferramentas internas.',
      category: 'Intermediário',
      area: 'CSS',
      steps: [
        {
          type: 'tool',
          title: 'Criando Fundos Atraentes: Gerador de Gradiente',
          description: 'Dê vida aos seus backgrounds com gradientes lineares e radiais customizáveis.',
          path: '/tools/gerador-gradiente-css',
          icon: 'palette'
        },
        {
          type: 'tool',
          title: 'Profundidade e Hierarquia: Gerador de Box Shadow',
          description: 'Use sombras em múltiplas camadas para criar uma sensação de profundidade e destacar elementos.',
          path: '/tools/gerador-box-shadow',
          icon: 'palette'
        },
        {
          type: 'tool',
          title: 'Layouts Criativos: Gerador de Clip-Path',
          description: 'Quebre a monotonia dos retângulos e crie formas únicas para seus elementos e imagens.',
          path: '/tools/gerador-clip-path',
          icon: 'palette'
        },
        {
          type: 'tool',
          title: 'Organização Estrutural: Construtor de Grid CSS',
          description: 'Projete layouts complexos e responsivos com o poder do CSS Grid.',
          path: '/tools/construtor-grid-css',
          icon: 'palette'
        },
        {
          type: 'tool',
          title: 'Toques Finais: Gerador de Animação CSS',
          description: 'Adicione micro-interações e animações para uma experiência de usuário mais fluida e agradável.',
          path: '/tools/gerador-animacao-css',
          icon: 'palette'
        }
      ]
    }
  ]);

  getLearningPaths() {
    return this.paths.asReadonly();
  }

  getPathBySlug(slug: string) {
    return this.paths().find(p => p.slug === slug);
  }
}
