// This is a Vercel serverless function for the Node.js runtime

export default (req: any, res: any) => {
  const ipHeader = req.headers['x-forwarded-for'];
  const ip = Array.isArray(ipHeader)
    ? ipHeader[0]
    : ipHeader?.split(',')[0].trim() || req.socket.remoteAddress || 'IP não encontrado';
  const userAgent = req.headers['user-agent'] || 'User-Agent não encontrado';

  const data = {
    ip,
    userAgent,
  };

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.end(JSON.stringify(data));
};
