import { Injectable, signal } from '@angular/core';
import { n8nPaths } from './learning-paths/n8n';
import { cssPaths } from './learning-paths/css';
import { iniciantePaths } from './learning-paths/iniciante';
import { devopsPaths } from './learning-paths/devops';

export interface Lesson {
  id: string;
  type: 'article' | 'video' | 'interactive' | 'quiz';
  title: string;
  description: string;
  slug: string;
  icon: string;
  contentUrl?: string; // For videos or external interactive content
}

export interface Module {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  slug: string;
  title: string;
  description: string;
  level: 'Fundamentos' | 'Básico' | 'Intermediário' | 'Avançado';
  modules: Module[];
  thumbnailUrl?: string;
}

export interface CourseCategory {
  id: 'iniciante' | 'automacao' | 'design' | 'python' | 'devops';
  name: string;
  icon: string;
  description?: string;
  courses: Course[];
}

const pythonFundamentosDadosSteps: Lesson[] = [
  { id: 'python-intro-ambiente', slug: 'python-intro-ambiente', type: 'article', title: 'Introdução ao Python e Ambiente', description: 'Configure seu ambiente de desenvolvimento para Python com VS Code ou Jupyter Notebook e escreva seu primeiro "Olá, Mundo!".', icon: 'play_circle' },
  { id: 'python-variaveis-tipos', slug: 'python-variaveis-tipos', type: 'article', title: 'Variáveis e Tipos de Dados Primitivos', description: 'Domine os tipos de dados básicos: strings para texto, int e float para números, e booleanos para lógica.', icon: 'data_object' },
  { id: 'python-listas-dicionarios', slug: 'python-listas-dicionarios', type: 'article', title: 'Estruturas de Dados: Listas e Dicionários', description: 'Aprenda a organizar dados com as duas estruturas mais importantes do Python: listas para coleções ordenadas e dicionários para pares chave-valor.', icon: 'data_usage' },
  { id: 'python-funcoes', slug: 'python-funcoes', type: 'article', title: 'Funções e Modularização', description: 'Escreva código limpo e reutilizável criando suas próprias funções e importando módulos.', icon: 'functions' },
  { id: 'python-arquivos', slug: 'python-arquivos', type: 'article', title: 'Lendo e Escrevendo Arquivos', description: 'Aprenda a interagir com o sistema de arquivos para ler e escrever dados em formatos como texto, CSV e JSON.', icon: 'description' },
  { id: 'data-converter', slug: 'data-converter', type: 'interactive', title: 'Prática: Conversor de Dados', description: 'Use a ferramenta para visualizar como os dados são estruturados em diferentes formatos como JSON e CSV.', icon: 'construction' },
];

const pythonFundamentosDadosPath: Course = {
  id: 'python-fundamentos-dados',
  slug: 'python-fundamentos-dados',
  title: '1. Fundamentos de Python para Dados',
  description: 'A base essencial de Python para quem quer trabalhar com dados: variáveis, listas, dicionários e funções.',
  level: 'Fundamentos',
  modules: [{
    id: 'module-1',
    title: 'Fundamentos',
    description: 'Conceitos básicos de Python',
    lessons: pythonFundamentosDadosSteps
  }],
};

const pythonColetaDadosSteps: Lesson[] = [
    { id: 'python-requests', slug: 'python-requests', type: 'article', title: 'Fazendo Requisições HTTP com a biblioteca Requests', description: 'Aprenda a usar a biblioteca `requests`, o padrão de fato em Python para interagir com APIs REST.', icon: 'http' },
    { id: 'cliente-rest', slug: 'cliente-rest', type: 'interactive', title: 'Prática: Entendendo APIs com o Cliente REST', description: 'Use o Cliente REST para testar endpoints de API e entender as respostas antes de automatizar a coleta com Python.', icon: 'construction' },
    { id: 'python-web-scraping', slug: 'python-web-scraping', type: 'article', title: 'Introdução ao Web Scraping com BeautifulSoup', description: 'Descubra como extrair informações de páginas HTML quando uma API não está disponível.', icon: 'travel_explore' },
];

const pythonColetaDadosPath: Course = {
  id: 'python-coleta-dados',
  slug: 'python-coleta-dados',
  title: '2. Coleta de Dados com APIs e Web Scraping',
  description: 'Aprenda a buscar dados de APIs REST com a biblioteca `Requests` e a extrair informações de páginas web.',
  level: 'Básico',
  modules: [{
    id: 'module-1',
    title: 'Coleta de Dados',
    description: 'APIs e Web Scraping',
    lessons: pythonColetaDadosSteps
  }],
};

const pythonManipulacaoPandasSteps: Lesson[] = [
    { id: 'pandas-intro', slug: 'pandas-intro', type: 'article', title: 'Introdução ao Pandas: Series e DataFrames', description: 'Conheça as duas estruturas de dados fundamentais do Pandas e como elas representam dados tabulares.', icon: 'table_chart' },
    { id: 'pandas-leitura-escrita', slug: 'pandas-leitura-escrita', type: 'article', title: 'Lendo e Escrevendo Dados (CSV, Excel)', description: 'Aprenda a carregar dados de diferentes fontes para um DataFrame e a salvar seus resultados.', icon: 'file_present' },
    { id: 'pandas-selecao-filtragem', slug: 'pandas-selecao-filtragem', type: 'article', title: 'Seleção e Filtragem de Dados (loc, iloc)', description: 'Domine as técnicas para selecionar linhas e colunas específicas do seu DataFrame com base em rótulos e posições.', icon: 'filter_alt' },
    { id: 'pandas-limpeza-dados', slug: 'pandas-limpeza-dados', type: 'article', title: 'Limpeza de Dados: Valores Nulos e Duplicados', description: 'Aprenda os passos essenciais de qualquer análise de dados: como encontrar e tratar dados faltantes ou duplicados.', icon: 'cleaning_services' },
    { id: 'pandas-agrupamento', slug: 'pandas-agrupamento', type: 'article', title: 'Agrupamento e Agregação (groupby)', description: 'Descubra o poder do `groupby` para sumarizar dados, calculando médias, somas e contagens por categoria.', icon: 'calculate' },
];

const pythonManipulacaoPandasPath: Course = {
  id: 'python-manipulacao-dados-pandas',
  slug: 'python-manipulacao-dados-pandas',
  title: '3. Limpeza e Manipulação de Dados com Pandas',
  description: 'Domine a biblioteca Pandas para carregar, limpar, transformar e analisar dados tabulares de forma eficiente.',
  level: 'Intermediário',
  modules: [{
    id: 'module-1',
    title: 'Manipulação de Dados',
    description: 'Trabalhando com Pandas',
    lessons: pythonManipulacaoPandasSteps
  }],
};

const pythonMachineLearningSteps: Lesson[] = [
    { id: 'sklearn-o-que-e-ml', slug: 'sklearn-o-que-e-ml', type: 'article', title: 'O que é Machine Learning?', description: 'Entenda os conceitos fundamentais de Machine Learning e a diferença entre aprendizado supervisionado e não-supervisionado.', icon: 'psychology' },
    { id: 'sklearn-primeiro-modelo', slug: 'sklearn-primeiro-modelo', type: 'article', title: 'Seu Primeiro Modelo Preditivo com Scikit-learn', description: 'Treine seu primeiro modelo de regressão para prever valores numéricos e entenda o ciclo de `fit` e `predict`.', icon: 'model_training' },
    { id: 'sklearn-metricas', slug: 'sklearn-metricas', type: 'article', title: 'Avaliando a Performance do seu Modelo', description: 'Aprenda a usar métricas como Acurácia e Erro Quadrático Médio para saber se seu modelo está performando bem.', icon: 'monitoring' },
    { id: 'sklearn-feature-engineering', slug: 'sklearn-feature-engineering', type: 'article', title: 'Preparando Dados: Feature Engineering', description: 'Descubra como transformar dados brutos, incluindo texto e categorias, em um formato que os modelos de Machine Learning entendam.', icon: 'engineering' },
    { id: 'sklearn-pipeline', slug: 'sklearn-pipeline', type: 'article', title: 'Construindo um Pipeline Completo', description: 'Junte todos os passos, desde a leitura dos dados até a previsão final, em um pipeline reutilizável e organizado.', icon: 'account_tree' },
];

const pythonMachineLearningPath: Course = {
  id: 'python-machine-learning-sklearn',
  slug: 'python-machine-learning-sklearn',
  title: '4. Introdução ao Machine Learning com Scikit-learn',
  description: 'Dê seus primeiros passos em Machine Learning. Aprenda a treinar modelos preditivos com a biblioteca `scikit-learn`.',
  level: 'Intermediário',
  modules: [{
    id: 'module-1',
    title: 'Machine Learning',
    description: 'Introdução ao Scikit-learn',
    lessons: pythonMachineLearningSteps
  }],
};

const pythonDataAutomationPaths: Course[] = [
    pythonFundamentosDadosPath,
    pythonColetaDadosPath,
    pythonManipulacaoPandasPath,
    pythonMachineLearningPath,
];

const ALL_DATA: CourseCategory[] = [
  {
    id: 'iniciante',
    name: 'Jornada do Desenvolvedor',
    icon: 'flag',
    description: 'A base completa para iniciar sua jornada, da lógica de programação à publicação do seu primeiro projeto na nuvem.',
    courses: iniciantePaths as any, // We will fix these imports next
  },
  {
    id: 'automacao',
    name: 'Automação',
    icon: 'lan',
    description: 'Aprenda a automatizar processos e conectar aplicações com a poderosa plataforma de automação de workflows n8n.',
    courses: n8nPaths as any,
  },
  {
    id: 'design',
    name: 'Design & UI',
    icon: 'palette',
    description: 'Crie interfaces ricas e visualmente impressionantes com ferramentas de CSS modernas.',
    courses: cssPaths as any,
  },
  {
    id: 'python',
    name: 'Python',
    icon: 'code',
    description: 'Aprenda a usar Python e bibliotecas como Pandas e Requests para coletar, limpar e automatizar a manipulação de dados.',
    courses: pythonDataAutomationPaths,
  },
  {
    id: 'devops',
    name: 'DevOps',
    icon: 'build_circle',
    description: 'Aprenda os princípios da cultura DevOps e domine as ferramentas essenciais para automatizar a entrega de software.',
    courses: devopsPaths as any
  },
];

@Injectable({
  providedIn: 'root',
})
export class LearningService {
  private readonly data = signal<CourseCategory[]>(ALL_DATA);

  getLearningData() {
    return this.data.asReadonly();
  }

  getCourseBySlug(
    slug: string
  ):
    | { course: Course; category: CourseCategory }
    | undefined {
    for (const category of this.data()) {
      const foundCourse = category.courses.find((c) => c.slug === slug);
      if (foundCourse) {
        return {
          course: foundCourse,
          category: category,
        };
      }
    }
    return undefined;
  }

  getNavigationContext(currentLessonSlug: string): {
    prevLesson?: Lesson;
    nextLesson?: Lesson;
    parentCourse?: Course;
    parentModule?: Module;
  } | undefined {
    for (const category of this.data()) {
      for (const course of category.courses) {
        for (const module of course.modules) {
          const index = module.lessons.findIndex(l => l.slug === currentLessonSlug);
          if (index !== -1) {
            return {
              prevLesson: module.lessons[index - 1],
              nextLesson: module.lessons[index + 1],
              parentCourse: course,
              parentModule: module
            };
          }
        }
      }
    }
    return undefined;
  }
}