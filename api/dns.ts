// This is a Vercel serverless function for DNS lookups for the Node.js runtime.

export default async (req: any, res: any) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const domain = url.searchParams.get('domain');
  const type = url.searchParams.get('type');

  const writeError = (statusCode: number, message: string) => {
    res.statusCode = statusCode;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.end(JSON.stringify({ error: message }));
  };
  
  const writeSuccess = (data: any) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.end(JSON.stringify(data));
  };

  if (!domain || !type) {
    return writeError(400, 'Parâmetros "domain" e "type" são obrigatórios.');
  }

  try {
    // Using Google's Public DNS over HTTPS API
    const dnsApiUrl = `https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=${type}`;
    const dnsResponse = await fetch(dnsApiUrl, {
        headers: {
            'Accept': 'application/dns-json'
        }
    });

    if (!dnsResponse.ok) {
      throw new Error(`Google DNS API retornou o status ${dnsResponse.status}`);
    }

    const data = await dnsResponse.json();

    // The API returns a status code in the body. 0 means NOERROR.
    if (data.Status !== 0) {
      // Return an empty answer list for common cases like NXDOMAIN (3)
      if (data.Status === 3) {
          return writeSuccess({ Answer: [] });
      }
      throw new Error(`DNS query falhou com o status: ${data.Status}`);
    }

    return writeSuccess(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido no servidor.';
    return writeError(500, message);
  }
};
