import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-construindo-api-rest-crud',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './construindo-api-rest-crud.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConstruindoApiRestCrudComponent {
  sqlCreateTable = `
CREATE TABLE tarefas (
  id SERIAL PRIMARY KEY,
  descricao VARCHAR(255) NOT NULL,
  concluida BOOLEAN DEFAULT FALSE
);
  `.trim();

  middlewareSnippet = `
// ... outras importações
const app = express();

// IMPORTANTE: Adicione esta linha antes de todas as suas rotas
// Isso permite que o Express entenda o JSON enviado no corpo das requisições
app.use(express.json());

const port = 3000;
// ... resto do seu código
  `.trim();

  getTasksSnippet = `
// READ: Obter todas as tarefas
app.get('/tarefas', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM tarefas ORDER BY id ASC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao buscar tarefas.");
  }
});
  `.trim();

  getTaskByIdSnippet = `
// READ: Obter uma tarefa específica por ID
app.get('/tarefas/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await db.query('SELECT * FROM tarefas WHERE id = $1', [id]);
    if (rows.length === 0) {
      return res.status(404).send('Tarefa não encontrada.');
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao buscar a tarefa.");
  }
});
  `.trim();

  createTaskSnippet = `
// CREATE: Criar uma nova tarefa
app.post('/tarefas', async (req, res) => {
  const { descricao } = req.body; // Pega a descrição do corpo da requisição
  if (!descricao) {
    return res.status(400).send('O campo "descricao" é obrigatório.');
  }
  try {
    const { rows } = await db.query(
      'INSERT INTO tarefas (descricao) VALUES ($1) RETURNING *',
      [descricao]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao criar a tarefa.");
  }
});
  `.trim();

  updateTaskSnippet = `
// UPDATE: Atualizar uma tarefa
app.put('/tarefas/:id', async (req, res) => {
  const { id } = req.params;
  const { descricao, concluida } = req.body;

  if (descricao === undefined || concluida === undefined) {
    return res.status(400).send('Os campos "descricao" e "concluida" são obrigatórios.');
  }

  try {
    const { rows } = await db.query(
      'UPDATE tarefas SET descricao = $1, concluida = $2 WHERE id = $3 RETURNING *',
      [descricao, concluida, id]
    );
    if (rows.length === 0) {
      return res.status(404).send('Tarefa não encontrada para atualização.');
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao atualizar a tarefa.");
  }
});
  `.trim();
  
  deleteTaskSnippet = `
// DELETE: Deletar uma tarefa
app.delete('/tarefas/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('DELETE FROM tarefas WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      return res.status(404).send('Tarefa não encontrada para deletar.');
    }
    // 204 No Content é uma resposta padrão para delete bem-sucedido
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao deletar a tarefa.");
  }
});
  `.trim();

  // Comandos cURL para teste
  curlCreate = `curl -X POST http://localhost:3000/tarefas -H "Content-Type: application/json" -d '{"descricao": "Aprender a usar curl"}'`;
  curlGetAll = `curl http://localhost:3000/tarefas`;
  curlGetById = `curl http://localhost:3000/tarefas/1`;
  curlUpdate = `curl -X PUT http://localhost:3000/tarefas/1 -H "Content-Type: application/json" -d '{"descricao": "Tarefa atualizada com curl", "concluida": true}'`;
  curlDelete = `curl -X DELETE http://localhost:3000/tarefas/1`;

  finalIndexJs = `
const express = require('express');
const db = require('./db');

const app = express();
// IMPORTANTE: Adicione esta linha antes de todas as suas rotas
app.use(express.json());

const port = 3000;

// Rota de teste original
app.get('/', (req, res) => {
  res.send('Hello World! Nossa API de tarefas está no ar!');
});


// --- CRUD TAREFAS ---

// CREATE: Criar uma nova tarefa
app.post('/tarefas', async (req, res) => {
  const { descricao } = req.body;
  if (!descricao) {
    return res.status(400).send('O campo "descricao" é obrigatório.');
  }
  try {
    const { rows } = await db.query('INSERT INTO tarefas (descricao) VALUES ($1) RETURNING *', [descricao]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao criar a tarefa.");
  }
});

// READ: Obter todas as tarefas
app.get('/tarefas', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM tarefas ORDER BY id ASC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao buscar tarefas.");
  }
});

// READ: Obter uma tarefa específica por ID
app.get('/tarefas/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await db.query('SELECT * FROM tarefas WHERE id = $1', [id]);
    if (rows.length === 0) {
      return res.status(404).send('Tarefa não encontrada.');
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao buscar a tarefa.");
  }
});

// UPDATE: Atualizar uma tarefa
app.put('/tarefas/:id', async (req, res) => {
  const { id } = req.params;
  const { descricao, concluida } = req.body;
  if (descricao === undefined || concluida === undefined) {
    return res.status(400).send('Os campos "descricao" e "concluida" são obrigatórios.');
  }
  try {
    const { rows } = await db.query('UPDATE tarefas SET descricao = $1, concluida = $2 WHERE id = $3 RETURNING *', [descricao, concluida, id]);
    if (rows.length === 0) {
      return res.status(404).send('Tarefa não encontrada para atualização.');
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao atualizar a tarefa.");
  }
});

// DELETE: Deletar uma tarefa
app.delete('/tarefas/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('DELETE FROM tarefas WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      return res.status(404).send('Tarefa não encontrada para deletar.');
    }
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao deletar a tarefa.");
  }
});


// "Liga" o servidor
app.listen(port, () => {
  console.log(\`Servidor rodando em http://localhost:\${port}\`);
});
  `.trim();
}
