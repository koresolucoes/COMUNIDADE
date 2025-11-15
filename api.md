# Documentação da API - Kore: Hub de Automação

Esta documentação descreve como interagir com as APIs RESTful do Hub de Automação da Kore para gerenciar posts do blog e interações no fórum.

## Autenticação

Todas as requisições que modificam dados (`POST`, `PUT`, `PATCH`, `DELETE`) exigem um token de autenticação no cabeçalho `Authorization`.

Existem dois métodos de autenticação:

1.  **Token JWT do Supabase**: Para usuários logados na aplicação. O token é obtido após o login e representa um usuário específico.
2.  **Chave Mestra (Master Key)**: Uma chave secreta definida nas variáveis de ambiente do servidor (`MASTER_BLOG_KEY` ou `MASTER_FORUM_KEY`). Este método concede acesso administrativo e é ideal para automações de backend (ex: n8n, scripts).

**Formato do Cabeçalho:**

```
Authorization: Bearer <SEU_TOKEN_JWT_OU_CHAVE_MESTRA>
```

---

## API de Blog

Endpoint base: `/api/blog`

### 1. Obter Posts

-   **Método**: `GET`
-   **Descrição**: Retorna uma lista de todos os posts do blog ou um post específico se o parâmetro `slug` for fornecido.
-   **Autenticação**: Não requerida.

#### Parâmetros de Query

-   `slug` (opcional): O slug único de um post para obter apenas aquele post.

#### Exemplo: Listar todos os posts

```bash
curl -X GET "https://<URL_DA_SUA_APP>/api/blog"
```

#### Exemplo: Obter um post específico

```bash
curl -X GET "https://<URL_DA_SUA_APP>/api/blog?slug=como-automatizar-tarefas-1a2b3c"
```

### 2. Criar um Post

-   **Método**: `POST`
-   **Descrição**: Cria um novo post no blog.
-   **Autenticação**: Requerida.

#### Corpo da Requisição (JSON)

```json
{
  "title": "Meu Novo Post Incrível",
  "author": "Nome do Autor",
  "summary": "Um resumo conciso sobre o conteúdo do post.",
  "content": "<h2>Introdução</h2><p>Este é o conteúdo do post em formato <strong>HTML</strong>.</p>"
}
```

#### Exemplo com `curl`

```bash
curl -X POST "https://<URL_DA_SUA_APP>/api/blog" \
-H "Authorization: Bearer <SEU_TOKEN>" \
-H "Content-Type: application/json" \
-d '{
  "title": "Meu Novo Post Incrível",
  "author": "Nome do Autor",
  "summary": "Um resumo conciso.",
  "content": "<p>Conteúdo em HTML.</p>"
}'
```

### 3. Atualizar um Post

-   **Método**: `PUT` ou `PATCH`
-   **Descrição**: Atualiza um ou mais campos de um post existente.
-   **Autenticação**: Requerida. O usuário deve ser o autor do post ou usar a chave mestra.

#### Parâmetros de Query

-   `slug` (obrigatório): O slug do post a ser atualizado.

#### Corpo da Requisição (JSON)

Forneça apenas os campos que deseja atualizar.

```json
{
  "title": "Título Atualizado do Post",
  "summary": "Este resumo foi melhorado."
}
```

#### Exemplo com `curl`

```bash
curl -X PATCH "https://<URL_DA_SUA_APP>/api/blog?slug=meu-post-antigo-1a2b3c" \
-H "Authorization: Bearer <SEU_TOKEN>" \
-H "Content-Type: application/json" \
-d '{
  "summary": "Um resumo novo e atualizado."
}'
```

### 4. Deletar um Post

-   **Método**: `DELETE`
-   **Descrição**: Remove um post permanentemente.
-   **Autenticação**: Requerida. O usuário deve ser o autor do post ou usar a chave mestra.

#### Parâmetros de Query

-   `slug` (obrigatório): O slug do post a ser deletado.

#### Exemplo com `curl`

```bash
curl -X DELETE "https://<URL_DA_SUA_APP>/api/blog?slug=post-a-ser-deletado-1a2b3c" \
-H "Authorization: Bearer <SEU_TOKEN>"
```

---

## API do Fórum

Endpoint base: `/api/forum`

### 1. Criar um Tópico ou Comentário

-   **Método**: `POST`
-   **Descrição**: Cria um novo tópico ou um novo comentário em um tópico existente.
-   **Autenticação**: Requerida.

#### Corpo da Requisição (JSON) - Criar Tópico

```json
{
  "title": "Dúvida sobre o nó HTTP Request no n8n",
  "content": "Estou com dificuldades para passar um header de autenticação. Alguém pode me ajudar?",
  "user_id": "opcional-se-usando-chave-mestra-uuid-do-usuario"
}
```

#### Corpo da Requisição (JSON) - Criar Comentário

Para criar um comentário, inclua o `topicId` do tópico ao qual ele pertence.

```json
{
  "topicId": "uuid-do-topico-existente",
  "content": "Claro! Você precisa adicionar o header na aba 'Headers' do nó. O formato é 'Authorization' como chave e 'Bearer SEU_TOKEN' como valor.",
  "user_id": "opcional-se-usando-chave-mestra-uuid-do-usuario"
}
```

#### Exemplo com `curl` (Criar Tópico)

```bash
curl -X POST "https://<URL_DA_SUA_APP>/api/forum" \
-H "Authorization: Bearer <SEU_TOKEN>" \
-H "Content-Type: application/json" \
-d '{
  "title": "Dúvida sobre o nó HTTP Request",
  "content": "Como passo um header de autenticação?"
}'
```

### 2. Atualizar um Tópico ou Comentário

-   **Método**: `PUT` ou `PATCH`
-   **Descrição**: Atualiza o conteúdo de um tópico ou comentário.
-   **Autenticação**: Requerida. O usuário deve ser o autor ou usar a chave mestra.

#### Corpo da Requisição (JSON) - Atualizar Tópico

```json
{
  "topicId": "uuid-do-topico-a-ser-editado",
  "title": "Título corrigido do tópico",
  "content": "Conteúdo atualizado e mais detalhado."
}
```

#### Corpo da Requisição (JSON) - Atualizar Comentário

```json
{
  "commentId": "uuid-do-comentario-a-ser-editado",
  "content": "Correção: o formato correto do valor do header é 'Bearer SEU_TOKEN'."
}
```

#### Exemplo com `curl` (Atualizar Comentário)

```bash
curl -X PATCH "https://<URL_DA_SUA_APP>/api/forum" \
-H "Authorization: Bearer <SEU_TOKEN>" \
-H "Content-Type: application/json" \
-d '{
  "commentId": "123e4567-e89b-12d3-a456-426614174000",
  "content": "Conteúdo corrigido do comentário."
}'
```

### 3. Deletar um Tópico ou Comentário

-   **Método**: `DELETE`
-   **Descrição**: Remove um tópico ou comentário permanentemente.
-   **Autenticação**: Requerida. O usuário deve ser o autor ou usar a chave mestra.

#### Parâmetros de Query

-   `topicId` (obrigatório se deletando um tópico): O ID do tópico a ser deletado.
-   `commentId` (obrigatório se deletando um comentário): O ID do comentário a ser deletado.

#### Exemplo com `curl` (Deletar Tópico)

```bash
curl -X DELETE "https://<URL_DA_SUA_APP>/api/forum?topicId=123e4567-e89b-12d3-a456-426614174000" \
-H "Authorization: Bearer <SEU_TOKEN>"
```

#### Exemplo com `curl` (Deletar Comentário)

```bash
curl -X DELETE "https://<URL_DA_SUA_APP>/api/forum?commentId=789e0123-e89b-12d3-a456-426614174000" \
-H "Authorization: Bearer <SEU_TOKEN>"
```
