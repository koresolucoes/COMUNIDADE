-- ==============================================================================
-- CONTEÚDO INTERATIVO: CURSO DE LÓGICA DE PROGRAMAÇÃO COM PYTHON
-- ==============================================================================

-- 1. Atualizar Lições Existentes (Melhorar conteúdo)

-- Lição 1: Algoritmos (Artigo)
UPDATE course_lessons 
SET content = '{"html": "<h2>O que é um Algoritmo?</h2><p>Um algoritmo é simplesmente uma <strong>sequência de passos</strong> para resolver um problema. Pense numa receita de bolo: você tem os ingredientes (dados de entrada), o modo de preparo (processamento) e o bolo pronto (saída).</p><h3>Exemplo do Dia a Dia</h3><p>Algoritmo para trocar uma lâmpada:</p><ol><li>Verificar se a lâmpada está queimada.</li><li>Se sim, pegar uma nova lâmpada.</li><li>Substituir a antiga pela nova.</li><li>Testar o interruptor.</li></ol><p>Na programação, fazemos isso com código!</p>"}'
WHERE id = 'py-lesson-1';

-- Lição 2: Variáveis (Vídeo) -> Vamos mudar para um vídeo real de Python se tiver, ou manter placeholder
UPDATE course_lessons 
SET content = '{"url": "https://www.youtube.com/embed/f79MRyMsjrQ"}' -- Vídeo de introdução ao Python (exemplo)
WHERE id = 'py-lesson-2';


-- 2. Inserir Novas Lições Interativas

-- Módulo 1: Quiz de Lógica
INSERT INTO course_lessons (id, module_id, title, slug, type, content, "order") VALUES 
('py-quiz-1', 'py-mod-1', 'Quiz: Lógica de Programação', 'quiz-logica', 'quiz', 
'{
  "questions": [
    {
      "id": "q1",
      "text": "O que é um algoritmo?",
      "options": [
        { "id": "a", "text": "Um tipo de vírus de computador", "isCorrect": false },
        { "id": "b", "text": "Uma sequência de passos para resolver um problema", "isCorrect": true },
        { "id": "c", "text": "Uma peça de hardware do computador", "isCorrect": false }
      ],
      "explanation": "Algoritmos são sequências finitas de instruções bem definidas para resolver problemas."
    },
    {
      "id": "q2",
      "text": "Qual destes é um exemplo de dado de entrada (input)?",
      "options": [
        { "id": "a", "text": "O bolo pronto saindo do forno", "isCorrect": false },
        { "id": "b", "text": "Os ingredientes da receita", "isCorrect": true },
        { "id": "c", "text": "O ato de misturar a massa", "isCorrect": false }
      ],
      "explanation": "Input é o que você fornece ao sistema. No caso do bolo, são os ingredientes."
    }
  ]
}', 3)
ON CONFLICT (id) DO UPDATE SET content = EXCLUDED.content, "order" = EXCLUDED."order";


-- Módulo 2: Estruturas de Controle

-- Lição 3: Condicionais (Artigo)
INSERT INTO course_lessons (id, module_id, title, slug, type, content, "order") VALUES 
('py-lesson-3', 'py-mod-2', 'Tomando Decisões (if/else)', 'condicionais', 'article', 
'{"html": "<h2>O poder do SE (if)</h2><p>Programas inteligentes tomam decisões. Em Python, usamos <code>if</code> e <code>else</code>.</p><pre><code class=\"language-python\">idade = 18\nif idade >= 18:\n    print(\"Pode dirigir\")\nelse:\n    print(\"Não pode dirigir\")</code></pre><p>A indentação (espaço no início da linha) é fundamental em Python!</p>"}', 1)
ON CONFLICT (id) DO UPDATE SET content = EXCLUDED.content, "order" = EXCLUDED."order";

-- Lição 4: Desafio de Código (Challenge)
INSERT INTO course_lessons (id, module_id, title, slug, type, content, "order") VALUES 
('py-challenge-1', 'py-mod-2', 'Desafio: Verificador de Idade', 'desafio-idade', 'challenge', 
'{
  "language": "python",
  "description": "<p>Escreva um código que verifique se uma pessoa é maior de idade.</p><ul><li>Crie uma variável chamada <code>idade</code> e atribua o valor <strong>20</strong>.</li><li>Use um <code>if</code> para verificar se a idade é maior ou igual a 18.</li><li>Se for, imprima <code>\"Maior de idade\"</code>.</li><li>Caso contrário, imprima <code>\"Menor de idade\"</code>.</li></ul>",
  "initialCode": "# Escreva seu código abaixo\nidade = \n\nif ... :\n    print(\"...\")\n",
  "hints": [
    "Lembre-se de usar dois pontos (:) após o if.",
    "Use print() para mostrar a mensagem na tela.",
    "A indentação é importante! O print deve estar recuado."
  ]
}', 2)
ON CONFLICT (id) DO UPDATE SET content = EXCLUDED.content, "order" = EXCLUDED."order";
