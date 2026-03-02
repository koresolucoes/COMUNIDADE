-- ==============================================================================
-- ESQUEMA COMPLETO DO BANCO DE DADOS (FULL DATABASE SCHEMA)
-- ==============================================================================
-- Este arquivo contém todo o SQL necessário para recriar o banco de dados do zero.
-- Compatível com PostgreSQL (Supabase, Neon, AWS RDS, etc).

-- Habilitar extensão para UUIDs se necessário
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 1. TABELAS EXISTENTES (Ferramentas e Progresso Simples)
-- ==============================================================================

-- 1.1. Tabela de Dados de Ferramentas (User Tool Data)
-- Armazena dados salvos pelos usuários nas ferramentas (ex: JSONs, Diagramas).
CREATE TABLE IF NOT EXISTS user_tool_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL, -- Em Supabase: REFERENCES auth.users(id)
    tool_id TEXT NOT NULL,
    title TEXT NOT NULL,
    data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 1.2. Tabela de Progresso de Aprendizagem (Legado/Simples)
-- Rastreia quais artigos/passos o usuário marcou como concluído.
CREATE TABLE IF NOT EXISTS user_learning_progress (
    user_id UUID NOT NULL, -- Em Supabase: REFERENCES auth.users(id)
    step_path TEXT NOT NULL, -- O caminho da rota (ex: '/learning/article/python-intro')
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (user_id, step_path)
);

-- ==============================================================================
-- 2. NOVAS TABELAS (Módulo de Aprendizagem Interativo)
-- ==============================================================================

-- 2.1. Tabela de Cursos
-- Armazena os metadados dos cursos disponíveis.
CREATE TABLE IF NOT EXISTS courses (
    id TEXT PRIMARY KEY, -- Slug do curso (ex: 'python-fundamentos')
    title TEXT NOT NULL,
    description TEXT,
    metadata JSONB DEFAULT '{}'::jsonb, -- Tags, dificuldade, duração, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2.2. Tabela de Módulos
-- Organiza as lições em grupos lógicos dentro de um curso.
CREATE TABLE IF NOT EXISTS course_modules (
    id TEXT PRIMARY KEY, -- ID único (ex: 'python-mod-1')
    course_id TEXT REFERENCES courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    "order" INTEGER NOT NULL, -- Para ordenação visual
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2.3. Tabela de Lições
-- A unidade fundamental de conteúdo (Artigo, Vídeo, Quiz, Desafio).
CREATE TABLE IF NOT EXISTS course_lessons (
    id TEXT PRIMARY KEY, -- ID único (ex: 'python-intro')
    module_id TEXT REFERENCES course_modules(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('article', 'video', 'quiz', 'challenge')),
    content JSONB DEFAULT '{}'::jsonb, -- Conteúdo flexível: HTML, URL de vídeo, perguntas do Quiz, etc.
    "order" INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2.4. Tabela de Progresso Detalhado
-- Rastreia o progresso do usuário em cada lição, incluindo notas de quiz e código.
CREATE TABLE IF NOT EXISTS user_lesson_progress (
    user_id UUID NOT NULL, -- Em Supabase: REFERENCES auth.users(id)
    lesson_id TEXT REFERENCES course_lessons(id) ON DELETE CASCADE,
    status TEXT CHECK (status IN ('started', 'completed')),
    score INTEGER DEFAULT 0, -- Para quizzes (0-100)
    metadata JSONB DEFAULT '{}'::jsonb, -- Para salvar respostas do quiz ou solução do desafio
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (user_id, lesson_id)
);

-- ==============================================================================
-- 3. POLÍTICAS DE SEGURANÇA (RLS - Row Level Security)
-- ==============================================================================
-- Nota: Se você não estiver usando Supabase Auth, pode precisar ajustar ou remover
-- as referências a `auth.uid()`.

-- Habilitar RLS em todas as tabelas
ALTER TABLE user_tool_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_lesson_progress ENABLE ROW LEVEL SECURITY;

-- 3.1. Políticas para user_tool_data
CREATE POLICY "Users can view their own tool data" ON user_tool_data FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own tool data" ON user_tool_data FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own tool data" ON user_tool_data FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own tool data" ON user_tool_data FOR DELETE USING (auth.uid() = user_id);

-- 3.2. Políticas para user_learning_progress
CREATE POLICY "Users can view their own progress" ON user_learning_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own progress" ON user_learning_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own progress" ON user_learning_progress FOR DELETE USING (auth.uid() = user_id);

-- 3.3. Políticas para Conteúdo do Curso (Leitura Pública)
CREATE POLICY "Courses are public" ON courses FOR SELECT USING (true);
CREATE POLICY "Modules are public" ON course_modules FOR SELECT USING (true);
CREATE POLICY "Lessons are public" ON course_lessons FOR SELECT USING (true);

-- 3.4. Políticas para Progresso Detalhado (Privado do Usuário)
CREATE POLICY "Users can view their own lesson progress" ON user_lesson_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own lesson progress" ON user_lesson_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own lesson progress" ON user_lesson_progress FOR UPDATE USING (auth.uid() = user_id);

-- ==============================================================================
-- 4. DADOS INICIAIS (SEED DATA)
-- ==============================================================================

-- Inserir Curso Exemplo
INSERT INTO courses (id, title, description, metadata) VALUES 
('python-fundamentos', 'Fundamentos de Python', 'Aprenda a base da linguagem Python, desde variáveis até funções.', '{"difficulty": "Iniciante", "duration": "2h 30m", "tags": ["Python", "Backend"]}')
ON CONFLICT (id) DO NOTHING;

-- Inserir Módulos
INSERT INTO course_modules (id, course_id, title, "order") VALUES 
('mod-1', 'python-fundamentos', 'Introdução', 1),
('mod-2', 'python-fundamentos', 'Variáveis e Tipos', 2)
ON CONFLICT (id) DO NOTHING;

-- Inserir Lições
INSERT INTO course_lessons (id, module_id, title, slug, type, content, "order") VALUES 
('python-intro', 'mod-1', 'O que é Python?', 'introducao', 'article', '{"html": "<p>Python é uma linguagem de programação de alto nível...</p>"}', 1),
('python-setup', 'mod-1', 'Configurando o Ambiente', 'configuracao-ambiente', 'video', '{"url": "https://www.youtube.com/embed/dQw4w9WgXcQ"}', 2),
('python-vars', 'mod-2', 'Variáveis', 'variaveis', 'article', '{"html": "<p>Variáveis são espaços na memória...</p>"}', 1),
('python-quiz-1', 'mod-2', 'Quiz: Fundamentos', 'quiz-fundamentos', 'quiz', '{"questions": []}', 2)
ON CONFLICT (id) DO NOTHING;
