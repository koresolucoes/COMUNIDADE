// This is a Vercel serverless function for the Node.js runtime to manage forum posts.
import { createClient } from '@supabase/supabase-js';

// Supabase client is created once using service role key from environment variables
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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
        resolve({}); // Resolve with empty object if no body
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
        if (!body.user_id) {
            res.statusCode = 400;
            return res.end(JSON.stringify({ error: 'O campo "user_id" é obrigatório ao usar a chave mestra.' }));
        }
        userId = body.user_id;
    } else {
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

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


export default async (req: any, res: any) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }
  
  if (req.method === 'POST') {
    await handlePost(req, res);
  } else {
    res.statusCode = 405;
    res.setHeader('Allow', 'POST');
    res.end(JSON.stringify({ error: `Método ${req.method} não permitido.` }));
  }
};