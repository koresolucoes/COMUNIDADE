-- ==============================================================================
-- ATUALIZAÇÃO DO ESQUEMA DE BANCO DE DADOS - MÓDULO DE APRENDIZAGEM INTERATIVO
-- ==============================================================================

-- 1. Tabela de Cursos
-- Armazena os metadados dos cursos disponíveis.
CREATE TABLE IF NOT EXISTS courses (
    id TEXT PRIMARY KEY, -- Slug do curso (ex: 'python-fundamentos')
    title TEXT NOT NULL,
    description TEXT,
    metadata JSONB, -- Tags, dificuldade, duração, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tabela de Módulos
-- Organiza as lições em grupos lógicos dentro de um curso.
CREATE TABLE IF NOT EXISTS course_modules (
    id TEXT PRIMARY KEY, -- ID único (ex: 'python-mod-1')
    course_id TEXT REFERENCES courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    "order" INTEGER NOT NULL, -- Para ordenação visual
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Tabela de Lições
-- A unidade fundamental de conteúdo (Artigo, Vídeo, Quiz, Desafio).
CREATE TABLE IF NOT EXISTS course_lessons (
    id TEXT PRIMARY KEY, -- ID único (ex: 'python-intro')
    module_id TEXT REFERENCES course_modules(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('article', 'video', 'quiz', 'challenge')),
    content JSONB, -- Conteúdo flexível: HTML, URL de vídeo, perguntas do Quiz, etc.
    "order" INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Tabela de Progresso Detalhado
-- Rastreia o progresso do usuário em cada lição, incluindo notas de quiz e código.
CREATE TABLE IF NOT EXISTS user_lesson_progress (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    lesson_id TEXT REFERENCES course_lessons(id) ON DELETE CASCADE,
    status TEXT CHECK (status IN ('started', 'completed')),
    score INTEGER, -- Para quizzes (0-100)
    metadata JSONB, -- Para salvar respostas do quiz ou solução do desafio
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (user_id, lesson_id)
);

-- ==============================================================================
-- POLÍTICAS DE SEGURANÇA (RLS - Row Level Security)
-- ==============================================================================

-- Habilitar RLS
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_lesson_progress ENABLE ROW LEVEL SECURITY;

-- Políticas de Leitura (Conteúdo é público)
CREATE POLICY "Cursos visíveis para todos" ON courses FOR SELECT USING (true);
CREATE POLICY "Módulos visíveis para todos" ON course_modules FOR SELECT USING (true);
CREATE POLICY "Lições visíveis para todos" ON course_lessons FOR SELECT USING (true);

-- Políticas de Progresso (Apenas o próprio usuário pode ver/editar seus dados)
CREATE POLICY "Usuário vê seu próprio progresso" 
    ON user_lesson_progress FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Usuário insere seu próprio progresso" 
    ON user_lesson_progress FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuário atualiza seu próprio progresso" 
    ON user_lesson_progress FOR UPDATE 
    USING (auth.uid() = user_id);

-- ==============================================================================
-- DADOS INICIAIS (SEED DATA) - Exemplo para o Curso de Python
-- ==============================================================================

-- Inserir Curso
INSERT INTO courses (id, title, description, metadata) VALUES 
('python-fundamentos', 'Fundamentos de Python', 'Aprenda a base da linguagem Python, desde variáveis até funções.', '{"difficulty": "Iniciante", "duration": "2h 30m", "tags": ["Python", "Backend"]}')
ON CONFLICT (id) DO NOTHING;

-- Inserir Módulo 1
INSERT INTO course_modules (id, course_id, title, "order") VALUES 
('mod-1', 'python-fundamentos', 'Introdução', 1)
ON CONFLICT (id) DO NOTHING;

-- Inserir Lições do Módulo 1
INSERT INTO course_lessons (id, module_id, title, slug, type, content, "order") VALUES 
('python-intro', 'mod-1', 'O que é Python?', 'introducao', 'article', '{"html": "<p>Python é uma linguagem...</p>"}', 1),
('python-setup', 'mod-1', 'Configurando o Ambiente', 'configuracao-ambiente', 'video', '{"url": "https://www.youtube.com/embed/dQw4w9WgXcQ"}', 2)
ON CONFLICT (id) DO NOTHING;

-- Inserir Módulo 2
INSERT INTO course_modules (id, course_id, title, "order") VALUES 
('mod-2', 'python-fundamentos', 'Variáveis e Tipos', 2)
ON CONFLICT (id) DO NOTHING;

-- Inserir Lições do Módulo 2
INSERT INTO course_lessons (id, module_id, title, slug, type, content, "order") VALUES 
('python-vars', 'mod-2', 'Variáveis', 'variaveis', 'article', '{"html": "<p>Variáveis são...</p>"}', 1),
('python-quiz-1', 'mod-2', 'Quiz: Fundamentos', 'quiz-fundamentos', 'quiz', '{"questions": []}', 2)
ON CONFLICT (id) DO NOTHING;
