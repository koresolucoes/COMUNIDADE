// This is a Vercel serverless function that acts as a CORS proxy for the Node.js runtime.

const readBody = (req: any): Promise<any> => {
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

export default async (req: any, res: any) => {
  const writeError = (statusCode: number, message: string) => {
    res.statusCode = statusCode;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.end(JSON.stringify({ error: message }));
  };

  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.end('Method Not Allowed');
    return;
  }

  try {
    const { url, method, headers, body } = await readBody(req);

    if (!url || !method) {
      return writeError(400, 'URL e método são obrigatórios.');
    }

    const targetResponse = await fetch(url, {
      method,
      headers,
      body: body,
      redirect: 'follow',
    });

    const responseBody = await targetResponse.text();
    const responseHeaders: Record<string, string> = {};
    targetResponse.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    const proxyResponseData = {
      status: targetResponse.status,
      statusText: targetResponse.statusText,
      headers: responseHeaders,
      body: responseBody,
    };

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.end(JSON.stringify(proxyResponseData));

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro interno do proxy.';
    return writeError(500, message);
  }
};
