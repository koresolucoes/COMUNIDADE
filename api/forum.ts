// This is a Vercel serverless function for the Node.js runtime to manage forum posts.
import { createClient } from '@supabase/supabase-js';

// Supabase client is created once using service role key from environment variables
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Webhook Notification Utility
const sendWebhookNotification = async (type: string, payload: any) => {
  const webhookUrl = process.env.WEBHOOK_URL_NOTIFICATIONS;
  const webhookSecret = process.env.WEBHOOK_SECRET;

  if (!webhookUrl) {
    console.log('WEBHOOK_URL_NOTIFICATIONS is not set. Skipping notification.');
    return;
  }

  const webhookPayload = {
    event: type,
    timestamp: new Date().toISOString(),
    data: payload
  };

  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    };
    if (webhookSecret) {
      headers['X-Kore-Signature'] = webhookSecret;
    }

    // Await the fetch to ensure it completes before the serverless function terminates.
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(webhookPayload)
    });

    if (!response.ok) {
        // Log the error but don't throw, as we don't want to fail the user's request.
        console.error(`Webhook for event ${type} failed with status ${response.status}:`, await response.text());
    } else {
        console.log(`Webhook notification sent for event: ${type}`);
    }
    
  } catch (error) {
    // This will catch errors in payload construction, etc.
    console.error(`Failed to send webhook for event ${type}:`, error);
  }
};

const readRequestBody = (req: any): Promise<any> => {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk: any) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      if (body) {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          reject(new Error('Corpo da requisição não é um JSON válido.'));
        }
      } else {
        resolve({});
      }
    });
    req.on('error', (err: any) => {
      reject(err);
    });
  });
};

const handlePost = async (req: any, res: any) => {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.split(' ')[1];

    if (!token) {
        res.statusCode = 401;
        return res.end(JSON.stringify({ error: 'Token de autenticação não fornecido.' }));
    }

    let userId: string | null = null;
    const body = await readRequestBody(req);
    const { topicId, title, content } = body;

    const masterKey = process.env.MASTER_FORUM_KEY || process.env.MASTER_BLOG_KEY;

    if (masterKey && token === masterKey) {
        if (body.user_id) {
            userId = body.user_id;
        } else {
            // The forum tables require a user_id (NOT NULL).
            // As a fallback for admin posts without a specified user,
            // we assign it to the first user created in the system (assumed to be an admin).
            // Fix: Changed destructuring of listUsers response to be more robust.
            const { data, error: adminError } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1 });
            
            if (adminError || !data || data.users.length === 0) {
                console.error('Forum API Master Key Error: Could not find a default user to assign the post to.', adminError);
                res.statusCode = 500;
                return res.end(JSON.stringify({ error: 'Não foi possível encontrar um usuário padrão para a postagem. Ao usar a chave mestra, forneça um "user_id" no corpo da requisição.' }));
            }
            userId = data.users[0].id;
        }
    } else {
        // Fix: Changed destructuring of getUser response to match updated API shape.
        const { data: user, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) {
            res.statusCode = 401;
            return res.end(JSON.stringify({ error: 'Token inválido ou expirado.' }));
        }
        userId = user.id;
    }

    try {
        if (topicId) { // Creating a comment
            if (!content) {
                res.statusCode = 400;
                return res.end(JSON.stringify({ error: 'O campo "content" é obrigatório para comentários.' }));
            }
            
            const { data: insertedComment, error: insertError } = await supabase
                .from('forum_comments')
                .insert({ topic_id: topicId, content, user_id: userId })
                .select()
                .single();
            
            if (insertError) throw insertError;
            
            await sendWebhookNotification('forum.comment.created', insertedComment);

            res.statusCode = 201;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(insertedComment));

        } else { // Creating a topic
            if (!title || !content) {
                res.statusCode = 400;
                return res.end(JSON.stringify({ error: 'Campos "title" e "content" são obrigatórios para tópicos.' }));
            }

            const { data: insertedTopic, error: insertError } = await supabase
                .from('forum_topics')
                .insert({ title, content, user_id: userId })
                .select()
                .single();

            if (insertError) throw insertError;
            
            await sendWebhookNotification('forum.topic.created', insertedTopic);
            
            res.statusCode = 201;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(insertedTopic));
        }

    } catch (error) {
        console.error('Supabase Forum POST error:', error);
        const message = error instanceof Error ? error.message : 'Erro interno do servidor.';
        res.statusCode = 500;
        res.end(JSON.stringify({ error: message }));
    }
};

const handleUpdate = async (req: any, res: any) => {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.split(' ')[1];
    if (!token) {
        res.statusCode = 401;
        return res.end(JSON.stringify({ error: 'Token de autenticação não fornecido.' }));
    }

    const body = await readRequestBody(req);
    const { topicId, commentId, title, content } = body;

    if (!topicId && !commentId) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ error: 'É necessário fornecer "topicId" ou "commentId".' }));
    }

    const masterKey = process.env.MASTER_FORUM_KEY || process.env.MASTER_BLOG_KEY;
    let isMaster = masterKey && token === masterKey;
    
    try {
        let query;
        const updateData: any = {};
        
        if (commentId) { // Updating a comment
            if (!content) {
                 res.statusCode = 400;
                 return res.end(JSON.stringify({ error: 'O campo "content" é obrigatório para atualizar comentários.' }));
            }
            updateData.content = content;
            query = supabase.from('forum_comments').update(updateData).eq('id', commentId);
        } else { // Updating a topic
            if (title) updateData.title = title;
            if (content) updateData.content = content;
            if (Object.keys(updateData).length === 0) {
                 res.statusCode = 400;
                 return res.end(JSON.stringify({ error: 'É necessário fornecer "title" ou "content" para atualizar um tópico.' }));
            }
            query = supabase.from('forum_topics').update(updateData).eq('id', topicId);
        }

        if (!isMaster) {
            // Fix: Changed destructuring of getUser response to match updated API shape.
            const { data: user, error: authError } = await supabase.auth.getUser(token);
            if (authError || !user) {
                res.statusCode = 401;
                return res.end(JSON.stringify({ error: 'Token inválido ou permissão negada.' }));
            }
            query.eq('user_id', user.id);
        }

        const { data: updatedData, error: updateError } = await query.select().single();
        if (updateError) throw updateError;
        
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(updatedData));
    } catch (error) {
        console.error('Supabase Forum PUT/PATCH error:', error);
        res.statusCode = 500;
        res.end(JSON.stringify({ error: 'Erro ao atualizar o item.' }));
    }
};

const handleDelete = async (req: any, res: any) => {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.split(' ')[1];
    if (!token) {
        res.statusCode = 401;
        return res.end(JSON.stringify({ error: 'Token de autenticação não fornecido.' }));
    }
    
    const { topicId, commentId } = req.query || {};

    if (!topicId && !commentId) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ error: 'É necessário fornecer o parâmetro "topicId" ou "commentId".' }));
    }

    const masterKey = process.env.MASTER_FORUM_KEY || process.env.MASTER_BLOG_KEY;
    let isMaster = masterKey && token === masterKey;

    try {
        let query;
        if (commentId) {
            query = supabase.from('forum_comments').delete().eq('id', commentId);
        } else {
            query = supabase.from('forum_topics').delete().eq('id', topicId);
        }

        if (!isMaster) {
            // Fix: Changed destructuring of getUser response to match updated API shape.
            const { data: user, error: authError } = await supabase.auth.getUser(token);
            if (authError || !user) {
                res.statusCode = 401;
                return res.end(JSON.stringify({ error: 'Token inválido ou permissão negada.' }));
            }
            query.eq('user_id', user.id);
        }

        const { error: deleteError } = await query;
        if (deleteError) throw deleteError;
        
        res.statusCode = 204;
        res.end();
    } catch (error) {
        console.error('Supabase Forum DELETE error:', error);
        res.statusCode = 500;
        res.end(JSON.stringify({ error: 'Erro ao deletar o item.' }));
    }
};

export default async (req: any, res: any) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }
  
  switch (req.method) {
    case 'POST':
      await handlePost(req, res);
      break;
    case 'PUT':
    case 'PATCH':
      await handleUpdate(req, res);
      break;
    case 'DELETE':
      await handleDelete(req, res);
      break;
    default:
      res.statusCode = 405;
      res.setHeader('Allow', 'POST, PUT, PATCH, DELETE');
      res.end(JSON.stringify({ error: `Método ${req.method} não permitido.` }));
  }
};