// This is a Vercel serverless function to handle webhook testing for the Node.js runtime.
import { promises as fs } from 'node:fs';
import path from 'node:path';

// Vercel provides a writable /tmp directory
const STORAGE_DIR = '/tmp/webhook-kore-data';

// A simple in-memory lock to prevent race conditions on file access.
const locks = new Map<string, boolean>();

const acquireLock = async (file: string) => {
    while (locks.get(file)) {
        await new Promise(resolve => setTimeout(resolve, 50)); // wait 50ms
    }
    locks.set(file, true);
};

const releaseLock = (file: string) => {
    locks.delete(file);
};

// Ensure storage directory exists at cold start
fs.mkdir(STORAGE_DIR, { recursive: true }).catch(console.error);

async function readJsonFile(filePath: string): Promise<any[]> {
    try {
        await fs.access(filePath);
        const content = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(content);
    } catch (error) {
        return []; // File doesn't exist or is empty, return empty array
    }
}

async function writeJsonFile(filePath: string, data: any[]): Promise<void> {
    await fs.writeFile(filePath, JSON.stringify(data), 'utf-8');
}

const readRequestBody = (req: any): Promise<string> => {
    return new Promise((resolve) => {
        let body = '';
        req.on('data', (chunk: any) => {
            body += chunk.toString();
        });
        req.on('end', () => {
            resolve(body);
        });
    });
};


export default async (req: any, res: any) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    // Path format: /api/webhook/{action}/{uuid}
    const pathParts = url.pathname.split('/').filter(p => p);
    
    if (pathParts.length < 4 || pathParts[0] !== 'api' || pathParts[1] !== 'webhook') {
        res.statusCode = 400;
        res.end('Invalid path structure.');
        return;
    }

    const [, , action, uuid] = pathParts;
    const sanitizedUuid = uuid.replace(/[^a-zA-Z0-9-]/g, ''); // Basic sanitization
    const filePath = path.join(STORAGE_DIR, `${sanitizedUuid}.json`);

    // --- ACTION: test (receives a webhook) ---
    if (action === 'test') {
        const body = await readRequestBody(req);
        const headers: Record<string, string> = {};
        for (const [key, value] of Object.entries(req.headers)) {
            if (value !== undefined) {
                // FIX: Explicitly convert header value to string to handle potential non-string types.
                headers[key] = Array.isArray(value) ? value.join(', ') : String(value);
            }
        }

        const query: Record<string, string> = {};
        url.searchParams.forEach((value, key) => {
            query[key] = value;
        });

        const newRequest = {
            id: crypto.randomUUID(),
            method: req.method,
            headers,
            query,
            body,
            receivedAt: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        };

        await acquireLock(filePath);
        try {
            const existingRequests = await readJsonFile(filePath);
            existingRequests.unshift(newRequest); // Add to the beginning
            if (existingRequests.length > 50) {
                existingRequests.length = 50;
            }
            await writeJsonFile(filePath, existingRequests);
        } finally {
            releaseLock(filePath);
        }
        
        res.statusCode = 200;
        res.end('Webhook received');
        return;
    }

    // --- ACTION: poll (client checks for new webhooks) ---
    if (action === 'poll' && req.method === 'GET') {
        let requests: any[] = [];
        await acquireLock(filePath);
        try {
            requests = await readJsonFile(filePath);
            if (requests.length > 0) {
                await writeJsonFile(filePath, []);
            }
        } finally {
            releaseLock(filePath);
        }

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(requests));
        return;
    }

    // --- ACTION: clear (client is closing/clearing) ---
    if (action === 'clear') {
         await acquireLock(filePath);
         try {
            await fs.unlink(filePath).catch(() => {}); // Ignore error if file doesn't exist
         } finally {
            releaseLock(filePath);
         }
         res.statusCode = 200;
         res.end('Session cleared');
         return;
    }

    res.statusCode = 404;
    res.end('Not Found');
};
