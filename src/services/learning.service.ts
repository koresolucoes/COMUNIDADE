import { Injectable, signal } from '@angular/core';
import { n8nPaths } from './learning-paths/n8n';
import { cssPaths } from './learning-paths/css';
import { pythonPaths } from './learning-paths/python';
import { iniciantePaths } from './learning-paths/iniciante';

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
  level: 'Fundamentos' | 'Básico' | 'Intermediário' | 'Avançado';
  steps: LearningStep[];
}

export interface Subcategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  paths: LearningPath[];
}

export interface MainCategory {
  id: 'iniciante' | 'automacao' | 'design' | 'codigo' | 'devops';
  name: string;
  icon: string;
  subcategories: Subcategory[];
}

const ALL_DATA: MainCategory[] = [
  {
    id: 'iniciante',
    name: 'Jornada do Desenvolvedor',
    icon: 'flag',
    subcategories: [
      {
        id: 'fundamentos-dev',
        name: 'Fundamentos Essenciais',
        description:
          'A base completa para iniciar sua jornada, da lógica de programação à publicação do seu primeiro projeto na nuvem.',
        icon: 'foundation',
        paths: iniciantePaths,
      },
    ],
  },
  {
    id: 'automacao',
    name: 'Automação',
    icon: 'lan',
    subcategories: [
      {
        id: 'n8n',
        name: 'n8n',
        description:
          'Aprenda a automatizar processos e conectar aplicações com a poderosa plataforma de automação de workflows n8n.',
        icon: 'hub',
        paths: n8nPaths,
      },
      {
        id: 'python',
        name: 'Python',
        description:
          'Utilize Python para scripts de automação, manipulação de dados e integração com sistemas.',
        icon: 'code',
        paths: pythonPaths,
      },
    ],
  },
  {
    id: 'design',
    name: 'Design & UI',
    icon: 'palette',
    subcategories: [
      {
        id: 'css-avancado',
        name: 'CSS Avançado',
        description:
          'Crie interfaces ricas e visualmente impressionantes com ferramentas de CSS modernas.',
        icon: 'style',
        paths: cssPaths,
      },
    ],
  },
  {
    id: 'codigo',
    name: 'Código',
    icon: 'code',
    subcategories: [],
  },
  {
    id: 'devops',
    name: 'DevOps',
    icon: 'build_circle',
    subcategories: [],
  },
];

@Injectable({
  providedIn: 'root',
})
export class LearningService {
  private readonly data = signal<MainCategory[]>(ALL_DATA);

  getLearningData() {
    return this.data.asReadonly();
  }

  getPathBySlug(
    slug: string
  ):
    | { path: LearningPath; subcategory: Subcategory; mainCategory: MainCategory }
    | undefined {
    for (const mainCat of this.data()) {
      for (const subCat of mainCat.subcategories) {
        const foundPath = subCat.paths.find((p) => p.slug === slug);
        if (foundPath) {
          return {
            path: foundPath,
            subcategory: subCat,
            mainCategory: mainCat,
          };
        }
      }
    }
    return undefined;
  }
}
