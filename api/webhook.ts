/// <reference types="node" />

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

const readRequestBody = async (req: any): Promise<string> => {
    const chunks = [];
    for await (const chunk of req) {
        chunks.push(Buffer.from(chunk));
    }
    return Buffer.concat(chunks).toString('utf-8');
};


export default async (req: any, res: any) => {
    // Rely on Vercel's parsed query object for all query parameters.
    const { action, uuid } = req.query || {};

    if (!uuid) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Parâmetro "uuid" é obrigatório.' }));
        return;
    }

    const sanitizedUuid = String(uuid).replace(/[^a-zA-Z0-9-]/g, ''); // Basic sanitization
    const filePath = path.join(STORAGE_DIR, `${sanitizedUuid}.json`);

    // --- ACTION: poll (client checks for new webhooks) ---
    if (action === 'poll' && req.method === 'GET') {
        let requests: any[] = [];
        await acquireLock(filePath);
        try {
            requests = await readJsonFile(filePath);
            if (requests.length > 0) {
                // Atomically read and clear
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
    if (action === 'clear' && req.method === 'POST') {
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

    // --- ACTION: test / default (receives a webhook) ---
    if (!action || action === 'test') {
        const body = await readRequestBody(req);
        
        // Ensure headers and query are always valid objects to prevent frontend errors.
        const headers: Record<string, string> = {};
        if (req.headers && typeof req.headers === 'object') {
            for (const key in req.headers) {
                const value = req.headers[key];
                if (value !== undefined) {
                    headers[key] = Array.isArray(value) ? value.join(', ') : String(value);
                }
            }
        }

        const query: Record<string, string> = {};
        if (req.query && typeof req.query === 'object') {
            for (const key in req.query) {
                 if (key !== 'uuid' && key !== 'action') {
                    const value = req.query[key];
                    query[key] = Array.isArray(value) ? value.join(', ') : String(value);
                }
            }
        }

        const newRequest = {
            id: crypto.randomUUID(),
            method: req.method || 'UNKNOWN',
            headers: headers, // Guaranteed to be an object
            query: query,     // Guaranteed to be an object
            body,
            receivedAt: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        };
        
        // Add detailed logging as requested for easier debugging
        console.log('--- KORE WEBHOOK CAPTURED ---');
        console.log(JSON.stringify(newRequest, null, 2));
        console.log('-----------------------------');

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

    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Ação desconhecida ou método HTTP inválido para a ação.' }));
};