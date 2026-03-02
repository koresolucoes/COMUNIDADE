# Plano de Reestruturação: Módulo de Aprendizagem Interativo

Este documento descreve o plano para transformar a seção de aprendizado atual em uma plataforma de cursos interativos completa.

## 1. Objetivos
- **Estrutura de Curso Real:** Organizar o conteúdo em Cursos > Módulos > Lições.
- **Interatividade:** Adicionar Quizzes, Desafios de Código e Diagramas Interativos.
- **Navegação Melhorada:** Sidebar persistente com progresso do curso.
- **Gamificação (Futuro):** XP, Conquistas e Certificados.

## 2. Nova Arquitetura de Rotas

Atualmente, as rotas são planas (`/learning/article/nome-do-artigo`).
A nova estrutura será hierárquica:

```typescript
// Exemplo de Rota
{
  path: 'learning/course/:courseSlug',
  component: CourseLayoutComponent,
  children: [
    { path: '', component: CourseOverviewComponent }, // Visão geral do curso
    { path: ':lessonSlug', component: LessonViewerComponent } // Renderiza a lição atual
  ]
}
```

## 3. Novos Componentes Principais

### A. `CourseLayoutComponent`
- **Layout:** Sidebar à esquerda (desktop) / Drawer (mobile) + Área de Conteúdo Principal.
- **Sidebar:** Lista de módulos e lições com indicadores de conclusão (checkmarks).
- **Header:** Barra de progresso geral do curso.

### B. `LessonViewerComponent`
- Componente inteligente que decide o que renderizar com base no tipo de lição:
  - `ArticleComponent`: Para conteúdo de texto/imagem (suporta Markdown ou HTML).
  - `VideoComponent`: Para aulas em vídeo.
  - `QuizComponent`: Para testes de conhecimento.
  - `ChallengeComponent`: Para desafios de código ou lógica.

### C. Componentes Interativos
- **`QuizComponent`:**
  - Suporta múltipla escolha, verdadeiro/falso.
  - Feedback imediato.
  - Bloqueia o avanço até acertar (opcional).
- **`CodeChallengeComponent`:**
  - Editor de código (Monaco Editor).
  - Área de instruções.
  - Console de saída.
  - Botão "Executar Testes".

## 4. Modelo de Dados Aprimorado

Atualizar `LearningService` para suportar a nova estrutura:

```typescript
interface Course {
  id: string;
  slug: string;
  title: string;
  description: string;
  modules: CourseModule[];
  metadata: {
    difficulty: 'Iniciante' | 'Intermediário' | 'Avançado';
    duration: string; // ex: "4h 30m"
    tags: string[];
  };
}

interface CourseModule {
  id: string;
  title: string;
  lessons: Lesson[];
}

interface Lesson {
  id: string;
  slug: string;
  title: string;
  type: 'article' | 'video' | 'quiz' | 'challenge';
  content?: any; // Conteúdo específico (Markdown, URL de vídeo, JSON do Quiz)
  component?: any; // Para componentes Angular customizados existentes
}
```

## 5. Plano de Execução

### Fase 1: Fundação (Estrutura e Layout)
1.  Criar `CourseLayoutComponent`.
2.  Criar `CourseService` (ou atualizar `LearningService`) para gerenciar o estado do curso ativo.
3.  Configurar as novas rotas.

### Fase 2: Migração de Conteúdo
1.  Adaptar os "Learning Paths" atuais para o formato de `Course`.
2.  Criar um `LessonWrapperComponent` para renderizar os componentes de artigos existentes dentro do novo layout.

### Fase 3: Interatividade
1.  Implementar `QuizComponent`.
2.  Adicionar um Quiz simples ao final de um curso existente (ex: Python Fundamentos) para testar.

### Fase 4: Desafios de Código (Opcional/Avançado)
1.  Integrar Monaco Editor.
2.  Criar sistema de validação de código (client-side para JS/Python via Pyodide ou server-side).

## 6. Próximos Passos Imediatos
1.  Criar a estrutura de diretórios para o novo módulo.
2.  Implementar o `CourseLayoutComponent`.
