// This is a Vercel serverless function for DNS lookups.

export default async (req: Request) => {
  const url = new URL(req.url, `http://${req.headers.get('host')}`);
  const domain = url.searchParams.get('domain');
  const type = url.searchParams.get('type');

  if (!domain || !type) {
    return new Response(JSON.stringify({ error: 'Parâmetros "domain" e "type" são obrigatórios.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
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
          return new Response(JSON.stringify({ Answer: [] }), {
            status: 200,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
      }
      throw new Error(`DNS query falhou com o status: ${data.Status}`);
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido no servidor.';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
};
