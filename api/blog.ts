// This is a Vercel serverless function for the Node.js runtime to manage blog posts.
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

const slugify = (text: string) => {
  const a = 'àáâäæãåāăąçćčđďèéêëēėęěğǵḧîïíīįìłḿñńǹňôöòóœøōõőṕŕřßśšşșťțûüùúūǘůűųẃẍÿýžźż·/_,:;'
  const b = 'aaaaaaaaaacccddeeeeeeeegghiiiiiilmnnnnoooooooooprrsssssttuuuuuuuuuwxyyzzz------'
  const p = new RegExp(a.split('').join('|'), 'g')

  return text.toString().toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(p, c => b.charAt(a.indexOf(c))) // Replace special characters
    .replace(/&/g, '-and-') // Replace & with 'and'
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, '') // Trim - from end of text
}

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

const handleGet = async (req: any, res: any) => {
    const { slug } = req.query || {};

    try {
        if (slug) {
            const { data, error } = await supabase
                .from('posts')
                .select('*')
                .eq('slug', slug)
                .single();

            if (error || !data) {
              res.statusCode = 404;
              return res.end(JSON.stringify({ error: 'Post não encontrado.' }));
            }
            
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(data));
        } else {
            const { data, error } = await supabase
                .from('posts')
                .select('*')
                .order('published_at', { ascending: false });

            if (error) throw error;
            
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(data));
        }
    } catch (error) {
        console.error('Supabase GET error:', error);
        res.statusCode = 500;
        res.end(JSON.stringify({ error: 'Erro ao buscar os posts no banco de dados.' }));
    }
};

const handlePost = async (req: any, res: any) => {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.split(' ')[1];

    if (!token) {
        res.statusCode = 401;
        return res.end(JSON.stringify({ error: 'Token de autenticação não fornecido.' }));
    }

    let userId: string | null = null;
    const masterKey = process.env.MASTER_BLOG_KEY;

    if (masterKey && token === masterKey) {
        userId = null; 
    } else {
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) {
            res.statusCode = 401;
            return res.end(JSON.stringify({ error: 'Token inválido ou expirado.' }));
        }
        userId = user.id;
    }

    try {
        const { title, author, summary, content } = await readRequestBody(req);

        if (!title || !author || !summary || !content) {
            res.statusCode = 400;
            return res.end(JSON.stringify({ error: 'Campos title, author, summary e content são obrigatórios.' }));
        }

        if (typeof content !== 'string') {
            res.statusCode = 400;
            return res.end(JSON.stringify({ error: 'O campo "content" deve ser uma string de texto contendo HTML.' }));
        }

        const slug = slugify(title) + '-' + Date.now().toString(36);
        const newPost = {
            slug,
            title,
            author,
            summary,
            content,
            published_at: new Date().toISOString(),
            user_id: userId
        };

        const { data: insertedPost, error: insertError } = await supabase
            .from('posts')
            .insert(newPost)
            .select()
            .single();

        if (insertError) throw insertError;
        
        // Send webhook notification
        await sendWebhookNotification('blog.post.created', insertedPost);

        res.statusCode = 201;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(insertedPost));

    } catch (error) {
        console.error('Supabase POST error:', error);
        const message = error instanceof Error ? error.message : 'Erro interno do servidor ao criar o post.';
        res.statusCode = 500;
        res.end(JSON.stringify({ error: message }));
    }
};

const handleUpdate = async (req: any, res: any) => {
    const { slug } = req.query || {};
    if (!slug) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ error: 'O parâmetro "slug" é obrigatório para atualizar um post.' }));
    }

    const authHeader = req.headers.authorization || '';
    const token = authHeader.split(' ')[1];

    if (!token) {
        res.statusCode = 401;
        return res.end(JSON.stringify({ error: 'Token de autenticação não fornecido.' }));
    }

    const masterKey = process.env.MASTER_BLOG_KEY;

    try {
        const body = await readRequestBody(req);
        const { title, author, summary, content } = body;
        
        const updateData: any = {};
        if (title) updateData.title = title;
        if (author) updateData.author = author;
        if (summary) updateData.summary = summary;
        if (content) updateData.content = content;

        if (Object.keys(updateData).length === 0) {
            res.statusCode = 400;
            return res.end(JSON.stringify({ error: 'Pelo menos um campo (title, author, summary, content) deve ser fornecido para atualização.' }));
        }

        const query = supabase.from('posts').update(updateData).eq('slug', slug);

        if (!masterKey || token !== masterKey) {
            const { data: { user }, error: authError } = await supabase.auth.getUser(token);
            if (authError || !user) {
                res.statusCode = 401;
                return res.end(JSON.stringify({ error: 'Token inválido ou você não tem permissão para editar este post.' }));
            }
            query.eq('user_id', user.id);
        }

        const { data: updatedPost, error: updateError } = await query.select().single();

        if (updateError) throw updateError;

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(updatedPost));
    } catch (error) {
        console.error('Supabase PUT/PATCH error:', error);
        res.statusCode = 500;
        res.end(JSON.stringify({ error: 'Erro ao atualizar o post.' }));
    }
};

const handleDelete = async (req: any, res: any) => {
    const { slug } = req.query || {};
    if (!slug) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ error: 'O parâmetro "slug" é obrigatório para deletar um post.' }));
    }

    const authHeader = req.headers.authorization || '';
    const token = authHeader.split(' ')[1];

    if (!token) {
        res.statusCode = 401;
        return res.end(JSON.stringify({ error: 'Token de autenticação não fornecido.' }));
    }

    const masterKey = process.env.MASTER_BLOG_KEY;
    
    try {
        const query = supabase.from('posts').delete().eq('slug', slug);

        if (!masterKey || token !== masterKey) {
             const { data: { user }, error: authError } = await supabase.auth.getUser(token);
            if (authError || !user) {
                res.statusCode = 401;
                return res.end(JSON.stringify({ error: 'Token inválido ou você não tem permissão para deletar este post.' }));
            }
            query.eq('user_id', user.id);
        }
        
        const { error: deleteError } = await query;
        if (deleteError) throw deleteError;
        
        res.statusCode = 204;
        res.end();
    } catch (error) {
        console.error('Supabase DELETE error:', error);
        res.statusCode = 500;
        res.end(JSON.stringify({ error: 'Erro ao deletar o post.' }));
    }
};


const handleRequest = async (req: any, res: any) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }
  
  switch (req.method) {
    case 'GET':
      await handleGet(req, res);
      break;
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
      res.setHeader('Allow', 'GET, POST, PUT, PATCH, DELETE');
      res.end(JSON.stringify({ error: `Método ${req.method} não permitido.` }));
  }
};

export default handleRequest;