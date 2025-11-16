import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-hello-world-nodejs',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './hello-world-nodejs.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HelloWorldNodejsComponent {
  bashSnippet = `
# 1. Crie uma pasta para o projeto e entre nela
mkdir meu-primeiro-servidor
cd meu-primeiro-servidor

# 2. Inicie um projeto Node.js. Isso cria o arquivo package.json
npm init -y

# 3. Instale o Express.js. Isso o adiciona ao projeto e o lista no package.json
npm install express

# 4. Crie o arquivo onde escreveremos nosso código
touch index.js`.trim();

  indexJsSnippet = `
// 1. Importa a biblioteca Express que acabamos de instalar.
const express = require('express');

// 2. Cria uma "instância" da nossa aplicação. 'app' será nosso servidor.
const app = express();

// 3. Define a "porta" onde nosso servidor vai ouvir por pedidos. Pense nela como o número de um apartamento.
const port = 3000;

// 4. Define o que acontece quando alguém acessa a rota principal ('/').
//    req = Requisição (o pedido que chega do navegador).
//    res = Resposta (o que vamos enviar de volta).
app.get('/', (req, res) => {
  // 5. Envia o texto "Hello World!" como resposta para o navegador.
  res.send('Hello World!');
});

// 6. "Liga" o servidor e o faz começar a ouvir na porta que definimos.
app.listen(port, () => {
  console.log(\`Servidor rodando em http://localhost:\${port}\`);
});`.trim();

  runServerSnippet = `node index.js`;

  sobreRouteSnippet = `
// Adicione esta parte ao seu index.js
app.get('/sobre', (req, res) => {
  res.send('Esta é a página sobre o nosso primeiro servidor!');
});`.trim();
}
