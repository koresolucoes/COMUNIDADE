-- ==============================================================================
-- ATUALIZAÇÃO DE CATEGORIAS E CURSOS (VIRTUAL UNIVERSITY RESTRUCTURE)
-- ==============================================================================

-- 1. Adicionar coluna de categoria se não existir
ALTER TABLE courses ADD COLUMN IF NOT EXISTS category TEXT;

-- 2. Limpar dados existentes para reestruturação (Opcional - remova se quiser manter)
-- DELETE FROM course_lessons;
-- DELETE FROM course_modules;
-- DELETE FROM courses;

-- 3. Inserir Cursos Estruturados por Nível

-- ==============================================================================
-- NÍVEL 1: INICIANTE (EXPLORADOR)
-- ==============================================================================

INSERT INTO courses (id, title, description, category, metadata) VALUES 
('python-logic', 'Lógica de Programação com Python', 'Domine os fundamentos da programação usando a linguagem mais popular para automação. Variáveis, loops, funções e manipulação de dados.', 'Iniciante', '{"difficulty": "Iniciante", "duration": "4h", "tags": ["Python", "Lógica", "Fundamentos"]}')
ON CONFLICT (id) DO UPDATE SET category = EXCLUDED.category, metadata = EXCLUDED.metadata;

INSERT INTO courses (id, title, description, category, metadata) VALUES 
('api-intro', 'O Universo das APIs (HTTP & JSON)', 'Entenda como a web funciona. Aprenda sobre requisições HTTP, métodos (GET, POST), headers, autenticação e como manipular JSON.', 'Iniciante', '{"difficulty": "Iniciante", "duration": "3h", "tags": ["HTTP", "API", "JSON"]}')
ON CONFLICT (id) DO UPDATE SET category = EXCLUDED.category, metadata = EXCLUDED.metadata;

-- ==============================================================================
-- NÍVEL 2: INTERMEDIÁRIO (CONSTRUTOR)
-- ==============================================================================

INSERT INTO courses (id, title, description, category, metadata) VALUES 
('n8n-mastery', 'Dominando o n8n: Do Zero ao Avançado', 'O curso definitivo de n8n. Aprenda a criar fluxos complexos, usar expressões, manipular arrays e integrar múltiplos serviços.', 'Intermediário', '{"difficulty": "Intermediário", "duration": "8h", "tags": ["n8n", "Workflow", "Low-Code"]}')
ON CONFLICT (id) DO UPDATE SET category = EXCLUDED.category, metadata = EXCLUDED.metadata;

INSERT INTO courses (id, title, description, category, metadata) VALUES 
('database-sql', 'Bancos de Dados para Automação (SQL & Supabase)', 'Pare de usar planilhas como banco de dados. Aprenda SQL, modelagem de dados e como integrar o Supabase em suas automações.', 'Intermediário', '{"difficulty": "Intermediário", "duration": "5h", "tags": ["SQL", "Supabase", "Dados"]}')
ON CONFLICT (id) DO UPDATE SET category = EXCLUDED.category, metadata = EXCLUDED.metadata;

-- ==============================================================================
-- NÍVEL 3: PROFISSIONAL (ARQUITETO)
-- ==============================================================================

INSERT INTO courses (id, title, description, category, metadata) VALUES 
('devops-docker', 'DevOps e Docker para n8n', 'Leve suas automações para produção. Aprenda a configurar VPS, usar Docker Compose, gerenciar containers e garantir uptime.', 'Profissional', '{"difficulty": "Avançado", "duration": "6h", "tags": ["Docker", "DevOps", "VPS"]}')
ON CONFLICT (id) DO UPDATE SET category = EXCLUDED.category, metadata = EXCLUDED.metadata;

INSERT INTO courses (id, title, description, category, metadata) VALUES 
('custom-nodes', 'Criando Custom Nodes para n8n', 'Estenda o n8n criando seus próprios nós com TypeScript. A habilidade final para quem quer customização total.', 'Profissional', '{"difficulty": "Expert", "duration": "10h", "tags": ["TypeScript", "Node.js", "n8n"]}')
ON CONFLICT (id) DO UPDATE SET category = EXCLUDED.category, metadata = EXCLUDED.metadata;


-- 4. Inserir Módulos de Exemplo para os Novos Cursos

-- Python Logic
INSERT INTO course_modules (id, course_id, title, "order") VALUES 
('py-mod-1', 'python-logic', 'Introdução à Lógica', 1),
('py-mod-2', 'python-logic', 'Estruturas de Controle', 2)
ON CONFLICT (id) DO NOTHING;

-- API Intro
INSERT INTO course_modules (id, course_id, title, "order") VALUES 
('api-mod-1', 'api-intro', 'O Protocolo HTTP', 1),
('api-mod-2', 'api-intro', 'Trabalhando com JSON', 2)
ON CONFLICT (id) DO NOTHING;

-- n8n Mastery
INSERT INTO course_modules (id, course_id, title, "order") VALUES 
('n8n-mod-1', 'n8n-mastery', 'Conceitos Core do n8n', 1),
('n8n-mod-2', 'n8n-mastery', 'Manipulação de Dados Avançada', 2)
ON CONFLICT (id) DO NOTHING;

-- 5. Inserir Lições de Exemplo

-- Python Logic Lessons
INSERT INTO course_lessons (id, module_id, title, slug, type, content, "order") VALUES 
('py-lesson-1', 'py-mod-1', 'Algoritmos e Fluxogramas', 'algoritmos', 'article', '{"html": "<p>Um algoritmo é uma sequência de passos...</p>"}', 1),
('py-lesson-2', 'py-mod-1', 'Sua Primeira Variável', 'variaveis', 'video', '{"url": "https://www.youtube.com/embed/dQw4w9WgXcQ"}', 2)
ON CONFLICT (id) DO NOTHING;

-- n8n Mastery Lessons
INSERT INTO course_lessons (id, module_id, title, slug, type, content, "order") VALUES 
('n8n-lesson-1', 'n8n-mod-1', 'Nodes, Connections e Workflow', 'conceitos-basicos', 'video', '{"url": "https://www.youtube.com/embed/dQw4w9WgXcQ"}', 1),
('n8n-lesson-2', 'n8n-mod-1', 'O Objeto JSON no n8n', 'json-n8n', 'article', '{"html": "<p>No n8n, tudo é JSON...</p>"}', 2)
ON CONFLICT (id) DO NOTHING;
