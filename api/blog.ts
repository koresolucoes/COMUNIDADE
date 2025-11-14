/// <reference types="node" />

// This is a Vercel serverless function for the Node.js runtime to manage blog posts.
import { createClient } from '@supabase/supabase-js';

// Supabase client is created once using service role key from environment variables
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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

const readRequestBody = async (req: any): Promise<any> => {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(Buffer.from(chunk));
  }
  const body = Buffer.concat(chunks).toString('utf-8');
  try {
    return JSON.parse(body);
  } catch {
    throw new Error('Corpo da requisição não é um JSON válido.');
  }
};

const handleGet = async (req: any, res: any) => {
    const { slug } = req.query || {};

    try {
        if (slug) {
            // Fetch a single post from Supabase
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
            // Fetch all posts from Supabase
            const { data, error } = await supabase
                .from('posts')
                .select('*')
                .order('date', { ascending: false });

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

    // Validate the user's JWT token using the Supabase admin client
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
        res.statusCode = 401;
        return res.end(JSON.stringify({ error: 'Token inválido ou expirado.' }));
    }

    try {
        const { title, author, summary, content } = await readRequestBody(req);

        if (!title || !author || !summary || !content) {
            res.statusCode = 400;
            return res.end(JSON.stringify({ error: 'Campos title, author, summary e content são obrigatórios.' }));
        }

        const slug = slugify(title) + '-' + Date.now().toString(36);
        const newPost = {
            slug,
            title,
            author,
            summary,
            content,
            date: new Date().toISOString().split('T')[0], // Formato YYYY-MM-DD
            user_id: user.id
        };

        const { data: insertedPost, error: insertError } = await supabase
            .from('posts')
            .insert(newPost)
            .select()
            .single();

        if (insertError) throw insertError;
        
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

export default async (req: any, res: any) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }
  
  if (req.method === 'GET') {
    await handleGet(req, res);
  } else if (req.method === 'POST') {
    await handlePost(req, res);
  } else {
    res.statusCode = 405;
    res.setHeader('Allow', 'GET, POST');
    res.end(JSON.stringify({ error: `Método ${req.method} não permitido.` }));
  }
};
