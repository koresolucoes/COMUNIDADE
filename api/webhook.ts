// This is a Vercel serverless function to handle webhook testing.
// It uses the /tmp directory for ephemeral storage, which is suitable for this use case.
// NOTE: This will not work in a multi-region deployment as /tmp is not shared.
// It's a best-effort implementation for a simple, stateless environment.

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


export default async (req: Request) => {
    const url = new URL(req.url, `http://${req.headers.get('host')}`);
    // Path format: /api/webhook/{action}/{uuid}
    const pathParts = url.pathname.split('/').filter(p => p);
    
    if (pathParts.length !== 4 || pathParts[0] !== 'api' || pathParts[1] !== 'webhook') {
        return new Response('Invalid path structure.', { status: 400 });
    }

    const [, , action, uuid] = pathParts;
    const sanitizedUuid = uuid.replace(/[^a-zA-Z0-9-]/g, ''); // Basic sanitization
    const filePath = path.join(STORAGE_DIR, `${sanitizedUuid}.json`);

    // --- ACTION: test (receives a webhook) ---
    if (action === 'test') {
        const body = await req.text();
        const headers: Record<string, string> = {};
        req.headers.forEach((value, key) => {
            headers[key] = value;
        });

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
            // Limit to 50 requests to prevent abuse
            if (existingRequests.length > 50) {
                existingRequests.length = 50;
            }
            await writeJsonFile(filePath, existingRequests);
        } finally {
            releaseLock(filePath);
        }
        
        return new Response('Webhook received', { status: 200 });
    }

    // --- ACTION: poll (client checks for new webhooks) ---
    if (action === 'poll' && req.method === 'GET') {
        let requests: any[] = [];
        await acquireLock(filePath);
        try {
            requests = await readJsonFile(filePath);
            // Clear the file after polling to not send the same requests again
            if (requests.length > 0) {
                await writeJsonFile(filePath, []);
            }
        } finally {
            releaseLock(filePath);
        }

        return new Response(JSON.stringify(requests), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    // --- ACTION: clear (client is closing/clearing) ---
    if (action === 'clear') {
         await acquireLock(filePath);
         try {
            await fs.unlink(filePath);
         } catch (e) {
            // Ignore error if file doesn't exist
         } finally {
            releaseLock(filePath);
         }
         return new Response('Session cleared', { status: 200 });
    }


    return new Response('Not Found', { status: 404 });
};
