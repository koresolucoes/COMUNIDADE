import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-conectando-app-banco-dados',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './conectando-app-banco-dados.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConectandoAppBancoDadosComponent {
  npmInstallPg = `npm install pg`;
  
  dotenvInstall = `npm install dotenv`;

  envFile = `
# Configurações do Banco de Dados PostgreSQL
DB_USER=seu_usuario
DB_HOST=localhost
DB_DATABASE=seu_banco
DB_PASSWORD=sua_senha_segura
DB_PORT=5432
  `.trim();

  gitignoreFile = `
node_modules
.env
  `.trim();
  
  dbJsFile = `
// 1. Importa a biblioteca 'dotenv' para carregar as variáveis de ambiente
require('dotenv').config();

// 2. Importa o construtor 'Pool' da biblioteca 'pg'
const { Pool } = require('pg');

// 3. Cria uma nova instância do Pool com as configurações do .env
// O Pool gerencia múltiplas conexões para otimizar o desempenho.
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// 4. Exporta uma função 'query' que usa o pool para executar consultas
module.exports = {
  query: (text, params) => pool.query(text, params),
};
  `.trim();

  indexJsFinal = `
const express = require('express');
// 1. Importa nosso módulo de banco de dados recém-criado
const db = require('./db');

const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/sobre', (req, res) => {
  res.send('Esta é a página sobre o nosso primeiro servidor!');
});

// 2. Cria uma nova rota para testar a conexão com o banco
app.get('/test-db', async (req, res) => {
  try {
    // 3. Executa uma consulta simples para pegar a data e hora atual do banco
    const result = await db.query('SELECT NOW()');
    // 4. Envia o resultado da consulta de volta para o navegador
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao conectar ao banco de dados');
  }
});

app.listen(port, () => {
  console.log(\`Servidor rodando em http://localhost:\${port}\`);
});
  `.trim();

  testDbResult = `
[
  {
    "now": "2024-07-31T14:30:00.123Z"
  }
]
  `.trim();
}
