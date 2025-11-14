// This is a Vercel serverless function for the Node.js runtime to proxy n8n API requests.

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
        resolve({});
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
  
  const writeSuccess = (data: any, headers: Headers) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', headers.get('content-type') || 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.end(JSON.stringify(data));
  };
  
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    return writeError(405, 'Método não permitido.');
  }

  try {
    const { n8nUrl, apiKey, endpoint, method, body } = await readBody(req);
    
    if (!n8nUrl || !apiKey || !endpoint || !method) {
      return writeError(400, 'Parâmetros n8nUrl, apiKey, endpoint e method são obrigatórios.');
    }

    const finalUrl = `${n8nUrl}/api/v1${endpoint}`;

    const requestOptions: RequestInit = {
      method,
      headers: {
        'Accept': 'application/json',
        'X-N8N-API-KEY': apiKey,
      },
      redirect: 'follow',
    };
    
    if (body && (method === 'POST' || method === 'PUT')) {
      (requestOptions.headers as HeadersInit)['Content-Type'] = 'application/json';
      requestOptions.body = JSON.stringify(body);
    }
    
    const n8nResponse = await fetch(finalUrl, requestOptions);
    
    const responseBody = await n8nResponse.json();

    if (!n8nResponse.ok) {
      const errorMessage = responseBody.message || `n8n API retornou status ${n8nResponse.status}`;
      return writeError(n8nResponse.status, errorMessage);
    }
    
    writeSuccess(responseBody, n8nResponse.headers);

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro interno do proxy n8n.';
    return writeError(500, message);
  }
};