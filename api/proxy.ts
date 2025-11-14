// This is a Vercel serverless function that acts as a CORS proxy.

export default async (req: Request) => {
  // Only allow POST requests for this proxy
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const { url, method, headers, body } = await req.json();

    if (!url || !method) {
      return new Response(JSON.stringify({ error: 'URL e método são obrigatórios.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    const targetResponse = await fetch(url, {
      method,
      headers,
      body: body,
      redirect: 'follow', // Follow redirects
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

    return new Response(JSON.stringify(proxyResponseData), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro interno do proxy.';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
};
