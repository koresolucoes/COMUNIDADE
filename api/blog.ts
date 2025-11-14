// This is a Vercel serverless function for the Node.js runtime to manage blog posts.
import { promises as fs } from 'node:fs';
import path from 'node:path';

const STORAGE_DIR = '/tmp/kore-blog-posts';
const SECRET_API_KEY = 'kore-secret-blog-key'; // Em um app real, isso viria de variáveis de ambiente.

// Garante que o diretório de armazenamento exista no início.
fs.mkdir(STORAGE_DIR, { recursive: true }).catch(console.error);

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
            // Retorna um único post
            const filePath = path.join(STORAGE_DIR, `${slug}.json`);
            const content = await fs.readFile(filePath, 'utf-8');
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(content);
        } else {
            // Retorna todos os posts
            const files = await fs.readdir(STORAGE_DIR);
            const posts = [];
            for (const file of files) {
                if (file.endsWith('.json')) {
                    const content = await fs.readFile(path.join(STORAGE_DIR, file), 'utf-8');
                    posts.push(JSON.parse(content));
                }
            }
            // Ordena do mais novo para o mais antigo
            posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(posts));
        }
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
            res.statusCode = 404;
            res.end(JSON.stringify({ error: 'Post não encontrado.' }));
        } else {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: 'Erro ao ler os posts.' }));
        }
    }
};

const handlePost = async (req: any, res: any) => {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.split(' ')[1];

    // TODO: Mudar para validação de JWT do Supabase
    // Para uma segurança real, o token JWT do usuário logado deve ser validado aqui.
    // Isso requer as variáveis de ambiente SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY
    // e uma biblioteca como '@supabase/supabase-js' ou 'jsonwebtoken'.
    // Exemplo com @supabase/supabase-js em um ambiente Node.js padrão:
    //
    // import { createClient } from '@supabase/supabase-js';
    // const supabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    // const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    // if (error) {
    //   res.statusCode = 401;
    //   res.end(JSON.stringify({ error: 'Token inválido.' }));
    //   return;
    // }
    //
    // Por enquanto, usamos uma chave estática para o n8n ou outros serviços automatizados.
    if (token !== SECRET_API_KEY) {
        res.statusCode = 401;
        res.end(JSON.stringify({ error: 'Não autorizado.' }));
        return;
    }

    try {
        const { title, author, summary, content } = await readRequestBody(req);

        if (!title || !author || !summary || !content) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Campos title, author, summary e content são obrigatórios.' }));
            return;
        }

        const slug = slugify(title) + '-' + Date.now().toString(36);
        const newPost = {
            slug,
            title,
            author,
            summary,
            content,
            date: new Date().toISOString().split('T')[0], // Formato YYYY-MM-DD
        };

        const filePath = path.join(STORAGE_DIR, `${slug}.json`);
        await fs.writeFile(filePath, JSON.stringify(newPost, null, 2), 'utf-8');
        
        res.statusCode = 201;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(newPost));

    } catch (error) {
        const message = error instanceof Error ? error.message : 'Erro interno do servidor.';
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