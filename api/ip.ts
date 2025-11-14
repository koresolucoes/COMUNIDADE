// This is a Vercel serverless function
// It needs to be compatible with a standard Request/Response environment
// It should not import any heavy libraries like express

export default async (req: Request) => {
  // In Vercel, the 'x-forwarded-for' header contains the client's IP address.
  // The 'x-vercel-forwarded-for' is also available. We prioritize the standard one.
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'IP não encontrado';
  const userAgent = req.headers.get('user-agent') || 'User-Agent não encontrado';

  const data = {
    ip,
    userAgent,
  };

  return new Response(JSON.stringify(data), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*', // Allow requests from any origin
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
};
