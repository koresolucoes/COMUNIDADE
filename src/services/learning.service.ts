import { Injectable, signal } from '@angular/core';
import { n8nPaths } from './learning-paths/n8n';
import { cssPaths } from './learning-paths/css';
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
  id: 'iniciante' | 'automacao' | 'design' | 'python' | 'devops';
  name: string;
  icon: string;
  subcategories: Subcategory[];
}

const pythonFundamentosDadosSteps: LearningStep[] = [
  { type: 'article', title: 'Introdução ao Python e Ambiente', description: 'Configure seu ambiente de desenvolvimento para Python com VS Code ou Jupyter Notebook e escreva seu primeiro "Olá, Mundo!".', path: '/learning/article/python-intro-ambiente', icon: 'play_circle' },
  { type: 'article', title: 'Variáveis e Tipos de Dados Primitivos', description: 'Domine os tipos de dados básicos: strings para texto, int e float para números, e booleanos para lógica.', path: '/learning/article/python-variaveis-tipos', icon: 'data_object' },
  { type: 'article', title: 'Estruturas de Dados: Listas e Dicionários', description: 'Aprenda a organizar dados com as duas estruturas mais importantes do Python: listas para coleções ordenadas e dicionários para pares chave-valor.', path: '/learning/article/python-listas-dicionarios', icon: 'data_usage' },
  { type: 'article', title: 'Funções e Modularização', description: 'Escreva código limpo e reutilizável criando suas próprias funções e importando módulos.', path: '/learning/article/python-funcoes', icon: 'functions' },
  { type: 'article', title: 'Lendo e Escrevendo Arquivos', description: 'Aprenda a interagir com o sistema de arquivos para ler e escrever dados em formatos como texto, CSV e JSON.', path: '/learning/article/python-arquivos', icon: 'description' },
  { type: 'tool', title: 'Prática: Conversor de Dados', description: 'Use a ferramenta para visualizar como os dados são estruturados em diferentes formatos como JSON e CSV.', path: '/tools/data-converter', icon: 'construction' },
];

const pythonFundamentosDadosPath: LearningPath = {
  slug: 'python-fundamentos-dados',
  title: '1. Fundamentos de Python para Dados',
  description: 'A base essencial de Python para quem quer trabalhar com dados: variáveis, listas, dicionários e funções.',
  level: 'Fundamentos',
  steps: pythonFundamentosDadosSteps,
};

const pythonColetaDadosSteps: LearningStep[] = [
    { type: 'article', title: 'Fazendo Requisições HTTP com a biblioteca Requests', description: 'Aprenda a usar a biblioteca `requests`, o padrão de fato em Python para interagir com APIs REST.', path: '/learning/article/python-requests', icon: 'http' },
    { type: 'tool', title: 'Prática: Entendendo APIs com o Cliente REST', description: 'Use o Cliente REST para testar endpoints de API e entender as respostas antes de automatizar a coleta com Python.', path: '/tools/cliente-rest', icon: 'construction' },
    { type: 'article', title: 'Introdução ao Web Scraping com BeautifulSoup', description: 'Descubra como extrair informações de páginas HTML quando uma API não está disponível.', path: '/learning/article/python-web-scraping', icon: 'travel_explore' },
];

const pythonColetaDadosPath: LearningPath = {
  slug: 'python-coleta-dados',
  title: '2. Coleta de Dados com APIs e Web Scraping',
  description: 'Aprenda a buscar dados de APIs REST com a biblioteca `Requests` e a extrair informações de páginas web.',
  level: 'Básico',
  steps: pythonColetaDadosSteps,
};

const pythonManipulacaoPandasSteps: LearningStep[] = [
    { type: 'article', title: 'Introdução ao Pandas: Series e DataFrames', description: 'Conheça as duas estruturas de dados fundamentais do Pandas e como elas representam dados tabulares.', path: '/learning/article/pandas-intro', icon: 'table_chart' },
    { type: 'article', title: 'Lendo e Escrevendo Dados (CSV, Excel)', description: 'Aprenda a carregar dados de diferentes fontes para um DataFrame e a salvar seus resultados.', path: '/learning/article/pandas-leitura-escrita', icon: 'file_present' },
    { type: 'article', title: 'Seleção e Filtragem de Dados (loc, iloc)', description: 'Domine as técnicas para selecionar linhas e colunas específicas do seu DataFrame com base em rótulos e posições.', path: '/learning/article/pandas-selecao-filtragem', icon: 'filter_alt' },
    { type: 'article', title: 'Limpeza de Dados: Valores Nulos e Duplicados', description: 'Aprenda os passos essenciais de qualquer análise de dados: como encontrar e tratar dados faltantes ou duplicados.', path: '/learning/article/pandas-limpeza-dados', icon: 'cleaning_services' },
    { type: 'article', title: 'Agrupamento e Agregação (groupby)', description: 'Descubra o poder do `groupby` para sumarizar dados, calculando médias, somas e contagens por categoria.', path: '/learning/article/pandas-agrupamento', icon: 'calculate' },
];

const pythonManipulacaoPandasPath: LearningPath = {
  slug: 'python-manipulacao-dados-pandas',
  title: '3. Limpeza e Manipulação de Dados com Pandas',
  description: 'Domine a biblioteca Pandas para carregar, limpar, transformar e analisar dados tabulares de forma eficiente.',
  level: 'Intermediário',
  steps: pythonManipulacaoPandasSteps,
};

const pythonMachineLearningSteps: LearningStep[] = [
    { type: 'article', title: 'O que é Machine Learning?', description: 'Entenda os conceitos fundamentais de Machine Learning e a diferença entre aprendizado supervisionado e não-supervisionado.', path: '/learning/article/sklearn-o-que-e-ml', icon: 'psychology' },
    { type: 'article', title: 'Seu Primeiro Modelo Preditivo com Scikit-learn', description: 'Treine seu primeiro modelo de regressão para prever valores numéricos e entenda o ciclo de `fit` e `predict`.', path: '/learning/article/sklearn-primeiro-modelo', icon: 'model_training' },
    { type: 'article', title: 'Avaliando a Performance do seu Modelo', description: 'Aprenda a usar métricas como Acurácia e Erro Quadrático Médio para saber se seu modelo está performando bem.', path: '/learning/article/sklearn-metricas', icon: 'monitoring' },
    { type: 'article', title: 'Preparando Dados: Feature Engineering', description: 'Descubra como transformar dados brutos, incluindo texto e categorias, em um formato que os modelos de Machine Learning entendam.', path: '/learning/article/sklearn-feature-engineering', icon: 'engineering' },
    { type: 'article', title: 'Construindo um Pipeline Completo', description: 'Junte todos os passos, desde a leitura dos dados até a previsão final, em um pipeline reutilizável e organizado.', path: '/learning/article/sklearn-pipeline', icon: 'account_tree' },
];

const pythonMachineLearningPath: LearningPath = {
  slug: 'python-machine-learning-sklearn',
  title: '4. Introdução ao Machine Learning com Scikit-learn',
  description: 'Dê seus primeiros passos em Machine Learning. Aprenda a treinar modelos preditivos com a biblioteca `scikit-learn`.',
  level: 'Intermediário',
  steps: pythonMachineLearningSteps,
};

const pythonDataAutomationPaths: LearningPath[] = [
    pythonFundamentosDadosPath,
    pythonColetaDadosPath,
    pythonManipulacaoPandasPath,
    pythonMachineLearningPath,
];

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
    id: 'python',
    name: 'Python',
    icon: 'code',
    subcategories: [
       {
        id: 'python-automacao-dados',
        name: 'Python para Automação de Dados',
        description: 'Aprenda a usar Python e bibliotecas como Pandas e Requests para coletar, limpar e automatizar a manipulação de dados.',
        icon: 'query_stats',
        paths: pythonDataAutomationPaths,
      }
    ],
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
