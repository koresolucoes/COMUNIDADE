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
-   **Descrição**: Retorna uma lista paginada de todos os posts do blog ou um post específico se o parâmetro `slug` for fornecido.
-   **Autenticação**: Não requerida.

#### Parâmetros de Query

-   `slug` (opcional): O slug único de um post para obter apenas aquele post. Se fornecido, os parâmetros de paginação são ignorados.
-   `page` (opcional): O número da página a ser retornada. Padrão: `1`.
-   `limit` (opcional): O número de posts por página. Padrão: `6`.

#### Resposta (Listagem Paginada)

A resposta para uma listagem é um objeto contendo os dados e a contagem total de todos os posts no banco.

```json
{
  "data": [
    {
      "id": "uuid-do-post-1",
      "slug": "meu-post-1",
      "title": "Meu Post 1",
      "author": "Autor",
      "summary": "Resumo...",
      "content": "...",
      "published_at": "2024-07-29T18:30:00.000Z",
      "user_id": "uuid-do-usuario"
    }
  ],
  "count": 50
}
```

#### Resposta (Post Específico)

A resposta para um post específico (usando `?slug=...`) é o objeto do post diretamente.

```json
{
  "id": "uuid-do-post-1",
  "slug": "meu-post-1",
  "title": "Meu Post 1",
  "..." : "..."
}
```

#### Exemplo: Listar a segunda página de posts

```bash
# Pede a página 2, com 6 itens por página
curl -X GET "https://<URL_DA_SUA_APP>/api/blog?page=2&limit=6"
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
  "content": "Estou com dificuldades para passar um header de autenticação...",
  "user_id": "uuid-do-usuario-a-ser-personificado"
}
```
**Nota sobre `user_id`**:
- Ao usar um **token JWT**, o `user_id` é ignorado; a postagem é sempre associada ao dono do token.
- Ao usar a **chave mestra**, o `user_id` é **opcional**:
    - Se você **incluir** um `user_id`, a postagem será criada em nome daquele usuário (impersonação).
    - Se você **omitir** o `user_id`, a postagem será atribuída ao primeiro usuário registrado no sistema (geralmente um administrador), pois a autoria é obrigatória no fórum.

#### Corpo da Requisição (JSON) - Criar Comentário

Para criar um comentário, inclua o `topicId` do tópico ao qual ele pertence.

```json
{
  "topicId": "uuid-do-topico-existente",
  "content": "Claro! Você precisa usar a aba 'Headers'...",
  "user_id": "uuid-do-usuario-a-ser-personificado"
}
```
**Nota sobre `user_id`**: O comportamento é o mesmo da criação de tópicos. É opcional ao usar a chave mestra.

#### Exemplo com `curl` (Criar Tópico com Chave Mestra como Admin)

```bash
curl -X POST "https://<URL_DA_SUA_APP>/api/forum" \
-H "Authorization: Bearer <SUA_CHAVE_MESTRA>" \
-H "Content-Type: application/json" \
-d '{
  "title": "Anúncio Importante do Sistema",
  "content": "A plataforma estará em manutenção no próximo domingo."
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

---

## Webhook Notifications

O sistema pode enviar notificações via webhook para um endpoint configurado sempre que um novo conteúdo for criado. Isso é útil para integrações com outras plataformas, como Discord, Slack ou n8n.

### Configuração

Para habilitar os webhooks, configure as seguintes variáveis de ambiente no seu servidor:

-   `WEBHOOK_URL_NOTIFICATIONS`: A URL do endpoint que receberá as notificações `POST`.
-   `WEBHOOK_SECRET` (opcional): Um segredo que será enviado no cabeçalho `X-Kore-Signature` para que você possa verificar a autenticidade da requisição.

### Verificação de Assinatura

Se `WEBHOOK_SECRET` estiver configurado, cada requisição de webhook incluirá o cabeçalho:

```
X-Kore-Signature: <SEU_WEBHOOK_SECRET>
```

Você deve comparar o valor deste cabeçalho com o seu segredo para garantir que a requisição é legítima.

### Eventos e Payloads

As notificações são enviadas como uma requisição `POST` com um corpo JSON.

#### Estrutura Comum do Payload

```json
{
  "event": "event.type.string",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "data": { ... }
}
```

-   `event`: O tipo de evento que acionou o webhook.
-   `timestamp`: O timestamp ISO 8601 de quando o evento ocorreu.
-   `data`: O objeto de dados completo que foi criado.

---

#### 1. Novo Post no Blog

-   **Evento**: `blog.post.created`
-   **Descrição**: Acionado quando um novo post é publicado no blog.
-   **Payload (`data`)**: O objeto completo do post.

##### Exemplo

```json
{
  "event": "blog.post.created",
  "timestamp": "2024-07-29T18:30:00.000Z",
  "data": {
    "id": "uuid-do-post",
    "slug": "meu-novo-post-1a2b3c",
    "title": "Meu Novo Post Incrível",
    "author": "Nome do Autor",
    "summary": "Um resumo conciso.",
    "content": "<p>Conteúdo em HTML.</p>",
    "published_at": "2024-07-29T18:30:00.000Z",
    "user_id": "uuid-do-usuario-autor"
  }
}
```

---

#### 2. Novo Tópico no Fórum

-   **Evento**: `forum.topic.created`
-   **Descrição**: Acionado quando um novo tópico é criado no fórum.
-   **Payload (`data`)**: O objeto completo do tópico.

##### Exemplo

```json
{
  "event": "forum.topic.created",
  "timestamp": "2024-07-29T18:35:00.000Z",
  "data": {
    "id": "uuid-do-topico",
    "created_at": "2024-07-29T18:35:00.000Z",
    "updated_at": "2024-07-29T18:35:00.000Z",
    "title": "Dúvida sobre o nó HTTP Request",
    "content": "Estou com dificuldades para passar um header...",
    "user_id": "uuid-do-usuario-autor",
    "view_count": 0,
    "comment_count": 0
  }
}
```

---

#### 3. Novo Comentário no Fórum

-   **Evento**: `forum.comment.created`
-   **Descrição**: Acionado quando um novo comentário é adicionado a um tópico do fórum.
-   **Payload (`data`)**: O objeto completo do comentário.

##### Exemplo

```json
{
  "event": "forum.comment.created",
  "timestamp": "2024-07-29T18:40:00.000Z",
  "data": {
    "id": "uuid-do-comentario",
    "created_at": "2024-07-29T18:40:00.000Z",
    "content": "Claro! Você precisa usar a aba 'Headers'...",
    "user_id": "uuid-do-usuario-autor",
    "topic_id": "uuid-do-topico-pai"
  }
}
```