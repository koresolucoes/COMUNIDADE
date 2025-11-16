import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dockerizando-app-nodejs',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './dockerizando-app-nodejs.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DockerizandoAppNodejsComponent {
  dockerfileSnippet = `
# PASSO 1: A base da nossa "marmita". Usamos uma imagem oficial do Node.js
# 'alpine' é uma versão minúscula, ótima para produção.
FROM node:18-alpine

# PASSO 2: Cria uma pasta dentro do contêiner para colocar nosso código.
WORKDIR /app

# PASSO 3: Otimização! Copia APENAS os arquivos de dependências primeiro.
# O Docker faz cache de cada passo. Se esses arquivos não mudarem,
# ele não reinstalará as dependências toda vez, acelerando o build.
COPY package*.json ./

# PASSO 4: Instala as dependências do projeto.
RUN npm install

# PASSO 5: Agora sim, copia o resto do código da sua aplicação.
COPY . .

# PASSO 6: "Abre a porta" do contêiner para o mundo exterior.
# Informa ao Docker que a aplicação dentro do contêiner usa a porta 3000.
EXPOSE 3000

# PASSO 7: O comando que será executado quando o contêiner iniciar.
CMD [ "node", "index.js" ]`.trim();

  dockerignoreSnippet = `
# Ignora a pasta de dependências, pois elas serão instaladas DENTRO do contêiner
node_modules

# Ignora o arquivo de variáveis de ambiente para não vazar segredos
.env
  `.trim();

  buildSnippet = `
# O comando 'build' constrói a imagem.
# A flag '-t' dá um nome (tag) para a imagem (ex: 'minha-api-tarefas').
# O '.' no final diz ao Docker para procurar o Dockerfile na pasta atual.
docker build -t minha-api-tarefas .
  `.trim();

  runSnippet = `
# O comando 'run' cria e inicia um contêiner a partir de uma imagem.
# A flag '-p' mapeia uma porta do seu computador para uma porta do contêiner.
# Formato: -p <porta_no_seu_pc>:<porta_no_conteiner>
# A flag '--name' dá um nome fácil para o contêiner.
docker run -p 3000:3000 --name meu-container-api minha-api-tarefas
  `.trim();
}
